"use client";

import { Card, Icon } from "@maturex/ui";
import type { ClientLessonItem } from "../services/course-service";

interface CourseCurriculumProps {
  lessons: (ClientLessonItem | { title: string; id?: string })[];
  currentLesson: number;
  onSelectLesson: (index: number) => void;
}

export function CourseCurriculum({
  lessons,
  currentLesson,
  onSelectLesson,
}: CourseCurriculumProps) {
  const totalLessons = lessons.length;

  return (
    <Card className="curriculum-panel p-5">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-semibold text-[#57446b] m-0">
          Nội dung khóa học
        </h3>
        <span className="text-[11px] font-medium text-[#8f839d]">
          {totalLessons} bài học
        </span>
      </div>

      <div className="lesson-list -mx-2 -mb-2 space-y-1 mt-3">
        {lessons.map((item, i) => {
          const lessonTitle = item.title;
          const isCurrent = currentLesson === i;

          return (
            <button
              key={item.id || lessonTitle + i}
              type="button"
              className={`w-full flex items-center gap-3 text-left rounded-lg p-2.5 transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-[#f2ecf9] text-[#71548e]"
                  : "text-[#766c83] hover:bg-[#faf7fd]"
              }`}
              onClick={() => onSelectLesson(i)}
            >
              <span className="shrink-0 mt-0.5">
                {isCurrent ? (
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
                  Bài học {i + 1}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
