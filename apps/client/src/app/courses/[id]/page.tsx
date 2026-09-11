import type { Metadata } from "next";
import Link from "next/link";
import { Button, Card } from "@maturex/ui";
import { CourseDetailView } from "@/features/courses/components/course-detail-view";
import { getCourseById, mockCourses } from "@/features/courses/mock-courses";
import { APP_ROUTES } from "@/lib/api-routes";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) {
    return {
      title: "Khóa học không tồn tại | MatureX LMS",
    };
  }

  return {
    title: `${course.title} | MatureX LMS`,
    description: course.description,
  };
}

export function generateStaticParams() {
  return mockCourses.map((c) => ({
    id: c.id,
  }));
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <Card className="max-w-md p-8 bg-white border border-[#e9eaf0] rounded-xl flex flex-col items-center shadow-none">
          <h2 className="text-lg font-semibold text-[#483959] mb-2">
            Không tìm thấy khóa học
          </h2>
          <p className="text-xs text-[#736783] mb-6 leading-relaxed">
            Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
          <Button asChild className="bg-[#71548e] text-white hover:bg-[#60447a] text-xs">
            <Link href={APP_ROUTES.courses}>Về thư viện khóa học</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return <CourseDetailView course={course} />;
}
