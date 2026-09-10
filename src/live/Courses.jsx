import { useEffect, useState } from "react";
import { Badge, Button, Empty, Icon } from "../ui.jsx";
import { AIDraft } from "./AIDraft.jsx";
import { api, statusLabels } from "./api.js";
import { CourseTeam } from "./CourseTeam.jsx";
import { ContentTools, LessonTools } from "./LearningTools.jsx";

const teacherNames = (course) =>
  course.instructors?.map((person) => person.name).join(", ") || course.teacher;

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
export function Catalog({ state, go }) {
  const [bookmarks, setBookmarks] = useState([]),
    [savedOnly, setSavedOnly] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    api("/learning")
      .then((d) => setBookmarks(d.bookmarks))
      .catch((e) => setError(e.message));
  }, []);
  async function bookmark(id) {
    try {
      await api(`/learning/bookmarks/${id}`, "POST", {});
      setBookmarks((await api("/learning")).bookmarks);
    } catch (e) {
      setError(e.message);
    }
  }
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const available = state.courses.filter(
    (c) =>
      c.status === "published" ||
      state.enrollments.some((e) => e.course_id === c.id),
  );
  const courses = available.filter(
    (c) =>
      (!savedOnly || bookmarks.includes(c.id)) &&
      (category === "all" || c.category === category) &&
      normalize(`${c.title} ${c.description}`).includes(normalize(query)),
  );
  return (
    <>
      <div className="live-page-heading">
        <span className="live-eyebrow">KHÁM PHÁ & PHÁT TRIỂN</span>
        <h1>Thư viện học tập</h1>
        <p className="muted">
          Kiến thức có ý nghĩa khi được đưa vào thực hành.
        </p>
      </div>
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      <div className="live-filters">
        <Button
          kind={savedOnly ? "primary" : "secondary"}
          onClick={() => setSavedOnly(!savedOnly)}
          icon="Bookmark"
        >
          {savedOnly ? "Đang xem khóa đã lưu" : "Khóa đã lưu"}
        </Button>
        <label className="live-search">
          <Icon name="Search" size={18} />
          <input
            aria-label="Tìm khóa học"
            placeholder="Tìm tên khóa học, chủ đề…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Danh mục"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          {[...new Set(available.map((c) => c.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <span className="muted">{courses.length} khóa học</span>
      </div>
      {courses.length ? (
        <div className="live-course-grid">
          {courses.map((course, i) => (
            <article className="live-course-card" key={course.id}>
              <div className={`live-course-cover cover-${i % 4}`}>
                <span>{course.category}</span>
                <Icon
                  name={["Sprout", "Brain", "Compass", "Lightbulb"][i % 4]}
                  size={62}
                />
                <small>MATUREX LEARNING</small>
              </div>
              <div className="live-course-body">
                <div className="between">
                  {course.status === "published" && (
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={
                        bookmarks.includes(course.id)
                          ? "Bỏ lưu khóa học"
                          : "Lưu khóa học"
                      }
                      onClick={() => bookmark(course.id)}
                    >
                      <Icon name="Bookmark" size={17} />
                    </button>
                  )}
                  <Badge>{course.skill}</Badge>
                  {state.enrollments.some((e) => e.course_id === course.id) && (
                    <Badge color="green">Đã đăng ký</Badge>
                  )}
                </div>
                <h2>{course.title}</h2>
                <p className="muted">{course.description}</p>
                <div className="live-course-meta">
                  <span>
                    <Icon name="BookOpen" size={15} /> {course.lessons.length}{" "}
                    bài học
                  </span>
                  <span>{teacherNames(course)}</span>
                </div>
                <Button
                  kind="secondary"
                  icon="ArrowRight"
                  onClick={() => go(`course/${course.id}`)}
                >
                  Xem khóa học
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={
            query || category !== "all"
              ? "Chưa tìm thấy khóa phù hợp"
              : "Thư viện đang chờ khóa học đầu tiên"
          }
          description={
            query || category !== "all"
              ? "Thử từ khóa hoặc danh mục khác."
              : "Khóa học sẽ xuất hiện khi giảng viên phát hành."
          }
        />
      )}
    </>
  );
}
export function CoursePage({ id, state, mutate, busy, go }) {
  const course = state.courses.find((c) => c.id === id);
  const [selected, setSelected] = useState(0);
  if (!course) return <Empty title="Không tìm thấy khóa học" />;
  const enrolled = state.enrollments.some((e) => e.course_id === id);
  const lesson = course.lessons[selected] || course.lessons[0];
  const completed = state.progress.some((p) => p.lesson_id === lesson.id);
  const count = course.lessons.filter((l) =>
    state.progress.some((p) => p.lesson_id === l.id),
  ).length;
  return (
    <>
      <button className="text-btn" onClick={() => go("catalog")}>
        ← Thư viện học tập
      </button>
      <div className="live-page-heading">
        <Badge>{course.category}</Badge>
        <h1>{course.title}</h1>
        <p className="muted">{course.description}</p>
        <span>
          Giảng viên: {teacherNames(course)} · {course.lessons.length} bài học
        </span>
      </div>
      {!enrolled ? (
        <div className="live-panel live-course-intro">
          <h2>Bạn sẽ học gì?</h2>
          <ol>
            {course.lessons.map((l) => (
              <li key={l.id}>{l.title}</li>
            ))}
          </ol>
          <h3>Bài thực hành cuối khóa</h3>
          <p className="live-prose">{course.exercise}</p>
          {course.status === "published" ? (
            <Button
              disabled={busy}
              onClick={() =>
                mutate(
                  `/courses/${id}/enroll`,
                  "POST",
                  {},
                  "Đã đăng ký khóa học. Bạn có thể bắt đầu học.",
                )
              }
              icon="Plus"
            >
              Đăng ký học
            </Button>
          ) : (
            <Badge>{statusLabels[course.status]}</Badge>
          )}
        </div>
      ) : (
        <div className="live-learning">
          <aside className="live-panel live-lesson-nav">
            <h3>Nội dung khóa học</h3>
            <progress value={count} max={course.lessons.length} />
            <p className="muted small">
              {count}/{course.lessons.length} bài đã hoàn thành
            </p>
            {course.lessons.map((l, i) => (
              <button
                key={l.id}
                className={selected === i ? "selected" : ""}
                onClick={() => setSelected(i)}
                aria-current={selected === i ? "step" : undefined}
              >
                <Icon
                  name={
                    state.progress.some((p) => p.lesson_id === l.id)
                      ? "CheckCircle2"
                      : "Circle"
                  }
                  size={18}
                />
                <span>
                  {i + 1}. {l.title}
                </span>
              </button>
            ))}
          </aside>
          <article className="live-panel live-lesson-content">
            <span className="live-eyebrow">
              BÀI {selected + 1} / {course.lessons.length}
            </span>
            <h2>{lesson.title}</h2>
            <div className="live-prose">{lesson.content}</div>
            <LessonTools
              key={lesson.id}
              course={course}
              lesson={lesson}
              state={state}
            />
            <div className="live-lesson-actions">
              <Button
                disabled={busy || completed}
                icon="Check"
                onClick={() =>
                  mutate(
                    `/courses/${id}/lessons/${lesson.id}/complete`,
                    "POST",
                    {},
                    "Đã lưu tiến độ bài học.",
                  )
                }
              >
                {completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
              </Button>
              {selected < course.lessons.length - 1 ? (
                <Button
                  kind="secondary"
                  onClick={() => setSelected(selected + 1)}
                >
                  Bài tiếp theo →
                </Button>
              ) : (
                <Button kind="secondary" onClick={() => go("assignments")}>
                  Làm bài thực hành →
                </Button>
              )}
            </div>
            <p className="muted small">
              Hoàn thành nội dung ghi nhận tiến độ học. Năng lực được xác nhận
              qua bài thực hành và đánh giá.
            </p>
          </article>
        </div>
      )}
    </>
  );
}

const blank = () => ({
  title: "",
  description: "",
  category: "Chuyên môn",
  skill: "",
  exercise: "",
  lessons: [{ title: "", content: "" }],
});
function CourseEditor({ initial, onCancel, mutate, busy, onSaved }) {
  const [form, setForm] = useState(() => initial || blank());
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  function lesson(index, key, value) {
    set(
      "lessons",
      form.lessons.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );
  }
  async function submit(event) {
    event.preventDefault();
    const result = await mutate(
      `/courses${initial ? `/${initial.id}` : ""}`,
      initial ? "PUT" : "POST",
      form,
      "Đã lưu bản nháp khóa học.",
    );
    if (result) onSaved();
  }
  return (
    <form className="live-panel live-form live-editor" onSubmit={submit}>
      {!initial && <AIDraft onDraft={(draft) => setForm(draft)} />}
      <div className="between">
        <h2>{initial ? "Chỉnh sửa khóa học" : "Tạo khóa học"}</h2>
        <Button type="button" kind="ghost" disabled={busy} onClick={onCancel}>
          Hủy
        </Button>
      </div>
      <label>
        Tên khóa học
        <input
          required
          maxLength={180}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </label>
      <label>
        Mô tả
        <textarea
          required
          maxLength={5000}
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <div className="live-two-col">
        <label>
          Danh mục
          <input
            required
            maxLength={100}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          />
        </label>
        <label>
          Năng lực cần phát triển
          <input
            required
            maxLength={100}
            value={form.skill}
            onChange={(e) => set("skill", e.target.value)}
          />
        </label>
      </div>
      <h3>Nội dung bài học</h3>
      {form.lessons.map((item, i) => (
        <fieldset key={i} className="live-lesson-editor">
          <legend>Bài học {i + 1}</legend>
          <label>
            Tên bài học {i + 1}
            <input
              required
              maxLength={180}
              value={item.title}
              onChange={(e) => lesson(i, "title", e.target.value)}
            />
          </label>
          <label>
            Nội dung bài học {i + 1}
            <textarea
              required
              rows={6}
              maxLength={30000}
              value={item.content}
              onChange={(e) => lesson(i, "content", e.target.value)}
            />
          </label>
          {form.lessons.length > 1 && (
            <Button
              type="button"
              kind="ghost"
              onClick={() =>
                set(
                  "lessons",
                  form.lessons.filter((_, index) => index !== i),
                )
              }
            >
              Xóa bài {i + 1}
            </Button>
          )}
        </fieldset>
      ))}
      <Button
        type="button"
        kind="secondary"
        icon="Plus"
        disabled={form.lessons.length >= 50}
        onClick={() =>
          set("lessons", [...form.lessons, { title: "", content: "" }])
        }
      >
        Thêm bài học
      </Button>
      <label>
        Đề bài thực hành & tiêu chí đánh giá
        <textarea
          required
          rows={5}
          maxLength={10000}
          value={form.exercise}
          onChange={(e) => set("exercise", e.target.value)}
          placeholder="Mô tả sản phẩm người học cần nộp và bằng chứng cần có…"
        />
      </label>
      <Button type="submit" disabled={busy}>
        {busy ? "Đang lưu…" : "Lưu khóa học"}
      </Button>
    </form>
  );
}
export function Studio({ state, mutate, busy, refresh }) {
  const [editor, setEditor] = useState(null);
  const [toolsId, setToolsId] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const courses = state.courses.filter(
    (c) =>
      state.user.role === "admin" ||
      (c.can_teach ??
        (c.owner_id === state.user.id ||
          c.instructors?.some((person) => person.id === state.user.id))),
  );
  return (
    <>
      <div className="between live-page-heading">
        <div>
          <span className="live-eyebrow">CHIA SẺ TRI THỨC</span>
          <h1>Quản lý đào tạo</h1>
          <p className="muted">
            Biên soạn nội dung, giao bài thực hành và phát hành khóa học.
          </p>
        </div>
        <Button
          icon="Plus"
          onClick={() => setEditor({})}
          disabled={Boolean(editor)}
        >
          Tạo khóa học
        </Button>
      </div>
      {editor && (
        <CourseEditor
          key={editor.id || "new"}
          initial={editor.id ? editor : null}
          onCancel={() => setEditor(null)}
          onSaved={() => setEditor(null)}
          mutate={mutate}
          busy={busy}
        />
      )}
      {toolsId && courses.find((c) => c.id === toolsId) && (
        <ContentTools
          key={toolsId}
          course={courses.find((c) => c.id === toolsId)}
          onClose={() => setToolsId(null)}
        />
      )}
      {teamId && courses.find((c) => c.id === teamId) && (
        <CourseTeam
          key={teamId}
          course={courses.find((c) => c.id === teamId)}
          onClose={() => setTeamId(null)}
          onSaved={refresh}
        />
      )}
      {courses.length ? (
        <div className="stack">
          {courses.map((course) => (
            <article className="live-panel live-studio-row" key={course.id}>
              <div>
                <Badge
                  color={course.status === "published" ? "green" : "lavender"}
                >
                  {statusLabels[course.status]}
                </Badge>
                <h3>{course.title}</h3>
                <p className="muted">
                  {course.lessons.length} bài học · {course.enrollment_count}{" "}
                  lượt ghi danh · {teacherNames(course)}
                </p>
                {(course.enrollment_count > 0 ||
                  course.cohort_enrollment_count > 0 ||
                  course.content_locked) && (
                  <small className="muted">
                    Nội dung đã khóa để giữ lịch sử học tập.
                  </small>
                )}
              </div>
              <div className="live-row-actions">
                <Button kind="secondary" onClick={() => setTeamId(course.id)}>
                  Nhóm giảng viên
                </Button>
                <Button kind="secondary" onClick={() => setToolsId(course.id)}>
                  Học liệu & câu hỏi
                </Button>
                <Button
                  kind="secondary"
                  disabled={
                    busy ||
                    course.enrollment_count > 0 ||
                    course.cohort_enrollment_count > 0 ||
                    course.content_locked ||
                    Boolean(editor)
                  }
                  onClick={() => setEditor(course)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  disabled={busy}
                  onClick={() =>
                    mutate(
                      `/courses/${course.id}/status`,
                      "POST",
                      {
                        status:
                          course.status === "published"
                            ? "archived"
                            : "published",
                      },
                      course.status === "published"
                        ? "Đã lưu trữ khóa học."
                        : "Đã phát hành khóa học vào thư viện.",
                    )
                  }
                >
                  {course.status === "published" ? "Lưu trữ" : "Phát hành"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !editor && (
          <Empty
            title="Tạo khóa học đầu tiên"
            description="Thêm nội dung bài học và một bài thực hành có tiêu chí rõ ràng."
          />
        )
      )}
    </>
  );
}
