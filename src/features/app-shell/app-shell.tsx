import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge, Button, Empty, Icon } from "@/components/ui";
import { api, roleLabels } from "@/lib/api-client";
import { ServiceIntegrations as Assistant } from "../admin/components/service-integrations";
import { UserManagement as Admin } from "../admin/components/user-management";
import {
  Assignments,
  Evidence,
} from "../assessment/components/assessment-center";
import { LoginForm } from "../auth/components/login-form";
import { ClassLinks } from "../cohorts/components/class-links";
import { Cohorts } from "../cohorts/components/cohort-management";
import {
  Catalog,
  CoursePage,
  Studio,
} from "../courses/components/course-management";
import {
  Paths,
  Reports,
  Team,
} from "../organization/components/organization-hub";
import {
  PasswordRecovery,
  Settings,
} from "../settings/components/account-settings";
import {
  Calendar,
  Community,
  Notifications,
} from "../social/components/social-community";

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
                onClick={() => go(`course/${course.id}`)}
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
  const [session, setSession] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [route, setRoute] = useState(
    () =>
      (typeof location !== "undefined" ? location.hash.slice(1) : "") || "home",
  );
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
    } catch (error: any) {
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
      } catch (error: any) {
        setError(
          "Đã lưu trên máy chủ, nhưng chưa tải được dữ liệu mới. Hãy nhấn Tải lại dữ liệu.",
        );
        if (error.status === 401) setReauth(true);
      }
      return result;
    } catch (error: any) {
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
    } catch (error: any) {
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
    document.title = `${nav.find((n) => n[0] === active)?.[2] || "Khóa học"} · MatureX LMS`;
  }, [active, nav.find]);
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
    return <LoginForm setup={session.setupRequired} onLogin={boot} />;
  if (!state)
    return (
      <div className="live-loading">
        <p role="alert">{error || "Đang tải dữ liệu…"}</p>
        <Button onClick={boot}>Tải lại</Button>
      </div>
    );
  const props = { state, go, mutate, busy, refresh: reload };
  let page: any = null;
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
        className="live-app min-h-screen bg-[#f7f8fb]"
        key={state.user.id}
        style={reauth ? { display: "none" } : undefined}
      >
        <Sidebar
          nav={nav}
          active={active}
          user={state.user}
          unreadNotifications={state.unreadNotifications}
          busy={busy}
          onGo={go}
          onLogout={logout}
        />
        <div className="live-main ml-64 max-xl:ml-[230px] max-md:ml-0 min-h-screen max-md:min-h-[calc(100vh-130px)] flex flex-col">
          <Header
            currentTitle={
              nav.find((n) => n[0] === active)?.[2] || "Chi tiết khóa học"
            }
            busy={busy}
            onRefresh={async () => {
              try {
                await reload();
                setError("");
              } catch (e: any) {
                setError(e.message);
                if (e.status === 401) setReauth(true);
              }
            }}
          />
          <main className="live-content w-full p-[34px_38px_50px] max-xl:p-7 max-md:p-[22px_16px_35px] flex-1">
            {error && (
              <div
                className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8]"
                role="alert"
              >
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
          <footer className="live-footer text-[#9293a0] text-[10px] py-[22px] px-[38px] max-md:p-[20px_16px] border-t border-[var(--border,#e9eaf0)]">
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
        <LoginForm
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
