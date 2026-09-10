import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Empty, Icon } from "../ui.jsx";
import { api, statusLabels } from "./api.js";
import "./organization.css";

const progressLabels = {
  completed: "Hoàn thành",
  in_progress: "Đang học",
  not_started: "Chưa bắt đầu",
};
const date = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN") : "—";

function useOrganization(path, _revision) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const result = await api(path);
      setData(result);
      setError("");
    } catch (error) {
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
    <form className="live-form org-assignment" onSubmit={submit}>
      <h3>Giao lộ trình</h3>
      <LoadState resource={resource} />
      {resource.data && (
        <>
          <label>
            Người học
            <select required name="user_id" defaultValue="">
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
          <label>
            Lý do giao
            <textarea
              name="reason"
              required
              maxLength={2000}
              placeholder="Năng lực cần phát triển và mục tiêu mong đợi"
            />
          </label>
          <label>
            Hạn hoàn thành
            <input name="due_date" required type="date" />
          </label>
          {!resource.data.users.some((user) => user.active) && (
            <p className="muted">
              Chưa có người học trong phạm vi quản lý. Quản trị viên cần cập
              nhật đội nhóm hoặc quản lý trực tiếp.
            </p>
          )}
          <div className="org-actions">
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
      <div className="between live-page-heading">
        <div>
          <span className="live-eyebrow">TỪNG BƯỚC TRƯỞNG THÀNH</span>
          <h1>Lộ trình học tập</h1>
          <p className="muted">
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
        <form className="live-panel live-form live-editor" onSubmit={create}>
          <h2>Lộ trình mới</h2>
          <label>
            Tên lộ trình
            <input name="title" required maxLength={180} />
          </label>
          <label>
            Mô tả
            <textarea name="description" maxLength={5000} />
          </label>
          <fieldset className="org-course-picker">
            <legend>Khóa học theo thứ tự hiển thị</legend>
            {courses.length ? (
              courses.map((course) => (
                <label key={course.id}>
                  <input type="checkbox" name="course_ids" value={course.id} />
                  <span>
                    {course.title}{" "}
                    <small className="muted">
                      · {statusLabels[course.status]}
                    </small>
                  </span>
                </label>
              ))
            ) : (
              <p>Hãy tạo khóa học trước khi xây dựng lộ trình.</p>
            )}
          </fieldset>
          <p className="muted">
            Lộ trình được tạo ở dạng bản nháp. Các khóa học phải được phát hành
            trước khi mở đăng ký.
          </p>
          <Button type="submit" disabled={busy || !courses.length}>
            Lưu bản nháp
          </Button>
        </form>
      )}
      <div className="live-filters">
        <label className="live-search">
          <Icon name="Search" size={18} />
          <input
            aria-label="Tìm lộ trình"
            placeholder="Tìm lộ trình học tập…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="muted">{paths.length} lộ trình</span>
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
      <div className="org-path-grid">
        {paths.map((path, index) => (
          <article className="live-panel org-path" key={path.id}>
            <div className="org-path-top">
              <span className={`org-path-icon org-tone-${index % 3}`}>
                <Icon name="Workflow" size={28} />
              </span>
              <Badge>{statusLabels[path.status]}</Badge>
            </div>
            <div>
              <h2>{path.title}</h2>
              <p className="muted org-description">
                {path.description || "Hành trình học tập và thực hành."}
              </p>
              <small className="muted">
                {path.owner_name} · {path.courses.length} khóa học
              </small>
            </div>
            <ol className="org-steps">
              {path.courses.map((course) => (
                <li key={course.id}>
                  <button
                    className="text-btn"
                    onClick={() => go(`course/${course.id}`)}
                  >
                    {course.title}
                  </button>
                  {course.status !== "published" && (
                    <small className="muted">
                      {statusLabels[course.status]}
                    </small>
                  )}
                </li>
              ))}
            </ol>
            {path.enrollment && (
              <div className="org-path-progress">
                <div className="between">
                  <strong>{progressLabels[path.learning_status]}</strong>
                  <span>
                    {path.completed_courses}/{path.total_courses} khóa đạt
                  </span>
                </div>
                <progress
                  value={path.progress}
                  max="100"
                  aria-label="Tiến độ lộ trình"
                />
                <small className="muted">
                  Hoàn thành bài học và đạt bài thực hành để hoàn thành khóa.
                </small>
                {path.enrollment.due_date && (
                  <p>
                    Hạn hoàn thành:{" "}
                    <strong>{date(path.enrollment.due_date)}</strong>
                  </p>
                )}
                {path.enrollment.reason && (
                  <p className="org-reason">{path.enrollment.reason}</p>
                )}
              </div>
            )}
            <div className="org-actions">
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
      <div className="live-page-heading">
        <span className="live-eyebrow">CÙNG NHAU PHÁT TRIỂN</span>
        <h1>Đội ngũ của bạn</h1>
        <p className="muted">
          Theo dõi việc học và bằng chứng năng lực của từng thành viên.
        </p>
        {resource.data && <Badge>{resource.data.scope}</Badge>}
      </div>
      <div className="live-filters">
        <label className="live-search">
          <Icon name="Search" size={18} />
          <input
            aria-label="Tìm thành viên"
            placeholder="Tìm tên, đội nhóm, vị trí…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="muted">{users.length} thành viên</span>
      </div>
      <LoadState resource={resource} />
      {resource.data && !users.length && (
        <Empty
          title="Chưa có thành viên phù hợp"
          description="Thành viên hiển thị theo đội nhóm, quản lý trực tiếp hoặc danh sách khóa học bạn phụ trách."
        />
      )}
      {!!users.length && (
        <div className="live-panel live-table-wrap">
          <table className="live-table">
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Đội nhóm · Vị trí</th>
                <th>Khóa đã đạt</th>
                <th>Bằng chứng</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <small className="org-table-sub">{user.email}</small>
                    {!user.active && <Badge>Đã khóa</Badge>}
                  </td>
                  <td>
                    {user.team || "Chưa phân đội"}
                    <small className="org-table-sub">
                      {user.job || "Chưa cập nhật vị trí"}
                    </small>
                  </td>
                  <td>
                    {user.completed_courses}/{user.enrolled_courses}
                  </td>
                  <td>{user.evidence.length}</td>
                  <td>
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
        <section className="live-panel org-member">
          <div className="between">
            <div>
              <span className="live-eyebrow">HỒ SƠ HỌC TẬP</span>
              <h2>{member.name}</h2>
            </div>
            <Button kind="ghost" icon="X" onClick={() => setSelected(null)}>
              Đóng
            </Button>
          </div>
          <h3>Khóa học</h3>
          {!member.courses.length && (
            <p className="muted">Chưa đăng ký khóa học.</p>
          )}
          {member.courses.map((course) => (
            <div className="org-course-row" key={course.course_id}>
              <div>
                <strong>{course.course_title}</strong>
                <small className="org-table-sub">
                  {course.completed_lessons}/{course.lessons} bài học · Bài thực
                  hành: {statusLabels[course.assignment_status]}
                </small>
              </div>
              <Badge color={course.status === "completed" ? "green" : "purple"}>
                {progressLabels[course.status]}
              </Badge>
            </div>
          ))}
          <h3>Bằng chứng năng lực</h3>
          {!member.evidence.length && (
            <p className="muted">
              Chưa có bằng chứng được giảng viên xác nhận.
            </p>
          )}
          {member.evidence.map((evidence, index) => (
            <div
              className="org-course-row"
              key={`${evidence.course_id}-${index}`}
            >
              <div>
                <strong>{evidence.skill}</strong>
                <small className="org-table-sub">
                  {evidence.course_title} · Xác nhận bởi{" "}
                  {evidence.reviewer_name}
                </small>
              </div>
              <Badge color="green">Mức {evidence.level}/4</Badge>
            </div>
          ))}
          {!!member.paths.length && (
            <>
              <h3>Lộ trình được đăng ký</h3>
              {member.paths.map((path) => (
                <div className="org-course-row" key={path.id}>
                  <div>
                    <strong>{path.title}</strong>
                    <small className="org-table-sub">
                      {path.completed_courses}/{path.total_courses} khóa đạt ·
                      Hạn: {date(path.due_date)}
                    </small>
                    {path.reason && <p className="muted">{path.reason}</p>}
                  </div>
                  <Badge>{progressLabels[path.status]}</Badge>
                </div>
              ))}
            </>
          )}
          {["admin", "manager"].includes(state.user.role) && (
            <Button kind="secondary" onClick={() => go("paths")}>
              Giao lộ trình học tập
            </Button>
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
    } catch (error) {
      setError(error.message);
    } finally {
      setExporting(false);
    }
  }
  const report = resource.data;
  return (
    <>
      <div className="between live-page-heading">
        <div>
          <span className="live-eyebrow">NHÌN THẤY SỰ TIẾN BỘ</span>
          <h1>Báo cáo đào tạo</h1>
          <p className="muted">
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
        <div className="live-error" role="alert">
          {error}
        </div>
      )}
      {report && (
        <>
          <div className="org-report-scope">
            <Badge>{report.scope}</Badge>
            <span className="muted">
              Dữ liệu hiện tại trong phạm vi của bạn
            </span>
          </div>
          <div className="live-stats">
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
              <div className="live-stat" key={label}>
                <Icon name={icon} />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="muted org-report-note">
            Một khóa được tính hoàn thành khi người học hoàn tất tất cả bài học
            và đạt bài thực hành. Một người có thể đăng ký nhiều khóa.
          </p>
          <h2>Kết quả theo khóa học</h2>
          {!report.courses.length ? (
            <Empty
              title="Chưa có dữ liệu khóa học"
              description="Báo cáo sẽ cập nhật khi có khóa học và người đăng ký."
            />
          ) : (
            <div className="live-panel live-table-wrap">
              <table className="live-table">
                <thead>
                  <tr>
                    <th>Khóa học</th>
                    <th>Đăng ký</th>
                    <th>Chưa bắt đầu</th>
                    <th>Đang học</th>
                    <th>Hoàn thành</th>
                    <th>Tỷ lệ hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {report.courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <strong>{course.title}</strong>
                      </td>
                      <td>{course.enrolled}</td>
                      <td>{course.not_started}</td>
                      <td>{course.in_progress}</td>
                      <td>{course.completed}</td>
                      <td>
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
          <h2 className="org-section-title">Kết quả theo người học</h2>
          {!report.users.length ? (
            <p className="muted">Chưa có người học trong phạm vi báo cáo.</p>
          ) : (
            <div className="live-panel live-table-wrap">
              <table className="live-table">
                <thead>
                  <tr>
                    <th>Người học</th>
                    <th>Đội nhóm</th>
                    <th>Khóa đăng ký</th>
                    <th>Khóa hoàn thành</th>
                    <th>Bằng chứng</th>
                  </tr>
                </thead>
                <tbody>
                  {report.users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.team || "—"}</td>
                      <td>{user.enrolled_courses}</td>
                      <td>{user.completed_courses}</td>
                      <td>{user.evidence.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {state.user.role !== "instructor" && (
            <>
              <h2 className="org-section-title">Kết quả theo lộ trình</h2>
              {!report.paths.length ? (
                <p className="muted">
                  Chưa có lượt đăng ký lộ trình trong phạm vi báo cáo.
                </p>
              ) : (
                <div className="live-panel live-table-wrap">
                  <table className="live-table">
                    <thead>
                      <tr>
                        <th>Lộ trình</th>
                        <th>Đã đăng ký</th>
                        <th>Hoàn thành</th>
                        <th>Quá hạn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.paths.map((path) => (
                        <tr key={path.id}>
                          <td>{path.title}</td>
                          <td>{path.enrolled}</td>
                          <td>{path.completed}</td>
                          <td>{path.overdue}</td>
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
