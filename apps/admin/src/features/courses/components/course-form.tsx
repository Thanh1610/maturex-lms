"use client";

import { Button, Card, Icon, toast } from "@maturex/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_ROUTES } from "@/lib/api-routes";
import {
  createCourseAction,
  updateCourseAction,
} from "../actions/course-actions";
import {
  COURSE_CATEGORY_SUGGESTIONS,
  type CourseFormData,
  type CourseFormMode,
} from "../constants/course-constants";
import { CourseFormGeneral } from "./course-form-general";
import { CourseFormSettings } from "./course-form-settings";

export interface CourseFormProps {
  mode: CourseFormMode;
  initialData?: Partial<CourseFormData>;
  courseId?: string;
}

const DEFAULT_FORM_VALUES: CourseFormData = {
  title: "",
  category: "AI & Dữ liệu",
  description: "",
  teacher: "MatureX",
  duration: "2 giờ",
  level: "Nền tảng",
  color: "lavender",
  icon: "Sparkles",
  label: "",
  skill: "",
  status: "published",
};

export function CourseForm({ mode, initialData, courseId }: CourseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    ...DEFAULT_FORM_VALUES,
    ...initialData,
  });
  const [customCategory, setCustomCategory] = useState(
    COURSE_CATEGORY_SUGGESTIONS.includes(
      (initialData?.category ||
        DEFAULT_FORM_VALUES.category) as (typeof COURSE_CATEGORY_SUGGESTIONS)[number],
    )
      ? ""
      : initialData?.category || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof CourseFormData>(
    field: K,
    value: CourseFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCategorySelect = (val: string) => {
    if (val === "__custom__") {
      updateField("category", customCategory || "");
    } else {
      updateField("category", val);
      setCustomCategory("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = "Tiêu đề khóa học phải có ít nhất 3 ký tự";
    }
    if (
      !formData.description.trim() ||
      formData.description.trim().length < 10
    ) {
      newErrors.description = "Tổng quan khóa học phải có ít nhất 10 ký tự";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Vui lòng chọn hoặc nhập danh mục";
    }
    if (!formData.teacher.trim()) {
      newErrors.teacher = "Vui lòng nhập tên giảng viên / người phụ trách";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const res = await createCourseAction(formData);
        if (!res.success) {
          toast.error(res.error || "Tạo khóa học thất bại");
          return;
        }

        toast.success("Tạo khóa học thành công!", {
          description: `Đã tạo "${res.data?.title}"`,
        });
        router.push(APP_ROUTES.courses);
        router.refresh();
      } else {
        if (!courseId) {
          toast.error("Không tìm thấy mã khóa học để cập nhật");
          return;
        }

        const res = await updateCourseAction(courseId, formData);
        if (!res.success) {
          toast.error(res.error || "Cập nhật khóa học thất bại");
          return;
        }

        toast.success("Cập nhật khóa học thành công!", {
          description: `Đã lưu thay đổi cho "${res.data?.title}"`,
        });
        router.push(APP_ROUTES.courses);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information: 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 sm:p-6">
            <CourseFormGeneral
              formData={formData}
              errors={errors}
              customCategory={customCategory}
              onUpdateField={updateField}
              onCategorySelect={handleCategorySelect}
              onCustomCategoryChange={(val) => {
                setCustomCategory(val);
                updateField("category", val);
              }}
            />
          </Card>
        </div>

        {/* Sidebar: Settings, Themes & Publishing */}
        <div className="space-y-6">
          <CourseFormSettings formData={formData} onUpdateField={updateField} />
        </div>
      </div>

      {/* Form Action Buttons Bar */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e9eaf0]">
        <Button
          asChild
          type="button"
          variant="outline"
          className="text-xs h-9 flex items-center gap-1.5"
        >
          <Link href={APP_ROUTES.courses}>
            <Icon name="ArrowLeft" size={14} />
            <span>Quay lại danh sách</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2.5">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#71548e] text-white hover:bg-[#5f447a] text-xs h-9 px-5 flex items-center gap-1.5"
          >
            <Icon name={mode === "create" ? "Plus" : "Check"} size={15} />
            <span>
              {isSubmitting
                ? "Đang xử lý..."
                : mode === "create"
                  ? "Khởi tạo khóa học"
                  : "Lưu thay đổi"}
            </span>
          </Button>
        </div>
      </div>
    </form>
  );
}
