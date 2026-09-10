import { randomUUID } from "node:crypto";
import { check, type PublicUser, textField } from "./auth";
import { isCourseInstructor } from "./course-access";
import { type AppDatabase, transaction } from "./database";

const now = () => new Date().toISOString();

const teach = (user: { role: string }) =>
  check(
    ["admin", "instructor"].includes(user.role),
    403,
    "Bạn không có quyền quản lý lộ trình.",
  );

const manage = (user: { role: string }) =>
  check(
    ["admin", "manager"].includes(user.role),
    403,
    "Bạn không có quyền giao lộ trình.",
  );

export function initOrganization(db: AppDatabase): void {
  db.exec(`CREATE TABLE IF NOT EXISTS learning_paths (
    id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS path_courses (
    path_id TEXT NOT NULL REFERENCES learning_paths(id), course_id TEXT NOT NULL REFERENCES courses(id),
    position INTEGER NOT NULL, PRIMARY KEY(path_id,course_id), UNIQUE(path_id,position)
  );
  CREATE TABLE IF NOT EXISTS path_enrollments (
    path_id TEXT NOT NULL REFERENCES learning_paths(id), user_id TEXT NOT NULL REFERENCES users(id),
    assigned_by TEXT REFERENCES users(id), reason TEXT NOT NULL DEFAULT '', due_date TEXT,
    created_at TEXT NOT NULL, PRIMARY KEY(path_id,user_id)
  );`);
}

interface PermittedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  job: string;
  manager_id: string | null;
  active: number;
  management: number;
}

function permittedUsers(
  db: AppDatabase,
  user: { id: string; role: string },
): PermittedUser[] {
  check(
    ["admin", "manager", "instructor"].includes(user.role),
    403,
    "Bạn không có quyền xem dữ liệu đội ngũ.",
  );
  const rows = db
    .prepare(
      `SELECT id,name,email,role,team,job,manager_id,active,management FROM users
    WHERE role='learner' AND management=0 ORDER BY name`,
    )
    .all() as unknown as PermittedUser[];
  if (user.role === "admin") return rows;
  if (user.role === "manager") {
    const manager = db
      .prepare("SELECT team FROM users WHERE id=?")
      .get(user.id) as { team?: string } | undefined;
    return rows.filter(
      (row) =>
        row.id !== user.id &&
        (row.manager_id === user.id ||
          (manager?.team?.trim() && row.team === manager.team)),
    );
  }
  const roster = new Set(
    (
      db
        .prepare(`SELECT DISTINCT e.user_id,e.course_id FROM enrollments e`)
        .all() as Array<{ user_id: string; course_id: string }>
    )
      .filter((row) => isCourseInstructor(db, user, row.course_id))
      .map((row) => row.user_id),
  );
  return rows.filter((row) => roster.has(row.id));
}

function courseProgress(
  db: AppDatabase,
  userId: string,
  course: { id: string; title: string },
) {
  const total = (
    db
      .prepare("SELECT COUNT(*) n FROM lessons WHERE course_id=?")
      .get(course.id) as { n: number }
  ).n;
  const completed = (
    db
      .prepare(
        `SELECT COUNT(*) n FROM progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=? AND l.course_id=?`,
      )
      .get(userId, course.id) as { n: number }
  ).n;
  const assignment = db
    .prepare("SELECT status FROM assignments WHERE user_id=? AND course_id=?")
    .get(userId, course.id) as { status?: string } | undefined;
  const done =
    total > 0 && completed === total && assignment?.status === "approved";
  return {
    course_id: course.id,
    course_title: course.title,
    lessons: total,
    completed_lessons: completed,
    progress: total ? Math.round((completed / total) * 100) : 0,
    assignment_status: assignment?.status || "todo",
    status: done
      ? "completed"
      : completed > 0 || (assignment && assignment.status !== "todo")
        ? "in_progress"
        : "not_started",
  };
}

function pathCourses(
  db: AppDatabase,
  id: string,
): Array<{ id: string; title: string; status: string }> {
  return db
    .prepare(
      `SELECT c.id,c.title,c.status FROM path_courses pc JOIN courses c ON c.id=pc.course_id WHERE pc.path_id=? ORDER BY pc.position`,
    )
    .all(id) as Array<{ id: string; title: string; status: string }>;
}

