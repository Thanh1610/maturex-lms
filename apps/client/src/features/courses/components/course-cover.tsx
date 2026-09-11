import type { Course } from "../mock-courses";

export function CourseCover({
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
      <span className="cover-index text-[10px] tracking-[1.3px] uppercase mt-auto opacity-75">
        {course.category}
      </span>
    </div>
  );
}
