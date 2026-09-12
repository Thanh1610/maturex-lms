"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  SimpleTooltip,
  toast,
} from "@maturex/ui";
import { APP_ROUTES } from "@/lib/api-routes";
import { DataTable, type DataTableColumn, type DataTableFilter } from "@/components/ui/data-table";
import type { CourseListItem } from "../services/course-service";
import {
  deleteCourseAction,
  deleteBulkCoursesAction,
  toggleCourseStatusAction,
} from "../actions/course-actions";

interface CourseTableProps {
  initialCourses?: CourseListItem[];
}

export function CourseTable({ initialCourses = [] }: CourseTableProps) {
  const [courses, setCourses] = useState<CourseListItem[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CourseListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Danh sách categories động theo dữ liệu
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  // Bộ lọc dữ liệu
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || c.category === categoryFilter;
      const matchStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [courses, searchTerm, categoryFilter, statusFilter]);

  // Đổi trạng thái hiển thị
  const handleToggleStatus = async (course: CourseListItem) => {
    const nextStatus: "published" | "draft" =
      course.status === "published" ? "draft" : "published";

    setUpdatingId(course.id);
    try {
      const res = await toggleCourseStatusAction(course.id, nextStatus);
      if (!res.success) {
        toast.error(res.error || "Cập nhật trạng thái thất bại");
        return;
      }

      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, status: nextStatus } : c))
      );
      toast.success(
        `Đã đổi trạng thái sang ${nextStatus === "published" ? "Công khai" : "Bản nháp"}`,
        { description: course.title }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Xóa 1 khóa học
  const confirmDeleteSingle = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCourseAction(courseToDelete.id);
      if (!res.success) {
        toast.error(res.error || "Xóa khóa học thất bại");
        return;
      }

      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setSelectedIds((prev) => prev.filter((id) => id !== courseToDelete.id));
      toast.success("Đã xóa khóa học thành công", { description: courseToDelete.title });
      setCourseToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Xóa hàng loạt
  const handleBulkDelete = async (ids: string[]) => {
    const res = await deleteBulkCoursesAction(ids);
    if (!res.success) {
      toast.error(res.error || "Xóa danh sách khóa học thất bại");
      return;
    }

    setCourses((prev) => prev.filter((c) => !ids.includes(c.id)));
    toast.success(`Đã xóa thành công ${ids.length} khóa học`);
    setSelectedIds([]);
  };

  // Cấu hình các bộ lọc cho DataTable
  const filters: DataTableFilter[] = useMemo(
    () => [
      {
        id: "category",
        placeholder: "Tất cả danh mục",
        value: categoryFilter,
        onChange: setCategoryFilter,
        width: "w-[160px]",
        options: [
          { label: "Tất cả danh mục", value: "all" },
          ...categories.map((cat) => ({ label: cat, value: cat })),
        ],
      },
      {
        id: "status",
        placeholder: "Trạng thái",
        value: statusFilter,
        onChange: setStatusFilter,
        width: "w-[140px]",
        options: [
          { label: "Tất cả trạng thái", value: "all" },
          { label: "Đã công khai", value: "published" },
          { label: "Bản nháp", value: "draft" },
          { label: "Lưu trữ", value: "archived" },
        ],
      },
    ],
    [categoryFilter, statusFilter, categories]
  );

  // Định nghĩa các cột hiển thị
  const columns: DataTableColumn<CourseListItem>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Khóa học",
        cell: (c) => (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#f0e7f7] text-[#78599a] flex items-center justify-center shrink-0">
              <Icon name={c.icon || "BookOpen"} size={15} />
            </div>
            <div>
              <span className="font-medium text-[#392e47] block">{c.title}</span>
              <span className="text-[10px] text-[#9386a3]">ID: {c.id}</span>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        header: "Danh mục",
        cell: (c) => (
          <Badge variant="lavender" className="text-[10px] px-2 py-0.5 font-medium">
            {c.category}
          </Badge>
        ),
      },
      {
        key: "level",
        header: "Cấp độ",
        cell: (c) => <span className="text-xs text-[#6e617d]">{c.level}</span>,
      },
      {
        key: "teacher",
        header: "Giảng viên",
        cell: (c) => <span className="text-xs text-[#524462] font-medium">{c.teacher}</span>,
      },
      {
        key: "lessons",
        header: "Bài học / Thời lượng",
        cell: (c) => (
          <span className="text-xs text-[#736682]">
            {c.lessons.length} bài ({c.duration})
          </span>
        ),
      },
      {
        key: "students",
        header: "Học viên",
        cell: (c) => (
          <div className="flex items-center gap-1 text-xs text-[#524462]">
            <Icon name="Users" size={13} className="text-[#968ba3]" />
            <span>{c.students}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        cell: (c) => (
          <Badge
            variant={c.status === "published" ? "green" : "gray"}
            className="text-[10px] cursor-pointer hover:opacity-80 disabled:opacity-50"
            onClick={() => updatingId !== c.id && handleToggleStatus(c)}
            title="Bấm để đổi trạng thái"
          >
            {updatingId === c.id
              ? "Đang lưu..."
              : c.status === "published"
              ? "Công khai"
              : "Bản nháp"}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Thao tác",
        align: "right",
        cell: (c) => (
          <div className="flex items-center justify-end gap-1.5">
            <SimpleTooltip content="Chỉnh sửa khóa học">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#735e89] hover:bg-[#f2ebf8] cursor-pointer"
              >
                <Link href={APP_ROUTES.coursesEdit(c.id)}>
                  <Icon name="Pencil" size={14} />
                  <span className="sr-only">Chỉnh sửa</span>
                </Link>
              </Button>
            </SimpleTooltip>

            <SimpleTooltip content="Xóa khóa học">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCourseToDelete(c)}
                className="h-7 w-7 text-[#ba5b5b] hover:bg-[#fdeeed] hover:text-red-600 cursor-pointer"
              >
                <Icon name="Trash2" size={14} />
                <span className="sr-only">Xóa</span>
              </Button>
            </SimpleTooltip>
          </div>
        ),
      },
    ],
    [updatingId]
  );

  return (
    <>
      <DataTable
        data={filteredCourses}
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm theo tên, giảng viên..."
        filters={filters}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onBulkDelete={handleBulkDelete}
        bulkDeleteLabel="Xóa"
        createAction={{
          label: "Tạo khóa học mới",
          href: APP_ROUTES.coursesNew,
          icon: "Plus",
        }}
        emptyMessage="Không tìm thấy khóa học nào phù hợp với bộ lọc."
      />

      {/* Dialog Xác nhận Xóa 1 khóa học */}
      <Dialog
        open={Boolean(courseToDelete)}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="gap-2">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
              <Icon name="AlertTriangle" size={20} />
            </div>
            <DialogTitle className="text-base font-semibold text-[#2d223c]">
              Xác nhận xóa khóa học
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6e617d] leading-relaxed">
              Bạn có chắc chắn muốn xóa khóa học{" "}
              <strong className="text-[#302540]">
                &quot;{courseToDelete?.title}&quot;
              </strong>{" "}
              khỏi hệ thống? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setCourseToDelete(null)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={confirmDeleteSingle}
              className="text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Đang xóa..." : "Xóa khóa học"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
