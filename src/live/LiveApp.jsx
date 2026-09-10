import React, { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Empty, Icon } from "../ui.jsx";
import { Admin } from "./Admin.jsx";
import { Assignments, Evidence } from "./Assessment.jsx";
import { api, roleLabels } from "./api.js";
import { ClassLinks } from "./ClassLinks.jsx";
import { Cohorts } from "./Cohorts.jsx";
import { Catalog, CoursePage, Studio } from "./Courses.jsx";
import { Assistant } from "./Integrations.jsx";
import { Paths, Reports, Team } from "./Organization.jsx";
import { PasswordRecovery, Settings } from "./Settings.jsx";
import { Calendar, Community, Notifications } from "./Social.jsx";
import "./live.css";

function Login({ setup, onLogin, resumeUser }) {
  const [provider, setProvider] = useState(null);
  useEffect(() => {
    api("/auth/providers")
      .then((d) => setProvider(d.oidc))
      .catch(() => {});
  }, []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api(setup ? "/setup" : "/login", "POST", values);
      if (resumeUser && result.user.id !== resumeUser.id) {
        await api("/logout", "POST", {});
        throw new Error(
          "Hãy đăng nhập đúng tài khoản " +
            resumeUser.email +
            " để tiếp tục bản nháp.",
        );
      }
      await onLogin();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="live-login">
      <div className="live-welcome">
        <a className="live-wordmark" href="/">
          mature<span>×</span>
        </a>
        <Badge>LEARNING SPACE</Badge>
        <h1>
          Học hỏi mỗi ngày.
          <br />
          Trưởng thành cùng nhau.
        </h1>
        <p>
          Một không gian để học, thực hành và nhìn thấy sự tiến bộ của chính
          mình.
        </p>
        <div className="live-welcome-note">
          <Icon name="Sprout" size={32} />
          <span>
            Từ kiến thức đến hành động.
            <br />
            Từ trải nghiệm đến năng lực.
          </span>
        </div>
      </div>
      <div className="live-login-panel">
        <form className="live-form" onSubmit={submit}>
          <span className="live-eyebrow">MATUREX LMS</span>
          <h2>
            {setup ? "Khởi tạo không gian học tập" : "Chào mừng bạn trở lại"}
          </h2>
          <p className="muted">
            {resumeUser
              ? "Phiên đã hết hạn. Đăng nhập lại đúng tài khoản để tiếp tục; bản nháp vẫn được giữ trong trang này."
              : setup
                ? "Tạo tài khoản quản trị đầu tiên để bắt đầu tổ chức đào tạo."
                : "Đăng nhập bằng tài khoản được quản trị viên cấp."}
          </p>
          {setup && (
            <label>
              Họ và tên
              <input name="name" required maxLength={100} autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              defaultValue={resumeUser?.email || ""}
              type="email"
              required
              autoComplete="username"
              maxLength={254}
            />
          </label>
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              required
              minLength={setup ? 12 : undefined}
              maxLength={128}
              autoComplete={setup ? "new-password" : "current-password"}
            />
          </label>
          {setup && (
            <small className="muted">Dùng mật khẩu từ 12 đến 128 ký tự.</small>
          )}
          {error && (
            <div className="live-error" role="alert">
              {error}
            </div>
          )}
          <Button disabled={busy} type="submit" icon="ArrowRight">
            {busy
              ? "Đang xử lý…"
              : setup
                ? "Tạo không gian học tập"
                : "Đăng nhập"}
          </Button>
          <a className="live-demo-link" href="/demo.html">
            Xem bản demo giao diện <Icon name="ArrowUpRight" size={14} />
          </a>
          {!setup && !resumeUser && (
            <>
              <a className="live-demo-link" href="#forgot">
                Quên mật khẩu?
              </a>
              {provider?.configured && (
                <a className="btn secondary" href={provider.startUrl}>
                  Đăng nhập với {provider.label}
                </a>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function Dashboard({ state, go }) {
  const mine = state.assignments.filter((a) => a.user_id === state.user.id);
  const enrolled = state.courses.filter((c) =>
    state.enrollments.some((e) => e.course_id === c.id),
  );
  return (
    <>
      <div className="live-hero">
        <div>
          <span className="live-eyebrow">HÀNH TRÌNH CỦA BẠN</span>
          <h1>
            Chào {state.user.name} <span className="live-wave">✦</span>
          </h1>
          <p>
            Mỗi bài học là một bước tiến.
            <br />
            Tiếp tục từ nơi bạn đang đứng.
          </p>
          <Button onClick={() => go("catalog")} icon="ArrowRight">
            Khám phá khóa học
          </Button>
        </div>
        <div className="live-hero-art" aria-hidden="true">
          <Icon name="Sprout" size={100} />
        </div>
      </div>
      <div className="live-stats">
        {[
          ["BookOpen", state.enrollments.length, "Khóa đã đăng ký"],
          ["CheckCircle2", state.progress.length, "Bài học hoàn thành"],
          [
            "ClipboardCheck",
            mine.filter((a) => ["todo", "revision"].includes(a.status)).length,
            "Bài thực hành cần làm",
          ],
          ["Target", state.evidence.length, "Bằng chứng năng lực"],
        ].map(([icon, count, label]) => (
          <div className="live-stat" key={label}>
            <Icon name={icon} />
            <strong>{count}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <ClassLinks state={state} go={go} />
      <div className="between live-section-heading">
        <h2>Tiếp tục học</h2>
        <button className="text-btn" onClick={() => go("catalog")}>
          Xem thư viện →
        </button>
      </div>
      {enrolled.length ? (
        <div className="live-course-grid">
          {enrolled.map((course) => {
            const count = course.lessons.filter((l) =>
              state.progress.some((p) => p.lesson_id === l.id),
            ).length;
            return (
              <button
                className="live-panel live-resume"
                key={course.id}
                onClick={() => go("course/" + course.id)}
              >
                <Badge>{course.category}</Badge>
                <h3>{course.title}</h3>
                <progress value={count} max={course.lessons.length} />
                <small>
                  {count}/{course.lessons.length} bài học{" "}
                  <Icon name="ArrowRight" size={15} />
                </small>
              </button>
            );
          })}
        </div>
      ) : (
        <Empty
          title="Hành trình mới bắt đầu"
          description="Chọn một khóa trong thư viện để bắt đầu học và thực hành."
        />
      )}
      {["admin", "instructor"].includes(state.user.role) && (
        <div className="live-panel live-next">
          <Icon name="GraduationCap" size={30} />
          <div>
            <h3>Chia sẻ kiến thức với đội ngũ</h3>
            <p className="muted">
              Tạo khóa học, chuẩn bị bài thực hành và phản hồi cho người học.
            </p>
          </div>
          <Button kind="secondary" onClick={() => go("studio")}>
            Quản lý đào tạo
          </Button>
        </div>
      )}
    </>
  );
}

export default function LiveApp() {
  const [session, setSession] = useState(null);
  const [state, setState] = useState(null);
  const [route, setRoute] = useState(() => location.hash.slice(1) || "home");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reauth, setReauth] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const reload = useCallback(async () => {
    const data = await api("/state");
    setState(data);
  }, []);
  const boot = useCallback(async () => {
    setError("");
    try {
      const current = await api("/session");
      setSession(current);
      if (current.user) await reload();
      else setState(null);
      setSession(current);
    } catch (error) {
      setError(error.message);
    }
  }, [reload]);
  useEffect(() => {
    boot();
  }, [boot]);
  useEffect(() => {
    const expired = () => {
      if (state?.user) setReauth(true);
    };
    window.addEventListener("lms:unauthorized", expired);
    return () => window.removeEventListener("lms:unauthorized", expired);
  }, [state?.user]);
  useEffect(() => {
    const change = () => setRoute(location.hash.slice(1) || "home");
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  function go(value) {
    location.hash = value;
    setRoute(value);
    setError("");
    window.scrollTo(0, 0);
  }
  async function mutate(path, method, body, success) {
    if (busyRef.current) return null;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api(path, method, body);
      setNotice(success);
      try {
        await reload();
      } catch (error) {
        setError(
          "Đã lưu trên máy chủ, nhưng chưa tải được dữ liệu mới. Hãy nhấn Tải lại dữ liệu.",
        );
        if (error.status === 401) setReauth(true);
      }
      return result;
    } catch (error) {
      setError(error.message);
      if (error.status === 401) {
        setReauth(true);
      }
      return null;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await api("/logout", "POST", {});
      setState(null);
      setSession({ user: null, setupRequired: false });
      setError("");
      setNotice("");
      go("home");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  const nav = [
    ["home", "Home", "Tổng quan"],
    ["catalog", "BookOpen", "Thư viện học tập"],
    ["cohorts", "GraduationCap", "Lớp học"],
    ["assignments", "ClipboardCheck", "Bài tập & phản hồi"],
    ["skills", "Target", "Hồ sơ năng lực"],
    ["paths", "Compass", "Lộ trình học"],
    ["calendar", "CalendarDays", "Lịch đào tạo"],
    ["community", "MessageCircle", "Cộng đồng học tập"],
    ["assistant", "Sparkles", "Trợ lý học tập AI"],
    ["notifications", "Bell", "Thông báo"],
    ...(["admin", "instructor"].includes(state?.user.role)
      ? [
          ["studio", "FolderOpen", "Quản lý đào tạo"],
          ["reviews", "CheckSquare", "Đánh giá bài tập"],
        ]
      : []),
    ...(state?.user.role === "admin" ? [["users", "Users", "Tài khoản"]] : []),
    ...(["admin", "instructor", "manager"].includes(state?.user.role)
      ? [
          ["team", "Users", "Đội ngũ"],
          ["reports", "ChartNoAxesCombined", "Báo cáo đào tạo"],
        ]
      : []),
    ["settings", "Settings", "Cài đặt"],
  ];
  const active = route.split("/")[0];
  useEffect(() => {
    document.title =
      (nav.find((n) => n[0] === active)?.[2] || "Khóa học") + " · MatureX LMS";
  }, [active, state?.user.role]);
  if (active === "forgot" || active === "reset")
    return (
      <PasswordRecovery
        token={active === "reset" ? route.split("/")[1] : null}
        onDone={() => {
          go("home");
          boot();
        }}
      />
    );
  if (!session)
    return (
      <div className="live-loading">
        {error ? (
          <>
            <p role="alert">{error}</p>
            <Button onClick={boot}>Thử lại</Button>
          </>
        ) : (
          <p role="status">Đang kết nối không gian học tập…</p>
        )}
      </div>
    );
  if (!session.user)
    return <Login setup={session.setupRequired} onLogin={boot} />;
  if (!state)
    return (
      <div className="live-loading">
        <p role="alert">{error || "Đang tải dữ liệu…"}</p>
        <Button onClick={boot}>Tải lại</Button>
      </div>
    );
  const props = { state, go, mutate, busy, refresh: reload };
  let page;
  switch (active) {
    case "home":
      page = <Dashboard {...props} />;
      break;
    case "catalog":
      page = <Catalog {...props} />;
      break;
    case "course":
      page = <CoursePage key={route} id={route.split("/")[1]} {...props} />;
      break;
    case "assignments":
      page = (
        <>
          <Assignments key="mine" {...props} />
          <ClassLinks {...props} context="assignments" />
        </>
      );
      break;
    case "skills":
      page = <Evidence state={state} />;
      break;
    case "studio":
      page = ["admin", "instructor"].includes(state.user.role) && (
        <Studio {...props} />
      );
      break;
    case "reviews":
      page = ["admin", "instructor"].includes(state.user.role) && (
        <>
          <Assignments key="review" review {...props} />
          <ClassLinks {...props} context="assignments" />
        </>
      );
      break;
    case "users":
      page = state.user.role === "admin" && <Admin {...props} />;
      break;
    case "paths":
      page = <Paths {...props} />;
      break;
    case "calendar":
      page = (
        <>
          <Calendar {...props} />
          <ClassLinks {...props} context="calendar" />
        </>
      );
      break;
    case "cohorts":
      page = <Cohorts key={route} id={route.split("/")[1]} {...props} />;
      break;
    case "community":
      page = <Community {...props} />;
      break;
    case "assistant":
      page = <Assistant {...props} />;
      break;
    case "notifications":
      page = <Notifications {...props} />;
      break;
    case "team":
      page = ["admin", "instructor", "manager"].includes(state.user.role) && (
        <>
          <Team {...props} />
          <ClassLinks {...props} context="reports" />
        </>
      );
      break;
    case "reports":
      page = ["admin", "instructor", "manager"].includes(state.user.role) && (
        <>
          <Reports {...props} />
          <ClassLinks {...props} context="reports" />
        </>
      );
      break;
    case "settings":
      page = <Settings {...props} />;
      break;
    default:
      page = null;
  }
  return (
    <>
      <div
        className="live-app"
        key={state.user.id}
        style={reauth ? { display: "none" } : undefined}
      >
        <aside className="live-sidebar">
          <a className="live-wordmark" href="#home">
            mature<span>×</span>
            <small>LEARNING SPACE</small>
          </a>
          <div className="live-workspace">
            <Icon name="Building2" />
            <div>
              <strong>Không gian MatureX</strong>
              <small>Học hỏi. Thực hành. Trưởng thành.</small>
            </div>
          </div>
          <nav aria-label="Điều hướng chính">
            {nav.map(([key, icon, title]) => (
              <button
                key={key}
                aria-label={title}
                className={"nav-item " + (active === key ? "active" : "")}
                onClick={() => go(key)}
                aria-current={active === key ? "page" : undefined}
              >
                <Icon name={icon} size={19} />
                <span>{title}</span>
                {key === "notifications" && state.unreadNotifications > 0 && (
                  <span className="nav-count">{state.unreadNotifications}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="live-profile">
            <span className="live-avatar">
              {state.user.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{state.user.name}</strong>
              <small>{roleLabels[state.user.role]}</small>
            </div>
            <button
              className="icon-btn"
              aria-label="Đăng xuất"
              title="Đăng xuất"
              onClick={logout}
              disabled={busy}
            >
              <Icon name="LogOut" size={18} />
            </button>
          </div>
        </aside>
        <div className="live-main">
          <header className="live-topbar">
            <span>
              Không gian học tập <Icon name="ChevronRight" size={14} />{" "}
              <strong>
                {nav.find((n) => n[0] === active)?.[2] || "Chi tiết khóa học"}
              </strong>
            </span>
            <Button
              kind="ghost"
              icon="RotateCcw"
              disabled={busy}
              onClick={async () => {
                try {
                  await reload();
                  setError("");
                } catch (e) {
                  setError(e.message);
                  if (e.status === 401) setReauth(true);
                }
              }}
            >
              Tải lại dữ liệu
            </Button>
          </header>
          <main className="live-content">
            {error && (
              <div className="live-error" role="alert">
                {error}
              </div>
            )}
            {page || (
              <Empty
                title="Trang không khả dụng"
                description="Tài khoản của bạn không có quyền truy cập trang này."
              />
            )}
          </main>
          <footer className="live-footer">
            MatureX Learning · Phát triển từ bên trong
          </footer>
        </div>
        {notice && (
          <div className="toast" role="status">
            <Icon name="CheckCircle2" size={19} />
            <span>{notice}</span>
          </div>
        )}
      </div>
      {reauth && (
        <Login
          resumeUser={state.user}
          setup={false}
          onLogin={async () => {
            const data = await api("/state");
            if (data.user.id !== state.user.id)
              throw new Error(
                "Tài khoản đã thay đổi. Hãy đăng nhập lại tài khoản đang soạn bài.",
              );
            setState(data);
            setReauth(false);
            setError("");
            setNotice("Đã đăng nhập lại. Bạn có thể tiếp tục và gửi bản nháp.");
          }}
        />
      )}
    </>
  );
}
