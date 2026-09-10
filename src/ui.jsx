import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  BookOpen,
  BookOpenCheck,
  Brain,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  CheckCheck,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Flag,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  Lightbulb,
  Link,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  Maximize2,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PanelLeftClose,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  ScanSearch,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Target,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  Video,
  Volume2,
  Workflow,
  X,
} from "lucide-react";
import React, { createContext, useContext, useEffect, useRef } from "react";

const icons = {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  Brain,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  Compass,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  Video,
  Workflow,
  X,
  LayoutDashboard,
  ChartNoAxesCombined,
  ScanSearch,
  ClipboardCheck,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  Lock,
  Link,
  Mail,
  ThumbsUp,
  ExternalLink,
  Maximize2,
  Volume2,
  CheckSquare,
  Circle,
  Flag,
  AlertCircle,
  Info,
  ChevronLast,
  Building2,
  ListChecks,
  PanelLeftClose,
};
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
export function Icon({ name, size = 20, ...props }) {
  const C = icons[name] || BookOpen;
  return <C size={size} strokeWidth={1.7} {...props} />;
}
export function Button({
  children,
  icon,
  kind = "primary",
  className = "",
  ...props
}) {
  return (
    <button className={`btn ${kind} ${className}`} {...props}>
      {icon && <Icon name={icon} size={17} />}
      <span>{children}</span>
    </button>
  );
}
export function Badge({ children, color = "lavender", dot = false }) {
  return (
    <span className={`badge ${color}`}>
      {dot && <i />}
      {children}
    </span>
  );
}
export function Avatar({ person, size = "", className = "" }) {
  return (
    <span
      className={`avatar ${person?.color || "lavender"} ${size} ${className}`}
      title={person?.name}
    >
      {person?.initials || "MA"}
    </span>
  );
}
export function Progress({ value, color = "", label = false }) {
  return (
    <div className="progress-wrap">
      {label && (
        <div className="between tiny">
          <span>Tiến độ học tập</span>
          <strong>{value}%</strong>
        </div>
      )}
      <div
        className={`progress ${color}`}
        role="progressbar"
        aria-label="Tiến độ học tập"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
export function Empty({
  title = "Chưa có nội dung",
  description = "Nội dung sẽ xuất hiện tại đây khi bạn bắt đầu.",
  children,
}) {
  return (
    <div className="empty">
      <span className="icon-tile lavender">
        <Icon name="FolderOpen" size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function PageHead({ eyebrow, title, description, children }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="head-actions">{children}</div>
    </div>
  );
}
export function SectionHead({ title, description, action, onClick }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && (
        <button className="text-btn" onClick={onClick}>
          {action}
          <Icon name="ArrowRight" size={16} />
        </button>
      )}
    </div>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current.querySelectorAll(
          'button:not([disabled]),a,input,select,textarea,[tabindex="0"]',
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        ref={ref}
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header>
          <h2>{title}</h2>
          <button
            className="icon-btn"
            aria-label="Đóng hộp thoại"
            onClick={onClose}
          >
            <Icon name="X" />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Tabs({ items, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => {
        const key = typeof item === "string" ? item : item.id;
        return (
          <button
            role="tab"
            aria-selected={value === key}
            key={key}
            className={value === key ? "active" : ""}
            onClick={() => onChange(key)}
          >
            {typeof item === "string" ? item : item.label}
            {item.count !== undefined && <span>{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
export function Cover({ course, small = false }) {
  return (
    <div className={`course-cover ${course.color} ${small ? "small" : ""}`}>
      <span className="cover-brand">
        mature<span>x</span> <i>learning</i>
      </span>
      <span className="cover-title">{course.label || "LEARN & GROW"}</span>
      <Icon name={course.icon} size={small ? 44 : 76} />
      <span className="cover-index">{course.category}</span>
    </div>
  );
}
export function CourseCard({ course, progress: done, compact = false }) {
  const { state, dispatch, go } = useApp();
  return (
    <article className={`course-card ${compact ? "compact" : ""}`}>
      <button
        className="cover-link"
        onClick={() => go("course/" + course.id)}
        aria-label={"Mở khóa học " + course.title}
      >
        <Cover course={course} />
      </button>
      <button
        className={`bookmark ${state.bookmarks.includes(course.id) ? "saved" : ""}`}
        aria-label={
          state.bookmarks.includes(course.id)
            ? "Bỏ lưu " + course.title
            : "Lưu " + course.title
        }
        onClick={() => dispatch({ type: "bookmark", id: course.id })}
      >
        <Icon name="Bookmark" size={17} />
      </button>
      <div className="course-info">
        <div className="between">
          <span className="category">{course.category}</span>
          <span className="muted tiny">{course.level}</span>
        </div>
        <button
          className="title-link"
          onClick={() => go("course/" + course.id)}
        >
          {course.title}
        </button>
        <div className="course-meta">
          <span>
            <Icon name="Video" size={14} />
            {course.lessons.length} bài học
          </span>
          <span>
            <Icon name="Clock" size={14} />
            {course.duration}
          </span>
        </div>
        {done !== undefined ? (
          <>
            <Progress value={done} />
            <div className="between tiny">
              <span className="muted">
                {done === 100 ? "Đã hoàn thành" : `${done}% hoàn thành`}
              </span>
              <button
                className="text-btn"
                onClick={() => go("course/" + course.id)}
              >
                {done === 100 ? "Xem lại" : "Tiếp tục học"}
                <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </>
        ) : (
          <div className="course-footer">
            <span className="teacher-dot">{course.teacher.slice(0, 1)}</span>
            <span>{course.teacher}</span>
            <span className="students">
              <Icon name="Users" size={14} />
              {course.students}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
export function Stat({ icon, color = "lavender", value, label, sub }) {
  return (
    <div className="stat">
      <div className={`icon-tile ${color}`}>
        <Icon name={icon} />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
      {sub && <small>{sub}</small>}
    </div>
  );
}
export function download(name, text, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const statusLabel = {
  todo: "Chưa nộp",
  submitted: "Chờ phản hồi",
  revision: "Cần bổ sung",
  approved: "Đạt yêu cầu",
  published: "Đã phát hành",
  draft: "Bản nháp",
  archived: "Đã lưu trữ",
};
export const statusColor = {
  todo: "sand",
  submitted: "blue",
  revision: "peach",
  approved: "green",
  published: "green",
  draft: "sand",
  archived: "gray",
};
