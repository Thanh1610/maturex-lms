/**
 * Chuyển đổi chuỗi tiếng Việt / ký tự đặc biệt thành URL slug thân thiện
 * Ví dụ: "AI & Dữ liệu" -> "ai-va-du-lieu"
 *         "Nền tảng" -> "nen-tang"
 *         "Lãnh đạo & Coaching" -> "lanh-dao-va-coaching"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "va")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Tìm kiếm giá trị nguyên bản từ danh sách tùy chọn dựa vào slug
 * Nếu không khớp slug nào, trả về fallbackValue
 */
export function findFromSlug<T extends string>(
  slug: string | null | undefined,
  options: readonly T[] | T[],
  fallbackValue: T
): T {
  if (!slug) return fallbackValue;
  const match = options.find((opt) => slugify(opt) === slug);
  return match || fallbackValue;
}
