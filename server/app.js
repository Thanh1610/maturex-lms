import { createServer } from "node:http";
import { isIP } from "node:net";
import { openDatabase, transaction } from "./database.js";
import { resolve, dirname } from "node:path";
import { initLearning, handleLearning } from "./learning.js";
import { initFiles, handleFiles } from "./files.js";
import { handleAccounts, handlePublicAccounts, audit } from "./accounts.js";
import {
  initSocial,
  handleSocial,
  notify,
  generateEventReminders,
} from "./social.js";
import { initOrganization, handleOrganization } from "./organization.js";
import { initIntegrations, createIntegrations } from "./integrations.js";
import { serveStatic } from "./static.js";
import { initJobs, runJobs } from "./jobs.js";
import {
  initCourseTeams,
  handleCourseTeams,
  listCourseInstructors,
} from "./course-access.js";
import { initCohorts, handleCohorts, classEvidence } from "./cohorts.js";
import {
  authenticate,
  check,
  HttpError,
  insertUser,
  prepareUser,
  publicUser,
  startSession,
  endSession,
  verifyPassword,
} from "./auth.js";
import {
  getState,
  saveCourse,
  setCourseStatus,
  enroll,
  completeLesson,
  changeAssignment,
} from "./lms.js";

async function readBody(req) {
  check(
    req.headers["content-type"]?.split(";")[0] === "application/json",
    415,
    "Yêu cầu cần dữ liệu JSON.",
  );
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    check(size <= 2 * 1024 * 1024, 413, "Dữ liệu gửi lên quá lớn.");
    chunks.push(chunk);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString());
    check(
      body && typeof body === "object" && !Array.isArray(body),
      400,
      "Dữ liệu JSON không hợp lệ.",
    );
    return body;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Dữ liệu JSON không hợp lệ.");
  }
}
export function createApp({
  databasePath = ":memory:",
  origin,
  allowSetup = false,
  uploadsPath = resolve(
    databasePath === ":memory:" ? ".local" : dirname(databasePath),
    "uploads",
  ),
  env = process.env,
  enableWorkers = false,
  staticDir = null,
} = {}) {
  const configuredOrigin = origin ? new URL(origin).origin : null;
  const secure = configuredOrigin?.startsWith("https:") || false;
  const db = openDatabase(databasePath);
  initCourseTeams(db);
  initCohorts(db);
  initLearning(db);
  initFiles(db);
  initSocial(db);
  initOrganization(db);
  initIntegrations(db);
  initJobs(db);
  const integrations = createIntegrations({
    db,
    env,
    origin: configuredOrigin || "http://127.0.0.1:5173",
  });
  const attempts = new Map();
  function rateLimit(req) {
    let key = req.socket.remoteAddress;
    // Opt-in for one trusted immediate proxy that overwrites/appends its client IP.
    // Earlier entries may be client-supplied; invalid/missing final IP uses the socket.
    if (
      env.TRUST_PROXY === "1" &&
      typeof req.headers["x-forwarded-for"] === "string"
    ) {
      const forwarded = req.headers["x-forwarded-for"].split(",").at(-1).trim();
      if (isIP(forwarded)) key = forwarded;
    }
    const time = Date.now();
    for (const [id, item] of attempts)
      if (item.until <= time) attempts.delete(id);
    const item = attempts.get(key) || {
      count: 0,
      until: time + 15 * 60 * 1000,
    };
    check(
      item.count < 30,
      429,
      "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.",
    );
    item.count++;
    attempts.set(key, item);
  }
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    const send = (status, data) => {
      res.writeHead(status);
      res.end(JSON.stringify(data));
    };
    try {
      const localOrigin = `http://127.0.0.1:${server.address()?.port}`;
      const expectedOrigin = configuredOrigin || localOrigin;
      // Do not trust Host or forwarded headers as a source of allowed origins.
      check(
        req.headers.host === new URL(expectedOrigin).host ||
          req.headers.host === new URL(localOrigin).host,
        403,
        "Máy chủ yêu cầu không hợp lệ.",
      );
      const url = new URL(req.url, localOrigin),
        path = url.pathname,
        query = url.searchParams;
      const method = req.method;
      if (staticDir && !path.startsWith("/api/")) {
        if (await serveStatic(req, res, staticDir)) return;
        return send(404, { error: "Không tìm thấy trang." });
      }
      const write = !["GET", "HEAD"].includes(method);
      if (write)
        check(
          req.headers.origin === expectedOrigin,
          403,
          "Nguồn gửi yêu cầu không được phép.",
        );
      if (path === "/api/health" && method === "GET")
        return send(200, {
          status: "ok",
          schema: db.prepare("PRAGMA user_version").get().user_version,
        });
      if (path.startsWith("/api/files")) {
        const user = authenticate(db, req);
        const result = await handleFiles({
          db,
          user,
          path,
          method,
          query,
          req,
          res,
          uploadsPath,
        });
        if (result?.handled) return;
        if (result) return send(result.status, result.data);
      }
      const body = write ? await readBody(req) : undefined;
      if (path === "/api/auth/providers" || path.startsWith("/api/sso/")) {
        const result = await integrations.handle({
          path,
          method,
          body,
          query,
          req,
          res,
        });
        if (result?.handled) return;
        if (result) return send(result.status, result.data);
      }
      const setupAvailable = () =>
        allowSetup && !db.prepare("SELECT 1 FROM users LIMIT 1").get();
      if (method === "GET" && path === "/api/session") {
        let user = null;
        try {
          user = authenticate(db, req);
        } catch (error) {
          if (error.status !== 401) throw error;
        }
        return send(200, { user, setupRequired: Boolean(setupAvailable()) });
      }
      if (method === "POST" && path === "/api/setup") {
        check(allowSetup, 403, "Thiết lập ban đầu chưa được bật trên máy chủ.");
        check(setupAvailable(), 409, "Hệ thống đã được thiết lập.");
        rateLimit(req);
        const prepared = await prepareUser({ ...body, role: "admin" });
        const user = transaction(db, () => {
          check(setupAvailable(), 409, "Hệ thống đã được thiết lập.");
          return insertUser(db, prepared);
        });
        startSession(db, req, res, user.id, secure);
        return send(201, { user });
      }
      if (method === "POST" && path === "/api/login") {
        rateLimit(req);
        const email =
          typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
        check(
          (await verifyPassword(body.password, user?.password_hash)) &&
            user?.active === 1,
          401,
          "Email hoặc mật khẩu không đúng.",
        );
        const current = db
          .prepare("SELECT * FROM users WHERE id=?")
          .get(user.id);
        check(
          current?.active === 1 && current.password_hash === user.password_hash,
          401,
          "Email hoặc mật khẩu không đúng.",
        );
        startSession(db, req, res, current.id, secure);
        return send(200, { user: publicUser(current) });
      }
      if (method === "POST" && path === "/api/logout") {
        endSession(db, req, res, secure);
        return send(200, { ok: true });
      }
      if (path.startsWith("/api/password/")) {
        rateLimit(req);
        const result = await handlePublicAccounts({
          db,
          path,
          method,
          body,
          origin: expectedOrigin,
          integrations,
        });
        if (result) return send(result.status, result.data);
      }
      const user = authenticate(db, req);
      for (const handler of [
        handleAccounts,
        handleCourseTeams,
        handleCohorts,
        handleLearning,
        handleSocial,
        handleOrganization,
        integrations.handle,
      ]) {
        const result = await handler({
          db,
          user,
          path,
          method,
          body,
          query,
          req,
        });
        if (result) {
          if (
            path.match(/^\/api\/paths\/[^/]+\/assign$/) &&
            method === "POST" &&
            body.user_id
          ) {
            notify(
              db,
              body.user_id,
              "Bạn vừa được giao một lộ trình học.",
              "paths",
              `path-assigned:${path}:${body.user_id}:${body.due_date}`,
            );
            audit(db, user.id, "path.assign", body.user_id);
          }
          return send(result.status, result.data);
        }
      }
      if (method === "GET" && path === "/api/state") {
        const current = getState(db, user);
        const classes = await handleCohorts({
          db,
          user,
          path: "/api/cohorts",
          method: "GET",
          query: new URLSearchParams(),
        });
        return send(200, {
          ...current,
          evidence: [...current.evidence, ...classEvidence(db, user)],
          cohorts: classes.data.cohorts,
          unreadNotifications: db
            .prepare(
              "SELECT COUNT(*) AS n FROM notifications WHERE user_id=? AND read_at IS NULL",
            )
            .get(user.id).n,
        });
      }
      if (path === "/api/users") {
        check(
          user.role === "admin",
          403,
          "Chỉ quản trị được quản lý tài khoản.",
        );
        if (method === "GET")
          return send(200, {
            users: db
              .prepare("SELECT * FROM users ORDER BY created_at")
              .all()
              .map(publicUser),
          });
        if (method === "POST") {
          const prepared = await prepareUser(body);
          return send(201, {
            user: transaction(db, () => {
              check(
                authenticate(db, req).role === "admin",
                403,
                "Quyền quản trị đã thay đổi.",
              );
              const created = insertUser(db, prepared);
              audit(db, user.id, "user.create", created.id);
              return created;
            }),
          });
        }
      }
      if (path === "/api/courses" && method === "POST")
        return send(201, { course: saveCourse(db, user, body) });
      let match;
      if ((match = path.match(/^\/api\/courses\/([^/]+)$/)) && method === "PUT")
        return send(200, { course: saveCourse(db, user, body, match[1]) });
      if (
        (match = path.match(/^\/api\/courses\/([^/]+)\/status$/)) &&
        method === "POST"
      )
        setCourseStatus(db, user, match[1], body);
      else if (
        (match = path.match(/^\/api\/courses\/([^/]+)\/enroll$/)) &&
        method === "POST"
      )
        enroll(db, user, match[1]);
      else if (
        (match = path.match(
          /^\/api\/courses\/([^/]+)\/lessons\/([^/]+)\/complete$/,
        )) &&
        method === "POST"
      )
        completeLesson(db, user, match[1], match[2]);
      else if (
        (match = path.match(
          /^\/api\/assignments\/([^/]+)\/(submit|review)$/,
        )) &&
        method === "POST"
      )
        changeAssignment(db, user, match[1], body, match[2] === "review");
      else throw new HttpError(404, "Không tìm thấy chức năng.");
      const submitted = path.match(
        /^\/api\/assignments\/([^/]+)\/(submit|review)$/,
      );
      if (submitted) {
        const a = db
          .prepare(
            "SELECT a.*,c.owner_id,c.title FROM assignments a JOIN courses c ON c.id=a.course_id WHERE a.id=?",
          )
          .get(submitted[1]);
        if (a) {
          const recipients =
            submitted[2] === "submit"
              ? listCourseInstructors(db, a.course_id).map((t) => t.id)
              : [a.user_id];
          for (const recipient of recipients)
            notify(
              db,
              recipient,
              submitted[2] === "submit"
                ? `Có bài nộp mới cho khóa “${a.title}”.`
                : `Có đánh giá mới cho khóa “${a.title}”.`,
              submitted[2] === "submit" ? "reviews" : "assignments",
              `assignment:${a.id}:${a.version}`,
            );
        }
      }
      send(200, { ok: true });
    } catch (error) {
      if (!error.status) console.error(error);
      if (!res.headersSent)
        send(error.status || 500, {
          error: error.status
            ? error.message
            : "Có lỗi máy chủ. Vui lòng thử lại.",
        });
      else res.end();
    }
  });
  server.requestTimeout = 300_000;
  server.headersTimeout = 15_000;
  let timer;
  server.on("listening", () => {
    if (enableWorkers) {
      integrations.start();
      const tick = () => {
        try {
          runJobs(
            db,
            integrations,
            configuredOrigin || `http://127.0.0.1:${server.address().port}`,
          );
        } catch (e) {
          console.error("Reminder job failed", e.message);
        }
      };
      timer = setInterval(tick, 60000);
      timer.unref();
      tick();
    }
  });
  server.on("close", () => clearInterval(timer));
  return { server, db, integrations };
}
