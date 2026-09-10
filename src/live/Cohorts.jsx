import { useEffect, useRef, useState } from "react";
import { Badge, Button, download, Empty } from "../ui.jsx";
import { api, dateLabel, statusLabels } from "./api.js";
import { FilePanel, LessonTools } from "./LearningTools.jsx";
import "./cohorts.css";

const classLabels = {
  draft: "Chuẩn bị",
  open: "Đang học",
  closed: "Đã kết thúc",
  archived: "Đã lưu trữ",
};
const attendanceLabels = {
  unrecorded: "Chưa điểm danh",
  present: "Có mặt",
  absent: "Vắng",
  excused: "Có phép",
};
const blankClass = {
  course_id: "",
  title: "",
  code: "",
  start_date: "",
  end_date: "",
  capacity: "30",
  status: "draft",
  instructor_ids: [],
};
const names = (people = []) => people.map((person) => person.name).join(", ");
function useClassData(path, onChanged) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [pending, setPending] = useState(false);
  const alive = useRef(false),
    working = useRef(false),
    generation = useRef(0);
  async function load() {
    const request = ++generation.current;
    const result = await api(path);
    if (alive.current && request === generation.current) setData(result);
    return result;
  }
  useEffect(() => {
    alive.current = true;
    load().catch((e) => alive.current && setError(e.message));
    return () => {
      alive.current = false;
      generation.current++;
    };
  }, [load]);
  async function run(url, method, body, message) {
    if (working.current) return false;
    working.current = true;
    setPending(true);
    setError("");
    setNotice("");
    try {
      const result = await api(url, method, body);
      if (!alive.current) return false;
      setNotice(message);
      try {
        await onChanged?.();
        await load();
      } catch (e) {
        if (alive.current)
          setError(
            `Đã lưu thay đổi nhưng chưa tải lại được dữ liệu: ${e.message}`,
          );
      }
      return result || true;
    } catch (e) {
      if (alive.current) setError(e.message);
      return false;
    } finally {
      working.current = false;
      if (alive.current) setPending(false);
    }
  }
  return {
    data,
    error,
    notice,
    pending,
    run,
    retry: () => {
      setError("");
      load().catch((e) => alive.current && setError(e.message));
    },
  };
}
function Messages({ request }) {
  return (
    <>
      {request.error && (
        <p className="live-error" role="alert">
          {request.error}
        </p>
      )}
      {request.notice && (
        <p role="status" className="cohort-notice">
          {request.notice}
        </p>
      )}
      {request.pending && <p role="status">Đang lưu thay đổi…</p>}
    </>
  );
}
function PeoplePicker({
  title,
  people,
  selected,
  setSelected,
  required = false,
}) {
  return (
    <fieldset className="cohort-checks">
      <legend>
        {title}
        {required ? " (chọn ít nhất một)" : ""}
      </legend>
      {people.length ? (
        people.map((person) => (
          <label key={person.id}>
            <input
              type="checkbox"
              checked={selected.includes(person.id)}
              onChange={(event) =>
                setSelected(
                  event.target.checked
                    ? [...selected, person.id]
                    : selected.filter((id) => id !== person.id),
                )
              }
            />
            <span>
              {person.name}
              {person.email && (
                <small className="muted"> · {person.email}</small>
              )}
            </span>
          </label>
        ))
      ) : (
        <p className="muted">Chưa có người phù hợp.</p>
      )}
    </fieldset>
  );
}
function ClassForm({
  initial,
  courses = [],
  staff = [],
  pending,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          ...initial,
          capacity: initial.capacity ?? 30,
          instructor_ids: initial.instructors.map((person) => person.id),
        }
      : { ...blankClass, course_id: courses[0]?.id || "" },
  );
  const set = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const canStaff = !initial || initial.can_manage_staff;
  return (
    <form
      className="live-panel live-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          ...form,
          capacity: Number(form.capacity),
          ...(canStaff
            ? { instructor_ids: form.instructor_ids }
            : { instructor_ids: undefined }),
        });
      }}
    >
      <div className="between">
        <h2>{initial ? "Thông tin lớp học" : "Tạo lớp học"}</h2>
        <Button
          type="button"
          kind="ghost"
          disabled={pending}
          onClick={onCancel}
        >
          Hủy
        </Button>
      </div>
      <fieldset className="cohort-form-fields" disabled={pending}>
        {!initial && (
          <label>
            Khóa học
            <select
              aria-label="Khóa học"
              required
              value={form.course_id}
              onChange={(e) => set("course_id", e.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="live-two-col">
          <label>
            Tên lớp
            <input
              required
              maxLength={180}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label>
            Mã lớp
            <input
              required
              maxLength={60}
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
            />
          </label>
        </div>
        <div className="live-two-col">
          <label>
            Ngày bắt đầu
            <input
              type="date"
              required
              value={form.start_date || ""}
              onChange={(e) => set("start_date", e.target.value)}
            />
          </label>
          <label>
            Ngày kết thúc
            <input
              type="date"
              required
              min={form.start_date || undefined}
              value={form.end_date || ""}
              onChange={(e) => set("end_date", e.target.value)}
            />
          </label>
        </div>
        <label>
          Sĩ số tối đa
          <input
            type="number"
            required
            min="1"
            max="10000"
            step="1"
            value={form.capacity}
            onChange={(e) => set("capacity", e.target.value)}
          />
        </label>
        {initial && (
          <label>
            Trạng thái lớp
            <select
              aria-label="Trạng thái lớp"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {Object.entries(classLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        {canStaff && (
          <PeoplePicker
            title="Giảng viên phụ trách"
            required
            people={staff}
            selected={form.instructor_ids}
            setSelected={(value) => set("instructor_ids", value)}
          />
        )}
      </fieldset>
      <Button
        type="submit"
        disabled={pending || (canStaff && !form.instructor_ids.length)}
      >
        {pending ? "Đang lưu…" : initial ? "Lưu thông tin lớp" : "Tạo lớp"}
      </Button>
    </form>
  );
}
export function Cohorts(props) {
  return <CohortScreen key={props.id || "list"} {...props} />;
}
function CohortScreen({ id, state, go, refresh }) {
  const request = useClassData(id ? `/cohorts/${id}` : "/cohorts", refresh);
  const [creating, setCreating] = useState(false),
    [query, setQuery] = useState("");
  if (!request.data)
    return (
      <>
        <h1>{id ? "Lớp học" : "Các lớp học"}</h1>
        <Messages request={request} />
        {request.error ? (
          <Button kind="secondary" onClick={request.retry}>
            Thử tải lại
          </Button>
        ) : (
          <p role="status">Đang tải lớp học…</p>
        )}
      </>
    );
  if (id)
    return (
      <ClassDetail
        data={request.data}
        request={request}
        state={state}
        go={go}
      />
    );
  const { cohorts, courses = [], staff = [] } = request.data;
  const filtered = cohorts.filter((cohort) =>
    `${cohort.title} ${cohort.code} ${cohort.course_title}`
      .toLocaleLowerCase("vi")
      .includes(query.toLocaleLowerCase("vi")),
  );
  return (
    <>
      <div className="between live-page-heading">
        <div>
          <span className="live-eyebrow">HỌC TẬP THEO LỚP</span>
          <h1>Các lớp học</h1>
          <p className="muted">
            Theo dõi tiến độ, bài thực hành và lịch học riêng của từng lớp.
          </p>
        </div>
        {courses.length > 0 && (
          <Button
            icon="Plus"
            disabled={creating}
            onClick={() => setCreating(true)}
          >
            Tạo lớp học
          </Button>
        )}
      </div>
      <Messages request={request} />
      {creating && (
        <ClassForm
          courses={courses}
          staff={staff}
          pending={request.pending}
          onCancel={() => setCreating(false)}
          onSave={async (form) => {
            const result = await request.run(
              "/cohorts",
              "POST",
              form,
              "Đã tạo lớp học.",
            );
            if (result) {
              setCreating(false);
              if (result.cohort?.id) go(`cohorts/${result.cohort.id}`);
            }
          }}
        />
      )}
      <label className="live-form cohort-search">
        Tìm lớp học
        <input
          type="search"
          value={query}
          placeholder="Tên lớp, mã lớp hoặc khóa học"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {filtered.length ? (
        <div className="cohort-grid">
          {filtered.map((cohort) => (
            <article className="live-panel cohort-card" key={cohort.id}>
              <div className="between">
                <Badge color={cohort.status === "open" ? "green" : "lavender"}>
                  {classLabels[cohort.status]}
                </Badge>
                <span className="muted small">{cohort.code}</span>
              </div>
              <h2>{cohort.title}</h2>
              <p>{cohort.course_title}</p>
              <p className="muted small">
                Giảng viên: {names(cohort.instructors)}
              </p>
              <p className="muted small">
                {cohort.start_date || "Chưa có ngày bắt đầu"}
                {cohort.end_date ? ` → ${cohort.end_date}` : ""} ·{" "}
                {cohort.member_count} học viên
                {cohort.capacity ? ` / ${cohort.capacity}` : ""}
              </p>
              <Button
                kind="secondary"
                onClick={() => go(`cohorts/${cohort.id}`)}
              >
                Mở lớp học
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={query ? "Không tìm thấy lớp học" : "Chưa có lớp học"}
          description={
            query
              ? "Thử tên lớp, mã lớp hoặc khóa học khác."
              : "Các lớp bạn được phân công hoặc ghi danh sẽ xuất hiện tại đây."
          }
        />
      )}
    </>
  );
}
function ClassDetail({ data, request, state, go }) {
  const {
    cohort,
    lessons = [],
    members = [],
    sessions = [],
    assignments = [],
    assignment,
  } = data;
  const [editing, setEditing] = useState(false),
    [tab, setTab] = useState(() =>
      !cohort.can_manage &&
      !cohort.enrolled &&
      (state.user.management || state.user.role === "manager")
        ? "members"
        : "lessons",
    ),
    [selected, setSelected] = useState("");
  const lesson = lessons.find((item) => item.id === selected) || lessons[0];
  const progress = data.progress || [],
    manage = cohort.can_manage,
    writable = cohort.status === "open";
  const locked = cohort.status === "closed" || cohort.status === "archived";
  const tabs = [
    { id: "lessons", title: "Nội dung học" },
    { id: "assignments", title: "Bài thực hành" },
    { id: "sessions", title: "Lịch học & điểm danh" },
    ...(manage || state.user.management || state.user.role === "manager"
      ? [{ id: "members", title: "Học viên & báo cáo" }]
      : []),
  ];
  return (
    <div className="cohort-detail">
      <button className="text-btn" onClick={() => go("cohorts")}>
        ← Các lớp học
      </button>
      <div className="between live-page-heading">
        <div>
          <Badge color={writable ? "green" : "lavender"}>
            {classLabels[cohort.status]}
          </Badge>
          <h1>{cohort.title}</h1>
          <p>
            {cohort.code} · {cohort.course_title}
          </p>
          <p className="muted">
            Giảng viên: {names(cohort.instructors)} ·{" "}
            {cohort.start_date || "Chưa có lịch"}
            {cohort.end_date ? ` → ${cohort.end_date}` : ""}
          </p>
        </div>
        {(manage || cohort.can_manage_staff) &&
          (!locked || cohort.can_manage_staff) && (
            <Button
              kind="secondary"
              onClick={() => setEditing(true)}
              disabled={editing}
            >
              Thông tin lớp
            </Button>
          )}
      </div>
      <Messages request={request} />
      {editing && (
        <ClassForm
          initial={cohort}
          staff={data.staff || []}
          pending={request.pending}
          onCancel={() => setEditing(false)}
          onSave={async (form) => {
            if (
              await request.run(
                `/cohorts/${cohort.id}`,
                "PATCH",
                form,
                "Đã lưu thông tin lớp.",
              )
            )
              setEditing(false);
          }}
        />
      )}
      {!writable && (
        <p className="cohort-notice">
          {locked
            ? "Lớp đã kết thúc. Nội dung và lịch sử được lưu để xem lại."
            : "Lớp đang chuẩn bị. Bạn có thể bắt đầu ghi nhận học tập khi lớp được mở."}
        </p>
      )}
      <nav className="cohort-tabs" aria-label="Nội dung lớp học">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "selected" : ""}
            aria-current={tab === item.id ? "page" : undefined}
            onClick={() => setTab(item.id)}
          >
            {item.title}
          </button>
        ))}
      </nav>
      {tab === "lessons" &&
        (lesson ? (
          <div className="live-learning">
            <aside className="live-panel live-lesson-nav">
              <h2>Nội dung lớp học</h2>
              {cohort.enrolled && (
                <>
                  <progress
                    aria-label="Tiến độ trong lớp"
                    value={progress.length}
                    max={lessons.length || 1}
                  />
                  <p className="muted small">
                    {progress.length}/{lessons.length} bài hoàn thành trong lớp
                    này
                  </p>
                </>
              )}
              {lessons.map((item, index) => (
                <button
                  key={item.id}
                  className={lesson.id === item.id ? "selected" : ""}
                  aria-current={lesson.id === item.id ? "step" : undefined}
                  onClick={() => setSelected(item.id)}
                >
                  {progress.includes(item.id) ? "✓ " : ""}
                  {index + 1}. {item.title}
                </button>
              ))}
            </aside>
            <article className="live-panel live-lesson-content">
              <h2>{lesson.title}</h2>
              <div className="live-prose">{lesson.content}</div>
              <LessonTools
                key={lesson.id}
                course={{ id: cohort.course_id }}
                lesson={lesson}
                state={state}
              />
              {cohort.enrolled && (
                <Button
                  disabled={
                    !writable || request.pending || progress.includes(lesson.id)
                  }
                  onClick={() =>
                    request.run(
                      `/cohorts/${cohort.id}/lessons/${lesson.id}/complete`,
                      "POST",
                      {},
                      "Đã lưu tiến độ trong lớp này.",
                    )
                  }
                >
                  {progress.includes(lesson.id)
                    ? "Đã hoàn thành trong lớp"
                    : "Hoàn thành bài học trong lớp"}
                </Button>
              )}
            </article>
          </div>
        ) : (
          <Empty
            title="Chưa có nội dung học"
            description="Nội dung được hiển thị theo quyền truy cập của bạn."
          />
        ))}
      {tab === "assignments" && (
        <div className="stack">
          <section className="live-panel">
            <h2>Bài thực hành của lớp</h2>
            <p className="live-prose">
              {cohort.exercise ||
                assignment?.exercise ||
                assignments[0]?.exercise ||
                "Chưa có đề bài."}
            </p>
          </section>
          {assignment && (
            <ClassAssignment
              key={assignment.id}
              assignment={assignment}
              cohort={cohort}
              request={request}
              reviewer={false}
            />
          )}
          {manage &&
            assignments
              .filter((item) => item.user_id !== state.user.id)
              .map((item) => (
                <ClassAssignment
                  key={item.id}
                  assignment={item}
                  cohort={cohort}
                  request={request}
                  reviewer
                />
              ))}
          {!assignment && (!manage || !assignments.length) && (
            <Empty
              title="Chưa có bài thực hành"
              description="Bài thực hành được tạo khi học viên được ghi danh vào lớp."
            />
          )}
        </div>
      )}
      {tab === "sessions" && (
        <Sessions
          cohort={cohort}
          sessions={sessions}
          members={members}
          request={request}
        />
      )}
      {tab === "members" && (
        <Roster
          cohort={cohort}
          members={members}
          learners={data.learners || []}
          request={request}
        />
      )}
    </div>
  );
}
function ClassAssignment({ assignment, cohort, request, reviewer }) {
  const [body, setBody] = useState(assignment.body || ""),
    [feedback, setFeedback] = useState(assignment.feedback || ""),
    [level, setLevel] = useState(String(assignment.level || 1)),
    [decision, setDecision] = useState("approved"),
    [baseVersion, setBaseVersion] = useState(assignment.version),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) {
      setBody(assignment.body || "");
      setFeedback(assignment.feedback || "");
      setBaseVersion(assignment.version);
    }
  }, [assignment.version, assignment.body, assignment.feedback, dirty]);
  const writable = cohort.status === "open";
  const canSubmit =
    !reviewer &&
    writable &&
    cohort.enrolled &&
    ["todo", "revision"].includes(assignment.status);
  const canReview = reviewer && writable && assignment.status === "submitted";
  return (
    <article className="live-panel">
      <div className="between">
        <h3>{reviewer ? assignment.learner_name : "Bài làm của bạn"}</h3>
        <Badge color={assignment.status === "approved" ? "green" : "lavender"}>
          {statusLabels[assignment.status] || assignment.status}
        </Badge>
      </div>
      {canSubmit ? (
        <form
          className="live-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const saved = await request.run(
              `/cohorts/${cohort.id}/assignments/${assignment.id}/submit`,
              "POST",
              { body, version: baseVersion },
              "Đã nộp bài thực hành của lớp.",
            );
            if (saved) setDirty(false);
          }}
        >
          <label>
            Nội dung bài làm
            <textarea
              required
              rows={7}
              maxLength={30000}
              value={body}
              disabled={request.pending}
              onChange={(event) => {
                setDirty(true);
                setBody(event.target.value);
              }}
            />
          </label>
          <Button type="submit" disabled={request.pending}>
            {request.pending ? "Đang nộp…" : "Nộp bài thực hành"}
          </Button>
        </form>
      ) : (
        <p className="live-prose">
          {assignment.body || "Học viên chưa nộp bài."}
        </p>
      )}
      <FilePanel
        cohortAssignmentId={assignment.id}
        version={assignment.version}
        editable={canSubmit && !request.pending}
      />
      {assignment.feedback && (
        <div className="cohort-notice">
          <strong>Phản hồi</strong>
          <p className="live-prose">{assignment.feedback}</p>
        </div>
      )}
      {canReview && (
        <form
          className="live-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const saved = await request.run(
              `/cohorts/${cohort.id}/assignments/${assignment.id}/review`,
              "POST",
              {
                feedback,
                status: decision,
                level: Number(level),
                version: baseVersion,
              },
              "Đã lưu đánh giá bài thực hành.",
            );
            if (saved) setDirty(false);
          }}
        >
          <label>
            Phản hồi cho học viên
            <textarea
              required
              rows={4}
              maxLength={10000}
              value={feedback}
              disabled={request.pending}
              onChange={(event) => {
                setDirty(true);
                setFeedback(event.target.value);
              }}
            />
          </label>
          <div className="live-two-col">
            <label>
              Kết quả đánh giá
              <select
                aria-label="Kết quả đánh giá"
                value={decision}
                disabled={request.pending}
                onChange={(event) => {
                  setDirty(true);
                  setDecision(event.target.value);
                }}
              >
                <option value="approved">Đã đạt</option>
                <option value="revision">Cần bổ sung</option>
              </select>
            </label>
            {decision === "approved" && (
              <label>
                Mức năng lực
                <select
                  aria-label="Mức năng lực"
                  value={level}
                  disabled={request.pending}
                  onChange={(event) => {
                    setDirty(true);
                    setLevel(event.target.value);
                  }}
                >
                  {[1, 2, 3, 4].map((number) => (
                    <option key={number} value={number}>
                      Mức {number}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <Button disabled={request.pending} type="submit">
            Lưu đánh giá
          </Button>
        </form>
      )}
      {!!assignment.history?.length && (
        <details className="cohort-history">
          <summary>Lịch sử bài thực hành ({assignment.history.length})</summary>
          {assignment.history.map((entry, index) => (
            <div key={entry.id || index}>
              <strong>
                {statusLabels[entry.status] || entry.action || "Cập nhật"} ·{" "}
                {dateLabel(entry.created_at || entry.updated_at)}
              </strong>
              {entry.body && <p className="live-prose">{entry.body}</p>}
              {entry.feedback && (
                <p className="live-prose">Phản hồi: {entry.feedback}</p>
              )}
              {entry.level && <p>Mức năng lực: {entry.level}</p>}
            </div>
          ))}
        </details>
      )}
    </article>
  );
}
function Roster({ cohort, members, learners, request }) {
  const [selected, setSelected] = useState([]),
    [exportError, setExportError] = useState(""),
    [exporting, setExporting] = useState(false);
  const writable =
    cohort.can_manage && !["closed", "archived"].includes(cohort.status);
  const candidates = learners.filter(
    (person) => !members.some((member) => member.user_id === person.id),
  );
  async function exportReport() {
    setExportError("");
    setExporting(true);
    try {
      const result = await api(`/cohorts/${cohort.id}/report?format=csv`);
      download(
        result.fileName || `${cohort.code}-bao-cao.csv`,
        result.csv,
        "text/csv;charset=utf-8",
      );
    } catch (e) {
      setExportError(e.message);
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="stack">
      <section className="live-panel">
        <div className="between">
          <h2>Học viên của lớp</h2>
          <Button
            kind="secondary"
            icon="Download"
            disabled={exporting}
            onClick={exportReport}
          >
            {exporting ? "Đang xuất…" : "Xuất báo cáo CSV"}
          </Button>
        </div>
        {exportError && (
          <p role="alert" className="live-error">
            {exportError}
          </p>
        )}
        {members.length ? (
          <div className="cohort-table-wrap">
            <table className="cohort-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Ghi danh</th>
                  <th>Bài học</th>
                  <th>Thực hành</th>
                  <th>Hoàn thành</th>
                  {writable && <th>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.user_id}>
                    <td>
                      <strong>{member.name}</strong>
                      <br />
                      <small className="muted">{member.email}</small>
                    </td>
                    <td>
                      {member.status === "active" ? "Đang học" : "Đã rút"}
                    </td>
                    <td>
                      {member.completed_lessons}/{member.total_lessons}
                    </td>
                    <td>
                      {statusLabels[member.assignment_status] || "Chưa nộp"}
                    </td>
                    <td>
                      {member.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
                    </td>
                    {writable && (
                      <td>
                        <Button
                          kind="ghost"
                          disabled={request.pending}
                          onClick={() =>
                            request.run(
                              `/cohorts/${cohort.id}/members/${member.user_id}`,
                              "PATCH",
                              {
                                status:
                                  member.status === "active"
                                    ? "withdrawn"
                                    : "active",
                                version: member.version,
                              },
                              member.status === "active"
                                ? "Đã rút học viên; lịch sử được giữ lại."
                                : "Đã kích hoạt lại học viên.",
                            )
                          }
                        >
                          {member.status === "active"
                            ? "Rút khỏi lớp"
                            : "Kích hoạt lại"}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Chưa có học viên"
            description="Thêm học viên để bắt đầu theo dõi lớp."
          />
        )}
      </section>
      {writable && (
        <form
          className="live-panel live-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (
              await request.run(
                `/cohorts/${cohort.id}/members`,
                "POST",
                { user_ids: selected },
                "Đã thêm học viên vào lớp.",
              )
            )
              setSelected([]);
          }}
        >
          <h2>Thêm học viên</h2>
          <fieldset disabled={request.pending} className="cohort-form-fields">
            <PeoplePicker
              title="Chọn học viên"
              people={candidates}
              selected={selected}
              setSelected={setSelected}
            />
          </fieldset>
          <Button disabled={request.pending || !selected.length} type="submit">
            Thêm vào lớp
          </Button>
        </form>
      )}
    </div>
  );
}
const localTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
function SessionForm({ initial, pending, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: initial?.title || "",
    starts_at: localTime(initial?.starts_at),
    ends_at: localTime(initial?.ends_at),
    location: initial?.location || "",
  }));
  const set = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  return (
    <form
      className="live-panel live-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          ...form,
          starts_at: new Date(form.starts_at).toISOString(),
          ends_at: new Date(form.ends_at).toISOString(),
          ...(initial ? { version: initial.version } : {}),
        });
      }}
    >
      <div className="between">
        <h3>{initial ? "Chỉnh sửa buổi học" : "Thêm buổi học"}</h3>
        <Button
          type="button"
          kind="ghost"
          disabled={pending}
          onClick={onCancel}
        >
          Hủy
        </Button>
      </div>
      <fieldset disabled={pending} className="cohort-form-fields">
        <label>
          Tên buổi học
          <input
            required
            maxLength={180}
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
          />
        </label>
        <div className="live-two-col">
          <label>
            Bắt đầu
            <input
              required
              type="datetime-local"
              value={form.starts_at}
              onChange={(event) => set("starts_at", event.target.value)}
            />
          </label>
          <label>
            Kết thúc
            <input
              required
              type="datetime-local"
              min={form.starts_at || undefined}
              value={form.ends_at}
              onChange={(event) => set("ends_at", event.target.value)}
            />
          </label>
        </div>
        <label>
          Địa điểm hoặc liên kết tham gia
          <input
            maxLength={1000}
            value={form.location}
            onChange={(event) => set("location", event.target.value)}
          />
        </label>
      </fieldset>
      <Button disabled={pending} type="submit">
        Lưu buổi học
      </Button>
    </form>
  );
}
function Sessions({ cohort, sessions, members, request }) {
  const [editor, setEditor] = useState(null);
  const writable =
    cohort.can_manage && !["closed", "archived"].includes(cohort.status);
  return (
    <div className="stack">
      <div className="between">
        <h2>Lịch học & điểm danh</h2>
        {writable && (
          <Button icon="Plus" disabled={!!editor} onClick={() => setEditor({})}>
            Thêm buổi học
          </Button>
        )}
      </div>
      {editor && (
        <SessionForm
          key={editor.id || "new"}
          initial={editor.id ? editor : null}
          pending={request.pending}
          onCancel={() => setEditor(null)}
          onSave={async (form) => {
            if (
              await request.run(
                `/cohorts/${cohort.id}/sessions${editor.id ? `/${editor.id}` : ""}`,
                editor.id ? "PATCH" : "POST",
                form,
                "Đã lưu buổi học.",
              )
            )
              setEditor(null);
          }}
        />
      )}
      {sessions.length ? (
        sessions.map((session) => (
          <article key={session.id} className="live-panel">
            <div className="between">
              <h3>{session.title}</h3>
              <Badge>
                {session.status === "cancelled" ? "Đã hủy" : "Đã lên lịch"}
              </Badge>
            </div>
            <p>
              {dateLabel(session.starts_at)} → {dateLabel(session.ends_at)}
            </p>
            <p className="live-prose">{session.location}</p>
            {writable &&
              session.status !== "cancelled" &&
              new Date(session.starts_at) > new Date() && (
                <div className="live-row-actions">
                  <Button
                    kind="secondary"
                    disabled={!!editor || request.pending}
                    onClick={() => setEditor(session)}
                  >
                    Sửa buổi học
                  </Button>
                  <Button
                    kind="ghost"
                    disabled={request.pending}
                    onClick={() =>
                      request.run(
                        `/cohorts/${cohort.id}/sessions/${session.id}`,
                        "PATCH",
                        { version: session.version, status: "cancelled" },
                        "Đã hủy buổi học; lịch sử được giữ lại.",
                      )
                    }
                  >
                    Hủy buổi học
                  </Button>
                </div>
              )}
            <Attendance
              key={`${session.id}:${session.version}`}
              session={session}
              members={members}
              writable={writable}
              cohort={cohort}
              request={request}
            />
          </article>
        ))
      ) : (
        <Empty
          title="Chưa có lịch học"
          description="Các buổi học của lớp sẽ xuất hiện tại đây."
        />
      )}
    </div>
  );
}
function Attendance({ session, writable, cohort, request, members }) {
  const [records, setRecords] = useState(() =>
    (session.attendance || []).map((item) => ({ ...item })),
  );
  const canEdit =
    writable &&
    session.status !== "cancelled" &&
    new Date(session.starts_at) <= new Date();
  const activeMember = (item) =>
    members.some(
      (member) => member.user_id === item.user_id && member.status === "active",
    );
  if (!records.length)
    return <p className="muted small">Chưa có dữ liệu điểm danh.</p>;
  return (
    <form
      className="live-form cohort-attendance"
      onSubmit={(event) => {
        event.preventDefault();
        request.run(
          `/cohorts/${cohort.id}/sessions/${session.id}/attendance`,
          "PUT",
          {
            version: session.version,
            records: records
              .filter(
                (item) =>
                  activeMember(item) &&
                  item.status &&
                  item.status !== "unrecorded",
              )
              .map(({ user_id, status }) => ({ user_id, status })),
          },
          "Đã lưu điểm danh.",
        );
      }}
    >
      <h4>Điểm danh</h4>
      {records.map((item) => (
        <label key={item.user_id} className="cohort-attendance-row">
          <span>{item.name || "Bạn"}</span>
          {canEdit && activeMember(item) ? (
            <select
              aria-label={`Điểm danh ${item.name || "học viên"}`}
              disabled={request.pending}
              value={item.status || "unrecorded"}
              onChange={(event) =>
                setRecords((all) =>
                  all.map((record) =>
                    record.user_id === item.user_id
                      ? { ...record, status: event.target.value }
                      : record,
                  ),
                )
              }
            >
              {Object.entries(attendanceLabels).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                  disabled={
                    value === "unrecorded" &&
                    session.attendance.some(
                      (original) =>
                        original.user_id === item.user_id &&
                        original.status !== "unrecorded",
                    )
                  }
                >
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <span>{attendanceLabels[item.status] || "Chưa điểm danh"}</span>
          )}
        </label>
      ))}
      {canEdit && (
        <Button
          type="submit"
          disabled={
            request.pending ||
            !records.some(
              (item) =>
                activeMember(item) &&
                item.status &&
                item.status !== "unrecorded",
            )
          }
        >
          Lưu điểm danh
        </Button>
      )}
      {writable && !canEdit && session.status !== "cancelled" && (
        <p className="muted small">Điểm danh mở khi buổi học bắt đầu.</p>
      )}
    </form>
  );
}
