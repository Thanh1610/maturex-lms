"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Icon, toast } from "@maturex/ui";
import { APP_ROUTES } from "@/lib/api-routes";
import type { Course } from "../mock-courses";

interface CourseDetailHeaderProps {
  course: Course;
}

export function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  const [saved, setSaved] = useState(false);

  const handleToggleBookmark = () => {
    const nextState = !saved;
    setSaved(nextState);
    if (nextState) {
      toast.success("Đã lưu khóa học vào danh sách của bạn", {
        description: course.title,
      });
    } else {
      toast.info("Đã bỏ lưu khóa học", {
        description: course.title,
      });
    }
  };

  return (
    <div className="course-detail-header mb-6">
      <Link
        href={APP_ROUTES.courses}
        className="back-link inline-flex items-center gap-1.5 text-xs font-medium text-[#8d829e] hover:text-[#6b57bd] transition-colors mb-4"
      >
        <Icon name="ArrowLeft" size={16} />
        <span>Thư viện học tập</span>
      </Link>

      <div className="course-page-heading flex items-start justify-between gap-4 flex-wrap">
        <div className="max-w-[800px]">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="lavender" className="bg-[#f0e9f8] text-[#71548e] hover:bg-[#ebdff6] font-medium border-0">
              {course.category}
            </Badge>
            <span className="text-xs text-[#8d829e] font-normal">
              {course.level} · {course.scope || "MatureX"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#2d2838] mt-3 mb-2">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#736a82] m-0 flex items-center flex-wrap gap-2">
            <span>Hướng dẫn bởi <strong>{course.teacher}</strong></span>
            <span className="text-[#bbb2c9]">•</span>
            <span>{course.lessons.length} bài học</span>
            <span className="text-[#bbb2c9]">•</span>
            <span>{course.duration}</span>
          </p>
        </div>

        <Button
          variant="outline"
          className={`flex items-center gap-2 rounded-lg text-xs font-medium transition-colors ${
            saved
              ? "bg-[#f4edf9] text-[#78599a] border-[#e0cfea]"
              : "text-[#625974] hover:bg-[#faf8fd] border-[#ded7e7]"
          }`}
          onClick={handleToggleBookmark}
        >
          <Icon name="Bookmark" size={16} className={saved ? "fill-[#78599a]" : ""} />
          <span>{saved ? "Đã lưu" : "Lưu khóa học"}</span>
        </Button>
      </div>
    </div>
  );
}
