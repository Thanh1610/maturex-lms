import { z } from "zod";

export const courseFormSchema = z.object({
  title: z
    .string()
    .min(3, "Tiêu đề khóa học phải có ít nhất 3 ký tự")
    .max(180, "Tiêu đề không được vượt quá 180 ký tự"),
  description: z
    .string()
    .min(10, "Mô tả khóa học phải có ít nhất 10 ký tự"),
  category: z
    .string()
    .min(2, "Vui lòng chọn hoặc nhập danh mục khóa học"),
  teacher: z
    .string()
    .min(2, "Vui lòng nhập tên giảng viên/người phụ trách")
    .max(100, "Tên giảng viên không được quá 100 ký tự"),
  duration: z
    .string()
    .min(1, "Vui lòng nhập thời lượng dự kiến (VD: 2 giờ)"),
  level: z
    .string()
    .min(1, "Vui lòng chọn cấp độ"),
  color: z
    .string()
    .default("lavender"),
  icon: z
    .string()
    .default("Sparkles"),
  label: z
    .string()
    .optional(),
  skill: z
    .string()
    .optional(),
  status: z
    .enum(["published", "draft", "archived"])
    .default("published"),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
