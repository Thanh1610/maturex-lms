"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import {
  AppContext,
  Avatar,
  Button,
  Empty,
  Icon,
  Modal,
  useApp,
} from "@/components/ui";
import { initialState, normalize, paths, people } from "./portal-data";
import {
  Assignments,
  Assistant,
  Calendar,
  Catalog,
  Course,
  Dashboard,
  Paths,
} from "./portal-learning";
import {
  Community,
  Reports,
  Reviews,
  SettingsPage,
  Skills,
  Studio,
  Team,
} from "./portal-management";
import { STORAGE_KEY, transition } from "./portal-store";

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
  if (typeof window === "undefined") {
    return initialState();
  }
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
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

import { GlobalSearch } from "./components/shared/global-search";
import { NotificationList } from "./components/shared/notification-list";

export default function App() {
  const [state, dispatch] = useReducer(transition, undefined, load);
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined" && typeof window.location !== "undefined"
      ? window.location.hash.slice(1) || "home"
      : "home",
  );
  const [role, setRole] = useState(() => {
    if (typeof window === "undefined") return "learner";
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
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 760px)").matches
      : false,
  );
  const [persistError, setPersistError] = useState(false);
  const close = useCallback(() => setModal(null), []);
  const open = useCallback(
    (title, body, wide = false) => setModal({ title, body, wide }),
    [],
  );
  const notify = useCallback((msg) => setToast(msg), []);
  const go = useCallback((path: string) => {
    const cleanPath = path.replace(/^#/, "");
    if (typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/demo")) {
        window.location.href = `/demo#${cleanPath}`;
        return;
      }
      window.location.hash = cleanPath;
    }
    setRoute(cleanPath);
    setMobile(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
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
    // Sync initial hash on mount
    const currentHash = window.location.hash.slice(1);
    if (currentHash && currentHash !== route) {
      setRoute(currentHash);
    } else if (!window.location.hash) {
      window.location.hash = "home";
    }

    const fn = () => {
      setRoute(window.location.hash.slice(1) || "home");
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
    document.title = `${titles[active] || "Bài học"} · MatureX Learning`;
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
  let page: any = null;
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
      <div className="app-shell min-h-screen">
        {mobile && (
          <div
            className="sidebar-scrim fixed inset-0 bg-[#382b4c44] z-[35] backdrop-blur-[2px]"
            onClick={() => setMobile(false)}
          />
        )}
        <aside
          className={`sidebar ${mobile ? "show max-md:translate-x-0" : "max-md:-translate-x-full"} w-[242px] max-lg:w-[215px] min-[1500px]:w-[260px] fixed inset-y-0 left-0 bg-white border-r border-[var(--border,#e9eaf0)] flex flex-col pt-[30px] max-lg:pt-[27px] px-[17px] max-lg:px-3 z-40 overflow-y-auto transition-transform duration-200`}
          inert={narrow && !mobile}
        >
          <button
            className="brand flex items-center gap-[11px] pb-[30px] px-3.5 pt-0 text-left w-full cursor-pointer"
            onClick={() => go("home")}
          >
            <span className="brand-symbol text-[35px] tracking-[-7px] font-[750] flex items-center w-[43px] text-[#4e4080]">
              m
              <span className="text-[#9a84c8] font-medium text-[31px] -translate-y-[3px]">
                ×
              </span>
            </span>
            <span className="brand-type text-[26px] tracking-[-1.3px] leading-[1.1] font-[750] text-[#393245]">
              mature<span className="text-[#9179bf]">x</span>
              <small className="block tracking-[2px] text-[8px] font-medium text-[#9c96a5] mt-[7px]">
                LEARNING SPACE
              </small>
            </span>
          </button>
          <div className="workspace flex items-center gap-2.5 py-[15px] px-[9px] border-y border-[var(--border,#e9eaf0)] mb-[22px]">
            <span className="workspace-symbol grid place-items-center w-[29px] h-8 bg-[#f4f2f8] rounded-[7px] text-[#7a6d97]">
              <Icon name="Building2" size={17} />
            </span>
            <div>
              <strong className="text-[10px] min-[1500px]:text-[11px] block font-[550]">
                Không gian MatureX
              </strong>
              <small className="text-[9px] min-[1500px]:text-[10px] text-[#9b99a5] block mt-1">
                Học hỏi. Thực hành. Trưởng thành.
              </small>
            </div>
          </div>
          <nav>
            <div className="nav-label text-[9px] min-[1500px]:text-[10px] font-semibold tracking-[1.05px] text-[#aaa7b2] mx-[13px] mb-3 mt-px">
              KHÔNG GIAN CỦA BẠN
            </div>
            {baseNav.map(([id, icon, label]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`nav-item ${active === id ? "active bg-[#eee9f8] text-[#6d52a7] font-semibold" : "text-[#737381] hover:bg-[#f7f5fb] hover:text-[#65558b]"} flex items-center gap-[11px] w-full min-h-[43px] rounded-lg text-[11px] min-[1500px]:text-[12px] text-left py-[11px] px-[13px] mb-1 font-[450] transition-colors duration-150 cursor-pointer`}
              >
                <Icon name={icon} size={19} />
                <span>{label}</span>
                {id === "assignments" && (
                  <span className="nav-count text-[10px] bg-white/50 px-1.5 py-0.5 rounded ml-auto text-[#8f7db2]">
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
              className={`nav-item ai-nav mt-[15px] ${active === "assistant" ? "active bg-[#eee9f8] text-[#6d52a7] font-semibold" : "text-[#737381] hover:bg-[#f7f5fb] hover:text-[#65558b]"} flex items-center gap-[11px] w-full min-h-[43px] rounded-lg text-[11px] min-[1500px]:text-[12px] text-left py-[11px] px-[13px] mb-1 font-[450] transition-colors duration-150 cursor-pointer`}
              onClick={() => go("assistant")}
            >
              <Icon name="Sparkles" size={19} />
              <span>Trợ lý học tập AI</span>
              <span className="mini-ai text-[10px] bg-[#eee8f8] text-[#8870b8] px-1.25 py-0.5 rounded ml-auto">
                AI
              </span>
            </button>
            {role !== "learner" && (
              <>
                <div className="nav-label second text-[9px] min-[1500px]:text-[10px] font-semibold tracking-[1.05px] text-[#aaa7b2] mx-[13px] mb-3 mt-[27px]">
                  QUẢN LÝ & PHÁT TRIỂN
                </div>
                {managerNav.map(([id, icon, label]) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className={`nav-item ${active === id ? "active bg-[#eee9f8] text-[#6d52a7] font-semibold" : "text-[#737381] hover:bg-[#f7f5fb] hover:text-[#65558b]"} flex items-center gap-[11px] w-full min-h-[43px] rounded-lg text-[11px] min-[1500px]:text-[12px] text-left py-[11px] px-[13px] mb-1 font-[450] transition-colors duration-150 cursor-pointer`}
                  >
                    <Icon name={icon} size={19} />
                    <span>{label}</span>
                    {id === "reviews" && (
                      <span className="nav-count text-[10px] bg-white/50 px-1.5 py-0.5 rounded ml-auto text-[#8f7db2]">
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
          <div className="sidebar-bottom mt-auto pt-[22px]">
            <div className="grow-note bg-[#f7f7f3] border border-[#efefe7] rounded-[10px] mx-2 mb-[17px] p-3.5 text-[#96a28c] flex gap-2.5 items-center">
              <Icon name="Sprout" size={24} />
              <p className="text-[10px] text-[#858877] m-0 leading-[1.9]">
                Mỗi ngày một chút.
                <br />
                <strong className="font-medium text-[#727762]">
                  Cùng nhau đi xa hơn.
                </strong>
              </p>
            </div>
            <button
              className={`nav-item ${active === "settings" ? "active bg-[#eee9f8] text-[#6d52a7] font-semibold" : "text-[#737381] hover:bg-[#f7f5fb] hover:text-[#65558b]"} flex items-center gap-[11px] w-full min-h-[43px] rounded-lg text-[11px] min-[1500px]:text-[12px] text-left py-[11px] px-[13px] mb-1 font-[450] transition-colors duration-150 cursor-pointer`}
              onClick={() => go("settings")}
            >
              <Icon name="Settings" size={19} />
              Cài đặt
            </button>
            <button
              className="profile-button w-full flex items-center gap-[9px] border-t border-[var(--border,#e9eaf0)] py-[18px] px-[9px] mt-2 text-left cursor-pointer"
              onClick={() => go("skills")}
            >
              <Avatar person={people[0]} />
              <div>
                <strong className="text-[11px] block">Minh Anh</strong>
                <small className="text-[10px] text-[#817489]">
                  Product Researcher
                </small>
              </div>
              <Icon
                name="ChevronRight"
                size={17}
                className="ml-auto text-[#817489]"
              />
            </button>
          </div>
        </aside>
        <div className="main-shell ml-[242px] max-lg:ml-[215px] min-[1500px]:ml-[260px] max-md:ml-0 min-h-screen flex flex-col">
          <header className="topbar h-[73px] max-md:h-[60px] px-[35px] max-lg:px-[25px] max-md:px-[18px] bg-white border-b border-[var(--border,#e9eaf0)] flex items-center justify-between gap-[18px]">
            <div className="top-left flex items-center">
              <button
                className="icon-btn mobile-menu hidden max-md:inline-flex mr-2 text-[#81838e] cursor-pointer"
                aria-label="Mở menu"
                onClick={() => setMobile(!mobile)}
              >
                <Icon name="Menu" />
              </button>
              <span className="breadcrumb text-[10px] max-md:text-[9px] flex items-center gap-[13px] max-md:gap-1.5 text-[#a0a0ab]">
                Không gian học tập <Icon name="ChevronRight" size={14} />
                <strong className="text-[#616171] font-medium max-md:max-w-[115px] max-[440px]:max-w-[85px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {titles[active] || "Chi tiết khóa học"}
                </strong>
              </span>
            </div>
            <div className="top-actions flex items-center gap-[19px] max-md:gap-2">
              <button
                className="global-search flex items-center gap-2.5 text-[10px] text-[#a1a0aa] min-w-[190px] max-lg:min-w-[130px] max-md:min-w-0 max-md:p-1 cursor-pointer"
                aria-label="Tìm kiếm toàn hệ thống"
                onClick={() => open("Tìm kiếm trong MatureX", <GlobalSearch />)}
              >
                <Icon name="Search" size={17} />
                <span className="max-md:hidden">Tìm kiếm…</span>
                <kbd className="font-inherit text-[15px] bg-[#f7f7fa] border border-[#ececf0] rounded w-5 ml-auto max-md:hidden">
                  ⌕
                </kbd>
              </button>
              <button
                className="icon-btn notification-btn relative text-[#81838e] hover:bg-[#f0edf8] hover:text-[var(--purple,#6b57bd)] rounded-[7px] w-8 h-8 inline-flex items-center justify-center cursor-pointer"
                aria-label="Thông báo"
                onClick={() => open("Thông báo của bạn", <NotificationList />)}
              >
                <Icon name="Bell" />
                {state.notifications.some((n) => !n.read) && (
                  <i className="w-[5px] h-[5px] border border-white bg-[#ad90ca] absolute top-[5px] right-[7px] rounded-full not-italic" />
                )}
              </button>
              <span className="top-divider h-[22px] w-px bg-[var(--border,#e9eaf0)] max-md:hidden" />
              <a
                href="/auth/login"
                className="inline-flex items-center gap-1.5 bg-[#6b57bd] text-white text-[11px] px-3.5 py-1.5 rounded-lg font-medium hover:bg-[#5946aa] transition-colors no-underline shadow-sm cursor-pointer"
              >
                <span>Đăng nhập</span>
                <Icon name="ArrowRight" size={13} />
              </a>
            </div>
          </header>
          {persistError && (
            <div className="callout peach m-4">
              Trình duyệt không lưu được dữ liệu. Thay đổi hiện chỉ giữ trong
              phiên này.
            </div>
          )}
          <main
            key={active}
            className={`main-content p-8 max-lg:p-6 max-md:px-[18px] max-md:py-[23px] min-[1500px]:p-10 w-full flex-1 animate-[pageIn_0.2s_ease] ${active === "course" ? "lesson-main" : ""}`}
          >
            {page}
          </main>
          <footer className="app-footer px-[35px] py-3 pb-5 max-md:px-[18px] text-[10px] text-[#817489] flex justify-between gap-3">
            <span>MatureX Learning · Phát triển từ bên trong</span>
            <span className="text-[#9e91af] text-[10px]">
              Cổng thông tin & Thư viện học tập
            </span>
          </footer>
        </div>
        {modal && (
          <Modal title={modal.title} onClose={close} wide={modal.wide}>
            {modal.body}
          </Modal>
        )}
        {toast && (
          <div
            className="toast fixed bottom-[25px] max-md:bottom-[18px] left-[calc(50%+100px)] max-md:left-1/2 -translate-x-1/2 z-[150] bg-[#443752] text-[#eee3f5] border border-white/15 shadow-[0_8px_40px_#37234126] rounded-[10px] px-[18px] py-3.5 flex items-center gap-3 text-[11px] max-md:text-[10px] max-w-[min(600px,90vw)] animate-[modalIn_0.17s_ease]"
            role="status"
          >
            <Icon name="CheckCircle2" size={19} className="text-[#b2c7a3]" />
            <span>{toast}</span>
            <button
              aria-label="Đóng thông báo"
              onClick={() => setToast("")}
              className="ml-auto text-[#baa4c7] p-0.5 cursor-pointer"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
