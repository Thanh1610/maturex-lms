"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { ClientCourseDetail } from "../services/course-service";
import { CourseCurriculum } from "./course-curriculum";
import { CourseDetailHeader } from "./course-detail-header";
import { CoursePlayer } from "./course-player";
import { CourseTabsContent } from "./course-tabs-content";
import { CourseTutor } from "./course-tutor";

interface CourseDetailViewProps {
  course: ClientCourseDetail;
  initialLessonParam?: string;
}

export function CourseDetailView({
  course,
  initialLessonParam,
}: CourseDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const lessons = useMemo(() => {
    if (course.lessonsList && course.lessonsList.length > 0) {
      return course.lessonsList;
    }
    // Fallback nếu course chỉ có mảng string titles
    return course.lessons.map((title, idx) => ({
      id: `lesson-${idx}`,
      position: idx + 1,
      title,
      content: "",
      videoUrl: null,
      slideUrl: null,
    }));
  }, [course]);

  // Đọc lesson index từ URL param (?lesson=1 -> index 0)
  const lessonParam = searchParams.get("lesson") || initialLessonParam;
  const initialLessonIndex = useMemo(() => {
    if (!lessonParam) return 0;
    const parsed = parseInt(lessonParam, 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= lessons.length) {
      return parsed - 1;
    }
    // Hỗ trợ tìm theo lesson ID nếu param là id
    const foundById = lessons.findIndex((l) => l.id === lessonParam);
    return foundById !== -1 ? foundById : 0;
  }, [lessonParam, lessons]);

  const [currentLesson, setCurrentLesson] =
    useState<number>(initialLessonIndex);

  // Sync state khi người dùng back/forward trình duyệt
  useEffect(() => {
    setCurrentLesson(initialLessonIndex);
  }, [initialLessonIndex]);

  const handleSelectLesson = useCallback(
    (index: number) => {
      setCurrentLesson(index);
      const params = new URLSearchParams(searchParams.toString());
      if (index === 0) {
        params.delete("lesson");
      } else {
        params.set("lesson", String(index + 1));
      }
      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    },
    [searchParams, pathname, router],
  );

  const currentLessonData = lessons[currentLesson] || lessons[0];
  const lessonTitle = currentLessonData?.title || "Bài học giới thiệu";
  const lessonContent = currentLessonData?.content || "";
  const lessonVideoUrl = currentLessonData?.videoUrl;
  const lessonSlideUrl = currentLessonData?.slideUrl;

  return (
    <div className="course-detail-container pb-12">
      <CourseDetailHeader course={course} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        {/* Main Column */}
        <div className="main-content min-w-0">
          <CoursePlayer
            courseTitle={course.title}
            lessonTitle={lessonTitle}
            videoUrl={lessonVideoUrl}
            slideUrl={lessonSlideUrl}
            content={lessonContent}
          />

          {/* Lesson Info Banner */}
          <div className="flex items-center justify-between gap-4 my-5 bg-white p-4 rounded-xl border border-[#e9eaf0]">
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-[#8b7e9b] uppercase block mb-1">
                BẠN ĐANG HỌC
              </span>
              <h3 className="text-sm font-semibold text-[#483959] m-0">
                {lessonTitle}
              </h3>
            </div>

            <div className="text-xs text-[#8d829e]">
              Bài {currentLesson + 1} / {lessons.length}
            </div>
          </div>

          <CourseTabsContent
            courseDescription={course.description}
            lessonTitle={lessonTitle}
            lessonContent={lessonContent}
          />
        </div>

        {/* Sidebar Column */}
        <div className="sidebar-column flex flex-col gap-6">
          <CourseCurriculum
            lessons={lessons}
            currentLesson={currentLesson}
            onSelectLesson={handleSelectLesson}
          />

          <CourseTutor
            courseTitle={course.title}
            courseDescription={course.description}
          />
        </div>
      </div>
    </div>
  );
}