function pathProgress(db: AppDatabase, id: string, userId: string) {
  const courses = pathCourses(db, id).map((course) =>
    courseProgress(db, userId, course),
  );
  const complete = courses.filter(
    (course) => course.status === "completed",
  ).length;
  return {
    completed_courses: complete,
    total_courses: courses.length,
    progress: courses.length
      ? Math.round((complete / courses.length) * 100)
      : 0,
    status:
      courses.length && complete === courses.length
        ? "completed"
        : courses.some((course) => course.status !== "not_started")
          ? "in_progress"
          : "not_started",
  };
}

function listPaths(
  db: AppDatabase,
  user: { id: string; role: string },
): Array<Record<string, unknown>> {
  return (
    db
      .prepare(
        `SELECT p.*,u.name AS owner_name FROM learning_paths p JOIN users u ON u.id=p.owner_id
    WHERE p.status='published' OR ?='admin' OR p.owner_id=? OR EXISTS(SELECT 1 FROM path_enrollments pe WHERE pe.path_id=p.id AND pe.user_id=?) ORDER BY p.created_at DESC`,
      )
      .all(user.role, user.id, user.id) as Array<Record<string, unknown>>
  ).map((path) => {
    const enrollment = db
      .prepare("SELECT * FROM path_enrollments WHERE path_id=? AND user_id=?")
      .get(String(path.id), user.id);
    return {
      ...path,
      courses: pathCourses(db, String(path.id)),
      enrollment: enrollment || null,
      ...(enrollment
        ? (() => {
            const { status: learning_status, ...progress } = pathProgress(
              db,
              String(path.id),
              user.id,
            );
            return { learning_status, ...progress };
          })()
        : {}),
    };
  });
}

function savePath(
  db: AppDatabase,
  user: { id: string; role: string },
  body: Record<string, unknown>,
  id?: string,
) {
  teach(user);
  return transaction(db, () => {
    let pathId = id;
    if (pathId) {
      const path = db
        .prepare("SELECT * FROM learning_paths WHERE id=?")
        .get(pathId) as { owner_id: string } | undefined;
      check(path, 404, "Không tìm thấy lộ trình.");
      check(
        user.role === "admin" || path.owner_id === user.id,
        403,
        "Bạn không phụ trách lộ trình này.",
      );
      check(
        typeof body.status === "string" &&
          ["draft", "published", "archived"].includes(body.status),
        400,
        "Trạng thái không hợp lệ.",
      );
      if (body.status === "published") {
        check(
          pathCourses(db, pathId).every(
            (course) => course.status === "published",
          ),
          409,
          "Tất cả khóa học phải được phát hành trước khi mở lộ trình.",
        );
      }
      db.prepare("UPDATE learning_paths SET status=? WHERE id=?").run(
        body.status,
        pathId,
      );
    } else {
      const title = textField(body.title, "Tên lộ trình", 180);
      const description = textField(body.description ?? "", "Mô tả", 5000, 0);
      const courseIds = body.course_ids;
      check(
        Array.isArray(courseIds) &&
          courseIds.length > 0 &&
          courseIds.length <= 50 &&
          courseIds.every((x) => typeof x === "string") &&
          new Set(courseIds).size === courseIds.length,
        400,
        "Chọn từ 1 đến 50 khóa học khác nhau.",
      );
      for (const courseId of courseIds as string[]) {
        const course = db
          .prepare("SELECT * FROM courses WHERE id=?")
          .get(courseId) as { id: string; status: string } | undefined;
        check(course, 400, "Khóa học không tồn tại.");
        check(
          isCourseInstructor(db, user, course.id) ||
            course.status === "published",
          403,
          "Bạn không có quyền sử dụng khóa học này.",
        );
      }
      pathId = randomUUID();
      db.prepare(
        "INSERT INTO learning_paths (id,owner_id,title,description,created_at) VALUES (?,?,?,?,?)",
      ).run(pathId, user.id, title, description, now());
      (courseIds as string[]).forEach((courseId, position) =>
        db
          .prepare("INSERT INTO path_courses VALUES (?,?,?)")
          .run(pathId, courseId, position),
      );
    }
    return {
      ...(db.prepare("SELECT * FROM learning_paths WHERE id=?").get(pathId) as Record<string, unknown>),
      courses: pathCourses(db, pathId),
    };
  });
}

