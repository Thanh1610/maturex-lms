import { check, type PublicUser } from "./auth";
import { type AppDatabase, transaction } from "./database";

export function hasTable(db: AppDatabase, name: string): boolean {
  return Boolean(
    db
      .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?")
      .get(name),
  );
}

export function initCourseTeams(db: AppDatabase): void {
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

export function courseVersion(db: AppDatabase, id: string): number {
  if (!hasTable(db, "course_revisions")) return 0;
  const row = db
    .prepare("SELECT version FROM course_revisions WHERE course_id=?")
    .get(id) as { version?: number } | undefined;
  return row?.version ?? 0;
}

export function activeAccount(
  db: AppDatabase,
  user?: { id?: string },
): { id: string; role: string; active: number } | null {
  if (!user?.id) return null;
  const row = db
    .prepare("SELECT id,role,active FROM users WHERE id=? AND active=1")
    .get(user.id) as { id: string; role: string; active: number } | undefined;
  return row || null;
}

export function isCourseInstructor(
  db: AppDatabase,
  user: { id: string; role?: string },
  courseId: string,
): boolean {
  const account = activeAccount(db, user);
  if (!account || !["admin", "instructor"].includes(account.role)) return false;
  const course = db
    .prepare("SELECT owner_id FROM courses WHERE id=?")
    .get(courseId) as { owner_id: string } | undefined;
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

export function hasCourseLearningAccess(
  db: AppDatabase,
  user: { id: string; role?: string },
  courseId: string,
): boolean {
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

export interface CourseInstructor {
  id: string;
  name: string;
  email: string;
  role: string;
  is_owner: boolean;
}

export function listCourseInstructors(
  db: AppDatabase,
  courseId: string,
): CourseInstructor[] {
  const course = db
    .prepare("SELECT owner_id FROM courses WHERE id=?")
    .get(courseId) as { owner_id: string } | undefined;
  if (!course) return [];
  const ids = new Set<string>([course.owner_id]);
  if (hasTable(db, "course_instructors")) {
    const rows = db
      .prepare("SELECT user_id FROM course_instructors WHERE course_id=?")
      .all(courseId) as Array<{ user_id: string }>;
    for (const row of rows) {
      ids.add(row.user_id);
    }
  }
  const users = db
    .prepare(
      "SELECT id,name,email,role FROM users WHERE active=1 AND role IN ('instructor','admin') ORDER BY name",
    )
    .all() as Array<{ id: string; name: string; email: string; role: string }>;

  return users
    .filter((row) => ids.has(row.id))
    .map((row) => ({ ...row, is_owner: row.id === course.owner_id }));
}

export function handleCourseTeams({
  db,
  user,
  path,
  method,
  body = {},
}: {
  db: AppDatabase;
  user: PublicUser;
  path: string;
  method: string;
  body?: Record<string, unknown>;
}): { status: number; data: Record<string, unknown> } | null {
  const match = path.match(/^\/api\/courses\/([^/]+)\/instructors$/);
  if (!match || !["GET", "PUT"].includes(method)) return null;
  const course = db.prepare("SELECT * FROM courses WHERE id=?").get(match[1]) as
    | { id: string; owner_id: string; status: string }
    | undefined;
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
    const instructorIds = body.instructor_ids;
    check(
      Array.isArray(instructorIds) &&
        instructorIds.length <= 100 &&
        instructorIds.every((id) => typeof id === "string"),
      400,
      "Danh sách giảng viên không hợp lệ.",
    );
    transaction(db, () => {
      const ids = [...new Set(instructorIds as string[])];
      for (const id of ids) {
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
      }
      db.prepare("DELETE FROM course_instructors WHERE course_id=?").run(
        course.id,
      );
      const insert = db.prepare(
        "INSERT OR IGNORE INTO course_instructors VALUES (?,?)",
      );
      insert.run(course.id, course.owner_id);
      for (const id of ids) {
        insert.run(course.id, id);
      }
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
