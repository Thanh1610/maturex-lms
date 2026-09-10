import { randomUUID } from "node:crypto";
import { mkdir, open, rename, unlink, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { resolve, extname } from "node:path";
import { authenticate, check, HttpError, textField } from "./auth.js";
import { courseAccess } from "./learning.js";
import {
  activeAccount,
  hasTable,
  isCourseInstructor,
} from "./course-access.js";
import { transaction } from "./database.js";
import { cohortTeachAccess } from "./cohorts.js";

const types = {
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};
export function initFiles(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS files(
  id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES users(id),course_id TEXT NOT NULL REFERENCES courses(id),
  lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,assignment_id TEXT REFERENCES assignments(id),assignment_version INTEGER,
  name TEXT NOT NULL,mime TEXT NOT NULL,size INTEGER NOT NULL,created_at TEXT NOT NULL
); CREATE INDEX IF NOT EXISTS files_course ON files(course_id); CREATE INDEX IF NOT EXISTS files_assignment ON files(assignment_id);`);
  db.exec(`CREATE TABLE IF NOT EXISTS cohort_file_links(
    file_id TEXT PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
    assignment_id TEXT NOT NULL REFERENCES cohort_assignments(id),version INTEGER NOT NULL
  ); CREATE INDEX IF NOT EXISTS cohort_file_assignment ON cohort_file_links(assignment_id);`);
}
function cohortAssignment(db, id) {
  if (!hasTable(db, "cohort_assignments")) return null;
  return db
    .prepare(
      "SELECT a.*,c.status AS cohort_status FROM cohort_assignments a JOIN cohorts c ON c.id=a.cohort_id WHERE a.id=?",
    )
    .get(id);
}
function cohortMember(db, user, a) {
  return (
    activeAccount(db, user) &&
    db
      .prepare(
        "SELECT 1 FROM cohort_members WHERE cohort_id=? AND user_id=? AND status='active'",
      )
      .get(a.cohort_id, user.id)
  );
}
function cohortReviewer(db, user, a) {
  return cohortTeachAccess(db, user, a.cohort_id);
}
function fileRows(db, id) {
  return db
    .prepare(
      `SELECT f.*,cf.assignment_id AS cohort_assignment_id,cf.version AS cohort_assignment_version
    FROM files f LEFT JOIN cohort_file_links cf ON cf.file_id=f.id ${id ? "WHERE f.id=?" : "ORDER BY f.created_at DESC"}`,
    )
    [id ? "get" : "all"](...(id ? [id] : []));
}
function target(db, user, query) {
  const assignmentId = query.get("assignmentId"),
    cohortAssignmentId = query.get("cohortAssignmentId"),
    courseId = query.get("courseId"),
    lessonId = query.get("lessonId");
  check(
    [assignmentId, cohortAssignmentId, courseId].filter(Boolean).length === 1 &&
      !(lessonId && (assignmentId || cohortAssignmentId)),
    400,
    "Chọn khóa học hoặc bài nộp để đính kèm.",
  );
  if (cohortAssignmentId) {
    const a = cohortAssignment(db, cohortAssignmentId);
    check(
      a && a.user_id === user.id && cohortMember(db, user, a),
      404,
      "Không tìm thấy bài tập trong lớp của bạn.",
    );
    check(
      a.cohort_status === "open" && ["todo", "revision"].includes(a.status),
      409,
      "Lớp hoặc bài nộp không cho phép thêm tệp.",
    );
    return {
      courseId: a.course_id,
      lessonId: null,
      assignmentId: null,
      assignmentVersion: null,
      cohortAssignmentId: a.id,
      cohortAssignmentVersion: a.version + 1,
    };
  }
  if (assignmentId) {
    const a = db
      .prepare("SELECT * FROM assignments WHERE id=? AND user_id=?")
      .get(assignmentId, user.id);
    check(a, 404, "Không tìm thấy bài tập.");
    check(
      ["todo", "revision"].includes(a.status),
      409,
      "Chỉ thêm tệp trước khi nộp bài.",
    );
    return {
      courseId: a.course_id,
      assignmentId: a.id,
      assignmentVersion: a.version + 1,
      lessonId: null,
    };
  }
  courseAccess(db, user, courseId, true);
  if (lessonId)
    check(
      db
        .prepare("SELECT 1 FROM lessons WHERE id=? AND course_id=?")
        .get(lessonId, courseId),
      400,
      "Bài học không thuộc khóa.",
    );
  return {
    courseId,
    lessonId: lessonId || null,
    assignmentId: null,
    assignmentVersion: null,
  };
}
function canRead(db, user, file) {
  if (!activeAccount(db, user)) return false;
  if (file.cohort_assignment_id) {
    const a = cohortAssignment(db, file.cohort_assignment_id);
    const submitted = a && file.cohort_assignment_version <= a.version;
    const member =
      a &&
      db
        .prepare(
          "SELECT status FROM cohort_members WHERE cohort_id=? AND user_id=?",
        )
        .get(a.cohort_id, user.id);
    return Boolean(
      a &&
      ((a.user_id === user.id &&
        member &&
        (member.status === "active" || submitted)) ||
        (cohortReviewer(db, user, a) && submitted)),
    );
  }
  if (file.assignment_id) {
    const a = db
      .prepare(
        "SELECT a.*,c.owner_id FROM assignments a JOIN courses c ON c.id=a.course_id WHERE a.id=?",
      )
      .get(file.assignment_id);
    return (
      a &&
      (a.user_id === user.id ||
        (isCourseInstructor(db, user, a.course_id) &&
          file.assignment_version <= a.version))
    );
  }
  try {
    courseAccess(db, user, file.course_id);
    return true;
  } catch {
    return false;
  }
}
function validateMagic(mime, head) {
  if (mime === "application/pdf")
    return head.subarray(0, 5).toString() === "%PDF-";
  if (mime.includes("openxmlformats"))
    return head.subarray(0, 2).toString() === "PK";
  if (mime === "video/mp4") return head.subarray(4, 8).toString() === "ftyp";
  if (mime === "video/webm")
    return head.subarray(0, 4).toString("hex") === "1a45dfa3";
  if (mime === "image/png")
    return head.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
  if (mime === "image/jpeg")
    return head.subarray(0, 3).toString("hex") === "ffd8ff";
  if (mime === "audio/wav") return head.subarray(0, 4).toString() === "RIFF";
  if (mime === "audio/mpeg")
    return (
      head.subarray(0, 3).toString() === "ID3" ||
      (head[0] === 255 && (head[1] & 224) === 224)
    );
  return true;
}
export async function handleFiles({
  db,
  user,
  path,
  method,
  req,
  res,
  query,
  uploadsPath,
  maxUploadBytes = 128 * 1024 * 1024,
}) {
  if (path === "/api/files" && method === "GET") {
    const rows = fileRows(db).filter((f) => canRead(db, user, f));
    return { status: 200, data: { files: rows } };
  }
  if (path === "/api/files" && method === "POST") {
    let name;
    try {
      name = decodeURIComponent(req.headers["x-file-name"] || "");
    } catch {
      throw new HttpError(400, "Tên tệp không hợp lệ.");
    }
    name = textField(name, "Tên tệp", 180);
    check(!/[\x00-\x1f\x7f/\\]/.test(name), 400, "Tên tệp không hợp lệ.");
    const mime = types[extname(name).toLowerCase()];
    check(
      mime,
      415,
      "Định dạng tệp không hỗ trợ. Dùng PDF, Office, TXT/CSV, ảnh, MP4/WebM hoặc MP3/WAV.",
    );
    check(
      Number(req.headers["content-length"] || 0) <= maxUploadBytes,
      413,
      "Tệp vượt quá giới hạn tải lên.",
    );
    const initial = target(db, user, query);
    const id = randomUUID();
    await mkdir(uploadsPath, { recursive: true });
    const temp = resolve(uploadsPath, id + ".part"),
      destination = resolve(uploadsPath, id);
    let handle,
      total = 0,
      head = Buffer.alloc(0),
      moved = false;
    try {
      handle = await open(temp, "wx");
      for await (const chunk of req) {
        total += chunk.length;
        check(total <= maxUploadBytes, 413, "Tệp vượt quá giới hạn tải lên.");
        if (head.length < 512)
          head = Buffer.concat([head, chunk.subarray(0, 512 - head.length)]);
        await handle.writeFile(chunk);
      }
      await handle.close();
      handle = null;
      check(total > 0, 400, "Tệp rỗng.");
      check(
        validateMagic(mime, head),
        415,
        "Nội dung tệp không khớp định dạng.",
      );
      const currentUser = authenticate(db, req);
      const dest = target(db, currentUser, query);
      await rename(temp, destination);
      moved = true;
      // Recheck mutable authorization after disk I/O before persisting the link.
      const final = target(db, authenticate(db, req), query);
      check(
        final.assignmentVersion === dest.assignmentVersion &&
          final.assignmentVersion === initial.assignmentVersion &&
          final.cohortAssignmentVersion === dest.cohortAssignmentVersion &&
          final.cohortAssignmentVersion === initial.cohortAssignmentVersion,
        409,
        "Bài nộp đã thay đổi, hãy tải lại.",
      );
      transaction(db, () => {
        db.prepare("INSERT INTO files VALUES (?,?,?,?,?,?,?,?,?,?)").run(
          id,
          user.id,
          final.courseId,
          final.lessonId,
          final.assignmentId,
          final.assignmentVersion,
          name,
          mime,
          total,
          new Date().toISOString(),
        );
        if (final.cohortAssignmentId)
          db.prepare("INSERT INTO cohort_file_links VALUES (?,?,?)").run(
            id,
            final.cohortAssignmentId,
            final.cohortAssignmentVersion,
          );
      });
      return {
        status: 201,
        data: { file: fileRows(db, id) },
      };
    } catch (error) {
      if (handle) await handle.close().catch(() => {});
      await unlink(moved ? destination : temp).catch(() => {});
      throw error;
    }
  }
  const match = path.match(/^\/api\/files\/([a-f0-9-]+)$/);
  if (match) {
    const file = fileRows(db, match[1]);
    check(
      file && canRead(db, user, file),
      404,
      "Không tìm thấy tệp trong phạm vi của bạn.",
    );
    const filePath = resolve(uploadsPath, file.id);
    if (method === "DELETE") {
      if (file.cohort_assignment_id) {
        const a = cohortAssignment(db, file.cohort_assignment_id);
        check(
          a &&
            a.user_id === user.id &&
            cohortMember(db, user, a) &&
            a.cohort_status === "open" &&
            ["todo", "revision"].includes(a.status) &&
            file.cohort_assignment_version > a.version,
          403,
          "Không thể xóa tệp đã nộp hoặc ngoài lớp đang mở.",
        );
      } else if (file.assignment_id) {
        const a = db
          .prepare("SELECT * FROM assignments WHERE id=?")
          .get(file.assignment_id);
        check(
          file.owner_id === user.id && file.assignment_version > a.version,
          403,
          "Không thể xóa tệp đã nộp.",
        );
      } else courseAccess(db, user, file.course_id, true);
      // Metadata removal takes effect immediately. Physical blob remains for consistent backups.
      db.prepare("DELETE FROM files WHERE id=?").run(file.id);
      return { status: 200, data: { ok: true } };
    }
    if (method === "GET" || method === "HEAD") {
      const info = await stat(filePath).catch(() => null);
      check(info, 404, "Tệp không còn trên bộ lưu trữ.");
      let start = 0,
        end = info.size - 1,
        status = 200;
      const range = req.headers.range;
      if (range) {
        const r = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!r || (!r[1] && !r[2])) {
          res.setHeader("Content-Range", `bytes */${info.size}`);
          throw new HttpError(416, "Khoảng dữ liệu không hợp lệ.");
        }
        start = r[1] ? Number(r[1]) : Math.max(0, info.size - Number(r[2]));
        end =
          r[1] && r[2] ? Math.min(Number(r[2]), info.size - 1) : info.size - 1;
        if (
          start > end ||
          start >= info.size ||
          !Number.isSafeInteger(start) ||
          !Number.isSafeInteger(end)
        ) {
          res.setHeader("Content-Range", `bytes */${info.size}`);
          throw new HttpError(416, "Khoảng dữ liệu không hợp lệ.");
        }
        status = 206;
        res.setHeader("Content-Range", `bytes ${start}-${end}/${info.size}`);
      }
      res.setHeader("Content-Type", file.mime);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", end - start + 1);
      const inline = /^(video|audio)\//.test(file.mime);
      res.setHeader(
        "Content-Disposition",
        `${inline ? "inline" : "attachment"}; filename="download${extname(file.name)}"; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g, "%27")}`,
      );
      res.writeHead(status);
      if (method === "HEAD") res.end();
      else {
        const stream = createReadStream(filePath, { start, end });
        stream.on("error", () => res.destroy());
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      }
      return { handled: true };
    }
  }
  return null;
}
