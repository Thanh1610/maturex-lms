import {
  Card,
  Icon,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@maturex/ui";
import {
  type CourseFormData,
  COURSE_COLOR_OPTIONS,
  COURSE_ICON_OPTIONS,
  COURSE_LEVEL_OPTIONS,
  COURSE_STATUS_OPTIONS,
} from "../constants/course-constants";

interface CourseFormSettingsProps {
  formData: CourseFormData;
  onUpdateField: <K extends keyof CourseFormData>(
    field: K,
    value: CourseFormData[K]
  ) => void;
}

export function CourseFormSettings({
  formData,
  onUpdateField,
}: CourseFormSettingsProps) {
  const currentColor =
    COURSE_COLOR_OPTIONS.find((c) => c.value === formData.color) ||
    COURSE_COLOR_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Publishing Card */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#302540] border-b border-[#f0edf5] pb-2">
          Trạng thái & Đăng tải
        </h3>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-[#483c58]">
            Trạng thái hiển thị
          </Label>
          <Select
            value={formData.status}
            onValueChange={(val) =>
              onUpdateField("status", val as CourseFormData["status"])
            }
          >
            <SelectTrigger className="text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COURSE_STATUS_OPTIONS.map((st) => (
                <SelectItem key={st.value} value={st.value}>
                  {st.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-[#968ca2]">
            {formData.status === "published"
              ? "Khóa học sẽ hiển thị ngay cho học viên trên hệ thống."
              : formData.status === "draft"
              ? "Lưu nháp, chỉ admin và tác giả có thể xem."
              : "Khóa học đã đóng và lưu trữ."}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Label className="text-xs font-semibold text-[#483c58]">
            Cấp độ đào tạo
          </Label>
          <Select
            value={formData.level}
            onValueChange={(val) => onUpdateField("level", val)}
          >
            <SelectTrigger className="text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COURSE_LEVEL_OPTIONS.map((lvl) => (
                <SelectItem key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-xs font-semibold text-[#483c58]">
            Thời lượng ước tính
          </Label>
          <Input
            id="duration"
            placeholder="VD: 2 giờ 30 phút"
            value={formData.duration}
            onChange={(e) => onUpdateField("duration", e.target.value)}
            className="text-xs h-9"
          />
        </div>
      </Card>

      {/* Theme & Visuals Card */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#302540] border-b border-[#f0edf5] pb-2">
          Giao diện thẻ khóa học
        </h3>

        {/* Icon Picker */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-[#483c58]">
            Biểu tượng (Icon)
          </Label>
          <Select
            value={formData.icon}
            onValueChange={(val) => onUpdateField("icon", val)}
          >
            <SelectTrigger className="text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COURSE_ICON_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <div className="flex items-center gap-2">
                    <Icon name={item.value} size={14} />
                    <span>{item.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color/Theme Picker */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-[#483c58]">
            Màu sắc chủ đề
          </Label>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {COURSE_COLOR_OPTIONS.map((col) => (
              <button
                key={col.value}
                type="button"
                title={col.label}
                onClick={() => onUpdateField("color", col.value)}
                style={{ backgroundColor: col.bg, borderColor: col.border }}
                className={`h-8 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  formData.color === col.value
                    ? "ring-2 ring-offset-1 ring-[#71548e] scale-105"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                {formData.color === col.value ? (
                  <Icon name="Check" size={14} className="text-[#483c58]" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Mini Preview Box */}
        <div className="pt-2 border-t border-[#f0edf5]">
          <p className="text-[10px] font-medium text-[#968ca2] uppercase tracking-wider mb-2">
            Xem trước huy hiệu
          </p>
          <div
            style={{
              backgroundColor: currentColor.bg,
              borderColor: currentColor.border,
            }}
            className="p-3 rounded-lg border flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-md bg-white/70 flex items-center justify-center text-[#483c58] shrink-0">
              <Icon name={formData.icon || "Sparkles"} size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#302540] truncate">
                {formData.title || "Tiêu đề khóa học"}
              </p>
              <p className="text-[10px] text-[#6e637c] truncate">
                {formData.teacher} · {formData.duration}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
