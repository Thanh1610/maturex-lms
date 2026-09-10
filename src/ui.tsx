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
import type React from "react";
import {
  type ButtonHTMLAttributes,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import type { Course, Person } from "./types/index";

const icons: Record<string, any> = {
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
export const AppContext = createContext<any>(null);
export const useApp = () => useContext(AppContext);

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  const C = icons[name] || BookOpen;
  return <C size={size} strokeWidth={1.7} {...props} />;
}
const buttonKindStyles: Record<string, string> = {
  primary:
    "bg-[var(--purple,#6b57bd)] text-white shadow-[0_3px_5px_#6b57bd15] hover:bg-[#5c49ad]",
  secondary:
    "bg-white border border-[#e4e3eb] text-[#747080] hover:border-[#bcb0d6] hover:bg-[#fdfbff]",
  white: "bg-white text-[#6e5799]",
  ghost: "text-[var(--purple,#6b57bd)] px-2",
  danger: "text-[#b76363] bg-[#fff4f2] border border-[#f2ded9]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  icon?: string;
  kind?: "primary" | "secondary" | "white" | "ghost" | "danger";
  className?: string;
}

export function Button({
  children,
  icon,
  kind = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 rounded-[7px] px-4 py-[11px] text-[11px] font-medium border border-transparent leading-[1.55] min-h-[38px] transition-all duration-150 whitespace-nowrap cursor-pointer hover:not-disabled:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45";
  const kindStyle = buttonKindStyles[kind] || buttonKindStyles.primary;

  return (
    <button
      className={`btn ${kind} ${baseStyle} ${kindStyle} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={17} />}
      <span className="inline-flex items-center justify-center gap-[9px]">
        {children}
      </span>
    </button>
  );
}

export function Badge({
  children,
  color = "lavender",
  dot = false,
  className = "",
  ...props
}: {
  children?: ReactNode;
  color?: string;
  dot?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <span
      className={`badge ${color} inline-flex items-center gap-[5px] px-2 py-1 rounded-[5px] text-[10px] font-medium whitespace-nowrap leading-normal ${className}`}
      {...props}
    >
      {dot && (
        <i className="w-1 h-1 rounded-full bg-current inline-block not-italic" />
      )}
      {children}
    </span>
  );
}

export function Avatar({
  person,
  size = "",
  className = "",
}: {
  person?: Partial<Person> & { initials?: string };
  size?: "small" | "large" | "";
  className?: string;
}) {
  const sizeClass =
    size === "small"
      ? "w-[29px] h-[29px] text-[10px]"
      : size === "large"
        ? "w-[76px] h-[76px] text-[23px] border-4 border-white/70"
        : "w-[35px] h-[35px] text-[11px]";

  return (
    <span
      className={`avatar ${person?.color || "lavender"} ${size} rounded-full inline-flex items-center justify-center font-semibold shrink-0 ${sizeClass} ${className}`}
      title={person?.name}
    >
      {person?.initials || "MA"}
    </span>
  );
}

export function Progress({
  value,
  color = "",
  label = false,
}: {
  value: number;
  color?: string;
  label?: boolean;
}) {
  return (
    <div className="progress-wrap my-[17px] mb-[9px]">
      {label && (
        <div className="between tiny flex items-center justify-between gap-[14px] text-[10px] mb-[9px]">
          <span>Tiến độ học tập</span>
          <strong>{value}%</strong>
        </div>
      )}
      <div
        className={`progress ${color} h-1 rounded-[5px] bg-[#eeeaf3] overflow-hidden`}
        role="progressbar"
        aria-label="Tiến độ học tập"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="h-full block bg-[#ab94c7] rounded-[5px] transition-[width] duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function Empty({
  title = "Chưa có nội dung",
  description = "Nội dung sẽ xuất hiện tại đây khi bạn bắt đầu.",
  children,
  action,
  onClick,
  className = "",
  ...props
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
  action?: string;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`empty px-5 py-[45px] text-center flex flex-col items-center justify-center min-h-[230px] w-full ${className}`}
      {...props}
    >
      <span className="icon-tile lavender mb-5 w-[43px] h-[43px] inline-flex items-center justify-center rounded-[11px] shrink-0">
        <Icon name="FolderOpen" size={28} />
      </span>
      <h3 className="text-base text-[#9b7dac] font-medium mt-0 mb-2.5">
        {title}
      </h3>
      {description && (
        <p className="text-[11px] max-w-[370px] text-[#baa1c8] mb-5 leading-[1.85]">
          {description}
        </p>
      )}
      {children}
      {action && onClick && (
        <Button onClick={onClick} kind="secondary">
          {action}
        </Button>
      )}
    </div>
  );
}

export function PageHead({
  eyebrow,
  title,
  description,
  children,
  className = "",
  ...props
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`page-head flex justify-between items-center gap-[22px] mb-7 max-sm:flex-wrap max-sm:items-start max-sm:gap-3.5 ${className}`}
      {...props}
    >
      <div>
        {eyebrow && (
          <div className="eyebrow text-[10px] font-semibold tracking-[1.6px] text-[#a6a0ad] mb-2.5">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[26px] font-[650] tracking-[-0.9px] leading-[1.45] mb-[9px] mt-0">
          {title}
        </h1>
        {description && (
          <p className="text-[#9695a0] text-[11px] mb-0 leading-[1.85]">
            {description}
          </p>
        )}
      </div>
      <div className="head-actions flex items-center gap-[9px] shrink-0">
        {children}
      </div>
    </div>
  );
}

export function SectionHead({
  title,
  description,
  action,
  onClick,
  className = "",
  ...props
}: {
  title: string;
  description?: string;
  action?: string;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`section-head flex justify-between items-center gap-3 my-[25px] mb-4 ${className}`}
      {...props}
    >
      <div>
        <h2 className="text-[16px] font-[650] tracking-[-0.3px] mb-0 mt-0 leading-[1.5]">
          {title}
        </h2>
        {description && (
          <p className="text-[10px] text-[#a4a0aa] mt-[5px] mb-0 leading-[1.85]">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          className="text-btn inline-flex items-center gap-[7px] text-[10px] font-medium text-[#8a75af] py-[3px] px-0 whitespace-nowrap cursor-pointer hover:text-[#5f498b]"
          onClick={onClick}
        >
          {action}
          <Icon name="ArrowRight" size={16} />
        </button>
      )}
    </div>
  );
}

export interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function Modal({ title, children, onClose, wide = false }: ModalProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const nodes = ref.current.querySelectorAll(
          'button:not([disabled]),a,input,select,textarea,[tabindex="0"]',
        );
        const first = nodes[0] as HTMLElement | undefined,
          last = nodes[nodes.length - 1] as HTMLElement | undefined;
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
      className="modal-backdrop fixed inset-0 bg-[#30293c55] backdrop-blur-[3px] z-[100] flex items-center justify-center p-7 max-sm:p-3"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        ref={ref}
        className={`modal ${wide ? "wide w-[780px]" : "w-[580px]"} max-w-full max-h-[90vh] max-sm:max-h-[94vh] bg-white border border-[#e9deef] rounded-2xl max-sm:rounded-xl shadow-[0_25px_95px_#32243b25] overflow-auto`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between gap-5 px-[25px] py-5 max-sm:px-5 max-sm:py-[17px] border-b border-[#ede4f4] sticky top-0 bg-white z-[3] rounded-t-2xl max-sm:rounded-t-xl">
          <h2 className="text-[17px] max-sm:text-[15px] text-[#9674aa] font-[550] m-0">
            {title}
          </h2>
          <button
            className="icon-btn inline-flex items-center justify-center w-8 h-8 rounded-[7px] shrink-0 text-[#81838e] hover:bg-[#f0edf8] hover:text-[var(--purple,#6b57bd)] cursor-pointer"
            aria-label="Đóng hộp thoại"
            onClick={onClose}
          >
            <Icon name="X" />
          </button>
        </header>
        <div className="modal-body p-[25px] max-sm:p-5">{children}</div>
      </section>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field flex flex-col gap-2 my-[18px]">
      <span className="text-[11px] font-medium text-[#8d779b]">{label}</span>
      {children}
      {hint && <small className="text-[10px] text-[#b29fc0]">{hint}</small>}
    </label>
  );
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: Array<string | { id: string; label: string; count?: number }>;
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div
      className="tabs flex items-center gap-[23px] max-sm:gap-[22px] border-b border-[#e6e2ec] mb-[23px] overflow-auto [scrollbar-width:thin]"
      role="tablist"
    >
      {items.map((item) => {
        const key = typeof item === "string" ? item : item.id;
        const isSelected = value === key;
        return (
          <button
            role="tab"
            aria-selected={isSelected}
            key={key}
            className={`tabs-btn ${isSelected ? "active border-b-2 border-[#a28abd] text-[#8464ae]" : "text-[#a198ab] border-b-2 border-transparent"} text-[11px] max-sm:text-[10px] font-medium py-[15px] max-sm:py-3 whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors duration-150`}
            onClick={() => onChange(key)}
          >
            {typeof item === "string" ? item : item.label}
            {typeof item !== "string" && item.count !== undefined && (
              <span className="bg-[#f0eaf7] text-[#9477b8] text-[10px] px-1.5 py-0.5 rounded-[5px]">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Cover({
  course,
  small = false,
}: {
  course: Course;
  small?: boolean;
}) {
  return (
    <div
      className={`course-cover ${course.color} ${small ? "small h-[100px]" : "h-[148px] max-sm:h-[145px] max-[440px]:h-[170px]"} relative overflow-hidden flex flex-col p-[20px_23px] max-sm:p-[19px] max-[440px]:p-6 isolate`}
    >
      <span className="cover-brand text-xs tracking-[-0.6px] font-[650] opacity-55">
        mature<span>x</span>{" "}
        <i className="text-[10px] not-italic font-normal tracking-[0.4px] ml-[7px] pl-2 border-l border-current">
          learning
        </i>
      </span>
      <span className="cover-title text-[19px] max-sm:text-[18px] max-[440px]:text-[24px] tracking-[-0.4px] font-semibold leading-[1.3] mt-[18px] z-[1] max-w-[70%] max-[440px]:max-w-[65%]">
        {course.label || "LEARN & GROW"}
      </span>
      <span className="absolute right-5 top-[37px] max-sm:right-3 max-sm:top-[43px] max-[440px]:right-7 max-[440px]:top-11 opacity-45 stroke-1 pointer-events-none">
        <Icon name={course.icon} size={small ? 44 : 76} />
      </span>
      <span className="cover-index text-[10px] tracking-[1.3px] uppercase mt-auto opacity-75">
        {course.category}
      </span>
    </div>
  );
}

export function CourseCard({
  course,
  progress: done,
  compact = false,
}: {
  course: Course;
  progress?: number;
  compact?: boolean;
}) {
  const { state, dispatch, go } = useApp();
  return (
    <article
      className={`course-card ${compact ? "compact" : ""} relative rounded-[11px] bg-white border border-[var(--border,#e9eaf0)] overflow-hidden transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_25px_#4435500b] flex flex-col`}
    >
      <button
        className="cover-link p-0 w-full block text-left cursor-pointer"
        onClick={() => go(`course/${course.id}`)}
        aria-label={`Mở khóa học ${course.title}`}
      >
        <Cover course={course} />
      </button>
      <button
        className={`bookmark ${state.bookmarks.includes(course.id) ? "saved text-[#8d73b0] bg-white" : "text-[#a49aaf] bg-white/65"} absolute right-3 top-3 flex items-center justify-center rounded-md p-1.5 z-[3] cursor-pointer hover:bg-white`}
        aria-label={
          state.bookmarks.includes(course.id)
            ? `Bỏ lưu ${course.title}`
            : `Lưu ${course.title}`
        }
        onClick={() => dispatch({ type: "bookmark", id: course.id })}
      >
        <Icon name="Bookmark" size={17} />
      </button>
      <div className="course-info p-[18px_19px_13px] max-sm:p-4 max-[440px]:p-5 flex flex-col flex-1">
        <div className="between flex items-center justify-between gap-[14px]">
          <span className="category text-[10px] text-[#a28db4] tracking-[0.15px] font-medium">
            {course.category}
          </span>
          <span className="muted tiny text-[#858894] text-[10px]">
            {course.level}
          </span>
        </div>
        <button
          className="title-link block text-left text-[14px] max-sm:text-[13px] max-[440px]:text-[16px] font-[550] leading-[1.7] my-[9px] mb-3 p-0 min-h-[48px] max-sm:min-h-[44px] max-[440px]:min-h-0 tracking-[-0.25px] text-[#56515f] hover:text-[#8c6eb2] cursor-pointer"
          onClick={() => go(`course/${course.id}`)}
        >
          {course.title}
        </button>
        <div className="course-meta flex flex-wrap gap-3 max-sm:gap-2 text-[10px] text-[#a9a1b0] items-center">
          <span className="flex items-center gap-1.25">
            <Icon name="Video" size={14} />
            {course.lessons.length} bài học
          </span>
          <span className="flex items-center gap-1.25">
            <Icon name="Clock" size={14} />
            {course.duration}
          </span>
        </div>
        {done !== undefined ? (
          <>
            <Progress value={done} />
            <div className="between tiny flex items-center justify-between gap-[14px] text-[10px] mt-auto">
              <span className="muted text-[#858894]">
                {done === 100 ? "Đã hoàn thành" : `${done}% hoàn thành`}
              </span>
              <button
                className="text-btn inline-flex items-center gap-[7px] text-[10px] font-medium text-[#8a75af] py-[3px] px-0 whitespace-nowrap cursor-pointer hover:text-[#5f498b]"
                onClick={() => go(`course/${course.id}`)}
              >
                {done === 100 ? "Xem lại" : "Tiếp tục học"}
                <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </>
        ) : (
          <div className="course-footer flex items-center gap-[7px] text-[10px] text-[#a197a8] border-t border-[#f0edf5] mt-[17px] pt-[13px]">
            <span className="teacher-dot w-[21px] h-[21px] rounded-full bg-[#ede8f3] text-[#ad9abe] flex items-center justify-center text-[10px]">
              {course.teacher.slice(0, 1)}
            </span>
            <span>{course.teacher}</span>
            <span className="students ml-auto flex gap-[5px] items-center">
              <Icon name="Users" size={14} />
              {course.students}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function Stat({
  icon,
  color = "lavender",
  value,
  label,
  sub,
}: {
  icon: string;
  color?: string;
  value: string | number;
  label: string;
  sub?: string;
}) {
  return (
    <div className="stat border border-[var(--border,#e9eaf0)] rounded-[10px] bg-white p-[17px_13px] max-sm:p-[17px_14px] flex items-center gap-2.5 max-sm:gap-[11px] min-w-0">
      <div
        className={`icon-tile ${color} w-[34px] h-[34px] max-sm:w-[35px] max-sm:h-[35px] rounded-[9px] inline-flex items-center justify-center shrink-0`}
      >
        <Icon name={icon} size={18} />
      </div>
      <div>
        <strong className="text-[23px] max-sm:text-[25px] leading-[1.2] font-semibold block tracking-[-0.7px]">
          {value}
        </strong>
        <span className="block text-[10px] text-[#a5a0ac] mt-1.25 whitespace-nowrap">
          {label}
        </span>
      </div>
      {sub && (
        <small className="text-[10px] text-[var(--green,#448171)] ml-auto">
          {sub}
        </small>
      )}
    </div>
  );
}

export function download(
  name: string,
  text: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const statusLabel: Record<string, string> = {
  todo: "Chưa nộp",
  submitted: "Chờ phản hồi",
  revision: "Cần bổ sung",
  approved: "Đạt yêu cầu",
  published: "Đã phát hành",
  draft: "Bản nháp",
  archived: "Đã lưu trữ",
};

export const statusColor: Record<string, string> = {
  todo: "sand",
  submitted: "blue",
  revision: "peach",
  approved: "green",
  published: "green",
  draft: "sand",
  archived: "gray",
};
