import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@maturex/ui";
import { getCourseById } from "@/features/courses/services/course-service";
import { CourseForm } from "@/features/courses/components/course-form";

interface EditCoursePageProps {
  params: Promise<{
    id: string;
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

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="courses-container pb-12 max-w-5xl mx-auto">
      <PageHead
        eyebrow="QUẢN TRỊ NỘI DUNG"
        title={`Chỉnh sửa: ${course.title}`}
        description={`Cập nhật thông tin chi tiết, trạng thái hiển thị và hình thức cho khóa học (Mã: ${course.id}).`}
      />

      <div className="mt-6">
        <CourseForm
          mode="edit"
          courseId={course.id}
          initialData={{
            title: course.title,
            category: course.category,
            description: course.description,
            teacher: course.teacher,
            duration: course.duration,
            level: course.level,
            color: course.color,
            icon: course.icon,
            label: course.label || "",
            skill: course.skill || "",
            status: course.status,
          }}
        />
      </div>
    </div>
  );
}
