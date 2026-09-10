import { useEffect, useState } from "react";
import { Badge, Button, Empty, Icon } from "../ui";
import { AIDraft } from "./AIDraft";
import { api, statusLabels } from "./api";
import { CourseTeam } from "./CourseTeam";
import { ContentTools, LessonTools } from "./LearningTools";

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
      <div className="live-page-heading mb-7">
        <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
          KHÁM PHÁ & PHÁT TRIỂN
        </span>
        <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
          Thư viện học tập
        </h1>
        <p className="muted text-[11px] text-[var(--muted,#757185)]">
          Kiến thức có ý nghĩa khi được đưa vào thực hành.
        </p>
      </div>
      {error && (
        <p
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8]"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="live-filters flex items-center flex-wrap gap-[14px] mb-[25px]">
        <Button
          kind={savedOnly ? "primary" : "secondary"}
          onClick={() => setSavedOnly(!savedOnly)}
          icon="Bookmark"
        >
          {savedOnly ? "Đang xem khóa đã lưu" : "Khóa đã lưu"}
        </Button>
        <label className="live-search bg-white border border-[var(--border,#e9eaf0)] rounded-[8px] pl-[14px] flex items-center flex-1 min-w-[200px] max-w-[500px] text-[var(--muted,#757185)]">
          <Icon name="Search" size={18} />
          <input
            className="border-0 bg-transparent w-full py-2 pl-2 focus:outline-none text-[12px] text-[#1f1b2d]"
            aria-label="Tìm khóa học"
            placeholder="Tìm tên khóa học, chủ đề…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          className="max-[760px]:max-w-full"
          aria-label="Danh mục"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          {[...new Set(available.map((c) => c.category))].map((c) => (
            <option key={c as string} value={c as string}>
              {c as string}
            </option>
          ))}
        </select>
        <span className="muted text-[11px] text-[var(--muted,#757185)]">
          {courses.length} khóa học
        </span>
      </div>
      {courses.length ? (
        <div className="live-course-grid grid grid-cols-3 max-[1200px]:grid-cols-2 max-[760px]:grid-cols-1 gap-[20px]">
          {courses.map((course, i) => (
            <article
              className="live-course-card bg-white border border-[var(--border,#e9eaf0)] rounded-[13px] overflow-hidden flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              key={course.id}
            >
              <div
                className={`live-course-cover cover-${i % 4} h-[176px] p-[20px] relative flex flex-col items-start overflow-hidden`}
              >
                <span className="text-[10px] font-semibold max-w-[65%]">
                  {course.category}
                </span>
                <div className="absolute right-[25px] top-[53px] opacity-75 -rotate-10">
                  <Icon
                    name={["Sprout", "Brain", "Compass", "Lightbulb"][i % 4]}
                    size={62}
                  />
                </div>
                <small className="mt-auto text-[8px] tracking-[2px] opacity-70 font-semibold">
                  MATUREX LEARNING
                </small>
              </div>
              <div className="live-course-body p-[22px] flex flex-col items-start flex-1">
                <div className="between w-full flex items-center justify-between gap-[5px] flex-wrap">
                  {course.status === "published" && (
                    <button
                      type="button"
                      className="icon-btn text-[#757185] hover:text-[#1f1b2d] cursor-pointer"
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
                <h2 className="text-[16px] font-bold text-[#1f1b2d] mt-[18px] mb-[10px] leading-snug">
                  {course.title}
                </h2>
                <p className="muted text-[11px] text-[var(--muted,#757185)] flex-1 leading-relaxed">
                  {course.description}
                </p>
                <div className="live-course-meta flex w-full gap-[10px] justify-between text-[9px] text-[var(--muted,#757185)] mt-[6px] mb-[20px]">
                  <span className="flex items-center gap-1">
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
      <button
        className="text-btn text-[12px] text-[#757185] hover:text-[#1f1b2d] mb-4 cursor-pointer flex items-center gap-1 font-medium"
        onClick={() => go("catalog")}
      >
        ← Thư viện học tập
      </button>
      <div className="live-page-heading mb-7">
        <Badge>{course.category}</Badge>
        <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-2">
          {course.title}
        </h1>
        <p className="muted text-[11px] text-[var(--muted,#757185)] leading-relaxed">
          {course.description}
        </p>
        <span className="text-[10px] text-[var(--muted,#757185)] mt-1 block">
          Giảng viên: {teacherNames(course)} · {course.lessons.length} bài học
        </span>
      </div>
      {!enrolled ? (
        <div className="live-panel live-course-intro bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-3">
            Bạn sẽ học gì?
          </h2>
          <ol className="list-decimal pl-5 mb-5 space-y-2 text-[12px] text-[#332f42] leading-relaxed">
            {course.lessons.map((l) => (
              <li className="mb-2 leading-[1.7]" key={l.id}>
                {l.title}
              </li>
            ))}
          </ol>
          <h3 className="text-[15px] font-bold text-[#1f1b2d] mb-2">
            Bài thực hành cuối khóa
          </h3>
          <p className="live-prose text-[12px] text-[#555064] whitespace-pre-wrap break-words leading-[1.95] mb-5">
            {course.exercise}
          </p>
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
        <div className="live-learning grid grid-cols-[255px_minmax(0,1fr)] max-[1200px]:grid-cols-[210px_minmax(0,1fr)] max-[900px]:grid-cols-1 gap-[22px] items-start">
          <aside className="live-panel live-lesson-nav bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[22px_15px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-[14px] font-bold text-[#1f1b2d] mb-2">
              Nội dung khóa học
            </h3>
            <progress
              className="w-full h-[6px] rounded-[10px] accent-[#9381c9] border-0 my-2"
              value={count}
              max={course.lessons.length}
            />
            <p className="muted small text-[9px] text-[var(--muted,#757185)] mb-4">
              {count}/{course.lessons.length} bài đã hoàn thành
            </p>
            <div className="space-y-1">
              {course.lessons.map((l, i) => (
                <button
                  key={l.id}
                  className={`w-full flex items-start gap-[10px] text-left p-[12px_10px] rounded-[8px] leading-[1.7] text-[11px] transition-colors cursor-pointer ${
                    selected === i
                      ? "selected bg-[#f0ebf9] text-[#74609f] font-semibold"
                      : "text-[#555064] hover:bg-[#f6f5f9]"
                  }`}
                  onClick={() => setSelected(i)}
                  aria-current={selected === i ? "step" : undefined}
                >
                  <Icon
                    className="mt-[2px] shrink-0"
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
            </div>
          </aside>
          <article className="live-panel live-lesson-content bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[32px] max-[760px]:p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-w-0">
            <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
              BÀI {selected + 1} / {course.lessons.length}
            </span>
            <h2 className="text-[20px] font-bold text-[#1f1b2d] my-2">
              {lesson.title}
            </h2>
            <div className="live-prose text-[12px] text-[#332f42] whitespace-pre-wrap break-words leading-[1.95] min-h-[230px] mt-[24px]">
              {lesson.content}
            </div>
            <LessonTools
              key={lesson.id}
              course={course}
              lesson={lesson}
              state={state}
            />
            <div className="live-lesson-actions flex flex-wrap gap-[12px] my-[35px_18px] pt-[24px] border-t border-[var(--border,#e9eaf0)]">
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
            <p className="muted small text-[9px] text-[var(--muted,#757185)]">
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
    <form
      className="live-panel live-form live-editor bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px] mb-[25px]"
      onSubmit={submit}
    >
      {!initial && <AIDraft onDraft={(draft) => setForm(draft)} />}
      <div className="between flex items-center justify-between gap-4">
        <h2 className="text-[18px] font-bold text-[#1f1b2d]">
          {initial ? "Chỉnh sửa khóa học" : "Tạo khóa học"}
        </h2>
        <Button type="button" kind="ghost" disabled={busy} onClick={onCancel}>
          Hủy
        </Button>
      </div>
      <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
        Tên khóa học
        <input
          className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
          required
          maxLength={180}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
        Mô tả
        <textarea
          className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
          required
          maxLength={5000}
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <div className="live-two-col grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Danh mục
          <input
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            required
            maxLength={100}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Năng lực cần phát triển
          <input
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            required
            maxLength={100}
            value={form.skill}
            onChange={(e) => set("skill", e.target.value)}
          />
        </label>
      </div>
      <h3 className="text-[14px] font-bold text-[#1f1b2d] mt-2 mb-0">
        Nội dung bài học
      </h3>
      {form.lessons.map((item, i) => (
        <fieldset
          key={i}
          className="live-lesson-editor flex flex-col gap-[15px] border border-[var(--border,#e9eaf0)] rounded-[8px] p-[20px] max-[760px]:p-[15px] m-0 min-w-0"
        >
          <legend className="text-[11px] px-2 text-[#8a7bab] font-semibold">
            Bài học {i + 1}
          </legend>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Tên bài học {i + 1}
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              required
              maxLength={180}
              value={item.title}
              onChange={(e) => lesson(i, "title", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Nội dung bài học {i + 1}
            <textarea
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
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
      <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
        Đề bài thực hành & tiêu chí đánh giá
        <textarea
          className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
          required
          rows={5}
          maxLength={10000}
          value={form.exercise}
          onChange={(e) => set("exercise", e.target.value)}
          placeholder="Mô tả sản phẩm người học cần nộp và bằng chứng cần có…"
        />
      </label>
      <div className="self-start">
        <Button type="submit" disabled={busy}>
          {busy ? "Đang lưu…" : "Lưu khóa học"}
        </Button>
      </div>
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
      <div className="between live-page-heading flex items-center justify-between gap-4 mb-7">
        <div>
          <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
            CHIA SẺ TRI THỨC
          </span>
          <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
            Quản lý đào tạo
          </h1>
          <p className="muted text-[11px] text-[var(--muted,#757185)]">
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
        <div className="stack space-y-4">
          {courses.map((course) => (
            <article
              className="live-panel live-studio-row bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] max-[760px]:p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center max-[900px]:items-start max-[900px]:flex-col justify-between gap-[20px]"
              key={course.id}
            >
              <div>
                <Badge
                  color={course.status === "published" ? "green" : "lavender"}
                >
                  {statusLabels[course.status]}
                </Badge>
                <h3 className="text-[16px] font-bold text-[#1f1b2d] mt-[12px] mb-[6px]">
                  {course.title}
                </h3>
                <p className="muted text-[10px] text-[var(--muted,#757185)] mb-0">
                  {course.lessons.length} bài học · {course.enrollment_count}{" "}
                  lượt ghi danh · {teacherNames(course)}
                </p>
                {(course.enrollment_count > 0 ||
                  course.cohort_enrollment_count > 0 ||
                  course.content_locked) && (
                  <small className="muted text-[9px] text-[var(--muted,#757185)] block mt-1">
                    Nội dung đã khóa để giữ lịch sử học tập.
                  </small>
                )}
              </div>
              <div className="live-row-actions flex flex-shrink-0 gap-[10px] max-[650px]:flex-wrap">
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
