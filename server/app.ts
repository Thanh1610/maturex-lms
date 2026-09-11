import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { isIP } from "node:net";
import { resolve, dirname } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { openDatabase, transaction } from "./database";
import { initLearning, handleLearning } from "./learning";
import { initFiles, handleFiles } from "./files";
import { handleAccounts, handlePublicAccounts, audit } from "./accounts";
import {
  initSocial,
  handleSocial,
  notify,
  generateEventReminders,
} from "./social";
import { initOrganization, handleOrganization } from "./organization";
import { initIntegrations, createIntegrations, type IntegrationsService } from "./integrations";
import { initJobs, runJobs } from "./jobs";
import {
  initCourseTeams,
  handleCourseTeams,
  listCourseInstructors,
} from "./course-access";
import { initCohorts, handleCohorts, classEvidence } from "./cohorts";
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
  type AuthUser,
  type PublicUser,
  type UserRow,
} from "./auth";
import {
  getState,
  saveCourse,
  setCourseStatus,
  enroll,
  completeLesson,
  changeAssignment,
} from "./lms";

async function readBody(req: import("node:http").IncomingMessage): Promise<Record<string, unknown>> {
  check(
    req.headers["content-type"]?.split(";")[0] === "application/json",
    415,
    "Yêu cầu cần dữ liệu JSON.",
  );
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
    size += buf.length;
    check(size <= 2 * 1024 * 1024, 413, "Dữ liệu gửi lên quá lớn.");
    chunks.push(buf);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString()) as unknown;
    check(
      body && typeof body === "object" && !Array.isArray(body),
      400,
      "Dữ liệu JSON không hợp lệ.",
    );
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Dữ liệu JSON không hợp lệ.");
  }
}

export interface CreateAppOptions {
  databasePath?: string;
  origin?: string;
  allowSetup?: boolean;
  uploadsPath?: string;
  env?: NodeJS.ProcessEnv;
  enableWorkers?: boolean;
  staticHandler?: ((req: IncomingMessage, res: ServerResponse) => Promise<boolean> | boolean) | null;
}

