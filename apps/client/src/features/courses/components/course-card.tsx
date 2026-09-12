import { Button, Card, Icon, Progress, toast } from "@maturex/ui";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/api-routes";
import type { Course } from "../mock-courses";
import type { ClientCourseListItem } from "../services/course-service";

type CourseCardData = ClientCourseListItem | Course;

export function CourseCover({
  course,
  small = false,
}: {
  course: CourseCardData;
  small?: boolean;
}) {
  return (
    <div
      className={`course-cover ${course.color} ${small ? "small h-[100px]" : "h-[148px] max-sm:h-[145px] max-[440px]:h-[170px]"} relative overflow-hidden flex flex-col p-[20px_23px] max-sm:p-[19px] max-[440px]:p-6 isolate`}
    >
      <span className="cover-brand text-xs tracking-[-0.6px] font-[650] opacity-55">
        mature<span>x</span>{" "}
        <i className="text-[10px] not-italic font-normal tracking-[0.4px] ml-[7px] pl-2 border-l border-current">
          learning
        </i>
      </span>
      <span className="cover-title text-[19px] max-sm:text-[18px] max-[440px]:text-[24px] tracking-[-0.4px] font-semibold leading-[1.3] mt-[18px] z-[1] max-w-[70%] max-[440px]:max-w-[65%]">
        {course.label || "LEARN & GROW"}
      </span>
      <span className="absolute right-5 top-[37px] max-sm:right-3 max-sm:top-[43px] max-[440px]:right-7 max-[440px]:top-11 opacity-45 stroke-1 pointer-events-none">
        <Icon name={course.icon} size={small ? 44 : 76} />
      </span>
      <span className="cover-index text-[10px] tracking-[1.3px] uppercase mt-auto opacity-75">
        {course.category}
      </span>
    </div>
  );
}

export function CourseCard({
  course,
  isSaved,
  onToggleBookmark,
}: {
  course: CourseCardData;
  isSaved?: boolean;
  onToggleBookmark?: () => void;
}) {
  const courseUrl = `${APP_ROUTES.courses}/${course.id}`;

  return (
    <Card className="course-card relative overflow-hidden transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_25px_#4435500b] flex flex-col p-0 gap-0">
      <Link
        href={courseUrl}
        className="cover-link p-0 w-full h-auto block text-left cursor-pointer rounded-none"
        aria-label={`Mở khóa học ${course.title}`}
      >
        <CourseCover course={course} />
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className={`bookmark ${isSaved ? "saved text-[#8d73b0] bg-white" : "text-[#a49aaf] bg-white/65"} absolute right-3 top-3 h-8 w-8 rounded-md p-1.5 z-[3] cursor-pointer hover:bg-white hover:text-[#7d60a5] transition-colors`}
        aria-label={isSaved ? `Bỏ lưu ${course.title}` : `Lưu ${course.title}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleBookmark?.();
          toast.success(
            isSaved ? "Đã bỏ lưu khóa học" : "Đã lưu khóa học vào danh sách",
            {
              description: course.title,
            },
          );
        }}
      >
        <Icon name="Bookmark" size={17} />
      </Button>

      <div className="course-info p-[18px_19px_13px] max-sm:p-4 max-[440px]:p-5 flex flex-col flex-1">
        <div className="between flex items-center justify-between gap-[14px]">
          <span className="category text-xs text-[#7a6096] tracking-[0.15px] font-semibold">
            {course.category}
          </span>
          <span className="text-xs text-[#6e6878] font-medium">
            {course.level}
          </span>
        </div>

        <Link
          href={courseUrl}
          className="title-link h-auto block text-left text-[14px] max-sm:text-[13px] max-[440px]:text-[16px] font-[550] leading-[1.7] my-[9px] mb-3 p-0 min-h-[48px] max-sm:min-h-[44px] max-[440px]:min-h-0 tracking-[-0.25px] text-[#2d2838] hover:text-[#6b57bd] transition-colors"
        >
          {course.title}
        </Link>

        <div className="course-meta flex flex-wrap gap-3 max-sm:gap-2 text-xs text-[#6e6878] items-center font-normal">
          <span className="flex items-center gap-1.25">
            <Icon name="Video" size={14} className="text-[#8b8296]" />
            {course.lessons.length} bài học
          </span>
          <span className="flex items-center gap-1.25">
            <Icon name="Clock" size={14} className="text-[#8b8296]" />
            {course.duration}
          </span>
        </div>

        {course.progress !== undefined ? (
          <div className="mt-3 pt-1">
            <Progress value={course.progress} className="h-1.5" />
            <div className="between flex items-center justify-between gap-[14px] text-xs mt-2">
              <span className="text-[#595364] font-medium">
                {course.progress === 100
                  ? "Đã hoàn thành"
                  : `${course.progress}% hoàn thành`}
              </span>
              <Link
                href={courseUrl}
                className="text-btn h-auto inline-flex items-center gap-[7px] text-xs font-semibold text-[#6b57bd] py-[3px] px-0 whitespace-nowrap hover:text-[#4b3c88] transition-colors"
              >
                {course.progress === 100 ? "Xem lại" : "Tiếp tục học"}
                <Icon name="ArrowRight" size={15} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="course-footer flex items-center gap-[7px] text-xs text-[#6e6878] border-t border-[#f0edf5] mt-[17px] pt-[13px]">
            <span className="teacher-dot w-[22px] h-[22px] rounded-full bg-[#eee8f8] text-[#6b57bd] font-semibold flex items-center justify-center text-[11px]">
              {course.teacher.slice(0, 1)}
            </span>
            <span className="font-medium text-[#463f52]">{course.teacher}</span>
            <span className="students ml-auto flex gap-[5px] items-center text-[#6e6878]">
              <Icon name="Users" size={14} className="text-[#8b8296]" />
              {course.students}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
