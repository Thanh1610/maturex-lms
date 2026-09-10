import { randomUUID } from "node:crypto";
import { check, textField } from "./auth.js";
import { transaction } from "./database.js";
import { notify } from "./social.js";

const now = () => new Date().toISOString();
const result = (data = { ok: true }, status = 200) => ({ status, data });

export function initCohorts(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cohorts (
      id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id), title TEXT NOT NULL,
      code TEXT NOT NULL COLLATE NOCASE UNIQUE, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK(capacity>0), status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','open','closed','archived')),
      version INTEGER NOT NULL DEFAULT 0, created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cohort_instructors (
      cohort_id TEXT NOT NULL REFERENCES cohorts(id), user_id TEXT NOT NULL REFERENCES users(id), PRIMARY KEY(cohort_id,user_id)
    );
    CREATE TABLE IF NOT EXISTS cohort_members (
      cohort_id TEXT NOT NULL REFERENCES cohorts(id), user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','withdrawn')), version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, PRIMARY KEY(cohort_id,user_id)
    );
    CREATE TABLE IF NOT EXISTS cohort_progress (
      cohort_id TEXT NOT NULL, user_id TEXT NOT NULL, lesson_id TEXT NOT NULL REFERENCES lessons(id), completed_at TEXT NOT NULL,
      PRIMARY KEY(cohort_id,user_id,lesson_id), FOREIGN KEY(cohort_id,user_id) REFERENCES cohort_members(cohort_id,user_id)
    );
    CREATE TABLE IF NOT EXISTS cohort_assignments (
      id TEXT PRIMARY KEY, cohort_id TEXT NOT NULL REFERENCES cohorts(id), user_id TEXT NOT NULL REFERENCES users(id), course_id TEXT NOT NULL REFERENCES courses(id),
      status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','submitted','revision','approved')), body TEXT NOT NULL DEFAULT '', feedback TEXT NOT NULL DEFAULT '',
      version INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, UNIQUE(cohort_id,user_id),
      FOREIGN KEY(cohort_id,user_id) REFERENCES cohort_members(cohort_id,user_id)
    );
    CREATE TABLE IF NOT EXISTS cohort_assignment_history (
      id TEXT PRIMARY KEY, assignment_id TEXT NOT NULL REFERENCES cohort_assignments(id), actor_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL, body TEXT NOT NULL, feedback TEXT NOT NULL, level INTEGER, version INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(assignment_id,version)
    );
    CREATE TABLE IF NOT EXISTS cohort_evidence (
      assignment_id TEXT PRIMARY KEY REFERENCES cohort_assignments(id), user_id TEXT NOT NULL REFERENCES users(id), skill TEXT NOT NULL,
      level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 4), reviewer_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cohort_sessions (
      id TEXT PRIMARY KEY, cohort_id TEXT NOT NULL REFERENCES cohorts(id), title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','cancelled')), version INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cohort_attendance (
      session_id TEXT NOT NULL REFERENCES cohort_sessions(id), user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL CHECK(status IN ('present','absent','excused')), recorded_by TEXT NOT NULL REFERENCES users(id), updated_at TEXT NOT NULL, PRIMARY KEY(session_id,user_id)
    );
    CREATE INDEX IF NOT EXISTS cohort_member_user ON cohort_members(user_id,cohort_id);
    CREATE INDEX IF NOT EXISTS cohort_instructor_user ON cohort_instructors(user_id,cohort_id);
    CREATE INDEX IF NOT EXISTS cohort_course ON cohorts(course_id);
    CREATE INDEX IF NOT EXISTS cohort_session_start ON cohort_sessions(cohort_id,starts_at);
  `);
}

function account(db, user) {
  return user?.id
    ? db.prepare("SELECT * FROM users WHERE id=? AND active=1").get(user.id)
    : null;
}
function leadAccess(db, user, courseId) {
  const current = account(db, user);
  return Boolean(
    current &&
    (current.role === "admin" ||
      (current.role === "instructor" &&
        db
          .prepare("SELECT 1 FROM courses WHERE id=? AND owner_id=?")
          .get(courseId, current.id))),
  );
}
export function cohortTeachAccess(db, user, cohortId) {
  const current = account(db, user);
  return Boolean(
    current &&
    (current.role === "admin" ||
      (current.role === "instructor" &&
        db
          .prepare(
            "SELECT 1 FROM cohort_instructors WHERE cohort_id=? AND user_id=? UNION SELECT 1 FROM cohorts h JOIN courses c ON c.id=h.course_id WHERE h.id=? AND c.owner_id=?",
          )
          .get(cohortId, current.id, cohortId, current.id))),
  );
}
function membership(db, user, id) {
  return db
    .prepare("SELECT * FROM cohort_members WHERE cohort_id=? AND user_id=?")
    .get(id, user.id);
}
function managedLearners(db, user, id) {
  const current = account(db, user);
  if (!current?.management) return [];
  return db
    .prepare(
      `SELECT u.id FROM users u JOIN cohort_members m ON m.user_id=u.id WHERE m.cohort_id=? AND u.role='learner' AND u.management=0 AND u.id<>? AND (u.manager_id=? OR (?<>'' AND u.team=?))`,
    )
    .all(id, current.id, current.id, current.team.trim(), current.team)
    .map((row) => row.id);
}
export function cohortReadAccess(db, user, id) {
  return Boolean(
    account(db, user) &&
    (cohortTeachAccess(db, user, id) ||
      membership(db, user, id) ||
      managedLearners(db, user, id).length),
  );
}
function getCohort(db, id) {
  const c = db
    .prepare(
      "SELECT h.*,c.title AS course_title,c.exercise,c.skill,c.owner_id FROM cohorts h JOIN courses c ON c.id=h.course_id WHERE h.id=?",
    )
    .get(id);
  check(c, 404, "Không tìm thấy lớp học.");
  return c;
}
function instructors(db, id) {
  return db
    .prepare(
      "SELECT u.id,u.name FROM users u JOIN cohort_instructors i ON i.user_id=u.id WHERE i.cohort_id=? AND u.active=1 AND u.role='instructor' ORDER BY u.name",
    )
    .all(id);
}
function progress(db, id, userId) {
  const c = getCohort(db, id);
  const total = db
    .prepare("SELECT COUNT(*) n FROM lessons WHERE course_id=?")
    .get(c.course_id).n;
  const completed = db
    .prepare(
      "SELECT COUNT(*) n FROM cohort_progress WHERE cohort_id=? AND user_id=?",
    )
    .get(id, userId).n;
  const assignment = db
    .prepare(
      "SELECT status FROM cohort_assignments WHERE cohort_id=? AND user_id=?",
    )
    .get(id, userId);
  return {
    completed_lessons: completed,
    total_lessons: total,
    assignment_status: assignment?.status || "todo",
    completed:
      total > 0 && completed === total && assignment?.status === "approved",
  };
}
function summary(db, user, c) {
  const member = membership(db, user, c.id),
    canManage = cohortTeachAccess(db, user, c.id);
  const managed = managedLearners(db, user, c.id);
  const nextSession = db
    .prepare(
      "SELECT id,title,starts_at FROM cohort_sessions WHERE cohort_id=? AND status='scheduled' AND starts_at>? ORDER BY starts_at LIMIT 1",
    )
    .get(c.id, now());
  return {
    ...c,
    instructors: instructors(db, c.id),
    can_manage: canManage,
    can_manage_staff: leadAccess(db, user, c.course_id),
    enrolled: member?.status === "active",
    membership_status: member?.status || null,
    member_count:
      canManage || member || leadAccess(db, user, c.course_id)
        ? db
            .prepare(
              "SELECT COUNT(*) n FROM cohort_members WHERE cohort_id=? AND status='active'",
            )
            .get(c.id).n
        : managed.length,
    ...(member ? { progress: progress(db, c.id, user.id) } : {}),
    ...((canManage || member?.status === "active") && nextSession
      ? { next_session: nextSession }
      : {}),
  };
}
function candidates(db, user, cohort) {
  const canCreate =
    account(db, user)?.role === "admin" ||
    (db
      .prepare("SELECT 1 FROM courses WHERE owner_id=? AND status='published'")
      .get(user.id) &&
      account(db, user)?.role === "instructor");
  const manage = cohort
    ? cohortTeachAccess(db, user, cohort.id)
    : canCreate ||
      Boolean(
        db
          .prepare("SELECT 1 FROM cohort_instructors WHERE user_id=?")
          .get(user.id) && account(db, user)?.role === "instructor",
      );
  const staffAccess = cohort
    ? leadAccess(db, user, cohort.course_id)
    : canCreate;
  return {
    staff: staffAccess
      ? db
          .prepare(
            "SELECT id,name FROM users WHERE active=1 AND role='instructor' ORDER BY name",
          )
          .all()
      : [],
    learners: manage
      ? db
          .prepare(
            "SELECT id,name,email FROM users WHERE active=1 AND role='learner' AND management=0 ORDER BY name",
          )
          .all()
      : [],
    courses: canCreate
      ? db
          .prepare(
            "SELECT id,title FROM courses WHERE status='published' AND (?='admin' OR owner_id=?) ORDER BY title",
          )
          .all(account(db, user).role, user.id)
      : [],
  };
}
function memberRows(db, user, c) {
  const canManage = cohortTeachAccess(db, user, c.id),
    allowed = managedLearners(db, user, c.id);
  return db
    .prepare(
      "SELECT m.*,u.name,u.email FROM cohort_members m JOIN users u ON u.id=m.user_id WHERE m.cohort_id=? ORDER BY u.name",
    )
    .all(c.id)
    .filter(
      (m) => canManage || m.user_id === user.id || allowed.includes(m.user_id),
    )
    .map((m) => ({ ...m, ...progress(db, c.id, m.user_id) }));
}
function assignmentDto(db, a) {
  return {
    ...a,
    history: db
      .prepare(
        "SELECT h.*,u.name AS actor_name FROM cohort_assignment_history h JOIN users u ON u.id=h.actor_id WHERE assignment_id=? ORDER BY version",
      )
      .all(a.id),
  };
}
function detail(db, user, c) {
  const teach = cohortTeachAccess(db, user, c.id),
    member = membership(db, user, c.id),
    learning = teach || member?.status === "active";
  const rows =
    teach || member
      ? db
          .prepare(
            `SELECT a.*,u.name AS learner_name,c.title AS course_title,c.exercise,c.skill FROM cohort_assignments a JOIN users u ON u.id=a.user_id JOIN courses c ON c.id=a.course_id WHERE a.cohort_id=? AND (?=1 OR a.user_id=?) ORDER BY a.updated_at DESC`,
          )
          .all(c.id, teach ? 1 : 0, user.id)
          .map((a) => assignmentDto(db, a))
      : [];
  const members = memberRows(db, user, c);
  const sessions =
    teach || member
      ? db
          .prepare(
            "SELECT * FROM cohort_sessions WHERE cohort_id=? ORDER BY starts_at",
          )
          .all(c.id)
          .filter(
            (s) =>
              learning ||
              db
                .prepare(
                  "SELECT 1 FROM cohort_attendance WHERE session_id=? AND user_id=?",
                )
                .get(s.id, user.id),
          )
          .map((s) => ({
            ...s,
            attendance: members
              .filter((m) => teach || m.user_id === user.id)
              .filter(
                (m) =>
                  m.status === "active" ||
                  db
                    .prepare(
                      "SELECT 1 FROM cohort_attendance WHERE session_id=? AND user_id=?",
                    )
                    .get(s.id, m.user_id),
              )
              .map((m) => ({
                user_id: m.user_id,
                name: m.name,
                status:
                  db
                    .prepare(
                      "SELECT status FROM cohort_attendance WHERE session_id=? AND user_id=?",
                    )
                    .get(s.id, m.user_id)?.status || "unrecorded",
              })),
          }))
      : [];
  return {
    cohort: summary(db, user, c),
    lessons: learning
      ? db
          .prepare("SELECT * FROM lessons WHERE course_id=? ORDER BY position")
          .all(c.course_id)
      : [],
    members,
    progress: member
      ? db
          .prepare(
            "SELECT lesson_id FROM cohort_progress WHERE cohort_id=? AND user_id=?",
          )
          .all(c.id, user.id)
          .map((p) => p.lesson_id)
      : [],
    assignment: rows.find((a) => a.user_id === user.id) || null,
    assignments: teach ? rows : [],
    sessions,
    ...candidates(db, user, c),
  };
}
function checkVersion(row, body) {
  check(
    Number.isInteger(body.version) && body.version === row.version,
    409,
    "Dữ liệu đã thay đổi. Hãy tải lại trước khi lưu.",
  );
}
function ensureWritable(c) {
  check(
    ["draft", "open"].includes(c.status),
    409,
    "Lớp đã đóng; dữ liệu chỉ được đọc.",
  );
}
function learnerWrite(db, user, c) {
  check(
    membership(db, user, c.id)?.status === "active",
    403,
    "Bạn không còn trong danh sách học viên đang học.",
  );
  check(c.status === "open", 409, "Lớp chưa mở hoặc đã đóng.");
}
function fields(body, old = {}) {
  const data = { ...old, ...body };
  check(
    typeof data.start_date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.start_date) &&
      Number.isFinite(Date.parse(data.start_date)) &&
      new Date(data.start_date).toISOString().slice(0, 10) === data.start_date,
    400,
    "Ngày bắt đầu không hợp lệ.",
  );
  check(
    typeof data.end_date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.end_date) &&
      Number.isFinite(Date.parse(data.end_date)) &&
      new Date(data.end_date).toISOString().slice(0, 10) === data.end_date &&
      data.end_date >= data.start_date,
    400,
    "Ngày kết thúc không hợp lệ.",
  );
  check(
    Number.isInteger(data.capacity) &&
      data.capacity > 0 &&
      data.capacity <= 10000,
    400,
    "Sĩ số phải từ 1 đến 10.000.",
  );
  check(
    ["draft", "open", "closed", "archived"].includes(data.status || "draft"),
    400,
    "Trạng thái lớp không hợp lệ.",
  );
  return {
    title: textField(data.title, "Tên lớp", 180),
    code: textField(data.code, "Mã lớp", 60),
    start_date: data.start_date,
    end_date: data.end_date,
    capacity: data.capacity,
    status: data.status || "draft",
  };
}
function staffIds(db, ids) {
  check(
    Array.isArray(ids) &&
      ids.length > 0 &&
      ids.length <= 100 &&
      ids.every((id) => typeof id === "string"),
    400,
    "Lớp cần ít nhất một giảng viên đang hoạt động.",
  );
  ids = [...new Set(ids)];
  check(
    ids.every((id) =>
      db
        .prepare(
          "SELECT 1 FROM users WHERE id=? AND role='instructor' AND active=1",
        )
        .get(id),
    ),
    400,
    "Giảng viên không hợp lệ hoặc đã ngừng hoạt động.",
  );
  return ids;
}
function setStaff(db, id, ids) {
  db.prepare("DELETE FROM cohort_instructors WHERE cohort_id=?").run(id);
  for (const userId of ids)
    db.prepare("INSERT INTO cohort_instructors VALUES(?,?)").run(id, userId);
}
function notifyClass(db, c, message) {
  for (const m of db
    .prepare(
      "SELECT u.id AS user_id FROM users u JOIN cohort_members m ON m.user_id=u.id WHERE m.cohort_id=? AND m.status='active' AND u.active=1 UNION SELECT u.id AS user_id FROM users u JOIN cohort_instructors i ON i.user_id=u.id WHERE i.cohort_id=? AND u.role='instructor' AND u.active=1",
    )
    .all(c.id, c.id))
    notify(db, m.user_id, message, `cohorts/${c.id}`);
}
function rosterAdd(db, user, c, ids, restore = false) {
  check(
    Array.isArray(ids) &&
      ids.length > 0 &&
      ids.length <= 10000 &&
      ids.every((id) => typeof id === "string"),
    400,
    "Danh sách học viên không hợp lệ.",
  );
  ids = [...new Set(ids)];
  check(
    restore ||
      !ids.some((id) =>
        db
          .prepare(
            "SELECT 1 FROM cohort_members WHERE cohort_id=? AND user_id=? AND status='withdrawn'",
          )
          .get(c.id, id),
      ),
    409,
    "Hãy khôi phục học viên từ danh sách lớp với phiên bản hiện tại.",
  );
  for (const id of ids)
    check(
      db.prepare("SELECT 1 FROM users WHERE id=? AND active=1").get(id),
      400,
      "Học viên không hợp lệ hoặc đã ngừng hoạt động.",
    );
  const active = db
    .prepare(
      "SELECT COUNT(*) n FROM cohort_members WHERE cohort_id=? AND status='active'",
    )
    .get(c.id).n;
  const additions = ids.filter(
    (id) =>
      db
        .prepare(
          "SELECT status FROM cohort_members WHERE cohort_id=? AND user_id=?",
        )
        .get(c.id, id)?.status !== "active",
  );
  check(active + additions.length <= c.capacity, 409, "Lớp đã vượt quá sĩ số.");
  for (const id of additions) {
    db.prepare(
      "INSERT INTO cohort_members(cohort_id,user_id,created_at) VALUES(?,?,?) ON CONFLICT(cohort_id,user_id) DO UPDATE SET status='active',version=version+1",
    ).run(c.id, id, now());
    db.prepare(
      "INSERT OR IGNORE INTO cohort_assignments(id,cohort_id,user_id,course_id,updated_at) VALUES(?,?,?,?,?)",
    ).run(randomUUID(), c.id, id, c.course_id, now());
    notify(db, id, `Bạn được thêm vào lớp ${c.title}.`, `cohorts/${c.id}`);
  }
}
function sessionFields(body, c, old = {}) {
  const data = { ...old, ...body },
    starts = Date.parse(data.starts_at),
    ends = Date.parse(data.ends_at);
  check(
    typeof data.starts_at === "string" &&
      typeof data.ends_at === "string" &&
      Number.isFinite(starts) &&
      Number.isFinite(ends) &&
      starts > Date.now() &&
      ends > starts,
    400,
    "Buổi học cần bắt đầu trong tương lai và kết thúc sau giờ bắt đầu.",
  );
  check(
    new Date(starts).toISOString().slice(0, 10) >= c.start_date &&
      new Date(ends).toISOString().slice(0, 10) <= c.end_date,
    400,
    "Buổi học phải nằm trong thời gian của lớp.",
  );
  check(
    ["scheduled", "cancelled"].includes(data.status || "scheduled"),
    400,
    "Trạng thái buổi học không hợp lệ.",
  );
  return {
    title: textField(data.title, "Tên buổi học", 180),
    starts_at: new Date(starts).toISOString(),
    ends_at: new Date(ends).toISOString(),
    location: textField(data.location ?? "", "Địa điểm", 1000, 0),
    status: data.status || "scheduled",
  };
}
function reportRows(db, user, c) {
  return memberRows(db, user, c).map((m) => {
    const attendance = db
      .prepare(
        "SELECT a.status,COUNT(*) n FROM cohort_attendance a JOIN cohort_sessions s ON s.id=a.session_id WHERE s.cohort_id=? AND a.user_id=? AND s.status='scheduled' GROUP BY a.status",
      )
      .all(c.id, m.user_id);
    const counts = Object.fromEntries(attendance.map((a) => [a.status, a.n]));
    return {
      ...m,
      present: counts.present || 0,
      absent: counts.absent || 0,
      excused: counts.excused || 0,
      total_sessions: db
        .prepare(
          "SELECT COUNT(*) n FROM cohort_sessions WHERE cohort_id=? AND status='scheduled' AND starts_at<=?",
        )
        .get(c.id, now()).n,
    };
  });
}
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function classEvidence(db, user) {
  return db
    .prepare(
      `SELECT e.*,u.name AS reviewer_name,c.title AS course_title,h.id AS cohort_id,h.title AS cohort_title,h.code AS cohort_code FROM cohort_evidence e JOIN users u ON u.id=e.reviewer_id JOIN cohort_assignments a ON a.id=e.assignment_id JOIN courses c ON c.id=a.course_id JOIN cohorts h ON h.id=a.cohort_id WHERE e.user_id=? ORDER BY e.created_at DESC`,
    )
    .all(user.id);
}

export function generateCohortReminders(db, timestamp = Date.now()) {
  if (
    !db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='cohort_sessions'",
      )
      .get()
  )
    return;
  const sessions = db
    .prepare(
      "SELECT s.*,c.title AS cohort_title FROM cohort_sessions s JOIN cohorts c ON c.id=s.cohort_id WHERE c.status='open' AND s.status='scheduled' AND s.starts_at>? AND s.starts_at<=?",
    )
    .all(
      new Date(timestamp).toISOString(),
      new Date(timestamp + 24 * 3600000).toISOString(),
    );
  for (const session of sessions) {
    const recipients = db
      .prepare(
        "SELECT u.id FROM users u JOIN cohort_members m ON m.user_id=u.id WHERE m.cohort_id=? AND m.status='active' AND u.active=1 UNION SELECT u.id FROM users u JOIN cohort_instructors i ON i.user_id=u.id WHERE i.cohort_id=? AND u.active=1 AND u.role='instructor'",
      )
      .all(session.cohort_id, session.cohort_id);
    for (const recipient of recipients)
      notify(
        db,
        recipient.id,
        `Buổi học ${session.title} của lớp ${session.cohort_title} bắt đầu trong 24 giờ.`,
        `cohorts/${session.cohort_id}`,
        `cohort-reminder:${session.id}:${session.starts_at}`,
      );
  }
}

export function handleCohorts({
  db,
  user,
  path,
  method,
  body = {},
  query = new URLSearchParams(),
}) {
  if (path !== "/api/cohorts" && !path.startsWith("/api/cohorts/")) return null;
  check(account(db, user), 401, "Tài khoản không còn hoạt động.");
  if (path === "/api/cohorts") {
    if (method === "GET")
      return result({
        cohorts: db
          .prepare(
            "SELECT h.*,c.title AS course_title,c.exercise,c.skill,c.owner_id FROM cohorts h JOIN courses c ON c.id=h.course_id ORDER BY h.created_at DESC",
          )
          .all()
          .filter(
            (c) =>
              cohortReadAccess(db, user, c.id) ||
              leadAccess(db, user, c.course_id),
          )
          .map((c) => summary(db, user, c)),
        ...candidates(db, user),
      });
    if (method === "POST")
      return transaction(db, () => {
        check(
          typeof body.course_id === "string" && body.course_id.length > 0,
          400,
          "Khóa học không hợp lệ.",
        );
        const course = db
          .prepare("SELECT * FROM courses WHERE id=? AND status='published'")
          .get(body.course_id);
        check(course, 404, "Chỉ tạo lớp từ khóa học đã xuất bản.");
        check(
          leadAccess(db, user, course.id),
          403,
          "Chỉ quản trị viên hoặc chủ khóa học có thể tạo lớp.",
        );
        const f = fields({ ...body, status: "draft" }),
          ids = staffIds(db, body.instructor_ids);
        check(
          !db
            .prepare("SELECT 1 FROM cohorts WHERE code=? COLLATE NOCASE")
            .get(f.code),
          409,
          "Mã lớp đã được sử dụng.",
        );
        const id = randomUUID();
        db.prepare(
          "INSERT INTO cohorts(id,course_id,title,code,start_date,end_date,capacity,status,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        ).run(
          id,
          course.id,
          f.title,
          f.code,
          f.start_date,
          f.end_date,
          f.capacity,
          f.status,
          user.id,
          now(),
        );
        setStaff(db, id, ids);
        for (const staff of ids)
          notify(
            db,
            staff,
            `Bạn được phân công giảng dạy lớp ${f.title}.`,
            `cohorts/${id}`,
          );
        return result({ cohort: summary(db, user, getCohort(db, id)) }, 201);
      });
    return null;
  }
  const match = path.match(/^\/api\/cohorts\/([^/]+)(?:\/(.*))?$/);
  if (!match) return null;
  const [, id, rest = ""] = match;
  if (method === "GET") {
    const c = getCohort(db, id);
    check(
      cohortReadAccess(db, user, id) || leadAccess(db, user, c.course_id),
      404,
      "Không tìm thấy lớp học.",
    );
    if (!rest) return result(detail(db, user, c));
    if (rest === "report") {
      check(
        cohortTeachAccess(db, user, id) || managedLearners(db, user, id).length,
        403,
        "Bạn không có quyền xem báo cáo lớp.",
      );
      const rows = reportRows(db, user, c);
      if (query.get("format") === "csv") {
        const keys = [
          "user_id",
          "name",
          "email",
          "status",
          "completed_lessons",
          "total_lessons",
          "assignment_status",
          "completed",
          "present",
          "absent",
          "excused",
          "total_sessions",
        ];
        return result({
          csv:
            "\uFEFF" +
            [
              keys.map(csvCell).join(","),
              ...rows.map((row) =>
                keys.map((key) => csvCell(row[key])).join(","),
              ),
            ].join("\r\n"),
          fileName: `class-${c.id}.csv`,
        });
      }
      return result({ cohort: summary(db, user, c), rows });
    }
    return null;
  }
  return transaction(db, () => {
    const c = getCohort(db, id),
      teach = cohortTeachAccess(db, user, id),
      lead = leadAccess(db, user, c.course_id);
    if (!rest && method === "PATCH") {
      check(teach || lead, 404, "Không tìm thấy lớp học.");
      checkVersion(c, body);
      if (["closed", "archived"].includes(c.status))
        check(
          lead,
          403,
          "Chỉ quản trị viên hoặc chủ khóa học có thể mở lại lớp.",
        );
      const f = fields(body, c);
      check(
        !db
          .prepare(
            "SELECT 1 FROM cohorts WHERE code=? COLLATE NOCASE AND id<>?",
          )
          .get(f.code, id),
        409,
        "Mã lớp đã được sử dụng.",
      );
      check(
        db
          .prepare(
            "SELECT COUNT(*) n FROM cohort_members WHERE cohort_id=? AND status='active'",
          )
          .get(id).n <= f.capacity,
        409,
        "Sĩ số nhỏ hơn danh sách đang học.",
      );
      if (body.instructor_ids !== undefined) {
        check(
          lead,
          403,
          "Chỉ quản trị viên hoặc chủ khóa học có thể phân công giảng viên.",
        );
        setStaff(db, id, staffIds(db, body.instructor_ids));
      }
      check(
        instructors(db, id).length > 0,
        409,
        "Lớp cần ít nhất một giảng viên đang hoạt động.",
      );
      check(
        !db
          .prepare(
            "SELECT 1 FROM cohort_sessions WHERE cohort_id=? AND (substr(starts_at,1,10)<? OR substr(ends_at,1,10)>?)",
          )
          .get(id, f.start_date, f.end_date),
        409,
        "Thời gian lớp không bao gồm các buổi học hiện tại.",
      );
      db.prepare(
        "UPDATE cohorts SET title=?,code=?,start_date=?,end_date=?,capacity=?,status=?,version=version+1 WHERE id=?",
      ).run(
        f.title,
        f.code,
        f.start_date,
        f.end_date,
        f.capacity,
        f.status,
        id,
      );
      notifyClass(db, c, `Lớp ${f.title} đã cập nhật thông tin.`);
      return result({ cohort: summary(db, user, getCohort(db, id)) });
    }
    if (rest === "members" && method === "POST") {
      check(teach, 404, "Không tìm thấy lớp học.");
      ensureWritable(c);
      rosterAdd(db, user, c, body.user_ids);
      return result();
    }
    let action = rest.match(/^members\/([^/]+)$/);
    if (action && method === "PATCH") {
      check(teach, 404, "Không tìm thấy lớp học.");
      ensureWritable(c);
      const member = db
        .prepare("SELECT * FROM cohort_members WHERE cohort_id=? AND user_id=?")
        .get(id, action[1]);
      check(member, 404, "Không tìm thấy học viên.");
      checkVersion(member, body);
      check(
        ["active", "withdrawn"].includes(body.status),
        400,
        "Trạng thái học viên không hợp lệ.",
      );
      if (body.status !== member.status) {
        if (body.status === "active")
          rosterAdd(db, user, c, [member.user_id], true);
        else {
          db.prepare(
            "UPDATE cohort_members SET status='withdrawn',version=version+1 WHERE cohort_id=? AND user_id=?",
          ).run(id, member.user_id);
          notify(
            db,
            member.user_id,
            `Bạn đã rút khỏi lớp ${c.title}.`,
            `cohorts/${id}`,
          );
        }
      }
      return result();
    }
    action = rest.match(/^lessons\/([^/]+)\/complete$/);
    if (action && method === "POST") {
      learnerWrite(db, user, c);
      check(
        db
          .prepare("SELECT 1 FROM lessons WHERE id=? AND course_id=?")
          .get(action[1], c.course_id),
        404,
        "Không tìm thấy bài học.",
      );
      db.prepare("INSERT OR IGNORE INTO cohort_progress VALUES(?,?,?,?)").run(
        id,
        user.id,
        action[1],
        now(),
      );
      return result();
    }
    action = rest.match(/^assignments\/([^/]+)\/(submit|review)$/);
    if (action && method === "POST") {
      const review = action[2] === "review",
        a = db
          .prepare(
            "SELECT * FROM cohort_assignments WHERE id=? AND cohort_id=?",
          )
          .get(action[1], id);
      check(
        a && (review ? teach : a.user_id === user.id),
        404,
        "Không tìm thấy bài tập.",
      );
      if (review) {
        ensureWritable(c);
        check(
          a.user_id !== user.id,
          403,
          "Không thể tự đánh giá bài của mình.",
        );
      } else learnerWrite(db, user, c);
      checkVersion(a, body);
      let status,
        content = a.body,
        feedback = "",
        level = null;
      if (review) {
        check(a.status === "submitted", 409, "Bài không còn chờ chấm.");
        check(
          ["approved", "revision"].includes(body.status),
          400,
          "Kết quả đánh giá không hợp lệ.",
        );
        status = body.status;
        feedback = textField(body.feedback, "Phản hồi", 10000);
        if (status === "approved") {
          check(
            Number.isInteger(body.level) && body.level >= 1 && body.level <= 4,
            400,
            "Mức năng lực cần từ 1 đến 4.",
          );
          level = body.level;
        }
      } else {
        check(
          ["todo", "revision"].includes(a.status),
          409,
          "Chỉ nộp bài mới hoặc bài cần bổ sung.",
        );
        status = "submitted";
        content = textField(body.body, "Nội dung bài nộp", 30000);
      }
      const timestamp = now();
      db.prepare(
        "UPDATE cohort_assignments SET status=?,body=?,feedback=?,version=version+1,updated_at=? WHERE id=?",
      ).run(status, content, feedback, timestamp, a.id);
      db.prepare(
        "INSERT INTO cohort_assignment_history VALUES(?,?,?,?,?,?,?,?,?)",
      ).run(
        randomUUID(),
        a.id,
        user.id,
        status,
        content,
        feedback,
        level,
        a.version + 1,
        timestamp,
      );
      if (status === "approved")
        db.prepare("INSERT INTO cohort_evidence VALUES(?,?,?,?,?,?)").run(
          a.id,
          a.user_id,
          c.skill,
          level,
          user.id,
          timestamp,
        );
      if (review)
        notify(
          db,
          a.user_id,
          `Bài tập lớp ${c.title} đã được đánh giá.`,
          `cohorts/${id}`,
        );
      else
        for (const staff of instructors(db, id))
          if (staff.id !== user.id)
            notify(
              db,
              staff.id,
              `Có bài nộp mới trong lớp ${c.title}.`,
              `cohorts/${id}`,
            );
      return result();
    }
    if (rest === "sessions" && method === "POST") {
      check(teach, 404, "Không tìm thấy lớp học.");
      ensureWritable(c);
      const f = sessionFields(body, c),
        sessionId = randomUUID();
      db.prepare(
        "INSERT INTO cohort_sessions(id,cohort_id,title,starts_at,ends_at,location,status,created_at) VALUES(?,?,?,?,?,?,?,?)",
      ).run(
        sessionId,
        id,
        f.title,
        f.starts_at,
        f.ends_at,
        f.location,
        f.status,
        now(),
      );
      notifyClass(db, c, `Lớp ${c.title} có buổi học mới: ${f.title}.`);
      return result(
        {
          session: db
            .prepare("SELECT * FROM cohort_sessions WHERE id=?")
            .get(sessionId),
        },
        201,
      );
    }
    action = rest.match(/^sessions\/([^/]+)(?:\/(attendance))?$/);
    if (
      action &&
      ((method === "PATCH" && !action[2]) || (method === "PUT" && action[2]))
    ) {
      check(teach, 404, "Không tìm thấy lớp học.");
      ensureWritable(c);
      const session = db
        .prepare("SELECT * FROM cohort_sessions WHERE id=? AND cohort_id=?")
        .get(action[1], id);
      check(session, 404, "Không tìm thấy buổi học.");
      checkVersion(session, body);
      if (action[2]) {
        check(
          session.status === "scheduled" &&
            Date.parse(session.starts_at) <= Date.now(),
          409,
          "Chỉ điểm danh sau khi buổi học bắt đầu.",
        );
        check(
          Array.isArray(body.records) && body.records.length <= 10000,
          400,
          "Danh sách điểm danh không hợp lệ.",
        );
        const seen = new Set();
        for (const r of body.records) {
          check(
            r &&
              typeof r.user_id === "string" &&
              !seen.has(r.user_id) &&
              ["present", "absent", "excused"].includes(r.status),
            400,
            "Điểm danh không hợp lệ hoặc trùng học viên.",
          );
          seen.add(r.user_id);
          check(
            db
              .prepare(
                "SELECT 1 FROM cohort_members WHERE cohort_id=? AND user_id=? AND status='active'",
              )
              .get(id, r.user_id),
            400,
            "Chỉ điểm danh học viên đang trong lớp.",
          );
        }
        for (const r of body.records)
          db.prepare(
            "INSERT INTO cohort_attendance VALUES(?,?,?,?,?) ON CONFLICT(session_id,user_id) DO UPDATE SET status=excluded.status,recorded_by=excluded.recorded_by,updated_at=excluded.updated_at",
          ).run(session.id, r.user_id, r.status, user.id, now());
        db.prepare(
          "UPDATE cohort_sessions SET version=version+1 WHERE id=?",
        ).run(session.id);
      } else {
        check(
          Date.parse(session.starts_at) > Date.now(),
          409,
          "Không thể đổi buổi học đã bắt đầu.",
        );
        const f = sessionFields(body, c, session);
        db.prepare(
          "UPDATE cohort_sessions SET title=?,starts_at=?,ends_at=?,location=?,status=?,version=version+1 WHERE id=?",
        ).run(
          f.title,
          f.starts_at,
          f.ends_at,
          f.location,
          f.status,
          session.id,
        );
        notifyClass(
          db,
          c,
          `Buổi học ${f.title} của lớp ${c.title} đã cập nhật.`,
        );
      }
      return result({
        session: db
          .prepare("SELECT * FROM cohort_sessions WHERE id=?")
          .get(session.id),
      });
    }
    return null;
  });
}
