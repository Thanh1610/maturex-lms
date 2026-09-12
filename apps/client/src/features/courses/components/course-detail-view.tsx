"use client";

import { useState } from "react";
import { Button, Icon, toast } from "@maturex/ui";
import type { Course } from "../mock-courses";
import type { ClientCourseDetail } from "../services/course-service";
import { topicDetails } from "../mock-courses";
import { CourseCurriculum } from "./course-curriculum";
import { CourseDetailHeader } from "./course-detail-header";
import { CoursePlayer } from "./course-player";
import { CourseTabsContent } from "./course-tabs-content";
import { CourseTutor } from "./course-tutor";

interface CourseDetailViewProps {
  course: ClientCourseDetail | Course;
}

export function CourseDetailView({ course }: CourseDetailViewProps) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  // Đọc nội dung slide từ DB lesson nếu có, fallback về topicDetails hoặc mặc định
  const detailCourse = "lessonsList" in course ? (course as ClientCourseDetail) : null;
  const currentLessonContent = detailCourse?.lessonsList?.[currentLesson]?.content;

  const slides = currentLessonContent
    ? currentLessonContent
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : topicDetails[course.id] ||
      topicDetails.ai || [
        course.title,
        "Nêu bối cảnh, mục tiêu và yêu cầu cốt lõi.",
        "Đối chiếu tài liệu và tiến hành thực hành.",
        "Tự kiểm tra kết quả và tổng kết bài học.",
      ];

  const isCurrentLessonDone = completedLessons.includes(currentLesson);

  const handleToggleLessonStatus = () => {
    if (!enrolled) {
      setEnrolled(true);
      toast.success("Đã ghi danh khóa học", {
        description: `Bắt đầu học: "${course.title}"`,
      });
      return;
    }

    if (isCurrentLessonDone) {
      setCompletedLessons((prev) => prev.filter((idx) => idx !== currentLesson));
      toast.info("Đã hủy đánh dấu hoàn thành bài học", {
        description: course.lessons[currentLesson],
      });
    } else {
      setCompletedLessons((prev) => [...prev, currentLesson]);
      toast.success("Đã hoàn thành bài học!", {
        description: course.lessons[currentLesson],
      });
    }
  };

  return (
    <div className="course-detail-container pb-12">
      <CourseDetailHeader course={course} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        {/* Main Column */}
        <div className="main-content min-w-0">
          <CoursePlayer
            course={course}
            currentLessonIndex={currentLesson}
            slides={slides}
          />

          {/* Lesson Actions Banner */}
          <div className="flex items-center justify-between gap-4 my-5 bg-white p-4 rounded-xl border border-[#e9eaf0]">
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-[#8b7e9b] uppercase block mb-1">
                BẠN ĐANG HỌC
              </span>
              <h3 className="text-sm font-semibold text-[#483959] m-0">
                {course.lessons[currentLesson] || "Bài học giới thiệu"}
              </h3>
            </div>

            <Button
              variant={isCurrentLessonDone ? "secondary" : "default"}
              className={`text-xs flex items-center gap-2 rounded-lg font-medium transition-colors ${
                isCurrentLessonDone
                  ? "bg-[#e8f4eb] text-[#347847] hover:bg-[#ddedd0]"
                  : enrolled
                    ? "bg-[#71548e] text-white hover:bg-[#60447a]"
                    : "bg-[#71548e] text-white hover:bg-[#60447a]"
              }`}
              onClick={handleToggleLessonStatus}
            >
              <Icon
                name={
                  isCurrentLessonDone
                    ? "CheckCircle2"
                    : enrolled
                      ? "Check"
                      : "Plus"
                }
                size={16}
              />
              <span>
                {isCurrentLessonDone
                  ? "Đã hoàn thành"
                  : enrolled
                    ? "Hoàn thành bài học"
                    : "Đăng ký học"}
              </span>
            </Button>
          </div>

          <CourseTabsContent course={course} slides={slides} />
        </div>

        {/* Sidebar Column */}
        <div className="sidebar-column flex flex-col gap-6">
          <CourseCurriculum
            course={course}
            currentLesson={currentLesson}
            completedLessons={completedLessons}
            onSelectLesson={(idx) => setCurrentLesson(idx)}
          />

          <CourseTutor course={course} />
        </div>
      </div>
    </div>
  );
}
