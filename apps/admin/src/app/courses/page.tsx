import type { Metadata } from "next";
import { CourseView } from "@/features/courses/components/course-view";

export const metadata: Metadata = {
  title: "Khóa học · MatureX LMS",
  description: "Khám phá và tham gia các khóa học chất lượng cao trên MatureX.",
};

export default function CoursesPage() {
  return <CourseView />;
}