function joinPath(
  db: AppDatabase,
  user: { id: string; role: string },
  id: string,
  body: Record<string, unknown>,
  assign: boolean,
) {
  if (assign) manage(user);
  const userId = assign
    ? textField(body.user_id, "Người học", 100)
    : user.id;
  let reason = "";
  let dueDate: string | null = null;
  if (assign) {
    check(
      permittedUsers(db, user).some((row) => row.id === userId && row.active),
      403,
      "Người học không thuộc phạm vi quản lý hoặc đã bị khóa.",
    );
    reason = textField(body.reason, "Lý do giao", 2000);
    dueDate = textField(body.due_date, "Hạn hoàn thành", 10);
    check(
      /^\d{4}-\d{2}-\d{2}$/.test(dueDate) &&
        Number.isFinite(Date.parse(dueDate)) &&
        new Date(dueDate).toISOString().slice(0, 10) === dueDate,
      400,
      "Hạn hoàn thành không hợp lệ.",
    );
  }
  return transaction(db, () => {
    check(
      db
        .prepare(
          "SELECT id FROM learning_paths WHERE id=? AND status='published'",
        )
        .get(id),
      404,
      "Lộ trình chưa mở đăng ký.",
    );
    const courses = pathCourses(db, id);
    check(
      courses.length &&
        courses.every((course) => course.status === "published"),
      409,
      "Một khóa học trong lộ trình chưa mở đăng ký.",
    );
    const timestamp = now();
    db.prepare(
      "INSERT OR IGNORE INTO path_enrollments VALUES (?,?,?,?,?,?)",
    ).run(id, userId, assign ? user.id : null, reason, dueDate, timestamp);
    if (assign) {
      db.prepare(
        "UPDATE path_enrollments SET assigned_by=?,reason=?,due_date=? WHERE path_id=? AND user_id=?",
      ).run(user.id, reason, dueDate, id, userId);
    }
    for (const course of courses) {
      db.prepare(
        "INSERT OR IGNORE INTO enrollments (user_id,course_id,created_at) VALUES (?,?,?)",
      ).run(userId, course.id, timestamp);
      db.prepare(
        "INSERT OR IGNORE INTO assignments (id,user_id,course_id,updated_at) VALUES (?,?,?,?)",
      ).run(randomUUID(), userId, course.id, timestamp);
    }
    return {
      enrollment: db
        .prepare("SELECT * FROM path_enrollments WHERE path_id=? AND user_id=?")
        .get(id, userId),
    };
  });
}

function reportData(
  db: AppDatabase,
  user: { id: string; role: string },
) {
  const users = permittedUsers(db, user);
  const rows: Array<Record<string, unknown>> = [];
  const members = users.map((member) => {
    const courses = (
      db
        .prepare(
          `SELECT c.id,c.title FROM enrollments e JOIN courses c ON c.id=e.course_id
        WHERE e.user_id=? ORDER BY c.title`,
        )
        .all(member.id) as Array<{ id: string; title: string }>
    ).filter(
      (course) =>
        user.role !== "instructor" || isCourseInstructor(db, user, course.id),
    );
    const progress = courses.map((course) =>
      courseProgress(db, member.id, course),
    );
    const evidence = (
      db
        .prepare(
          `SELECT ev.skill,ev.level,ev.created_at,c.id AS course_id,c.title AS course_title,u.name AS reviewer_name
        FROM evidence ev JOIN assignments a ON a.id=ev.assignment_id JOIN courses c ON c.id=a.course_id JOIN users u ON u.id=ev.reviewer_id
        WHERE ev.user_id=? ORDER BY ev.created_at DESC`,
        )
        .all(member.id) as Array<{ course_id: string }>
    ).filter(
      (row) =>
        user.role !== "instructor" ||
        isCourseInstructor(db, user, row.course_id),
    );
    for (const course of progress) {
      rows.push({
        user_id: member.id,
        name: member.name,
        email: member.email,
        team: member.team,
        ...course,
      });
    }
    const paths =
      user.role === "instructor"
        ? []
        : (
            db
              .prepare(
                `SELECT p.id,p.title,pe.reason,pe.due_date FROM path_enrollments pe JOIN learning_paths p ON p.id=pe.path_id WHERE pe.user_id=?`,
              )
              .all(member.id) as Array<{ id: string; title: string; due_date?: string }>
          ).map((path) => ({
            ...path,
            ...pathProgress(db, path.id, member.id),
          }));
    return {
      ...member,
      courses: progress,
      evidence,
      paths,
      enrolled_courses: progress.length,
      completed_courses: progress.filter((x) => x.status === "completed")
        .length,
    };
  });
  const courseMap = new Map<string, Record<string, unknown>>();
  if (user.role === "admin" || user.role === "instructor") {
    const allCourses = db
      .prepare("SELECT id,title FROM courses")
      .all() as Array<{ id: string; title: string }>;
    for (const course of allCourses.filter((course) =>
      isCourseInstructor(db, user, course.id),
    )) {
      courseMap.set(course.id, {
        id: course.id,
        title: course.title,
        enrolled: 0,
        completed: 0,
        in_progress: 0,
        not_started: 0,
      });
    }
  }
  for (const row of rows) {
    const courseId = String(row.course_id);
    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, {
        id: courseId,
        title: row.course_title,
        enrolled: 0,
        completed: 0,
        in_progress: 0,
        not_started: 0,
      });
    }
    const summary = courseMap.get(courseId)!;
    summary.enrolled = (summary.enrolled as number) + 1;
    const statusKey = String(row.status);
    summary[statusKey] = ((summary[statusKey] as number) || 0) + 1;
  }
  const pathsMap = new Map<string, Record<string, unknown>>();
  for (const member of members) {
    for (const path of member.paths as Array<{ id: string; title: string; status?: string; due_date?: string }>) {
      if (!pathsMap.has(path.id)) {
        pathsMap.set(path.id, {
          id: path.id,
          title: path.title,
          enrolled: 0,
          completed: 0,
          overdue: 0,
        });
      }
      const summary = pathsMap.get(path.id)!;
      summary.enrolled = (summary.enrolled as number) + 1;
      if (path.status === "completed") {
        summary.completed = (summary.completed as number) + 1;
      } else if (path.due_date && path.due_date < now().slice(0, 10)) {
        summary.overdue = (summary.overdue as number) + 1;
      }
    }
  }
  return {
    scope:
      user.role === "admin"
        ? "Toàn bộ người học"
        : user.role === "manager"
          ? "Nhân sự trực tiếp và cùng đội"
          : "Người học trong khóa do bạn phụ trách",
    metrics: {
      learners: users.length,
      enrollments: rows.length,
      completed_courses: rows.filter((x) => x.status === "completed").length,
      evidence: members.reduce((sum, x) => sum + x.evidence.length, 0),
    },
    users: members,
    courses: [...courseMap.values()],
    paths: [...pathsMap.values()],
    rows,
  };
}

