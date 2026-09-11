"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Icon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@maturex/ui";

const baseNav = [
  { href: "/", id: "home", icon: "Home", label: "Tổng quan" },
  { href: "/catalog", id: "catalog", icon: "BookOpen", label: "Thư viện học tập" },
  { href: "/paths", id: "paths", icon: "Compass", label: "Lộ trình của tôi" },
  { href: "/assignments", id: "assignments", icon: "ClipboardCheck", label: "Bài tập & phản hồi", count: 2 },
  { href: "/skills", id: "skills", icon: "Target", label: "Hồ sơ năng lực" },
  { href: "/calendar", id: "calendar", icon: "CalendarDays", label: "Lịch đào tạo" },
  { href: "/community", id: "community", icon: "MessageCircle", label: "Cộng đồng học tập" },
];

const managerNav = [
  { href: "/team", id: "team", icon: "Users", label: "Đội ngũ" },
  { href: "/reviews", id: "reviews", icon: "CheckSquare", label: "Đánh giá bài tập" },
  { href: "/studio", id: "studio", icon: "FolderOpen", label: "Quản lý đào tạo" },
  { href: "/reports", id: "reports", icon: "ChartNoAxesCombined", label: "Báo cáo & hiệu quả" },
];

export interface AppSidebarProps {
  user?: {
    name: string;
    role?: string;
    job?: string;
  } | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isCurrent = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const userName = user?.name || "Minh Anh";
  const userJob = user?.job || "Product Researcher";

  return (
    <Sidebar className="border-r border-[var(--border,#e9eaf0)] bg-white select-none">
      {/* Brand Header */}
      <SidebarHeader>
        <Link
          href="/"
          className={`brand flex items-center ${isCollapsed ? "justify-center px-0 pb-2" : "gap-[11px] px-3.5 pb-[30px]"} text-left w-full cursor-pointer no-underline text-inherit`}
          title="MatureX Learning Space"
        >
          <span className="brand-symbol text-[35px] tracking-[-7px] font-[750] flex items-center justify-center shrink-0 w-[43px] text-[#4e4080]">
            m
            <span className="text-[#9a84c8] font-medium text-[31px] -translate-y-[3px]">
              ×
            </span>
          </span>
          {!isCollapsed && (
            <span className="brand-type text-[26px] tracking-[-1.3px] leading-[1.1] font-[750] text-[#393245] whitespace-nowrap">
              mature<span className="text-[#9179bf]">x</span>
              <small className="block tracking-[2px] text-[8px] font-medium text-[#9c96a5] mt-[7px]">
                LEARNING SPACE
              </small>
            </span>
          )}
        </Link>

        {/* Workspace Mini Card */}
        <div
          className={`workspace flex items-center ${isCollapsed ? "justify-center py-2 px-0 border-y-0" : "gap-2.5 py-[15px] px-[9px] border-y border-[var(--border,#e9eaf0)] mb-[22px]"} transition-all`}
          title="Không gian MatureX"
        >
          <span className="workspace-symbol grid place-items-center w-[29px] h-8 bg-[#f4f2f8] rounded-[7px] text-[#7a6d97] shrink-0">
            <Icon name="Building2" size={17} />
          </span>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <strong className="text-[10px] min-[1500px]:text-[11px] block font-[550] text-[#393245] truncate">
                Không gian MatureX
              </strong>
              <small className="text-[9px] min-[1500px]:text-[10px] text-[#9b99a5] block mt-1 truncate">
                Học hỏi. Thực hành. Trưởng thành.
              </small>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Nav Content */}
      <SidebarContent>
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel>KHÔNG GIAN CỦA BẠN</SidebarGroupLabel>
          <SidebarMenu>
            {baseNav.map((item) => {
              const active = isCurrent(item.href);
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Link href={item.href}>
                      <Icon name={item.icon} size={19} className="shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.count && (
                            <span className="nav-count text-[10px] bg-white/60 px-1.5 py-0.5 rounded ml-auto text-[#8f7db2] font-semibold">
                              {item.count}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            {/* AI Assistant Special Item */}
            <SidebarMenuItem className={isCollapsed ? "mt-1" : "mt-[15px]"}>
              <SidebarMenuButton
                asChild
                isActive={isCurrent("/assistant")}
                title={isCollapsed ? "Trợ lý học tập AI" : undefined}
              >
                <Link href="/assistant">
                  <Icon name="Sparkles" size={19} className="shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">Trợ lý học tập AI</span>
                      <span className="mini-ai text-[10px] bg-[#eee8f8] text-[#8870b8] px-1.25 py-0.5 rounded ml-auto font-semibold">
                        AI
                      </span>
                    </>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Manager Section */}
        <SidebarGroup className={isCollapsed ? "mt-1" : "mt-[22px]"}>
          <SidebarGroupLabel>QUẢN LÝ & PHÁT TRIỂN</SidebarGroupLabel>
          <SidebarMenu>
            {managerNav.map((item) => {
              const active = isCurrent(item.href);
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Link href={item.href}>
                      <Icon name={item.icon} size={19} className="shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Profile & Notes */}
      <SidebarFooter>
        {!isCollapsed && (
          <div className="grow-note bg-[#f7f7f3] border border-[#efefe7] rounded-[10px] mx-2 mb-[17px] p-3.5 text-[#96a28c] flex gap-2.5 items-center">
            <Icon name="Sprout" size={24} className="shrink-0" />
            <p className="text-[10px] text-[#858877] m-0 leading-[1.9]">
              Mỗi ngày một chút.
              <br />
              <strong className="font-medium text-[#727762]">
                Cùng nhau đi xa hơn.
              </strong>
            </p>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isCurrent("/settings")}
              title={isCollapsed ? "Cài đặt" : undefined}
            >
              <Link href="/settings">
                <Icon name="Settings" size={19} className="shrink-0" />
                {!isCollapsed && <span>Cài đặt</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Link
          href="/skills"
          className={`profile-button w-full flex items-center ${isCollapsed ? "justify-center p-1.5 mt-1" : "gap-[9px] border-t border-[var(--border,#e9eaf0)] py-[18px] px-[9px] mt-2"} rounded-lg hover:bg-[#f7f5fb] transition-colors cursor-pointer no-underline text-inherit`}
          title={isCollapsed ? `${userName} - ${userJob}` : undefined}
        >
          <Avatar
            person={{
              name: userName,
              initials: "MA",
              color: "lavender",
            }}
            size="small"
          />
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <strong className="text-[11px] block truncate text-[#393245]">
                  {userName}
                </strong>
                <small className="text-[10px] text-[#817489] block truncate">
                  {userJob}
                </small>
              </div>
              <Icon
                name="ChevronRight"
                size={17}
                className="text-[#817489] shrink-0 ml-auto"
              />
            </>
          )}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