export interface AppInstance {
  server: Server;
  db: DatabaseSync;
  integrations: IntegrationsService;
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
  staticHandler = null,
}: CreateAppOptions = {}): AppInstance {
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
    origin: configuredOrigin || "http://localhost:3000",
  });

  const attempts = new Map<string, { count: number; until: number }>();

  function rateLimit(req: import("node:http").IncomingMessage) {
    let key = req.socket.remoteAddress || "unknown";
    if (
      env.TRUST_PROXY === "1" &&
      typeof req.headers["x-forwarded-for"] === "string"
    ) {
      const parts = req.headers["x-forwarded-for"].split(",");
      const forwarded = parts[parts.length - 1]?.trim();
      if (forwarded && isIP(forwarded)) key = forwarded;
    }
    const time = Date.now();
    for (const [id, item] of attempts) {
      if (item.until <= time) attempts.delete(id);
    }
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

    const send = (status: number, data: unknown) => {
      res.writeHead(status);
      res.end(JSON.stringify(data));
    };

    try {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 3000;
      const localOrigin = `http://127.0.0.1:${port}`;
      const expectedOrigin = configuredOrigin || localOrigin;

      check(
        req.headers.host === new URL(expectedOrigin).host ||
          req.headers.host === new URL(localOrigin).host,
        403,
        "Máy chủ yêu cầu không hợp lệ.",
      );

      const url = new URL(req.url || "/", localOrigin);
      const path = url.pathname;
      const query = url.searchParams;
      const method = req.method || "GET";

      if (staticHandler && !path.startsWith("/api/")) {
        if (await staticHandler(req, res)) return;
        return send(404, { error: "Không tìm thấy trang." });
      }

      const write = !["GET", "HEAD"].includes(method);
      if (write) {
        check(
          req.headers.origin === expectedOrigin,
          403,
          "Nguồn gửi yêu cầu không được phép.",
        );
      }

      if (path === "/api/health" && method === "GET") {
        const schemaRow = db.prepare("PRAGMA user_version").get() as unknown as { user_version: number };
        return send(200, {
          status: "ok",
          schema: schemaRow.user_version,
        });
      }

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
        if (result) return send(result.status || 200, result.data);
      }

      const body = write ? await readBody(req) : {};

      if (path === "/api/auth/providers" || path.startsWith("/api/sso/")) {
        const result = await integrations.handle({
          user: null,
          path,
          method,
          body,
          query,
          req,
          res,
        });
        if (result?.handled) return;
        if (result) return send(result.status || 200, result.data);
      }

      const setupAvailable = () =>
        allowSetup && !db.prepare("SELECT 1 FROM users LIMIT 1").get();

      if (method === "GET" && path === "/api/session") {
        let user: PublicUser | null = null;
        try {
          user = authenticate(db, req);
        } catch (error: unknown) {
          const err = error as { status?: number };
          if (err.status !== 401) throw error;
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
        const user = db.prepare("SELECT * FROM users WHERE email=?").get(email) as unknown as UserRow | undefined;
        check(
          (await verifyPassword(body.password, user?.password_hash)) &&
            user?.active === 1,
          401,
          "Email hoặc mật khẩu không đúng.",
        );
        const current = db
          .prepare("SELECT * FROM users WHERE id=?")
          .get((user as UserRow).id) as unknown as UserRow | undefined;
        check(
          current?.active === 1 && current.password_hash === (user as UserRow).password_hash,
          401,
          "Email hoặc mật khẩu không đúng.",
        );
        startSession(db, req, res, (current as UserRow).id, secure);
        return send(200, { user: publicUser(current as UserRow) });
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

      type RouteHandler = (args: {
        db: DatabaseSync;
        user: AuthUser;
        path: string;
        method: string;
        body?: Record<string, unknown>;
        query?: URLSearchParams;
        req?: import("node:http").IncomingMessage;
        res?: import("node:http").ServerResponse;
      }) => Promise<{ status?: number; data?: unknown } | null> | { status?: number; data?: unknown } | null;

      const handlers: RouteHandler[] = [
        handleAccounts as unknown as RouteHandler,
        handleCourseTeams as unknown as RouteHandler,
        handleCohorts as unknown as RouteHandler,
        handleLearning as unknown as RouteHandler,
        handleSocial as unknown as RouteHandler,
        handleOrganization as unknown as RouteHandler,
        integrations.handle as unknown as RouteHandler,
      ];

      for (const handler of handlers) {
        const result = await handler({
          db,
          user,
          path,
          method,
          body,
          query,
          req,
          res,
        });
        if (result) {
          if (
            path.match(/^\/api\/paths\/[^/]+\/assign$/) &&
            method === "POST" &&
            typeof body.user_id === "string"
          ) {
            notify(
              db,
              body.user_id,
              "Bạn vừa được giao một lộ trình học.",
              "paths",
              `path-assigned:${path}:${body.user_id}:${body.due_date || ""}`,
            );
            audit(db, user.id, "path.assign", body.user_id);
          }
          return send(result.status || 200, result.data);
        }
      }

      if (method === "GET" && path === "/api/state") {
        const current = getState(db, user);
        const classes = handleCohorts({
          db,
          user,
          path: "/api/cohorts",
          method: "GET",
          query: new URLSearchParams(),
        });
        const unreadRow = db
          .prepare(
            "SELECT COUNT(*) AS n FROM notifications WHERE user_id=? AND read_at IS NULL",
          )
          .get(user.id) as unknown as { n: number };

        return send(200, {
          ...current,
          evidence: [...(current.evidence as unknown[]), ...classEvidence(db, user)],
          cohorts: (classes?.data as { cohorts: unknown[] })?.cohorts || [],
          unreadNotifications: unreadRow.n,
        });
      }

      if (path === "/api/users") {
        check(
          user.role === "admin",
          403,
          "Chỉ quản trị được quản lý tài khoản.",
        );
        if (method === "GET") {
          const allUsers = db
            .prepare("SELECT * FROM users ORDER BY created_at")
            .all() as unknown as UserRow[];
          return send(200, {
            users: allUsers.map(publicUser),
          });
        }
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

      if (path === "/api/courses" && method === "POST") {
        return send(201, { course: saveCourse(db, user, body) });
      }

      let courseMatch = path.match(/^\/api\/courses\/([^/]+)$/);
      if (courseMatch && method === "PUT") {
        return send(200, { course: saveCourse(db, user, body, courseMatch[1]) });
      }

      courseMatch = path.match(/^\/api\/courses\/([^/]+)\/status$/);
      if (courseMatch && method === "POST") {
        setCourseStatus(db, user, courseMatch[1], body);
      } else if (
        (courseMatch = path.match(/^\/api\/courses\/([^/]+)\/enroll$/)) &&
        method === "POST"
      ) {
        enroll(db, user, courseMatch[1]);
      } else if (
        (courseMatch = path.match(
          /^\/api\/courses\/([^/]+)\/lessons\/([^/]+)\/complete$/,
        )) &&
        method === "POST"
      ) {
        completeLesson(db, user, courseMatch[1], courseMatch[2]);
      } else if (
        (courseMatch = path.match(
          /^\/api\/assignments\/([^/]+)\/(submit|review)$/,
        )) &&
        method === "POST"
      ) {
        changeAssignment(db, user, courseMatch[1], body, courseMatch[2] === "review");
      } else {
        throw new HttpError(404, "Không tìm thấy chức năng.");
      }

      const submitted = path.match(
        /^\/api\/assignments\/([^/]+)\/(submit|review)$/,
      );
      if (submitted && submitted[1] && submitted[2]) {
        const a = db
          .prepare(
            "SELECT a.*,c.owner_id,c.title FROM assignments a JOIN courses c ON c.id=a.course_id WHERE a.id=?",
          )
          .get(submitted[1]) as unknown as { course_id: string; title: string; user_id: string; id: string; version: number } | undefined;
        if (a) {
          const recipients =
            submitted[2] === "submit"
              ? listCourseInstructors(db, a.course_id).map((t) => t.id)
              : [a.user_id];
          for (const recipient of recipients) {
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
      }
      send(200, { ok: true });
    } catch (rawError: unknown) {
      const error = rawError as { status?: number; message?: string };
      if (!error.status) console.error(rawError);
      if (!res.headersSent) {
        send(error.status || 500, {
          error: error.status
            ? error.message
            : "Có lỗi máy chủ. Vui lòng thử lại.",
        });
      } else {
        res.end();
      }
    }
  });

  server.requestTimeout = 300_000;
  server.headersTimeout = 15_000;

  let timer: NodeJS.Timeout | null = null;
  server.on("listening", () => {
    if (enableWorkers) {
      integrations.start();
      const tick = () => {
        try {
          const addr = server.address();
          const p = typeof addr === "object" && addr ? addr.port : 3000;
          runJobs(
            db,
            integrations,
            configuredOrigin || `http://localhost:${p}`,
          );
        } catch (e: unknown) {
          const err = e as { message?: string };
          console.error("Reminder job failed", err.message);
        }
      };
      timer = setInterval(tick, 60000);
      timer.unref();
      tick();
    }
  });

  server.on("close", () => {
    if (timer) clearInterval(timer);
  });

  return { server, db, integrations };
}
