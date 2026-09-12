import { PageHead } from "@maturex/ui";
import { getCoursesList } from "../services/course-service";
import { CourseTable } from "./course-table";

/**
 * CourseView for Admin - Server Component fetching data from DB and passing to CourseTable
 */
export async function CourseView() {
  const initialCourses = await getCoursesList();

  return (
    <div className="courses-container pb-12">
      <PageHead
        eyebrow="QUẢN TRỊ NỘI DUNG"
        title="Danh sách khóa học"
        description="Quản lý toàn bộ chương trình đào tạo, tài liệu và trạng thái hiển thị trên hệ thống."
      />

      <CourseTable initialCourses={initialCourses} />
    </div>
  );
}
