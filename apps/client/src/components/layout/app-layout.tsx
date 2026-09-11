"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  Icon,
} from "@maturex/ui";
import { AppSidebar } from "./app-sidebar";
import { UserNav } from "./user-nav";

const routeTitles: Record<string, string> = {
  "/": "Tổng quan",
  "/catalog": "Thư viện học tập",
  "/paths": "Lộ trình của tôi",
  "/assignments": "Bài tập & phản hồi",
  "/skills": "Hồ sơ năng lực",
  "/calendar": "Lịch đào tạo",
  "/community": "Cộng đồng học tập",
  "/assistant": "Trợ lý học tập AI",
  "/team": "Đội ngũ",
  "/reviews": "Đánh giá bài tập",
  "/studio": "Quản lý đào tạo",
  "/reports": "Báo cáo & hiệu quả",
  "/settings": "Cài đặt",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentTitle = routeTitles[pathname] || "Tổng quan";

  // Auth routes have their own full-screen standalone layout without sidebar
  if (pathname?.startsWith("/auth")) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-[#f8f9fb]">
        {/* Top Header Bar */}
        <header className="h-[73px] max-md:h-[60px] px-[35px] max-lg:px-[25px] max-md:px-[18px] bg-white border-b border-[var(--border,#e9eaf0)] flex items-center justify-between gap-[18px] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="h-[22px] w-px bg-[var(--border,#e9eaf0)]" />
            <nav aria-label="Breadcrumb" className="breadcrumb text-[10px] max-md:text-[9px] flex items-center gap-[13px] max-md:gap-1.5 text-[#a0a0ab]">
              <span>Không gian học tập</span>
              <Icon name="ChevronRight" size={14} />
              <strong className="text-[#616171] font-medium">{currentTitle}</strong>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Link to Demo */}
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-[#786a8a] bg-[#f4f0fa] hover:bg-[#ede6f7] border border-[#e4dbe8] rounded-md px-2.5 py-1 font-medium transition-colors no-underline flex items-center gap-1.5"
            >
              <span>Bản demo (Port 3001)</span>
              <Icon name="ArrowUpRight" size={13} />
            </a>

            {/* Notification Button */}
            <button
              className="relative p-2 text-[#81838e] hover:text-[#6b57bd] hover:bg-[#f0edf8] rounded-md transition-colors cursor-pointer border-0 bg-transparent"
              aria-label="Thông báo"
            >
              <Icon name="Bell" size={17} />
              <span className="w-2 h-2 bg-[#b290cb] rounded-full absolute top-1.5 right-1.5 border border-white" />
            </button>

            {/* Separator */}
            <span className="h-5 w-px bg-[var(--border,#e9eaf0)]" />

            {/* User Avatar Dropdown with Logout */}
            <UserNav />
          </div>
        </header>

        {/* Main View Area */}
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
