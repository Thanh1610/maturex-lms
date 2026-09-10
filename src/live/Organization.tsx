import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Empty, Icon } from "../ui";
import { api, statusLabels } from "./api";

const progressLabels = {
  completed: "Hoàn thành",
  in_progress: "Đang học",
  not_started: "Chưa bắt đầu",
};
const date = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN") : "—";

function useOrganization(path: string, _revision?: any) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const result = await api(path);
      setData(result);
      setError("");
    } catch (error: any) {
      setError(error.message);
    }
  }, [path]);
  useEffect(() => {
    let mounted = true;
    api(path)
      .then((result) => {
        if (mounted) {
          setData(result);
          setError("");
        }
      })
      .catch((error) => {
        if (mounted) setError(error.message);
      });
    return () => {
      mounted = false;
    };
  }, [path]);
  return { data, error, load };
}

function LoadState({ resource }) {
  if (resource.error)
    return (
      <div className="live-error" role="alert">
        {resource.error}
        <Button type="button" kind="ghost" onClick={resource.load}>
          Thử lại
        </Button>
      </div>
    );
  if (!resource.data) return <p role="status">Đang tải dữ liệu…</p>;
  return null;
}

function AssignPath({ pathId, mutate, busy, onDone }) {
  const resource = useOrganization("/team");
  async function submit(event) {
    event.preventDefault();
    if (
      await mutate(
        `/paths/${pathId}/assign`,
        "POST",
        Object.fromEntries(new FormData(event.currentTarget)),
        "Đã giao lộ trình và đăng ký các khóa học.",
      )
    )
      onDone();
  }
  return (
    <form
      className="live-form org-assignment pt-[20px] border-t border-[var(--border,#e9eaf0)] flex flex-col gap-[18px]"
      onSubmit={submit}
    >
      <h3 className="text-[15px] font-bold text-[#1f1b2d] mb-0">
        Giao lộ trình
      </h3>
      <LoadState resource={resource} />
      {resource.data && (
        <>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Người học
            <select
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              required
              name="user_id"
              defaultValue=""
            >
              <option value="" disabled>
                Chọn thành viên
              </option>
              {resource.data.users
                .filter((user) => user.active)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.team || user.email}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Lý do giao
            <textarea
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              name="reason"
              required
              maxLength={2000}
              placeholder="Năng lực cần phát triển và mục tiêu mong đợi"
            />
          </label>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Hạn hoàn thành
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              name="due_date"
              required
              type="date"
            />
          </label>
          {!resource.data.users.some((user) => user.active) && (
            <p className="muted text-[11px] text-[var(--muted,#757185)] leading-relaxed">
              Chưa có người học trong phạm vi quản lý. Quản trị viên cần cập
              nhật đội nhóm hoặc quản lý trực tiếp.
            </p>
          )}
          <div className="org-actions flex flex-wrap gap-[10px] mt-auto">
            <Button
              type="submit"
              disabled={
                busy || !resource.data.users.some((user) => user.active)
              }
            >
              Giao lộ trình
            </Button>
            <Button type="button" kind="ghost" onClick={onDone}>
              Đóng
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

export function Paths({ state, go, mutate, busy }) {
  const resource = useOrganization("/paths", state);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [query, setQuery] = useState("");
  const canTeach = ["admin", "instructor"].includes(state.user.role);
  const canAssign = ["admin", "manager"].includes(state.user.role);
  const courses = state.courses.filter(
    (course) =>
      state.user.role === "admin" ||
      course.owner_id === state.user.id ||
      course.status === "published",
  );
  async function create(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (
      await mutate(
        "/paths",
        "POST",
        {
          title: form.get("title"),
          description: form.get("description"),
          course_ids: form.getAll("course_ids"),
        },
        "Đã tạo bản nháp lộ trình.",
      )
    ) {
      setCreating(false);
      await resource.load();
    }
  }
  async function change(path, method, body, message) {
    if (await mutate(path, method, body, message)) await resource.load();
  }
  const paths =
    resource.data?.paths.filter((path) =>
      `${path.title} ${path.description}`
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi")),
    ) || [];
  return (
    <>
      <div className="between live-page-heading flex items-center justify-between gap-4 mb-7">
        <div>
          <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
            TỪNG BƯỚC TRƯỞNG THÀNH
          </span>
          <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
            Lộ trình học tập
          </h1>
          <p className="muted text-[11px] text-[var(--muted,#757185)]">
            Kết nối kiến thức và thực hành thành một hành trình có mục tiêu.
          </p>
        </div>
        {canTeach && (
          <Button
            icon="Plus"
            disabled={busy}
            onClick={() => setCreating(!creating)}
          >
            {creating ? "Đóng biểu mẫu" : "Tạo lộ trình"}
          </Button>
        )}
      </div>
      {creating && (
        <form
          className="live-panel live-form live-editor bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px] mb-[25px]"
          onSubmit={create}
        >
          <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-0">
            Lộ trình mới
          </h2>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Tên lộ trình
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              name="title"
              required
              maxLength={180}
            />
          </label>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Mô tả
            <textarea
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              name="description"
              maxLength={5000}
            />
          </label>
          <fieldset className="org-course-picker border border-[var(--border,#e9eaf0)] rounded-[12px] max-h-[300px] overflow-auto p-[15px] m-0">
            <legend className="text-[11px] font-semibold px-2 text-[#8a7bab]">
              Khóa học theo thứ tự hiển thị
            </legend>
            {courses.length ? (
              courses.map((course) => (
                <label
                  className="flex items-center gap-[10px] py-[9px] text-[12px] text-[#332f42] cursor-pointer"
                  key={course.id}
                >
                  <input
                    className="w-[17px] h-[17px] shrink-0 accent-[#9180bc]"
                    type="checkbox"
                    name="course_ids"
                    value={course.id}
                  />
                  <span>
                    {course.title}{" "}
                    <small className="muted text-[9px] text-[var(--muted,#757185)]">
                      · {statusLabels[course.status]}
                    </small>
                  </span>
                </label>
              ))
            ) : (
              <p className="text-[12px] text-[var(--muted,#757185)]">
                Hãy tạo khóa học trước khi xây dựng lộ trình.
              </p>
            )}
          </fieldset>
          <p className="muted text-[11px] text-[var(--muted,#757185)] leading-relaxed">
            Lộ trình được tạo ở dạng bản nháp. Các khóa học phải được phát hành
            trước khi mở đăng ký.
          </p>
          <div className="self-start">
            <Button type="submit" disabled={busy || !courses.length}>
              Lưu bản nháp
            </Button>
          </div>
        </form>
      )}
      <div className="live-filters flex items-center flex-wrap gap-[14px] mb-[25px]">
        <label className="live-search bg-white border border-[var(--border,#e9eaf0)] rounded-[8px] pl-[14px] flex items-center flex-1 min-w-[200px] max-w-[500px] text-[var(--muted,#757185)]">
          <Icon name="Search" size={18} />
          <input
            className="border-0 bg-transparent w-full py-2 pl-2 focus:outline-none text-[12px] text-[#1f1b2d]"
            aria-label="Tìm lộ trình"
            placeholder="Tìm lộ trình học tập…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="muted text-[11px] text-[var(--muted,#757185)]">
          {paths.length} lộ trình
        </span>
      </div>
      <LoadState resource={resource} />
      {resource.data && !paths.length && (
        <Empty
          title="Chưa có lộ trình phù hợp"
          description={
            canTeach
              ? "Tạo lộ trình từ các khóa học để định hướng phát triển cho người học."
              : "Lộ trình sẽ xuất hiện khi được phát hành hoặc giao cho bạn."
          }
        />
      )}
      <div className="org-path-grid grid grid-cols-2 max-[1000px]:grid-cols-1 gap-[22px]">
        {paths.map((path, index) => (
          <article
            className="live-panel org-path bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[26px] max-[600px]:p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[20px] min-w-0"
            key={path.id}
          >
            <div className="org-path-top flex items-center justify-between">
              <span
                className={`org-path-icon grid place-items-center w-[56px] h-[56px] rounded-[17px] ${
                  index % 3 === 1
                    ? "text-[#508879] bg-[#e7f3ed]"
                    : index % 3 === 2
                      ? "text-[#ae8447] bg-[#fcf2df]"
                      : "text-[#8270b3] bg-[#efebf8]"
                }`}
              >
                <Icon name="Workflow" size={28} />
              </span>
              <Badge>{statusLabels[path.status]}</Badge>
            </div>
            <div>
              <h2 className="text-[21px] font-bold text-[#1f1b2d] m-0 mb-[10px] leading-[1.4] break-words">
                {path.title}
              </h2>
              <p className="muted org-description text-[12px] text-[var(--muted,#757185)] leading-[1.7] whitespace-pre-wrap break-words">
                {path.description || "Hành trình học tập và thực hành."}
              </p>
              <small className="muted text-[9px] text-[var(--muted,#757185)] block mt-1">
                {path.owner_name} · {path.courses.length} khóa học
              </small>
            </div>
            <ol className="org-steps list-none p-0 m-0 [counter-reset:course]">
              {path.courses.map((course) => (
                <li
                  className="[counter-increment:course] flex items-center max-[600px]:flex-wrap gap-[12px] py-[11px] border-b border-[var(--border,#e9eaf0)] before:content-[counter(course)] before:grid before:place-items-center before:shrink-0 before:w-[25px] before:h-[25px] before:bg-[#f1eef8] before:text-[#8170b3] before:rounded-full before:text-[11px]"
                  key={course.id}
                >
                  <button
                    className="text-btn text-left leading-[1.5] break-words text-[12px] text-[#74609f] hover:underline font-medium"
                    onClick={() => go(`course/${course.id}`)}
                  >
                    {course.title}
                  </button>
                  {course.status !== "published" && (
                    <small className="muted text-[9px] text-[var(--muted,#757185)] ml-auto max-[600px]:ml-[37px]">
                      {statusLabels[course.status]}
                    </small>
                  )}
                </li>
              ))}
            </ol>
            {path.enrollment && (
              <div className="org-path-progress text-[12px] leading-[1.7]">
                <div className="between flex items-center justify-between gap-2">
                  <strong className="text-[#1f1b2d]">
                    {progressLabels[path.learning_status]}
                  </strong>
                  <span className="text-[#757185] text-[11px]">
                    {path.completed_courses}/{path.total_courses} khóa đạt
                  </span>
                </div>
                <progress
                  className="w-full h-[9px] rounded-[10px] accent-[#9180bc] my-[10px] border-0"
                  value={path.progress}
                  max="100"
                  aria-label="Tiến độ lộ trình"
                />
                <small className="muted text-[9px] text-[var(--muted,#757185)] block">
                  Hoàn thành bài học và đạt bài thực hành để hoàn thành khóa.
                </small>
                {path.enrollment.due_date && (
                  <p className="text-[12px] text-[#1f1b2d] mt-2 mb-1">
                    Hạn hoàn thành:{" "}
                    <strong>{date(path.enrollment.due_date)}</strong>
                  </p>
                )}
                {path.enrollment.reason && (
                  <p className="org-reason p-[10px_14px] bg-[#f7f5fb] rounded-[8px] whitespace-pre-wrap break-words text-[12px] text-[#555064] my-2">
                    {path.enrollment.reason}
                  </p>
                )}
              </div>
            )}
            <div className="org-actions flex flex-wrap gap-[10px] mt-auto">
              {!path.enrollment && path.status === "published" && (
                <Button
                  disabled={busy}
                  onClick={() =>
                    change(
                      `/paths/${path.id}/enroll`,
                      "POST",
                      {},
                      "Đã đăng ký lộ trình.",
                    )
                  }
                  icon="ArrowRight"
                >
                  Bắt đầu lộ trình
                </Button>
              )}
              {canAssign && path.status === "published" && (
                <Button
                  kind="secondary"
                  disabled={busy}
                  onClick={() =>
                    setAssigning(assigning === path.id ? null : path.id)
                  }
                >
                  Giao cho thành viên
                </Button>
              )}
              {canTeach &&
                (state.user.role === "admin" ||
                  path.owner_id === state.user.id) && (
                  <Button
                    kind="ghost"
                    disabled={busy}
                    onClick={() =>
                      change(
                        `/paths/${path.id}`,
                        "PATCH",
                        {
                          status:
                            path.status === "published"
                              ? "archived"
                              : "published",
                        },
                        "Đã cập nhật lộ trình.",
                      )
                    }
                  >
                    {path.status === "published" ? "Lưu trữ" : "Phát hành"}
                  </Button>
                )}
            </div>
            {assigning === path.id && (
              <AssignPath
                pathId={path.id}
                mutate={mutate}
                busy={busy}
                onDone={() => {
                  setAssigning(null);
                  resource.load();
                }}
              />
            )}
          </article>
        ))}
      </div>
    </>
  );
}

export function Team({ state, go }) {
  const resource = useOrganization("/team", state);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const users =
    resource.data?.users.filter((user) =>
      `${user.name} ${user.team} ${user.job}`
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi")),
    ) || [];
  const member = resource.data?.users.find((user) => user.id === selected);
  return (
    <>
      <div className="live-page-heading mb-7">
        <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
          CÙNG NHAU PHÁT TRIỂN
        </span>
        <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
          Đội ngũ của bạn
        </h1>
        <p className="muted text-[11px] text-[var(--muted,#757185)] mb-2">
          Theo dõi việc học và bằng chứng năng lực của từng thành viên.
        </p>
        {resource.data && <Badge>{resource.data.scope}</Badge>}
      </div>
      <div className="live-filters flex items-center flex-wrap gap-[14px] mb-[25px]">
        <label className="live-search bg-white border border-[var(--border,#e9eaf0)] rounded-[8px] pl-[14px] flex items-center flex-1 min-w-[200px] max-w-[500px] text-[var(--muted,#757185)]">
          <Icon name="Search" size={18} />
          <input
            className="border-0 bg-transparent w-full py-2 pl-2 focus:outline-none text-[12px] text-[#1f1b2d]"
            aria-label="Tìm thành viên"
            placeholder="Tìm tên, đội nhóm, vị trí…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="muted text-[11px] text-[var(--muted,#757185)]">
          {users.length} thành viên
        </span>
      </div>
      <LoadState resource={resource} />
      {resource.data && !users.length && (
        <Empty
          title="Chưa có thành viên phù hợp"
          description="Thành viên hiển thị theo đội nhóm, quản lý trực tiếp hoặc danh sách khóa học bạn phụ trách."
        />
      )}
      {!!users.length && (
        <div className="live-panel live-table-wrap bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto">
          <table className="live-table w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#fcfcfd] border-b border-[var(--border,#e9eaf0)]">
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Thành viên
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Đội nhóm · Vị trí
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Khóa đã đạt
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Bằng chứng
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  className="border-b border-[var(--border,#e9eaf0)] hover:bg-[#faf9fc]"
                  key={user.id}
                >
                  <td className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    <strong className="text-[#1f1b2d]">{user.name}</strong>
                    <small className="org-table-sub block text-[11px] text-[var(--muted,#757185)] mt-1">
                      {user.email}
                    </small>
                    {!user.active && <Badge color="rose">Đã khóa</Badge>}
                  </td>
                  <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                    {user.team || "Chưa phân đội"}
                    <small className="org-table-sub block text-[11px] text-[var(--muted,#757185)] mt-1">
                      {user.job || "Chưa cập nhật vị trí"}
                    </small>
                  </td>
                  <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                    {user.completed_courses}/{user.enrolled_courses}
                  </td>
                  <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                    {user.evidence.length}
                  </td>
                  <td className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    <Button
                      kind="ghost"
                      onClick={() =>
                        setSelected(user.id === selected ? null : user.id)
                      }
                    >
                      Xem tiến độ
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {member && (
        <section className="live-panel org-member bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[28px] max-[600px]:p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] mt-[24px]">
          <div className="between flex items-center justify-between gap-4 mb-4">
            <div>
              <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
                HỒ SƠ HỌC TẬP
              </span>
              <h2 className="text-[20px] font-bold text-[#1f1b2d] m-0">
                {member.name}
              </h2>
            </div>
            <Button kind="ghost" icon="X" onClick={() => setSelected(null)}>
              Đóng
            </Button>
          </div>
          <h3 className="text-[15px] font-bold text-[#1f1b2d] mt-[26px] mb-2">
            Khóa học
          </h3>
          {!member.courses.length && (
            <p className="muted text-[11px] text-[var(--muted,#757185)]">
              Chưa đăng ký khóa học.
            </p>
          )}
          {member.courses.map((course) => (
            <div
              className="org-course-row flex items-center max-[600px]:items-start max-[600px]:flex-wrap justify-between gap-[18px] py-[15px] border-b border-[var(--border,#e9eaf0)]"
              key={course.course_id}
            >
              <div className="min-w-0 break-words">
                <strong className="text-[13px] text-[#1f1b2d] font-semibold">
                  {course.course_title}
                </strong>
                <small className="org-table-sub block text-[11px] text-[var(--muted,#757185)] mt-1">
                  {course.completed_lessons}/{course.lessons} bài học · Bài thực
                  hành: {statusLabels[course.assignment_status]}
                </small>
              </div>
              <Badge color={course.status === "completed" ? "green" : "purple"}>
                {progressLabels[course.status]}
              </Badge>
            </div>
          ))}
          <h3 className="text-[15px] font-bold text-[#1f1b2d] mt-[26px] mb-2">
            Bằng chứng năng lực
          </h3>
          {!member.evidence.length && (
            <p className="muted text-[11px] text-[var(--muted,#757185)]">
              Chưa có bằng chứng được giảng viên xác nhận.
            </p>
          )}
          {member.evidence.map((evidence, index) => (
            <div
              className="org-course-row flex items-center max-[600px]:items-start max-[600px]:flex-wrap justify-between gap-[18px] py-[15px] border-b border-[var(--border,#e9eaf0)]"
              key={`${evidence.course_id}-${index}`}
            >
              <div className="min-w-0 break-words">
                <strong className="text-[13px] text-[#1f1b2d] font-semibold">
                  {evidence.skill}
                </strong>
                <small className="org-table-sub block text-[11px] text-[var(--muted,#757185)] mt-1">
                  {evidence.course_title} · Xác nhận bởi{" "}
                  {evidence.reviewer_name}
                </small>
              </div>
              <Badge color="green">Mức {evidence.level}/4</Badge>
            </div>
          ))}
          {!!member.paths.length && (
            <>
              <h3 className="text-[15px] font-bold text-[#1f1b2d] mt-[26px] mb-2">
                Lộ trình được đăng ký
              </h3>
              {member.paths.map((path) => (
                <div
                  className="org-course-row flex items-center max-[600px]:items-start max-[600px]:flex-wrap justify-between gap-[18px] py-[15px] border-b border-[var(--border,#e9eaf0)]"
                  key={path.id}
                >
                  <div className="min-w-0 break-words">
                    <strong className="text-[13px] text-[#1f1b2d] font-semibold">
                      {path.title}
                    </strong>
                    <small className="org-table-sub block text-[11px] text-[var(--muted,#757185)] mt-1">
                      {path.completed_courses}/{path.total_courses} khóa đạt ·
                      Hạn: {date(path.due_date)}
                    </small>
                    {path.reason && (
                      <p className="muted text-[11px] text-[var(--muted,#757185)] mt-1">
                        {path.reason}
                      </p>
                    )}
                  </div>
                  <Badge>{progressLabels[path.status]}</Badge>
                </div>
              ))}
            </>
          )}
          {["admin", "manager"].includes(state.user.role) && (
            <div className="mt-[20px]">
              <Button kind="secondary" onClick={() => go("paths")}>
                Giao lộ trình học tập
              </Button>
            </div>
          )}
        </section>
      )}
    </>
  );
}

export function Reports({ state }) {
  const resource = useOrganization("/reports", state);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    setExporting(true);
    setError("");
    try {
      const result = await api("/reports?format=csv");
      const url = URL.createObjectURL(
        new Blob([result.csv], { type: "text/csv;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setExporting(false);
    }
  }
  const report = resource.data;
  return (
    <>
      <div className="between live-page-heading flex items-center justify-between gap-4 mb-7">
        <div>
          <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
            NHÌN THẤY SỰ TIẾN BỘ
          </span>
          <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
            Báo cáo đào tạo
          </h1>
          <p className="muted text-[11px] text-[var(--muted,#757185)]">
            Kết quả từ hoạt động học tập và bài thực hành đã được đánh giá.
          </p>
        </div>
        <Button
          icon="Download"
          kind="secondary"
          disabled={!report || exporting}
          onClick={download}
        >
          {exporting ? "Đang xuất…" : "Xuất CSV"}
        </Button>
      </div>
      <LoadState resource={resource} />
      {error && (
        <div
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8]"
          role="alert"
        >
          {error}
        </div>
      )}
      {report && (
        <>
          <div className="org-report-scope flex flex-wrap gap-[12px] items-center mb-[20px] text-[12px]">
            <Badge>{report.scope}</Badge>
            <span className="muted text-[var(--muted,#757185)]">
              Dữ liệu hiện tại trong phạm vi của bạn
            </span>
          </div>
          <div className="live-stats grid grid-cols-4 max-[900px]:grid-cols-2 max-[650px]:grid-cols-1 gap-[18px] mb-[25px]">
            {[
              ["Users", report.metrics.learners, "Người học"],
              ["BookOpen", report.metrics.enrollments, "Lượt đăng ký khóa"],
              [
                "CheckCircle2",
                report.metrics.completed_courses,
                "Lượt hoàn thành khóa",
              ],
              ["Target", report.metrics.evidence, "Bằng chứng năng lực"],
            ].map(([icon, value, label]) => (
              <div
                className="live-stat bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[20px] max-[760px]:p-[17px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-start gap-1"
                key={label}
              >
                <div className="text-[#8170b3] mb-1">
                  <Icon name={icon} size={22} />
                </div>
                <strong className="text-[28px] font-bold text-[#1f1b2d] leading-tight">
                  {value}
                </strong>
                <span className="text-[12px] text-[var(--muted,#757185)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="muted org-report-note text-[12px] text-[var(--muted,#757185)] leading-[1.8] mb-[30px]">
            Một khóa được tính hoàn thành khi người học hoàn tất tất cả bài học
            và đạt bài thực hành. Một người có thể đăng ký nhiều khóa.
          </p>
          <h2 className="text-[20px] font-bold text-[#1f1b2d] mb-4">
            Kết quả theo khóa học
          </h2>
          {!report.courses.length ? (
            <Empty
              title="Chưa có dữ liệu khóa học"
              description="Báo cáo sẽ cập nhật khi có khóa học và người đăng ký."
            />
          ) : (
            <div className="live-panel live-table-wrap bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto mb-8">
              <table className="live-table w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#fcfcfd] border-b border-[var(--border,#e9eaf0)]">
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Khóa học
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Đăng ký
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Chưa bắt đầu
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Đang học
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Hoàn thành
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Tỷ lệ hoàn thành
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.courses.map((course) => (
                    <tr
                      className="border-b border-[var(--border,#e9eaf0)] hover:bg-[#faf9fc]"
                      key={course.id}
                    >
                      <td className="p-[18px_22px] text-[11px] whitespace-nowrap">
                        <strong className="text-[#1f1b2d]">
                          {course.title}
                        </strong>
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {course.enrolled}
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {course.not_started}
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {course.in_progress}
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {course.completed}
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {course.enrolled
                          ? `${Math.round(
                              (course.completed / course.enrolled) * 100,
                            )}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <h2 className="org-section-title text-[20px] font-bold text-[#1f1b2d] mt-[32px] mb-4">
            Kết quả theo người học
          </h2>
          {!report.users.length ? (
            <p className="muted text-[11px] text-[var(--muted,#757185)]">
              Chưa có người học trong phạm vi báo cáo.
            </p>
          ) : (
            <div className="live-panel live-table-wrap bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto mb-8">
              <table className="live-table w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#fcfcfd] border-b border-[var(--border,#e9eaf0)]">
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Người học
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Đội nhóm
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Khóa đăng ký
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Khóa hoàn thành
                    </th>
                    <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                      Bằng chứng
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.users.map((user) => (
                    <tr
                      className="border-b border-[var(--border,#e9eaf0)] hover:bg-[#faf9fc]"
                      key={user.id}
                    >
                      <td className="p-[18px_22px] text-[11px] font-medium text-[#1f1b2d] whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {user.team || "—"}
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {user.enrolled_courses}
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {user.completed_courses}
                      </td>
                      <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                        {user.evidence.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {state.user.role !== "instructor" && (
            <>
              <h2 className="org-section-title text-[20px] font-bold text-[#1f1b2d] mt-[32px] mb-4">
                Kết quả theo lộ trình
              </h2>
              {!report.paths.length ? (
                <p className="muted text-[11px] text-[var(--muted,#757185)]">
                  Chưa có lượt đăng ký lộ trình trong phạm vi báo cáo.
                </p>
              ) : (
                <div className="live-panel live-table-wrap bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto mb-8">
                  <table className="live-table w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#fcfcfd] border-b border-[var(--border,#e9eaf0)]">
                        <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                          Lộ trình
                        </th>
                        <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                          Đã đăng ký
                        </th>
                        <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                          Hoàn thành
                        </th>
                        <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                          Quá hạn
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.paths.map((path) => (
                        <tr
                          className="border-b border-[var(--border,#e9eaf0)] hover:bg-[#faf9fc]"
                          key={path.id}
                        >
                          <td className="p-[18px_22px] text-[11px] font-medium text-[#1f1b2d] whitespace-nowrap">
                            {path.title}
                          </td>
                          <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                            {path.enrolled}
                          </td>
                          <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                            {path.completed}
                          </td>
                          <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                            {path.overdue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
