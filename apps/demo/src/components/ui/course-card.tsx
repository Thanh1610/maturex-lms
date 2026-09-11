import { useApp } from "@/hooks/use-app";
import type { Course } from "@/types/index";
import { Icon } from "./icon";
import { Progress } from "./progress";

export function Cover({
  course,
  small = false,
}: {
  course: Course;
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
  progress: done,
  compact = false,
}: {
  course: Course;
  progress?: number;
  compact?: boolean;
}) {
  const appContext = useApp();
  const state = appContext?.state ?? { bookmarks: [] };
  const dispatch = appContext?.dispatch ?? (() => {});
  const go =
    appContext?.go ??
    ((path: string) => {
      window.location.href = `/${path.replace(/^#/, "")}`;
    });
  const isSaved = state.bookmarks?.includes(course.id);

  return (
    <article
      className={`course-card ${compact ? "compact" : ""} relative rounded-[11px] bg-white border border-[var(--border,#e9eaf0)] overflow-hidden transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_25px_#4435500b] flex flex-col`}
    >
      <button
        className="cover-link p-0 w-full block text-left cursor-pointer"
        onClick={() => go(`course/${course.id}`)}
        aria-label={`Mở khóa học ${course.title}`}
      >
        <Cover course={course} />
      </button>
      <button
        className={`bookmark ${isSaved ? "saved text-[#8d73b0] bg-white" : "text-[#a49aaf] bg-white/65"} absolute right-3 top-3 flex items-center justify-center rounded-md p-1.5 z-[3] cursor-pointer hover:bg-white`}
        aria-label={isSaved ? `Bỏ lưu ${course.title}` : `Lưu ${course.title}`}
        onClick={() => dispatch({ type: "bookmark", id: course.id })}
      >
        <Icon name="Bookmark" size={17} />
      </button>
      <div className="course-info p-[18px_19px_13px] max-sm:p-4 max-[440px]:p-5 flex flex-col flex-1">
        <div className="between flex items-center justify-between gap-[14px]">
          <span className="category text-xs text-[#7a6096] tracking-[0.15px] font-semibold">
            {course.category}
          </span>
          <span className="text-xs text-[#6e6878] font-medium">
            {course.level}
          </span>
        </div>
        <button
          className="title-link block text-left text-[14px] max-sm:text-[13px] max-[440px]:text-[16px] font-[550] leading-[1.7] my-[9px] mb-3 p-0 min-h-[48px] max-sm:min-h-[44px] max-[440px]:min-h-0 tracking-[-0.25px] text-[#2d2838] hover:text-[#6b57bd] cursor-pointer"
          onClick={() => go(`course/${course.id}`)}
        >
          {course.title}
        </button>
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
        {done !== undefined ? (
          <>
            <Progress value={done} />
            <div className="between flex items-center justify-between gap-[14px] text-xs mt-auto pt-1">
              <span className="text-[#595364] font-medium">
                {done === 100 ? "Đã hoàn thành" : `${done}% hoàn thành`}
              </span>
              <button
                className="text-btn inline-flex items-center gap-[7px] text-xs font-semibold text-[#6b57bd] py-[3px] px-0 whitespace-nowrap cursor-pointer hover:text-[#4b3c88]"
                onClick={() => go(`course/${course.id}`)}
              >
                {done === 100 ? "Xem lại" : "Tiếp tục học"}
                <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </>
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
    </article>
  );
}
