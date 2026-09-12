"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { APP_ROUTES } from "@/lib/api-routes";

interface NavItem {
  href: string;
  id: string;
  icon: string;
  label: string;
  count?: number;
}

const baseNav: NavItem[] = [
  { href: APP_ROUTES.home, id: "home", icon: "Home", label: "Tổng quan" },
  { href: APP_ROUTES.courses, id: "courses", icon: "BookOpen", label: "Khóa học" },
];

export interface AppSidebarProps {
  user?: {
    name: string;
    email?: string;
    role?: string;
    job?: string;
  } | null;
}

export function AppSidebar({ user: userProp }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const user = authUser || userProp;
  const userName = user?.name || "Người dùng";
  const userJob = user?.job || (user?.role ? `Vai trò: ${user.role}` : "Học viên");

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "MA";

  const handleLogout = async () => {
    try {
      await logout();
      router.replace(APP_ROUTES.auth.login);
      router.refresh();
    } catch {
      router.replace(APP_ROUTES.auth.login);
    }
  };

  const isCurrent = (href: string) => {
    if (href === APP_ROUTES.home) return pathname === APP_ROUTES.home;
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="border-r border-[var(--border,#e9eaf0)] bg-white select-none">
      {/* Brand Header */}
      <SidebarHeader>
        <Link
          href={APP_ROUTES.home}
          className={`brand flex items-center justify-center ${isCollapsed ? "p-0" : "w-full pb-4 pt-1"} cursor-pointer no-underline text-inherit`}
          title="MatureX Learning Space"
        >
          {isCollapsed ? (
            <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg mx-auto">
              <Image
                src="/logo_mobile.webp"
                alt="MatureX"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full py-1">
              <Image
                src="/logo.webp"
                alt="MatureX"
                width={240}
                height={60}
                className="h-12 max-h-14 w-auto object-contain"
                priority
              />
            </div>
          )}
        </Link>

        {/* Workspace Mini Card */}
        <div
          className={`workspace flex items-center ${isCollapsed ? "justify-center py-2 px-0 border-y-0" : "gap-2.5 py-[15px] px-[9px] border-y border-[var(--border,#e9eaf0)] mb-[22px]"} transition-all`}
          title="Cổng Quản trị MatureX"
        >
          <span className="workspace-symbol grid place-items-center w-[29px] h-8 bg-[#f4f2f8] rounded-[7px] text-[#7a6d97] shrink-0">
            <Icon name="Building2" size={17} />
          </span>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <strong className="text-[10px] min-[1500px]:text-[11px] block font-[550] text-[#393245] truncate">
                Cổng Quản trị MatureX
              </strong>
              <small className="text-[9px] min-[1500px]:text-[10px] text-[#9b99a5] block mt-1 truncate">
                Quản lý đào tạo & vận hành
              </small>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Nav Content */}
      <SidebarContent>
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel>QUẢN TRỊ HỆ THỐNG</SidebarGroupLabel>
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

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Profile & Notes */}
      <SidebarFooter>
        {!isCollapsed && (
          <div className="grow-note bg-[#f7f7f3] border border-[#efefe7] rounded-[10px] mx-2 mb-2 p-3.5 text-[#96a28c] flex gap-2.5 items-center">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`profile-button w-full flex items-center ${isCollapsed ? "justify-center p-1.5 mt-1" : "gap-[9px] border-t border-[var(--border,#e9eaf0)] py-[14px] px-[9px] mt-1"} rounded-lg hover:bg-[#f7f5fb] transition-colors cursor-pointer outline-none border-0 text-left`}
              title={isCollapsed ? `${userName} - ${userJob}` : undefined}
            >
              <Avatar
                person={{
                  name: userName,
                  initials,
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
                    name="ChevronsUpDown"
                    size={15}
                    className="text-[#817489] shrink-0 ml-auto"
                  />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={8}
            className="w-64 min-w-[240px] p-1.5 shadow-xl rounded-xl"
          >
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold text-[#1f1b2d] leading-none truncate">
                  {userName}
                </p>
                {user?.email && (
                  <p className="text-[11px] text-[#81838e] leading-none truncate font-normal mt-1">
                    {user.email}
                  </p>
                )}
                {user?.role && (
                  <span className="inline-block mt-1 text-[9px] font-medium text-[#7c63b4] bg-[#f2eef9] px-1.5 py-0.5 rounded w-fit capitalize">
                    {user.role}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={APP_ROUTES.skills} className="flex items-center gap-2 w-full no-underline text-inherit cursor-pointer">
                  <Icon name="Target" size={14} className="text-[#81838e]" />
                  <span>Hồ sơ năng lực</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={APP_ROUTES.paths} className="flex items-center gap-2 w-full no-underline text-inherit cursor-pointer">
                  <Icon name="Compass" size={14} className="text-[#81838e]" />
                  <span>Lộ trình của tôi</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={APP_ROUTES.settings} className="flex items-center gap-2 w-full no-underline text-inherit cursor-pointer">
                  <Icon name="Settings" size={14} className="text-[#81838e]" />
                  <span>Cài đặt tài khoản</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer font-medium text-[#c0392b]"
            >
              <Icon name="LogOut" size={14} />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
