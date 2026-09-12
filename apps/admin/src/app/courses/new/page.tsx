import type { Metadata } from "next";
import { PageHead } from "@maturex/ui";
import { CourseForm } from "@/features/courses/components/course-form";

export const metadata: Metadata = {
  title: "Tạo khóa học mới · MatureX LMS",
  description: "Khởi tạo chương trình đào tạo mới trên hệ thống MatureX.",
};

export default function NewCoursePage() {
  return (
    <div className="courses-container pb-12 max-w-5xl mx-auto">
      <PageHead
        eyebrow="QUẢN TRỊ NỘI DUNG"
        title="Tạo khóa học mới"
        description="Nhập thông tin cơ bản để khởi tạo khóa học. Bạn có thể bổ sung các bài học và nội dung chi tiết sau."
      />

      <div className="mt-6">
        <CourseForm mode="create" />
      </div>
    </div>
  );
}
