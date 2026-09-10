import { randomUUID } from "node:crypto";
import { check, textField } from "./auth.js";
import { transaction } from "./database.js";
import {
  initCourseTeams,
  courseVersion,
  hasTable,
  isCourseInstructor,
  hasCourseLearningAccess,
  listCourseInstructors,
} from "./course-access.js";

const now = () => new Date().toISOString();
export function canTeach(user) {
  check(
    ["admin", "instructor"].includes(user.role),
    403,
    "Bạn không có quyền quản lý đào tạo.",
  );
}
function ownedCourse(db, user, id) {
  canTeach(user);
  const course = db.prepare("SELECT * FROM courses WHERE id=?").get(id);
  check(course, 404, "Không tìm thấy khóa học.");
  check(
    isCourseInstructor(db, user, course.id),
    403,
    "Bạn không phụ trách khóa học này.",
  );
  return course;
}
function lessons(db, id) {
  return db
    .prepare("SELECT * FROM lessons WHERE course_id=? ORDER BY position")
    .all(id);
}
function courseFields(body) {
  const fields = {
    title: textField(body.title, "Tên khóa học", 180),
    description: textField(body.description, "Mô tả", 5000),
    category: textField(body.category, "Danh mục", 100),
    skill: textField(body.skill, "Năng lực", 100),
    exercise: textField(body.exercise, "Đề bài thực hành", 10000),
  };
  check(
    Array.isArray(body.lessons) &&
      body.lessons.length >= 1 &&
      body.lessons.length <= 50,
    400,
    "Khóa học cần từ 1 đến 50 bài học.",
  );
  fields.lessons = body.lessons.map((lesson) => {
    check(lesson && typeof lesson === "object", 400, "Bài học không hợp lệ.");
    return {
      id: typeof lesson.id === "string" ? lesson.id : null,
      title: textField(lesson.title, "Tên bài học", 180),
      content: textField(lesson.content, "Nội dung bài học", 30000),
    };
  });
  return fields;
}
export function saveCourse(db, user, body, id) {
  canTeach(user);
  const fields = courseFields(body);
  if (!hasTable(db, "course_revisions")) initCourseTeams(db);
  return transaction(db, () => {
    if (id) {
      ownedCourse(db, user, id);
      if (
        body.version !== undefined ||
        listCourseInstructors(db, id).length > 1
      )
        check(
          Number.isInteger(body.version) &&
            body.version === courseVersion(db, id),
          409,
          "Khóa học đã thay đổi. Hãy tải lại trước khi lưu.",
        );
      check(
        !db
          .prepare("SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1")
          .get(id) &&
          !(
            hasTable(db, "cohorts") &&
            db
              .prepare(
                "SELECT 1 FROM cohort_members m JOIN cohorts c ON c.id=m.cohort_id WHERE c.course_id=? LIMIT 1",
              )
              .get(id)
          ),
        409,
        "Khóa đã có người học. Hãy tạo khóa mới để giữ nguyên lịch sử học tập.",
      );
      db.prepare(
        "UPDATE courses SET title=?,description=?,category=?,skill=?,exercise=? WHERE id=?",
      ).run(
        fields.title,
        fields.description,
        fields.category,
        fields.skill,
        fields.exercise,
        id,
      );
      db.prepare(
        "INSERT INTO course_revisions VALUES (?,1) ON CONFLICT(course_id) DO UPDATE SET version=version+1",
      ).run(id);
      const existing = lessons(db, id);
      const seen = new Set();
      for (const lesson of fields.lessons) {
        if (lesson.id) {
          check(
            existing.some((l) => l.id === lesson.id) && !seen.has(lesson.id),
            400,
            "Mã bài học không hợp lệ hoặc trùng lặp.",
          );
          seen.add(lesson.id);
        }
      }
      // Keep stable IDs and all linked quizzes/files on ordinary content edits.
      db.prepare(
        "UPDATE lessons SET position=position+1000 WHERE course_id=?",
      ).run(id);
      for (const old of existing)
        if (!seen.has(old.id))
          db.prepare("DELETE FROM lessons WHERE id=?").run(old.id);
    } else {
      check(
        fields.lessons.every((l) => !l.id),
        400,
        "Khóa mới không được dùng mã bài học của khóa khác.",
      );
      id = randomUUID();
      db.prepare("INSERT INTO courses VALUES (?,?,?,?,?,?,?,?,?)").run(
        id,
        user.id,
        fields.title,
        fields.description,
        fields.category,
        fields.skill,
        fields.exercise,
        "draft",
        now(),
      );
      db.prepare("INSERT INTO course_revisions VALUES (?,0)").run(id);
      db.prepare("INSERT OR IGNORE INTO course_instructors VALUES (?,?)").run(
        id,
        user.id,
      );
    }
    fields.lessons.forEach((lesson, position) => {
      if (lesson.id)
        db.prepare(
          "UPDATE lessons SET position=?,title=?,content=? WHERE id=? AND course_id=?",
        ).run(position, lesson.title, lesson.content, lesson.id, id);
      else
        db.prepare("INSERT INTO lessons VALUES (?,?,?,?,?)").run(
          randomUUID(),
          id,
          position,
          lesson.title,
          lesson.content,
        );
    });
    return {
      ...db.prepare("SELECT * FROM courses WHERE id=?").get(id),
      version: courseVersion(db, id),
      lessons: lessons(db, id),
    };
  });
}
export function setCourseStatus(db, user, id, body) {
  ownedCourse(db, user, id);
  check(
    ["draft", "published", "archived"].includes(body.status),
    400,
    "Trạng thái khóa học không hợp lệ.",
  );
  db.prepare("UPDATE courses SET status=? WHERE id=?").run(body.status, id);
}
export function enroll(db, user, id) {
  transaction(db, () => {
    check(
      db
        .prepare("SELECT id FROM courses WHERE id=? AND status='published'")
        .get(id),
      404,
      "Khóa học chưa mở đăng ký.",
    );
    db.prepare("INSERT OR IGNORE INTO enrollments VALUES (?,?,?)").run(
      user.id,
      id,
      now(),
    );
    db.prepare(
      "INSERT OR IGNORE INTO assignments (id,user_id,course_id,updated_at) VALUES (?,?,?,?)",
    ).run(randomUUID(), user.id, id, now());
  });
}
export function completeLesson(db, user, courseId, lessonId) {
  check(
    db
      .prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=?")
      .get(user.id, courseId),
    403,
    "Hãy đăng ký khóa học trước.",
  );
  check(
    db
      .prepare("SELECT 1 FROM lessons WHERE id=? AND course_id=?")
      .get(lessonId, courseId),
    404,
    "Không tìm thấy bài học.",
  );
  db.prepare("INSERT OR IGNORE INTO progress VALUES (?,?,?)").run(
    user.id,
    lessonId,
    now(),
  );
}
export function changeAssignment(db, user, id, body, review) {
  if (review) canTeach(user);
  return transaction(db, () => {
    const assignment = db
      .prepare(
        "SELECT a.*, c.owner_id, c.skill FROM assignments a JOIN courses c ON c.id=a.course_id WHERE a.id=?",
      )
      .get(id);
    check(
      assignment &&
        (review
          ? isCourseInstructor(db, user, assignment.course_id)
          : assignment.user_id === user.id),
      404,
      "Không tìm thấy bài tập.",
    );
    if (review)
      check(
        assignment.user_id !== user.id,
        403,
        "Không thể tự đánh giá bài của mình.",
      );
    check(
      Number.isInteger(body.version) && body.version === assignment.version,
      409,
      "Bài đã thay đổi. Hãy tải lại dữ liệu trước khi gửi.",
    );
    let status,
      content = assignment.body,
      feedback = "",
      level = null;
    if (review) {
      check(
        assignment.status === "submitted",
        409,
        "Bài không còn ở trạng thái chờ chấm.",
      );
      check(
        ["approved", "revision"].includes(body.status),
        400,
        "Kết quả đánh giá không hợp lệ.",
      );
      feedback = textField(body.feedback, "Phản hồi", 10000);
      status = body.status;
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
        ["todo", "revision"].includes(assignment.status),
        409,
        "Chỉ có thể nộp bài mới hoặc bài cần bổ sung.",
      );
      content = textField(body.body, "Nội dung bài nộp", 30000);
      status = "submitted";
    }
    const timestamp = now();
    db.prepare(
      "UPDATE assignments SET status=?,body=?,feedback=?,version=version+1,updated_at=? WHERE id=?",
    ).run(status, content, feedback, timestamp, id);
    db.prepare("INSERT INTO assignment_history VALUES (?,?,?,?,?,?,?,?,?)").run(
      randomUUID(),
      id,
      user.id,
      status,
      content,
      feedback,
      level,
      assignment.version + 1,
      timestamp,
    );
    if (status === "approved")
      db.prepare("INSERT INTO evidence VALUES (?,?,?,?,?,?)").run(
        id,
        assignment.user_id,
        assignment.skill,
        level,
        user.id,
        timestamp,
      );
  });
}
export function getState(db, user) {
  const courses = db
    .prepare(
      `SELECT c.*, u.name AS teacher,
    (SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id) AS enrollment_count
    FROM courses c JOIN users u ON u.id=c.owner_id
    ORDER BY c.created_at DESC`,
    )
    .all()
    .filter(
      (course) =>
        course.status === "published" ||
        hasCourseLearningAccess(db, user, course.id),
    )
    .map((course) => ({
      ...course,
      version: courseVersion(db, course.id),
      lessons: lessons(db, course.id),
      instructors: listCourseInstructors(db, course.id),
      can_teach: isCourseInstructor(db, user, course.id),
      cohort_enrollment_count: hasTable(db, "cohorts")
        ? db
            .prepare(
              "SELECT COUNT(*) n FROM cohort_members m JOIN cohorts c ON c.id=m.cohort_id WHERE c.course_id=?",
            )
            .get(course.id).n
        : 0,
    }));
  const assignments = db
    .prepare(
      `SELECT a.*, u.name AS learner_name, c.title AS course_title, c.exercise, c.skill, c.owner_id
    FROM assignments a JOIN courses c ON c.id=a.course_id JOIN users u ON u.id=a.user_id
    ORDER BY a.updated_at DESC`,
    )
    .all()
    .filter(
      (assignment) =>
        assignment.user_id === user.id ||
        isCourseInstructor(db, user, assignment.course_id),
    )
    .map((assignment) => ({
      ...assignment,
      history: db
        .prepare(
          `SELECT h.*, u.name AS actor_name FROM assignment_history h
      JOIN users u ON u.id=h.actor_id WHERE h.assignment_id=? ORDER BY version`,
        )
        .all(assignment.id),
    }));
  return {
    user,
    courses,
    assignments,
    enrollments: db
      .prepare("SELECT * FROM enrollments WHERE user_id=?")
      .all(user.id),
    progress: db.prepare("SELECT * FROM progress WHERE user_id=?").all(user.id),
    evidence: db
      .prepare(
        `SELECT e.*, u.name AS reviewer_name, c.title AS course_title FROM evidence e
      JOIN users u ON u.id=e.reviewer_id JOIN assignments a ON a.id=e.assignment_id JOIN courses c ON c.id=a.course_id
      WHERE e.user_id=? ORDER BY e.created_at DESC`,
      )
      .all(user.id),
  };
}
