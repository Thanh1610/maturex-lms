import React, { useCallback, useEffect, useReducer, useState } from "react";
import { initialState, normalize, paths, people } from "./data.js";
import {
  Assignments,
  Assistant,
  Calendar,
  Catalog,
  Course,
  Dashboard,
  Paths,
} from "./Learning.jsx";
import {
  Community,
  Reports,
  Reviews,
  SettingsPage,
  Skills,
  Studio,
  Team,
} from "./Management.jsx";
import { STORAGE_KEY, transition } from "./store.js";
import {
  AppContext,
  Avatar,
  Badge,
  Button,
  Empty,
  Icon,
  Modal,
  useApp,
} from "./ui.jsx";

const baseNav = [
  ["home", "Home", "Tổng quan"],
  ["catalog", "BookOpen", "Thư viện học tập"],
  ["paths", "Compass", "Lộ trình của tôi"],
  ["assignments", "ClipboardCheck", "Bài tập & phản hồi"],
  ["skills", "Target", "Hồ sơ năng lực"],
  ["calendar", "CalendarDays", "Lịch đào tạo"],
  ["community", "MessageCircle", "Cộng đồng học tập"],
];
const managerNav = [
  ["team", "Users", "Đội ngũ"],
  ["reviews", "CheckSquare", "Đánh giá bài tập"],
  ["studio", "FolderOpen", "Quản lý đào tạo"],
  ["reports", "ChartNoAxesCombined", "Báo cáo & hiệu quả"],
];
const roles = {
  learner: "Người học",
  instructor: "Giảng viên",
  manager: "Quản lý",
};
const titles = Object.fromEntries(
  [
    ...baseNav,
    ...managerNav,
    ["assistant", "", "Trợ lý AI"],
    ["settings", "", "Cài đặt"],
  ].map((x) => [x[0], x[2]]),
);
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      raw?.version === 1 &&
      Array.isArray(raw.courses) &&
      Array.isArray(raw.assignments)
    )
      return raw;
  } catch {}
  return initialState();
}
function DemoGuide() {
  const { go, close, setRole } = useApp();
  return (
    <div className="guide">
      <div className="callout lavender">
        <Icon name="Sparkles" />
        <p>
          Đây là không gian thử nghiệm. Tên nhân sự, bài giảng, kết quả và hoạt
          động đều là dữ liệu mẫu.
        </p>
      </div>
      <h3>Một vòng trải nghiệm trọn vẹn</h3>
      {[
        [
          "Người học",
          "Mở khóa AI, thử bài học và nộp bài thực hành.",
          "assignments",
          "learner",
        ],
        [
          "Giảng viên",
          "Mở hàng chờ, xem bài vừa nộp và gửi đánh giá.",
          "reviews",
          "instructor",
        ],
        [
          "Quản lý",
          "Xem hồ sơ năng lực, giao lộ trình và theo dõi đội ngũ.",
          "team",
          "manager",
        ],
        [
          "Biên tập nội dung",
          "Tạo khóa học từ record mô phỏng và phát hành vào thư viện.",
          "studio",
          "instructor",
        ],
      ].map((x, i) => (
        <button
          className="guide-step"
          key={x[0]}
          onClick={() => {
            setRole(x[3]);
            go(x[2]);
            close();
          }}
        >
          <span>{i + 1}</span>
          <div>
            <strong>{x[0]}</strong>
            <p>{x[1]}</p>
          </div>
          <Icon name="ArrowRight" />
        </button>
      ))}
      <p className="muted tiny">
        Thay đổi chỉ lưu trên trình duyệt này. Có thể đặt lại tại Cài đặt. AI
        dùng kịch bản có sẵn; record là bản trình chiếu minh họa; không gửi dữ
        liệu hay thông báo ra bên ngoài.
      </p>
    </div>
  );
}
function GlobalSearch() {
  const { state, go, close, role } = useApp();
  const [q, setQ] = useState("");
  const n = normalize(q);
  const results = [
    ...state.courses
      .filter((c) => c.status === "published")
      .map((c) => ({
        name: c.title,
        sub: c.category,
        route: "course/" + c.id,
        icon: c.icon,
      })),
    ...[...paths, ...(state.customPaths || [])].map((p) => ({
      name: p.title,
      sub: "Lộ trình học",
      route: "paths",
      icon: "Compass",
    })),
    ...(role === "manager"
      ? people.map((p) => ({
          name: p.name,
          sub: p.job + " · " + p.team,
          route: "team",
          icon: "Users",
        }))
      : []),
  ].filter((x) => normalize(x.name + " " + x.sub).includes(n));
  return (
    <>
      <div className="search-input large">
        <Icon name="Search" />
        <input
          autoFocus
          placeholder="Tìm khóa học, năng lực, chủ đề…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <p className="muted tiny">
        {q ? `${results.length} kết quả` : "Khám phá nhanh"}
      </p>
      <div className="search-results">
        {results.length ? (
          results.map((r) => (
            <button
              key={r.route + r.name}
              onClick={() => {
                go(r.route);
                close();
              }}
            >
              <span className="icon-tile lavender">
                <Icon name={r.icon} />
              </span>
              <div>
                <strong>{r.name}</strong>
                <small>{r.sub}</small>
              </div>
              <Icon name="ArrowUpRight" size={18} />
            </button>
          ))
        ) : (
          <Empty
            title="Chưa tìm thấy kết quả"
            description="Thử từ khóa khác như AI, văn hoá hoặc nghiên cứu."
          />
        )}
      </div>
    </>
  );
}
function NotificationList() {
  const { state, dispatch, go, close } = useApp();
  return (
    <>
      <div className="between">
        <span className="muted small">Thông báo trong demo</span>
        <button
          className="text-btn"
          onClick={() => dispatch({ type: "readNotifications" })}
        >
          Đánh dấu đã đọc
        </button>
      </div>
      <div className="notification-list">
        {state.notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              dispatch({ type: "readNotifications" });
              go(n.route);
              close();
            }}
          >
            <span className={`notice-dot ${n.read ? "read" : ""}`} />
            <div>
              <strong>{n.text}</strong>
              <small>{n.read ? "Đã đọc" : "Mới"} · Dữ liệu demo</small>
            </div>
            <Icon name="ChevronRight" size={17} />
          </button>
        ))}
      </div>
    </>
  );
}
export default function App() {
  const [state, dispatch] = useReducer(transition, undefined, load);
  const [route, setRoute] = useState(() => location.hash.slice(1) || "home");
  const [role, setRole] = useState(() => {
    try {
      const saved = sessionStorage.getItem("mx-demo-role");
      return roles[saved] ? saved : "learner";
    } catch {
      return "learner";
    }
  });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [mobile, setMobile] = useState(false);
  const [narrow, setNarrow] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const [persistError, setPersistError] = useState(false);
  const close = useCallback(() => setModal(null), []);
  const open = useCallback(
    (title, body, wide = false) => setModal({ title, body, wide }),
    [],
  );
  const notify = useCallback((msg) => setToast(msg), []);
  const go = useCallback((path) => {
    location.hash = path;
    setRoute(path);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const update = () => setNarrow(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("mx-demo-role", role);
    } catch {}
  }, [role]);
  useEffect(() => {
    const fn = () => {
      setRoute(location.hash.slice(1) || "home");
      setMobile(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setPersistError(false);
    } catch {
      setPersistError(true);
    }
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const active = route.split("/")[0];
  useEffect(() => {
    document.title = (titles[active] || "Bài học") + " · MatureX Learning";
  }, [active]);
  const selectRole = (value) => {
    setRole(value);
    if (value === "learner" && managerNav.some((n) => n[0] === active))
      go("home");
  };
  const props = {
    state,
    dispatch,
    go,
    role,
    setRole: selectRole,
    open,
    close,
    notify,
  };
  const restricted =
    managerNav.some((n) => n[0] === active) && role === "learner";
  let page;
  if (restricted)
    page = (
      <Empty
        title="Không gian dành cho giảng viên & quản lý"
        description="Chuyển vai trải nghiệm ở góc trên để khám phá tính năng này."
      >
        <Button
          onClick={() => {
            setRole("instructor");
          }}
        >
          Trải nghiệm vai giảng viên
        </Button>
      </Empty>
    );
  else
    switch (active) {
      case "catalog":
        page = <Catalog />;
        break;
      case "course":
        page = <Course key={route} id={route.split("/")[1]} />;
        break;
      case "paths":
        page = <Paths />;
        break;
      case "assignments":
        page = <Assignments />;
        break;
      case "calendar":
        page = <Calendar />;
        break;
      case "assistant":
        page = <Assistant />;
        break;
      case "skills":
        page = <Skills />;
        break;
      case "team":
        page = <Team />;
        break;
      case "studio":
        page = <Studio />;
        break;
      case "reviews":
        page = <Reviews />;
        break;
      case "reports":
        page = <Reports />;
        break;
      case "community":
        page = <Community />;
        break;
      case "settings":
        page = <SettingsPage />;
        break;
      case "home":
        page = <Dashboard />;
        break;
      default:
        page = (
          <Empty title="Trang không tồn tại">
            <Button onClick={() => go("home")}>Về tổng quan</Button>
          </Empty>
        );
    }
  return (
    <AppContext.Provider value={props}>
      <div className="app-shell">
        {mobile && (
          <div className="sidebar-scrim" onClick={() => setMobile(false)} />
        )}
        <aside
          className={`sidebar ${mobile ? "show" : ""}`}
          inert={narrow && !mobile}
        >
          <button className="brand" onClick={() => go("home")}>
            <span className="brand-symbol">
              m<span>×</span>
            </span>
            <span className="brand-type">
              mature<span>x</span>
              <small>LEARNING SPACE</small>
            </span>
          </button>
          <div className="workspace">
            <span className="workspace-symbol">
              <Icon name="Building2" size={17} />
            </span>
            <div>
              <strong>Không gian MatureX</strong>
              <small>Học hỏi. Thực hành. Trưởng thành.</small>
            </div>
          </div>
          <nav>
            <div className="nav-label">KHÔNG GIAN CỦA BẠN</div>
            {baseNav.map(([id, icon, label]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`nav-item ${active === id ? "active" : ""}`}
              >
                <Icon name={icon} size={19} />
                <span>{label}</span>
                {id === "assignments" && (
                  <span className="nav-count">
                    {
                      state.assignments.filter(
                        (a) =>
                          a.person === "me" &&
                          ["todo", "revision"].includes(a.status),
                      ).length
                    }
                  </span>
                )}
              </button>
            ))}
            <button
              className={`nav-item ai-nav ${active === "assistant" ? "active" : ""}`}
              onClick={() => go("assistant")}
            >
              <Icon name="Sparkles" size={19} />
              <span>Trợ lý học tập AI</span>
              <span className="mini-ai">AI</span>
            </button>
            {role !== "learner" && (
              <>
                <div className="nav-label second">QUẢN LÝ & PHÁT TRIỂN</div>
                {managerNav.map(([id, icon, label]) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className={`nav-item ${active === id ? "active" : ""}`}
                  >
                    <Icon name={icon} size={19} />
                    <span>{label}</span>
                    {id === "reviews" && (
                      <span className="nav-count">
                        {
                          state.assignments.filter(
                            (a) => a.status === "submitted",
                          ).length
                        }
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </nav>
          <div className="sidebar-bottom">
            <div className="grow-note">
              <Icon name="Sprout" size={24} />
              <p>
                Mỗi ngày một chút.
                <br />
                <strong>Cùng nhau đi xa hơn.</strong>
              </p>
            </div>
            <button
              className={`nav-item ${active === "settings" ? "active" : ""}`}
              onClick={() => go("settings")}
            >
              <Icon name="Settings" size={19} />
              Cài đặt
            </button>
            <button className="profile-button" onClick={() => go("skills")}>
              <Avatar person={people[0]} />
              <div>
                <strong>Minh Anh</strong>
                <small>Product Researcher</small>
              </div>
              <Icon name="ChevronRight" size={17} />
            </button>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="top-left">
              <button
                className="icon-btn mobile-menu"
                aria-label="Mở menu"
                onClick={() => setMobile(!mobile)}
              >
                <Icon name="Menu" />
              </button>
              <span className="breadcrumb">
                Không gian học tập <Icon name="ChevronRight" size={14} />
                <strong>{titles[active] || "Chi tiết khóa học"}</strong>
              </span>
            </div>
            <div className="top-actions">
              <button
                className="global-search"
                aria-label="Tìm kiếm toàn hệ thống"
                onClick={() => open("Tìm kiếm trong MatureX", <GlobalSearch />)}
              >
                <Icon name="Search" size={17} />
                <span>Tìm kiếm…</span>
                <kbd>⌕</kbd>
              </button>
              <button
                className="icon-btn notification-btn"
                aria-label="Thông báo"
                onClick={() => open("Thông báo của bạn", <NotificationList />)}
              >
                <Icon name="Bell" />
                {state.notifications.some((n) => !n.read) && <i />}
              </button>
              <span className="top-divider" />
              <Avatar person={people[0]} size="small" />
            </div>
          </header>
          <div className="demo-bar">
            <span>
              <i /> BẢN DEMO{" "}
              <span className="demo-explainer">
                · Dữ liệu mẫu, thay đổi được lưu trên trình duyệt
              </span>
            </span>
            <div>
              <label htmlFor="role-selector">Trải nghiệm vai</label>
              <select
                id="role-selector"
                value={role}
                onChange={(e) => selectRole(e.target.value)}
              >
                {Object.entries(roles).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => open("Khám phá MX LMS", <DemoGuide />)}
                aria-label="Hướng dẫn trải nghiệm"
              >
                <Icon name="HelpCircle" size={17} />
              </button>
            </div>
          </div>
          {persistError && (
            <div className="callout peach">
              Trình duyệt không lưu được dữ liệu. Thay đổi hiện chỉ giữ trong
              phiên này.
            </div>
          )}
          <main
            key={active}
            className={`main-content ${active === "course" ? "lesson-main" : ""}`}
          >
            {page}
          </main>
          <footer className="app-footer">
            <span>MatureX Learning · Phát triển từ bên trong</span>
            <button onClick={() => open("Khám phá MX LMS", <DemoGuide />)}>
              Hướng dẫn trải nghiệm <Icon name="ArrowUpRight" size={13} />
            </button>
          </footer>
        </div>
        {modal && (
          <Modal title={modal.title} onClose={close} wide={modal.wide}>
            {modal.body}
          </Modal>
        )}
        {toast && (
          <div className="toast" role="status">
            <Icon name="CheckCircle2" size={19} />
            <span>{toast}</span>
            <button aria-label="Đóng thông báo" onClick={() => setToast("")}>
              <Icon name="X" size={16} />
            </button>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
