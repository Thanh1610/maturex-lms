export type CourseFormMode = "create" | "edit";

export interface CourseFormData {
  title: string;
  category: string;
  description: string;
  teacher: string;
  duration: string;
  level: string;
  color: string;
  icon: string;
  label?: string;
  skill?: string;
  status: "published" | "draft" | "archived";
}

export const COURSE_LEVEL_OPTIONS = [
  { value: "Nền tảng", label: "Nền tảng" },
  { value: "Ứng dụng", label: "Ứng dụng" },
  { value: "Nâng cao", label: "Nâng cao" },
] as const;

export const COURSE_STATUS_OPTIONS = [
  { value: "published", label: "Công khai (Published)" },
  { value: "draft", label: "Bản nháp (Draft)" },
  { value: "archived", label: "Lưu trữ (Archived)" },
] as const;

export const COURSE_COLOR_OPTIONS = [
  { value: "lavender", label: "Lavender (Tím nhạt)", bg: "#e8dcf5", border: "#c8b0e8" },
  { value: "green", label: "Green (Xanh lá)", bg: "#ddf3e4", border: "#9ddcb0" },
  { value: "peach", label: "Peach (Cam đào)", bg: "#fde2d4", border: "#f6b89c" },
  { value: "blue", label: "Blue (Xanh dương)", bg: "#d9eafc", border: "#9ec4f5" },
  { value: "pink", label: "Pink (Hồng pastel)", bg: "#fce0ec", border: "#f5adc8" },
  { value: "sand", label: "Sand (Vàng cát)", bg: "#f5edd8", border: "#dfcf9e" },
  { value: "gray", label: "Gray (Xám thanh lịch)", bg: "#ebebed", border: "#cbcbcf" },
] as const;

export const COURSE_ICON_OPTIONS = [
  { value: "Sparkles", label: "Sparkles (Ngôi sao)" },
  { value: "Compass", label: "Compass (La bàn)" },
  { value: "Brain", label: "Brain (Tư duy/Não bộ)" },
  { value: "Users", label: "Users (Đội ngũ)" },
  { value: "Target", label: "Target (Mục tiêu)" },
  { value: "Lightbulb", label: "Lightbulb (Ý tưởng)" },
  { value: "BookOpen", label: "BookOpen (Sách vở)" },
  { value: "GraduationCap", label: "GraduationCap (Học thuật)" },
] as const;

export const COURSE_CATEGORY_SUGGESTIONS = [
  "AI & Dữ liệu",
  "Văn hóa & Hợp tác",
  "Nghiên cứu & Thấu cảm",
  "Tư duy & Phản biện",
  "Lãnh đạo & Coaching",
  "Xây dựng sản phẩm",
  "Kỹ năng chung",
] as const;