function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

export function handleOrganization({
  db,
  user,
  path,
  method,
  body = {},
  query,
}: {
  db: AppDatabase;
  user: PublicUser;
  path: string;
  method: string;
  body?: Record<string, unknown>;
  query?: URLSearchParams | Record<string, string>;
}): { status: number; data: Record<string, unknown> } | null {
  const strippedPath = path.replace(/^\/api(?=\/)/, "");
  if (strippedPath === "/paths" && method === "GET") {
    return { status: 200, data: { paths: listPaths(db, user) } };
  }
  if (strippedPath === "/paths" && method === "POST") {
    return { status: 201, data: { path: savePath(db, user, body) } };
  }
  const match = /^\/paths\/([^/]+)(?:\/(enroll|assign))?$/.exec(strippedPath);
  if (match && method === "PATCH" && !match[2]) {
    return { status: 200, data: { path: savePath(db, user, body, match[1]) } };
  }
  if (match && method === "POST" && match[2]) {
    return {
      status: 200,
      data: joinPath(db, user, match[1], body, match[2] === "assign"),
    };
  }
  if ((strippedPath === "/team" || strippedPath === "/reports") && method === "GET") {
    const data = reportData(db, user);
    if (strippedPath === "/team") {
      return { status: 200, data: { users: data.users, scope: data.scope } };
    }
    const format = query instanceof URLSearchParams ? query.get("format") : (query as Record<string, string>)?.format;
    if (format === "csv") {
      const header = [
        "Họ tên",
        "Email",
        "Đội nhóm",
        "Khóa học",
        "Trạng thái",
        "Bài học hoàn thành",
        "Tổng bài học",
        "Bài thực hành",
      ];
      const csvRows = data.rows.map((row) => [
        row.name,
        row.email,
        row.team,
        row.course_title,
        row.status,
        row.completed_lessons,
        row.lessons,
        row.assignment_status,
      ]);
      return {
        status: 200,
        data: {
          csv:
            "\uFEFF" +
            [header, ...csvRows]
              .map((row) => row.map(csvCell).join(","))
              .join("\r\n"),
          fileName: `maturex-report-${now().slice(0, 10)}.csv`,
        },
      };
    }
    return { status: 200, data };
  }
  return null;
}
