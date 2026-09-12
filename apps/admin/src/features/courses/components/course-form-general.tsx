import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@maturex/ui";
import {
  COURSE_CATEGORY_SUGGESTIONS,
  type CourseFormData,
} from "../constants/course-constants";

interface CourseFormGeneralProps {
  formData: CourseFormData;
  errors: Record<string, string>;
  customCategory: string;
  onUpdateField: <K extends keyof CourseFormData>(
    field: K,
    value: CourseFormData[K],
  ) => void;
  onCategorySelect: (value: string) => void;
  onCustomCategoryChange: (value: string) => void;
}

export function CourseFormGeneral({
  formData,
  errors,
  customCategory,
  onUpdateField,
  onCategorySelect,
  onCustomCategoryChange,
}: CourseFormGeneralProps) {
  const isCustom =
    !COURSE_CATEGORY_SUGGESTIONS.includes(
      formData.category as (typeof COURSE_CATEGORY_SUGGESTIONS)[number],
    ) || customCategory !== "";

  return (
    <div className="space-y-5">
      <div className="border-b border-[#f0edf5] pb-3">
        <h3 className="text-sm font-semibold text-[#302540]">
          Thông tin chung khóa học
        </h3>
        <p className="text-xs text-[#80768e]">
          Các thông tin cơ bản sẽ hiển thị trên thẻ và trang tổng quan của học
          viên.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-xs font-semibold text-[#483c58]">
          Tiêu đề khóa học <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="VD: Làm việc cùng AI: từ câu hỏi đến kết quả"
          value={formData.title}
          onChange={(e) => onUpdateField("title", e.target.value)}
          className="text-sm h-10"
        />
        {errors.title ? (
          <p className="text-[11px] text-red-500">{errors.title}</p>
        ) : null}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-xs font-semibold text-[#483c58]"
        >
          Tổng quan khóa học <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="description"
          rows={4}
          placeholder="Mô tả tóm tắt giá trị khóa học, nội dung cốt lõi và kỹ năng đạt được..."
          value={formData.description}
          onChange={(e) => onUpdateField("description", e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
        />
        {errors.description ? (
          <p className="text-[11px] text-red-500">{errors.description}</p>
        ) : null}
      </div>

      {/* Category & Teacher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="category"
            className="text-xs font-semibold text-[#483c58]"
          >
            Danh mục khóa học <span className="text-red-500">*</span>
          </Label>
          <Select
            value={
              COURSE_CATEGORY_SUGGESTIONS.includes(
                formData.category as (typeof COURSE_CATEGORY_SUGGESTIONS)[number],
              )
                ? formData.category
                : "__custom__"
            }
            onValueChange={onCategorySelect}
          >
            <SelectTrigger id="category" className="text-xs h-10">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {COURSE_CATEGORY_SUGGESTIONS.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
              <SelectItem value="__custom__">
                + Tùy chỉnh danh mục khác...
              </SelectItem>
            </SelectContent>
          </Select>

          {isCustom ? (
            <Input
              placeholder="Nhập tên danh mục mới..."
              value={customCategory || formData.category}
              onChange={(e) => onCustomCategoryChange(e.target.value)}
              className="text-xs h-9 mt-2"
            />
          ) : null}
          {errors.category ? (
            <p className="text-[11px] text-red-500">{errors.category}</p>
          ) : null}
        </div>

        {/* Teacher name */}
        <div className="space-y-2">
          <Label
            htmlFor="teacher"
            className="text-xs font-semibold text-[#483c58]"
          >
            Tác giả / Giảng viên phụ trách{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="teacher"
            placeholder="VD: Ngọc Linh, Đội ngũ MatureX..."
            value={formData.teacher}
            onChange={(e) => onUpdateField("teacher", e.target.value)}
            className="text-sm h-10"
          />
          <p className="text-[11px] text-[#968ca2]">
            Nhập tên hiển thị trên thẻ khóa học (tùy ý).
          </p>
          {errors.teacher ? (
            <p className="text-[11px] text-red-500">{errors.teacher}</p>
          ) : null}
        </div>
      </div>

      {/* Label Badge & Skill Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Label
            htmlFor="label"
            className="text-xs font-semibold text-[#483c58]"
          >
            Nhãn hiển thị (Label / Badge)
          </Label>
          <Input
            id="label"
            placeholder="VD: AI IN PRACTICE, HOT..."
            value={formData.label || ""}
            onChange={(e) => onUpdateField("label", e.target.value)}
            className="text-xs h-9"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="skill"
            className="text-xs font-semibold text-[#483c58]"
          >
            Kỹ năng rèn luyện (Skill)
          </Label>
          <Input
            id="skill"
            placeholder="VD: Giao việc & Kiểm chứng AI..."
            value={formData.skill || ""}
            onChange={(e) => onUpdateField("skill", e.target.value)}
            className="text-xs h-9"
          />
        </div>
      </div>
    </div>
  );
}
