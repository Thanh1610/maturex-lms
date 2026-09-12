import { PageHead } from "@maturex/ui";
import { Suspense } from "react";
import { getPublishedCourses } from "../services/course-service";
import { CourseBanner } from "./course-banner";
import { CourseInteractiveSection } from "./course-interactive-section";

/**
 * CourseView - Server Component (SSR by default)
 * Fetches published courses directly from Postgres via Prisma.
 */
export async function CourseView() {
  const initialCourses = await getPublishedCourses();

  return (
    <div className="courses-container pb-12">
      {/* SSR Header */}
      <PageHead
        eyebrow="KHÁM PHÁ & HỌC HỎI"
        title="Thư viện học tập"
        description="Tri thức được sẻ chia. Năng lực được nuôi dưỡng."
      />

      {/* SSR Featured Collection Banner */}
      <CourseBanner />

      {/* Client Boundary for Dynamic Tabs, Filtering & Interactive Cards */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <CourseInteractiveSection initialCourses={initialCourses} />
      </Suspense>
    </div>
  );
}
