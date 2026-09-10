import { Badge, Button } from "../ui.jsx";

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
    <section className="live-panel space-top">
      <div className="between">
        <div>
          <h2>{title}</h2>
          <p className="muted">
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
      <div className="stack">
        {classes.map((c) => (
          <div className="between" key={c.id}>
            <div>
              <strong>{c.title}</strong>
              <p className="muted small">
                {c.code} · {c.course_title}
              </p>
              {c.next_session && (
                <small>
                  Buổi tiếp theo:{" "}
                  {new Date(c.next_session.starts_at).toLocaleString("vi-VN")}
                </small>
              )}
            </div>
            <div>
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
