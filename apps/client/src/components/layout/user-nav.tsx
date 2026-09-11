"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "@maturex/ui";
import { useAuthStore } from "@/features/auth/stores/auth-store";

export function UserNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "MA";

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/login");
      router.refresh();
    } catch {
      router.replace("/auth/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full p-0.5 border border-transparent hover:border-[#ded6ec] hover:bg-[#f7f5fb] transition-all cursor-pointer outline-none group"
          aria-label="Tài khoản người dùng"
        >
          <Avatar
            person={{
              name: user?.name || "Người dùng",
              initials,
              color: "lavender",
            }}
            size="small"
            className="ring-2 ring-transparent group-hover:ring-[#c8b7e6] transition-all"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl rounded-xl">
        <DropdownMenuLabel className="p-2">
          <div className="flex flex-col space-y-0.5">
            <p className="text-xs font-semibold text-[#1f1b2d] leading-none truncate">
              {user?.name || "Người dùng"}
            </p>
            <p className="text-[11px] text-[#81838e] leading-none truncate font-normal mt-1">
              {user?.email || ""}
            </p>
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
            <Link href="/skills" className="flex items-center gap-2 w-full no-underline text-inherit">
              <Icon name="Target" size={14} className="text-[#81838e]" />
              <span>Hồ sơ năng lực</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/paths" className="flex items-center gap-2 w-full no-underline text-inherit">
              <Icon name="Compass" size={14} className="text-[#81838e]" />
              <span>Lộ trình của tôi</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2 w-full no-underline text-inherit">
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
  );
}
