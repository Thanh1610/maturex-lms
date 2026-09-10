import { check } from "./auth.js";
import { transaction } from "./database.js";

export function hasTable(db, name) {
  return Boolean(
    db
      .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?")
      .get(name),
  );
}

export function initCourseTeams(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS course_instructors (
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id), PRIMARY KEY(course_id,user_id)
  ); CREATE INDEX IF NOT EXISTS course_instructors_user ON course_instructors(user_id);`);
  db.exec(
    "INSERT OR IGNORE INTO course_instructors SELECT id,owner_id FROM courses",
  );
  db.exec(`CREATE TABLE IF NOT EXISTS course_revisions (
    course_id TEXT PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 0
  ); INSERT OR IGNORE INTO course_revisions SELECT id,0 FROM courses;`);
}

export function courseVersion(db, id) {
  return hasTable(db, "course_revisions")
    ? (db
        .prepare("SELECT version FROM course_revisions WHERE course_id=?")
        .get(id)?.version ?? 0)
    : 0;
}

export function activeAccount(db, user) {
  if (!user?.id) return null;
  return (
    db
      .prepare("SELECT id,role,active FROM users WHERE id=? AND active=1")
      .get(user.id) || null
  );
}

export function isCourseInstructor(db, user, courseId) {
  const account = activeAccount(db, user);
  if (!account || !["admin", "instructor"].includes(account.role)) return false;
  const course = db
    .prepare("SELECT owner_id FROM courses WHERE id=?")
    .get(courseId);
  if (!course) return false;
  return (
    account.role === "admin" ||
    course.owner_id === account.id ||
    (hasTable(db, "course_instructors") &&
      Boolean(
        db
          .prepare(
            "SELECT 1 FROM course_instructors WHERE course_id=? AND user_id=?",
          )
          .get(courseId, account.id),
      ))
  );
}

export function hasCourseLearningAccess(db, user, courseId) {
  const account = activeAccount(db, user);
  if (!account) return false;
  if (isCourseInstructor(db, account, courseId)) return true;
  if (
    db
      .prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=?")
      .get(account.id, courseId)
  )
    return true;
  if (!hasTable(db, "cohorts")) return false;
  return Boolean(
    db
      .prepare(
        `SELECT 1 FROM cohorts c WHERE c.course_id=? AND (
    EXISTS(SELECT 1 FROM cohort_members m WHERE m.cohort_id=c.id AND m.user_id=? AND m.status='active')
    OR (?='instructor' AND EXISTS(SELECT 1 FROM cohort_instructors i WHERE i.cohort_id=c.id AND i.user_id=?))) LIMIT 1`,
      )
      .get(courseId, account.id, account.role, account.id),
  );
}

export function listCourseInstructors(db, courseId) {
  const course = db
    .prepare("SELECT owner_id FROM courses WHERE id=?")
    .get(courseId);
  if (!course) return [];
  const ids = new Set([course.owner_id]);
  if (hasTable(db, "course_instructors"))
    for (const row of db
      .prepare("SELECT user_id FROM course_instructors WHERE course_id=?")
      .all(courseId))
      ids.add(row.user_id);
  return db
    .prepare(
      "SELECT id,name,email,role FROM users WHERE active=1 AND role IN ('instructor','admin') ORDER BY name",
    )
    .all()
    .filter((row) => ids.has(row.id))
    .map((row) => ({ ...row, is_owner: row.id === course.owner_id }));
}

export function handleCourseTeams({ db, user, path, method, body = {} }) {
  const match = path.match(/^\/api\/courses\/([^/]+)\/instructors$/);
  if (!match || !["GET", "PUT"].includes(method)) return null;
  const course = db.prepare("SELECT * FROM courses WHERE id=?").get(match[1]);
  const account = activeAccount(db, user);
  check(
    course &&
      account &&
      (course.status === "published" ||
        hasCourseLearningAccess(db, account, course.id)),
    404,
    "Không tìm thấy khóa học.",
  );
  const canManage =
    account.role === "admin" ||
    (account.role === "instructor" && course.owner_id === account.id);
  if (method === "PUT") {
    check(
      canManage,
      403,
      "Chỉ giảng viên chính hoặc quản trị viên được phân công giảng viên.",
    );
    check(
      Array.isArray(body.instructor_ids) &&
        body.instructor_ids.length <= 100 &&
        body.instructor_ids.every((id) => typeof id === "string"),
      400,
      "Danh sách giảng viên không hợp lệ.",
    );
    transaction(db, () => {
      const ids = [...new Set(body.instructor_ids)];
      for (const id of ids)
        check(
          db
            .prepare(
              "SELECT 1 FROM users WHERE id=? AND active=1 AND role='instructor'",
            )
            .get(id) ||
            (id === course.owner_id &&
              db
                .prepare(
                  "SELECT 1 FROM users WHERE id=? AND active=1 AND role='admin'",
                )
                .get(id)),
          400,
          "Giảng viên phải đang hoạt động.",
        );
      db.prepare("DELETE FROM course_instructors WHERE course_id=?").run(
        course.id,
      );
      const insert = db.prepare(
        "INSERT OR IGNORE INTO course_instructors VALUES (?,?)",
      );
      insert.run(course.id, course.owner_id);
      for (const id of ids) insert.run(course.id, id);
    });
  }
  return {
    status: 200,
    data: {
      instructors: listCourseInstructors(db, course.id),
      candidates: canManage
        ? db
            .prepare(
              "SELECT id,name,email FROM users WHERE active=1 AND role='instructor' ORDER BY name",
            )
            .all()
        : [],
      can_manage: canManage,
    },
  };
}
