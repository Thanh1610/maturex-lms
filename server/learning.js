import { check, textField } from "./auth.js";
import { transaction } from "./database.js";
import {
  isCourseInstructor,
  hasCourseLearningAccess,
} from "./course-access.js";
export function initLearning(db) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS notes(user_id TEXT REFERENCES users(id),lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,text TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(user_id,lesson_id));
  CREATE TABLE IF NOT EXISTS bookmarks(user_id TEXT REFERENCES users(id),course_id TEXT REFERENCES courses(id),PRIMARY KEY(user_id,course_id));
  CREATE TABLE IF NOT EXISTS quizzes(lesson_id TEXT PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,question TEXT NOT NULL,options TEXT NOT NULL,correct_index INTEGER NOT NULL,explanation TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS quiz_attempts(user_id TEXT REFERENCES users(id),lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,passed INTEGER NOT NULL,attempts INTEGER NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(user_id,lesson_id));
`);
}
export function courseAccess(db, user, id, write = false) {
  const c = db.prepare("SELECT * FROM courses WHERE id=?").get(id);
  check(
    c &&
      (write
        ? isCourseInstructor(db, user, id)
        : hasCourseLearningAccess(db, user, id)),
    404,
    "Không tìm thấy khóa học trong phạm vi của bạn.",
  );
  return c;
}
export function handleLearning({ db, user, path, method, body }) {
  if (path === "/api/learning" && method === "GET") {
    const quizzes = db
      .prepare(
        `SELECT q.*,l.course_id,c.owner_id FROM quizzes q JOIN lessons l ON l.id=q.lesson_id JOIN courses c ON c.id=l.course_id`,
      )
      .all()
      .filter((q) => hasCourseLearningAccess(db, user, q.course_id))
      .map((q) => {
        const { correct_index, explanation, ...visible } = q;
        return {
          ...visible,
          options: JSON.parse(q.options),
          ...(isCourseInstructor(db, user, q.course_id)
            ? { correct_index, explanation }
            : {}),
        };
      });
    return {
      status: 200,
      data: {
        notes: db.prepare("SELECT * FROM notes WHERE user_id=?").all(user.id),
        bookmarks: db
          .prepare("SELECT course_id FROM bookmarks WHERE user_id=?")
          .all(user.id)
          .map((x) => x.course_id),
        quizzes,
        attempts: db
          .prepare("SELECT * FROM quiz_attempts WHERE user_id=?")
          .all(user.id),
      },
    };
  }
  let m = path.match(/^\/api\/learning\/(notes|quizzes)\/([^/]+)(\/attempt)?$/);
  if (m && ["PUT", "POST"].includes(method)) {
    const lesson = db.prepare("SELECT * FROM lessons WHERE id=?").get(m[2]);
    check(lesson, 404, "Bài học không tồn tại.");
    courseAccess(db, user, lesson.course_id, m[1] === "quizzes" && !m[3]);
    if (m[1] === "notes" && method === "PUT" && !m[3]) {
      const text = textField(body.text ?? "", "Ghi chú", 30000, 0);
      db.prepare(
        "INSERT INTO notes VALUES (?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET text=excluded.text,updated_at=excluded.updated_at",
      ).run(user.id, lesson.id, text, new Date().toISOString());
      return { status: 200, data: { ok: true } };
    }
    if (m[1] === "quizzes" && method === "PUT" && !m[3]) {
      const question = textField(body.question, "Câu hỏi", 2000),
        explanation = textField(body.explanation ?? "", "Giải thích", 5000, 0);
      check(
        Array.isArray(body.options) &&
          body.options.length >= 2 &&
          body.options.length <= 6,
        400,
        "Cần từ 2 đến 6 lựa chọn.",
      );
      const options = body.options.map((x) => textField(x, "Lựa chọn", 1000));
      check(
        Number.isInteger(body.correctIndex) &&
          body.correctIndex >= 0 &&
          body.correctIndex < options.length,
        400,
        "Đáp án không hợp lệ.",
      );
      transaction(db, () => {
        const encodedOptions = JSON.stringify(options);
        const existing = db
          .prepare("SELECT * FROM quizzes WHERE lesson_id=?")
          .get(lesson.id);
        if (
          existing &&
          existing.question === question &&
          existing.options === encodedOptions &&
          existing.correct_index === body.correctIndex &&
          existing.explanation === explanation
        )
          return;
        check(
          !db
            .prepare("SELECT 1 FROM quiz_attempts WHERE lesson_id=? LIMIT 1")
            .get(lesson.id),
          409,
          "Câu hỏi đã có người làm nên không thể chỉnh sửa để giữ lịch sử kết quả. Hãy tạo câu hỏi ở bài học hoặc khóa học mới.",
        );
        db.prepare(
          "INSERT INTO quizzes VALUES (?,?,?,?,?) ON CONFLICT(lesson_id) DO UPDATE SET question=excluded.question,options=excluded.options,correct_index=excluded.correct_index,explanation=excluded.explanation",
        ).run(
          lesson.id,
          question,
          encodedOptions,
          body.correctIndex,
          explanation,
        );
      });
      return { status: 200, data: { ok: true } };
    }
    if (m[1] === "quizzes" && method === "POST" && m[3]) {
      const q = db
        .prepare("SELECT * FROM quizzes WHERE lesson_id=?")
        .get(lesson.id);
      check(q, 404, "Chưa có câu hỏi ôn tập.");
      check(
        Number.isInteger(body.answerIndex) &&
          body.answerIndex >= 0 &&
          body.answerIndex < JSON.parse(q.options).length,
        400,
        "Lựa chọn không hợp lệ.",
      );
      const passed = body.answerIndex === q.correct_index;
      db.prepare(
        "INSERT INTO quiz_attempts VALUES (?,?,?,1,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET passed=MAX(passed,excluded.passed),attempts=attempts+1,updated_at=excluded.updated_at",
      ).run(user.id, lesson.id, passed ? 1 : 0, new Date().toISOString());
      return { status: 200, data: { passed, explanation: q.explanation } };
    }
  }
  m = path.match(/^\/api\/learning\/bookmarks\/([^/]+)$/);
  if (m && method === "POST") {
    check(
      db
        .prepare("SELECT 1 FROM courses WHERE id=? AND status='published'")
        .get(m[1]),
      404,
      "Khóa chưa phát hành.",
    );
    const saved = db
      .prepare("SELECT 1 FROM bookmarks WHERE user_id=? AND course_id=?")
      .get(user.id, m[1]);
    if (saved)
      db.prepare("DELETE FROM bookmarks WHERE user_id=? AND course_id=?").run(
        user.id,
        m[1],
      );
    else db.prepare("INSERT INTO bookmarks VALUES (?,?)").run(user.id, m[1]);
    return { status: 200, data: { saved: !saved } };
  }
  return null;
}
