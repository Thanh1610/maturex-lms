import { Badge, Button } from "../ui";

export function ClassLinks({ state, go, context = "learning" }) {
  const classes = (state.cohorts || []).filter(
    (c) => c.enrolled || c.can_manage || state.user.management,
  );
  if (!classes.length) return null;
  const title =
    context === "reports"
      ? "Báo cáo theo lớp"
      : context === "calendar"
        ? "Lịch theo lớp"
        : context === "assignments"
          ? "Bài thực hành theo lớp"
          : "Lớp học của bạn";
  return (
    <section className="live-panel space-top bg-white border border-[var(--border,#e9eaf0)] rounded-xl p-[25px] max-sm:p-5 mt-[30px]">
      <div className="between flex justify-between items-center max-sm:flex-col max-sm:items-start gap-4 mb-4">
        <div>
          <h2 className="text-[19px] font-semibold text-[#333] m-0 mb-1">
            {title}
          </h2>
          <p className="muted text-[12px] text-[#858894] m-0 leading-[1.7]">
            {context === "reports"
              ? "Xem tiến độ, kết quả và điểm danh trong phạm vi lớp được quản lý."
              : context === "calendar"
                ? "Xem các buổi học và điểm danh trong lớp được phân công."
                : context === "assignments"
                  ? "Bài nộp và kết quả được theo dõi riêng cho từng lớp."
                  : "Tiếp tục học trong lớp được phân công tại MatureX."}
          </p>
        </div>
        <Button kind="ghost" onClick={() => go("cohorts")}>
          Tất cả lớp học
        </Button>
      </div>
      <div className="stack flex flex-col gap-4">
        {classes.map((c) => (
          <div
            className="between flex justify-between items-center py-3 border-b border-[#eee] last:border-0"
            key={c.id}
          >
            <div>
              <strong className="block text-[13px] text-[#2c3e50] font-medium">
                {c.title}
              </strong>
              <p className="muted small text-[11px] text-[#858894] m-0 mt-0.5">
                {c.code} · {c.course_title}
              </p>
              {c.next_session && (
                <small className="text-[10px] text-[#6b57bd] block mt-1">
                  Buổi tiếp theo:{" "}
                  {new Date(c.next_session.starts_at).toLocaleString("vi-VN")}
                </small>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge>
                {{
                  draft: "Chuẩn bị",
                  open: "Đang mở",
                  closed: "Đã kết thúc",
                  archived: "Lưu trữ",
                }[c.status] || c.status}
              </Badge>{" "}
              <Button kind="secondary" onClick={() => go(`cohorts/${c.id}`)}>
                Vào lớp
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
