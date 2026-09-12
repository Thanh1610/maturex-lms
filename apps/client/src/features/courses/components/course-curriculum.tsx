"use client";

import Link from "next/link";
import { Button, Card, Icon, Progress } from "@maturex/ui";
import { APP_ROUTES } from "@/lib/api-routes";
import type { Course } from "../mock-courses";

interface CourseCurriculumProps {
  course: Course;
  currentLesson: number;
  completedLessons: number[];
  onSelectLesson: (index: number) => void;
}

export function CourseCurriculum({
  course,
  currentLesson,
  completedLessons,
  onSelectLesson,
}: CourseCurriculumProps) {
  const totalLessons = course.lessons.length;
  const percentCompleted =
    totalLessons > 0
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;

  return (
    <Card className="curriculum-panel p-5">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-semibold text-[#57446b] m-0">
          Nội dung khóa học
        </h3>
        <span className="text-[11px] font-medium text-[#8f839d]">
          {completedLessons.length}/{totalLessons}
        </span>
      </div>

      <div className="my-3">
        <Progress value={percentCompleted} className="h-1.5" />
      </div>

      <div className="lesson-list -mx-2 -mb-2 space-y-1">
        {course.lessons.map((lessonTitle, i) => {
          const isDone = completedLessons.includes(i);
          const isCurrent = currentLesson === i;

          return (
            <button
              key={lessonTitle}
              type="button"
              className={`w-full flex items-center gap-3 text-left rounded-lg p-2.5 transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-[#f2ecf9] text-[#71548e]"
                  : "text-[#766c83] hover:bg-[#faf7fd]"
              }`}
              onClick={() => onSelectLesson(i)}
            >
              <span className="shrink-0 mt-0.5">
                {isDone ? (
                  <Icon name="CheckCircle2" size={17} className="text-[#59a073]" />
                ) : isCurrent ? (
                  <Icon name="Play" size={16} className="text-[#71548e]" />
                ) : (
                  <Icon name="Circle" size={16} className="text-[#c1b4cf]" />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <strong className="block text-xs leading-snug font-medium text-[#443851] truncate">
                  {String(i + 1).padStart(2, "0")}. {lessonTitle}
                </strong>
                <span className="block text-[10px] text-[#9a8ea6] mt-0.5">
                  Video & thực hành
                </span>
              </div>
            </button>
          );
        })}

        <Link
          href={APP_ROUTES.assignments}
          className="w-full flex items-center gap-3 text-left p-3 mt-2 border-t border-[#f0ebf5] text-[#766c83] hover:bg-[#faf7fd] rounded-lg transition-colors cursor-pointer"
        >
          <Icon name="ClipboardCheck" size={18} className="text-[#8467a3] shrink-0" />
          <div className="flex-1 min-w-0">
            <strong className="block text-xs leading-snug font-medium text-[#443851]">
              Bài thực hành cuối khóa
            </strong>
            <span className="block text-[10px] text-[#9a8ea6] mt-0.5">
              Nộp bài & nhận phản hồi
            </span>
          </div>
          <Icon name="ArrowUpRight" size={15} className="text-[#baa0cd] shrink-0" />
        </Link>
      </div>
    </Card>
  );
}
