import { useState } from "react";
import { Badge, Button, Empty, Icon } from "../ui";
import { dateLabel, statusLabels } from "./api";
import { FilePanel } from "./LearningTools";

function Assignment({ item, review, busy, mutate }) {
  const [body, setBody] = useState(item.body);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("approved");
  const [level, setLevel] = useState("2");
  const canSubmit = !review && ["todo", "revision"].includes(item.status);
  const canReview = review && item.status === "submitted";
  async function submit(event) {
    event.preventDefault();
    const result = await mutate(
      `/assignments/${item.id}/${review ? "review" : "submit"}`,
      "POST",
      review
        ? { feedback, status, level: Number(level), version: item.version }
        : { body, version: item.version },
      review
        ? "Đã gửi đánh giá cho người học."
        : "Đã nộp bài. Giảng viên sẽ xem và phản hồi.",
    );
    if (result) setFeedback("");
  }
  return (
    <article className="live-panel live-assignment bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] max-[760px]:p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="between flex items-center justify-between gap-4">
        <Badge
          color={
            item.status === "approved"
              ? "green"
              : item.status === "revision"
                ? "peach"
                : "lavender"
          }
        >
          {statusLabels[item.status]}
        </Badge>
        <small className="muted text-[9px] text-[var(--muted,#757185)]">
          {dateLabel(item.updated_at)}
        </small>
      </div>
      <h2 className="text-[20px] font-bold text-[#1f1b2d] mt-[20px] mb-2">
        {item.course_title}
      </h2>
      {review && (
        <p className="text-[12px] text-[#555064] mb-3">
          <strong className="text-[#1f1b2d] font-semibold">Người học:</strong>{" "}
          {item.learner_name}
        </p>
      )}
      <details className="live-exercise border border-[var(--border,#e9eaf0)] rounded-[8px] p-[15px] my-[18px_22px]">
        <summary className="cursor-pointer text-[11px] font-semibold text-[#1f1b2d]">
          Đề bài & tiêu chí đánh giá
        </summary>
        <p className="live-prose text-[12px] text-[#555064] whitespace-pre-wrap break-words leading-[1.95] mt-[14px] mb-0">
          {item.exercise}
        </p>
      </details>
      {item.feedback && (
        <div className="live-feedback flex items-start gap-[12px] p-[18px] bg-[#f3f0fa] rounded-[8px] mb-[22px]">
          <Icon
            className="text-[#74609f] shrink-0 mt-[2px]"
            name="MessageCircle"
            size={18}
          />
          <div>
            <strong className="text-[12px] text-[#1f1b2d] font-semibold">
              Phản hồi từ giảng viên
            </strong>
            <p className="live-prose text-[12px] text-[#4f4861] whitespace-pre-wrap break-words leading-[1.95] mt-[6px] mb-0">
              {item.feedback}
            </p>
          </div>
        </div>
      )}
      {item.body && !canSubmit && (
        <div className="mb-5">
          <h3 className="text-[14px] font-bold text-[#1f1b2d] mb-2">
            Bài đã nộp
          </h3>
          <p className="live-prose live-submission bg-[#f8f9fb] rounded-[8px] p-[20px] max-h-[420px] overflow-y-auto text-[12px] text-[#332f42] whitespace-pre-wrap break-words leading-[1.95]">
            {item.body}
          </p>
        </div>
      )}
      <FilePanel
        assignmentId={item.id}
        editable={canSubmit}
        version={item.version}
      />
      {(canSubmit || canReview) && (
        <form
          className="live-form flex flex-col gap-[18px] mt-4"
          onSubmit={submit}
        >
          {canSubmit ? (
            <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
              Nội dung bài thực hành
              <textarea
                className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                required
                rows={7}
                maxLength={30000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Trình bày cách áp dụng, kết quả và bằng chứng của bạn…"
              />
            </label>
          ) : (
            <>
              <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
                Phản hồi cho người học
                <textarea
                  className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                  required
                  rows={4}
                  maxLength={10000}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </label>
              <div className="live-two-col grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
                <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
                  Kết quả
                  <select
                    className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="approved">Đạt — xác nhận bằng chứng</option>
                    <option value="revision">
                      Cần bổ sung — cho phép nộp lại
                    </option>
                  </select>
                </label>
                {status === "approved" && (
                  <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
                    Mức năng lực
                    <select
                      className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="1">1 — Nhận biết</option>
                      <option value="2">2 — Áp dụng có hướng dẫn</option>
                      <option value="3">3 — Thực hành độc lập</option>
                      <option value="4">4 — Dẫn dắt & chia sẻ</option>
                    </select>
                  </label>
                )}
              </div>
            </>
          )}
          <div className="self-start">
            <Button type="submit" disabled={busy} icon="Send">
              {busy
                ? "Đang gửi…"
                : review
                  ? "Gửi đánh giá"
                  : item.status === "revision"
                    ? "Nộp lại bài"
                    : "Nộp bài"}
            </Button>
          </div>
        </form>
      )}
      {item.history.length > 0 && (
        <details className="live-history mt-[25px] pt-[20px] border-t border-[var(--border,#e9eaf0)]">
          <summary className="cursor-pointer text-[11px] font-semibold text-[#1f1b2d]">
            Lịch sử nộp & đánh giá ({item.history.length})
          </summary>
          {item.history.map((history) => (
            <div
              className="border-l-2 border-[#ded5ee] mt-[20px] pl-[18px]"
              key={history.id}
            >
              <strong className="text-[12px] text-[#1f1b2d]">
                {statusLabels[history.status]} · {history.actor_name}
              </strong>
              <small className="muted block text-[9px] text-[var(--muted,#757185)] mt-1">
                {dateLabel(history.created_at)}
              </small>
              <p className="live-prose text-[12px] text-[#4f4861] whitespace-pre-wrap break-words leading-[1.95] my-[10px]">
                {history.feedback || history.body}
              </p>
              {history.level && (
                <Badge color="green">Mức {history.level}</Badge>
              )}
            </div>
          ))}
        </details>
      )}
    </article>
  );
}
export function Assignments({ state, review = false, busy, mutate }) {
  const [filter, setFilter] = useState(review ? "submitted" : "all");
  const visible = state.assignments.filter((a) =>
    review
      ? a.user_id !== state.user.id &&
        (state.user.role === "admin" ||
          state.courses.some((c) => c.id === a.course_id && c.can_teach))
      : a.user_id === state.user.id,
  );
  const items = visible.filter((a) => filter === "all" || a.status === filter);
  return (
    <>
      <div className="live-page-heading mb-7">
        <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
          HỌC QUA THỰC HÀNH
        </span>
        <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
          {review ? "Đánh giá bài tập" : "Bài tập & phản hồi"}
        </h1>
        <p className="muted text-[11px] text-[var(--muted,#757185)]">
          {review
            ? "Đọc bằng chứng, đưa phản hồi cụ thể và xác nhận mức năng lực phù hợp."
            : "Áp dụng vào công việc, nhận phản hồi và hoàn thiện từng bước."}
        </p>
      </div>
      <div className="live-filters flex items-center flex-wrap gap-[14px] mb-[25px]">
        <select
          className="max-[760px]:max-w-full"
          aria-label="Trạng thái bài tập"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          {["todo", "submitted", "revision", "approved"].map((key) => (
            <option value={key} key={key}>
              {statusLabels[key]}
            </option>
          ))}
        </select>
        <span className="muted text-[11px] text-[var(--muted,#757185)]">
          {items.length} bài thực hành
        </span>
      </div>
      {items.length ? (
        <div className="stack space-y-4">
          {items.map((item) => (
            <Assignment
              key={`${item.id}:${item.version}`}
              item={item}
              review={review}
              busy={busy}
              mutate={mutate}
            />
          ))}
        </div>
      ) : (
        <Empty
          title={
            review
              ? "Chưa có bài cần đánh giá"
              : "Chưa có bài tập ở trạng thái này"
          }
          description={
            review
              ? "Bài do người học nộp trong khóa bạn phụ trách sẽ xuất hiện ở đây."
              : "Đăng ký khóa học để nhận bài thực hành, hoặc thử chọn trạng thái khác."
          }
        />
      )}
    </>
  );
}
export function Evidence({ state }) {
  return (
    <>
      <div className="live-page-heading mb-7">
        <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
          TIẾN BỘ CÓ BẰNG CHỨNG
        </span>
        <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
          Hồ sơ năng lực
        </h1>
        <p className="muted text-[11px] text-[var(--muted,#757185)]">
          Những gì bạn đã thực hành và được giảng viên xác nhận.
        </p>
      </div>
      {state.evidence.length ? (
        <div className="live-course-grid grid grid-cols-3 max-[1200px]:grid-cols-2 max-[760px]:grid-cols-1 gap-[20px]">
          {state.evidence.map((item) => (
            <article
              className="live-panel bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] max-[760px]:p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col"
              key={item.assignment_id}
            >
              <div className="between flex items-center justify-between gap-4">
                <Icon className="text-[#3b7c53]" name="ShieldCheck" size={32} />
                <Badge color="green">Mức {item.level}</Badge>
              </div>
              <h2 className="space-top text-[18px] font-bold text-[#1f1b2d] mt-4 mb-1">
                {item.skill}
              </h2>
              <p className="text-[12px] text-[#555064] mb-2">
                {item.course_title}
              </p>
              {item.cohort_id && (
                <p className="muted text-[11px] text-[var(--muted,#757185)] mb-2">
                  Lớp: {item.cohort_title}
                </p>
              )}
              <p className="muted small text-[9px] text-[var(--muted,#757185)] mt-auto pt-3 mb-3 leading-relaxed">
                Xác nhận bởi {item.reviewer_name}
                <br />
                {dateLabel(item.created_at)}
              </p>
              <a
                className="text-[11px] font-semibold text-[#74609f] hover:underline"
                href={
                  item.cohort_id ? `#cohorts/${item.cohort_id}` : "#assignments"
                }
              >
                Xem bài thực hành & phản hồi →
              </a>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Bằng chứng đầu tiên đang chờ bạn"
          description="Hoàn thành bài thực hành và nhận đánh giá đạt để xây dựng hồ sơ năng lực."
        />
      )}
    </>
  );
}
