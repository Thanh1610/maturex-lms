import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@maturex/ui";
import { getCourseById } from "@/features/courses/services/course-service";
import { CourseEditTabs } from "@/features/courses/components/course-edit-tabs";

interface EditCoursePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditCoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseById(id);

  return {
    title: course
      ? `Chỉnh sửa: ${course.title} · MatureX LMS`
      : "Chỉnh sửa khóa học · MatureX LMS",
    description: "Cập nhật thông tin chi tiết và thiết lập khóa học.",
  };
}

export default async function EditCoursePage({
  params,
  searchParams,
}: EditCoursePageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  const initialTab = tab === "lessons" ? "lessons" : "info";

  return (
    <div className="courses-container pb-12 max-w-5xl mx-auto">
      <PageHead
        eyebrow="QUẢN TRỊ NỘI DUNG"
        title={`Chỉnh sửa: ${course.title}`}
        description={`Cập nhật thông tin chi tiết, trạng thái hiển thị và hình thức cho khóa học (Mã: ${course.id}).`}
      />

      <div className="mt-6">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-[#8e829d] bg-white rounded-xl border border-[#e9eaf0]">
              Đang tải nội dung...
            </div>
          }
        >
          <CourseEditTabs course={course} initialTab={initialTab} />
        </Suspense>
      </div>
    </div>
  );
}
