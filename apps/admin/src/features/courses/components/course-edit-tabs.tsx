"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@maturex/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CourseDetail } from "../services/course-service";
import { CourseForm } from "./course-form";
import { CourseLessonsManager } from "./course-lessons-manager";

interface CourseEditTabsProps {
  course: CourseDetail;
  initialTab?: "info" | "lessons";
}

export function CourseEditTabs({
  course,
  initialTab = "info",
}: CourseEditTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Đọc tab từ URL query param, nếu chưa có thì dùng initialTab truyền từ Server Component
  const tabParam = searchParams.get("tab");
  const currentTab = tabParam
    ? tabParam === "lessons"
      ? "lessons"
      : "info"
    : initialTab;

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "info") {
      params.delete("tab"); // Default tab: xóa param cho URL sạch đẹp
    } else {
      params.set("tab", val);
    }
    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="info" className="text-xs flex items-center gap-2">
          <span className="font-semibold">Thông tin chung & Cài đặt</span>
        </TabsTrigger>
        <TabsTrigger
          value="lessons"
          className="text-xs flex items-center gap-2"
        >
          <span className="font-semibold">
            Nội dung bài học ({course.lessonsList.length})
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <CourseForm
          mode="edit"
          courseId={course.id}
          initialData={{
            title: course.title,
            category: course.category,
            description: course.description,
            teacher: course.teacher,
            duration: course.duration,
            level: course.level,
            color: course.color,
            icon: course.icon,
            label: course.label || "",
            skill: course.skill || "",
            status: course.status,
          }}
        />
      </TabsContent>

      <TabsContent value="lessons">
        <CourseLessonsManager
          courseId={course.id}
          initialLessons={course.lessonsList}
        />
      </TabsContent>
    </Tabs>
  );
}
