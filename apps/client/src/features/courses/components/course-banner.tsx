import Image from "next/image";

interface CourseBannerProps {
  className?: string;
}

export function CourseBanner({ className }: CourseBannerProps) {
  return (
    <div
      className={`library-banner relative w-full mb-7 rounded-[14px] overflow-hidden shadow-sm ${
        className || ""
      }`}
    >
      <Image
        src="/images/course-banner-v2.webp"
        alt="AI là cộng sự. Bạn là người dẫn đường. Học cách làm việc cùng AI một cách chủ động và có kiểm chứng."
        width={2167}
        height={726}
        priority
        className="w-full h-auto object-cover block rounded-[14px]"
        sizes="(max-width: 1200px) 100vw, 1200px"
      />
    </div>
  );
}
