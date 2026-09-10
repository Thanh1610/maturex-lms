import { randomUUID } from "node:crypto";
import { mkdir, open, rename, unlink, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { resolve, extname } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { authenticate, check, HttpError, textField } from "./auth";
import { courseAccess } from "./learning";
import {
  activeAccount,
  hasTable,
  isCourseInstructor,
} from "./course-access";
import { transaction } from "./database";
import { cohortTeachAccess } from "./cohorts";
import type { AuthUser } from "./auth";

export interface FileRecord {
  id: string;
  owner_id: string;
  course_id: string;
  lesson_id: string | null;
  assignment_id: string | null;
  assignment_version: number | null;
  name: string;
  mime: string;
  size: number;
  created_at: string;
  cohort_assignment_id?: string | null;
  cohort_assignment_version?: number | null;
}

interface CohortAssignmentRecord {
  id: string;
  cohort_id: string;
  user_id: string;
  version: number;
  status: string;
  course_id: string;
  cohort_status: string;
}

const types: Record<string, string> = {
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

export function initFiles(db: DatabaseSync): void {
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

function cohortAssignment(db: DatabaseSync, id: string): CohortAssignmentRecord | null {
  if (!hasTable(db, "cohort_assignments")) return null;
  return (
    (db
      .prepare(
        "SELECT a.*,c.status AS cohort_status FROM cohort_assignments a JOIN cohorts c ON c.id=a.cohort_id WHERE a.id=?",
      )
      .get(id) as unknown as CohortAssignmentRecord | undefined) ?? null
  );
}

function cohortMember(db: DatabaseSync, user: AuthUser, a: CohortAssignmentRecord): boolean {
  return (
    activeAccount(db, user) &&
    Boolean(
      db
        .prepare(
          "SELECT 1 FROM cohort_members WHERE cohort_id=? AND user_id=? AND status='active'",
        )
        .get(a.cohort_id, user.id),
    )
  );
}

function cohortReviewer(db: DatabaseSync, user: AuthUser, a: CohortAssignmentRecord): boolean {
  return cohortTeachAccess(db, user, a.cohort_id);
}

function fileRows(db: DatabaseSync, id?: string): FileRecord[] | FileRecord | undefined {
  if (id) {
    return db
      .prepare(
        `SELECT f.*,cf.assignment_id AS cohort_assignment_id,cf.version AS cohort_assignment_version
      FROM files f LEFT JOIN cohort_file_links cf ON cf.file_id=f.id WHERE f.id=?`,
      )
      .get(id) as unknown as FileRecord | undefined;
  }
  return db
    .prepare(
      `SELECT f.*,cf.assignment_id AS cohort_assignment_id,cf.version AS cohort_assignment_version
    FROM files f LEFT JOIN cohort_file_links cf ON cf.file_id=f.id ORDER BY f.created_at DESC`,
    )
    .all() as unknown as unknown as FileRecord[];
}

interface TargetResult {
  courseId: string;
  lessonId: string | null;
  assignmentId: string | null;
  assignmentVersion: number | null;
  cohortAssignmentId?: string | null;
  cohortAssignmentVersion?: number | null;
}

function target(db: DatabaseSync, user: AuthUser, query: URLSearchParams): TargetResult {
  const assignmentId = query.get("assignmentId");
  const cohortAssignmentId = query.get("cohortAssignmentId");
  const courseId = query.get("courseId");
  const lessonId = query.get("lessonId");

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
      .get(assignmentId, user.id) as { id: string; course_id: string; status: string; version: number } | undefined;
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

  if (!courseId) {
    throw new HttpError(400, "Chọn khóa học hoặc bài nộp để đính kèm.");
  }

  courseAccess(db, user, courseId, true);
  if (lessonId) {
    check(
      Boolean(
        db
          .prepare("SELECT 1 FROM lessons WHERE id=? AND course_id=?")
          .get(lessonId, courseId),
      ),
      400,
      "Bài học không thuộc khóa.",
    );
  }

  return {
    courseId,
    lessonId: lessonId || null,
    assignmentId: null,
    assignmentVersion: null,
  };
}

function canRead(db: DatabaseSync, user: AuthUser, file: FileRecord): boolean {
  if (!activeAccount(db, user)) return false;
  if (file.cohort_assignment_id) {
    const a = cohortAssignment(db, file.cohort_assignment_id);
    const submitted = a && (file.cohort_assignment_version ?? 0) <= a.version;
    const member =
      a &&
      (db
        .prepare(
          "SELECT status FROM cohort_members WHERE cohort_id=? AND user_id=?",
        )
        .get(a.cohort_id, user.id) as { status: string } | undefined);
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
      .get(file.assignment_id) as { user_id: string; course_id: string; version: number } | undefined;
    return Boolean(
      a &&
      (a.user_id === user.id ||
        (isCourseInstructor(db, user, a.course_id) &&
          (file.assignment_version ?? 0) <= a.version)),
    );
  }
  try {
    courseAccess(db, user, file.course_id);
    return true;
  } catch {
    return false;
  }
}

function validateMagic(mime: string, head: Buffer): boolean {
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
      (head[0] === 255 && ((head[1] ?? 0) & 224) === 224)
    );
  return true;
}

export interface HandleFilesOptions {
  db: DatabaseSync;
  user: AuthUser;
  path: string;
  method: string;
  req: IncomingMessage;
  res: ServerResponse;
  query: URLSearchParams;
  uploadsPath: string;
  maxUploadBytes?: number;
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
}: HandleFilesOptions): Promise<{ status?: number; data?: unknown; handled?: boolean } | null> {
  if (path === "/api/files" && method === "GET") {
    const allFiles = fileRows(db) as unknown as FileRecord[];
    const rows = allFiles.filter((f) => canRead(db, user, f));
    return { status: 200, data: { files: rows } };
  }

  if (path === "/api/files" && method === "POST") {
    let name: string;
    try {
      const headerName = typeof req.headers["x-file-name"] === "string" ? req.headers["x-file-name"] : "";
      name = decodeURIComponent(headerName);
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
    const temp = resolve(uploadsPath, id + ".part");
    const destination = resolve(uploadsPath, id);
    let handle: Awaited<ReturnType<typeof open>> | null = null;
    let total = 0;
    let head = Buffer.alloc(0);
    let moved = false;

    try {
      handle = await open(temp, "wx");
      for await (const rawChunk of req) {
        const chunk = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(rawChunk as Uint8Array);
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
        if (final.cohortAssignmentId) {
          db.prepare("INSERT INTO cohort_file_links VALUES (?,?,?)").run(
            id,
            final.cohortAssignmentId,
            final.cohortAssignmentVersion ?? 1,
          );
        }
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
  if (match && match[1]) {
    const file = fileRows(db, match[1]) as unknown as FileRecord | undefined;
    check(
      file && canRead(db, user, file),
      404,
      "Không tìm thấy tệp trong phạm vi của bạn.",
    );
    const validFile = file as unknown as FileRecord;
    const filePath = resolve(uploadsPath, validFile.id);

    if (method === "DELETE") {
      if (validFile.cohort_assignment_id) {
        const a = cohortAssignment(db, validFile.cohort_assignment_id);
        check(
          a &&
            a.user_id === user.id &&
            cohortMember(db, user, a) &&
            a.cohort_status === "open" &&
            ["todo", "revision"].includes(a.status) &&
            (validFile.cohort_assignment_version ?? 0) > a.version,
          403,
          "Không thể xóa tệp đã nộp hoặc ngoài lớp đang mở.",
        );
      } else if (validFile.assignment_id) {
        const a = db
          .prepare("SELECT * FROM assignments WHERE id=?")
          .get(validFile.assignment_id) as { version: number } | undefined;
        check(
          a &&
            validFile.owner_id === user.id &&
            (validFile.assignment_version ?? 0) > a.version,
          403,
          "Không thể xóa tệp đã nộp.",
        );
      } else {
        courseAccess(db, user, validFile.course_id, true);
      }

      db.prepare("DELETE FROM files WHERE id=?").run(validFile.id);
      return { status: 200, data: { ok: true } };
    }

    if (method === "GET" || method === "HEAD") {
      const info = await stat(filePath).catch(() => null);
      check(info, 404, "Tệp không còn trên bộ lưu trữ.");
      const validInfo = info as NonNullable<typeof info>;

      let start = 0;
      let end = validInfo.size - 1;
      let status = 200;

      const range = typeof req.headers.range === "string" ? req.headers.range : undefined;
      if (range) {
        const r = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!r || (!r[1] && !r[2])) {
          res.setHeader("Content-Range", `bytes */${validInfo.size}`);
          throw new HttpError(416, "Khoảng dữ liệu không hợp lệ.");
        }
        start = r[1] ? Number(r[1]) : Math.max(0, validInfo.size - Number(r[2]));
        end =
          r[1] && r[2] ? Math.min(Number(r[2]), validInfo.size - 1) : validInfo.size - 1;
        if (
          start > end ||
          start >= validInfo.size ||
          !Number.isSafeInteger(start) ||
          !Number.isSafeInteger(end)
        ) {
          res.setHeader("Content-Range", `bytes */${validInfo.size}`);
          throw new HttpError(416, "Khoảng dữ liệu không hợp lệ.");
        }
        status = 206;
        res.setHeader("Content-Range", `bytes ${start}-${end}/${validInfo.size}`);
      }

      res.setHeader("Content-Type", validFile.mime);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", end - start + 1);
      const inline = /^(video|audio)\//.test(validFile.mime);
      res.setHeader(
        "Content-Disposition",
        `${inline ? "inline" : "attachment"}; filename="download${extname(validFile.name)}"; filename*=UTF-8''${encodeURIComponent(validFile.name).replace(/'/g, "%27")}`,
      );
      res.writeHead(status);
      if (method === "HEAD") {
        res.end();
      } else {
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
