import { PageHead } from "@maturex/ui";
import { CourseBanner } from "./course-banner";
import { CourseInteractiveSection } from "./course-interactive-section";

/**
 * CourseView - Server Component (SSR by default)
 * Only interactive filters and cards run as client boundaries.
 */
export function CourseView() {
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
      <CourseInteractiveSection />
    </div>
  );
}
