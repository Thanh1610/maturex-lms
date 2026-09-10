import { Button, Icon } from "@/components/ui";

export interface HeaderProps {
  currentTitle: string;
  busy: boolean;
  onRefresh: () => void;
}

export function Header({ currentTitle, busy, onRefresh }: HeaderProps) {
  return (
    <header className="live-topbar h-[74px] max-md:h-[55px] bg-white border-b border-[var(--border,#e9eaf0)] px-9 max-md:px-4 flex items-center justify-between gap-3">
      <span className="text-[#8a8b97] text-[11px] max-md:text-[9px] flex items-center gap-2.5 max-md:gap-1">
        Không gian học tập <Icon name="ChevronRight" size={14} />{" "}
        <strong className="text-[#525360] font-semibold max-md:hidden">
          {currentTitle}
        </strong>
      </span>
      <Button kind="ghost" icon="RotateCcw" disabled={busy} onClick={onRefresh}>
        Tải lại dữ liệu
      </Button>
    </header>
  );
}
