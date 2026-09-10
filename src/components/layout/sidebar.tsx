import { Icon } from "@/components/ui";
import { roleLabels } from "@/lib/formatters";

export interface SidebarProps {
  nav: Array<[string, string, string] | string[]>;
  active: string;
  user: any;
  unreadNotifications: number;
  busy: boolean;
  onGo: (key: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  nav,
  active,
  user,
  unreadNotifications,
  busy,
  onGo,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="live-sidebar w-64 max-xl:w-[230px] max-md:w-full fixed max-md:static inset-y-0 left-0 pt-[30px] pb-[18px] px-[18px] max-md:p-[18px_16px_0] flex flex-col max-md:flex-row max-md:flex-wrap max-md:gap-3 border-r max-md:border-r-0 border-[var(--border,#e9eaf0)] bg-white z-20">
      <a
        className="live-wordmark block text-decoration-none text-[#343340] text-[32px] max-md:text-[27px] tracking-[-1.8px] font-extrabold m-0 mx-4 mb-8 max-md:m-0 max-md:flex-1"
        href="#home"
      >
        mature<span className="text-[#8b76cf]">×</span>
        <small className="block text-[8px] max-md:text-[6px] tracking-[2.7px] text-[#92929f] mt-0.5 font-normal">
          LEARNING SPACE
        </small>
      </a>
      <div className="live-workspace flex gap-2.5 pt-[15px] pb-6 px-2 border-b border-[var(--border,#e9eaf0)] mb-[22px] items-center max-md:hidden">
        <Icon name="Building2" />
        <div>
          <strong className="text-[11px] block font-semibold">
            Không gian MatureX
          </strong>
          <small className="block text-[8px] text-[var(--muted,#858894)] mt-1">
            Học hỏi. Thực hành. Trưởng thành.
          </small>
        </div>
      </div>
      <nav
        aria-label="Điều hướng chính"
        className="flex-1 overflow-y-auto max-md:order-3 max-md:basis-full max-md:flex max-md:overflow-x-auto max-md:gap-[5px] max-md:pb-2"
      >
        {nav.map(([key, icon, title]) => (
          <button
            key={key}
            aria-label={title}
            className={`nav-item ${active === key ? "active bg-[#eee9f8] text-[#6d52a7] font-semibold" : "text-[#737381] hover:bg-[#f7f5fb] hover:text-[#65558b]"} flex items-center gap-[11px] w-full max-md:w-auto max-md:shrink-0 mb-1.5 max-md:m-0 p-2.5 max-md:text-[10px] rounded-lg text-[11px] text-left transition-colors duration-150 cursor-pointer`}
            onClick={() => onGo(key)}
            aria-current={active === key ? "page" : undefined}
          >
            <Icon name={icon} size={19} />
            <span>{title}</span>
            {key === "notifications" && unreadNotifications > 0 && (
              <span className="nav-count text-[10px] bg-white/50 px-1.5 py-0.5 rounded ml-auto text-[#8f7db2]">
                {unreadNotifications}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="live-profile flex items-center gap-2.5 border-t max-md:border-t-0 border-[var(--border,#e9eaf0)] pt-[18px] max-md:pt-0 px-[5px] max-md:px-0 max-md:max-w-[200px]">
        <span className="live-avatar rounded-full w-[34px] h-[34px] shrink-0 bg-[#eee8fa] text-[#7561b2] grid place-items-center font-semibold text-xs">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block whitespace-nowrap overflow-hidden text-ellipsis text-xs">
            {user.name}
          </strong>
          <small className="block text-[10px] text-[var(--muted,#858894)]">
            {roleLabels[user.role]}
          </small>
        </div>
        <button
          className="icon-btn inline-flex items-center justify-center w-8 h-8 rounded-[7px] shrink-0 text-[#81838e] hover:bg-[#f0edf8] hover:text-[var(--purple,#6b57bd)] cursor-pointer"
          aria-label="Đăng xuất"
          title="Đăng xuất"
          onClick={onLogout}
          disabled={busy}
        >
          <Icon name="LogOut" size={18} />
        </button>
      </div>
    </aside>
  );
}
