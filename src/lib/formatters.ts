export const roleLabels: Record<string, string> = {
  admin: "Quản trị",
  instructor: "Giảng viên",
  learner: "Người học",
  manager: "Quản lý",
};

export const statusLabels: Record<string, string> = {
  draft: "Bản nháp",
  published: "Đã phát hành",
  archived: "Đã lưu trữ",
  todo: "Chưa nộp",
  submitted: "Chờ đánh giá",
  revision: "Cần bổ sung",
  approved: "Đã đạt",
};

export const dateLabel = (value: string | number | Date) =>
  new Date(value).toLocaleString("vi-VN");

export const normalize = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
