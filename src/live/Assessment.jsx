import { useState } from "react";
import { Badge, Button, Empty, Icon } from "../ui.jsx";
import { dateLabel, statusLabels } from "./api.js";
import { FilePanel } from "./LearningTools.jsx";

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
    <article className="live-panel live-assignment">
      <div className="between">
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
        <small className="muted">{dateLabel(item.updated_at)}</small>
      </div>
      <h2>{item.course_title}</h2>
      {review && (
        <p>
          <strong>Người học:</strong> {item.learner_name}
        </p>
      )}
      <details className="live-exercise">
        <summary>Đề bài & tiêu chí đánh giá</summary>
        <p className="live-prose">{item.exercise}</p>
      </details>
      {item.feedback && (
        <div className="live-feedback">
          <Icon name="MessageCircle" size={18} />
          <div>
            <strong>Phản hồi từ giảng viên</strong>
            <p className="live-prose">{item.feedback}</p>
          </div>
        </div>
      )}
      {item.body && !canSubmit && (
        <div>
          <h3>Bài đã nộp</h3>
          <p className="live-prose live-submission">{item.body}</p>
        </div>
      )}
      <FilePanel
        assignmentId={item.id}
        editable={canSubmit}
        version={item.version}
      />
      {(canSubmit || canReview) && (
        <form className="live-form" onSubmit={submit}>
          {canSubmit ? (
            <label>
              Nội dung bài thực hành
              <textarea
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
              <label>
                Phản hồi cho người học
                <textarea
                  required
                  rows={4}
                  maxLength={10000}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </label>
              <div className="live-two-col">
                <label>
                  Kết quả
                  <select
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
                  <label>
                    Mức năng lực
                    <select
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
          <Button type="submit" disabled={busy} icon="Send">
            {busy
              ? "Đang gửi…"
              : review
                ? "Gửi đánh giá"
                : item.status === "revision"
                  ? "Nộp lại bài"
                  : "Nộp bài"}
          </Button>
        </form>
      )}
      {item.history.length > 0 && (
        <details className="live-history">
          <summary>Lịch sử nộp & đánh giá ({item.history.length})</summary>
          {item.history.map((history) => (
            <div key={history.id}>
              <strong>
                {statusLabels[history.status]} · {history.actor_name}
              </strong>
              <small className="muted">{dateLabel(history.created_at)}</small>
              <p className="live-prose">{history.feedback || history.body}</p>
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
      <div className="live-page-heading">
        <span className="live-eyebrow">HỌC QUA THỰC HÀNH</span>
        <h1>{review ? "Đánh giá bài tập" : "Bài tập & phản hồi"}</h1>
        <p className="muted">
          {review
            ? "Đọc bằng chứng, đưa phản hồi cụ thể và xác nhận mức năng lực phù hợp."
            : "Áp dụng vào công việc, nhận phản hồi và hoàn thiện từng bước."}
        </p>
      </div>
      <div className="live-filters">
        <select
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
        <span className="muted">{items.length} bài thực hành</span>
      </div>
      {items.length ? (
        <div className="stack">
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
      <div className="live-page-heading">
        <span className="live-eyebrow">TIẾN BỘ CÓ BẰNG CHỨNG</span>
        <h1>Hồ sơ năng lực</h1>
        <p className="muted">
          Những gì bạn đã thực hành và được giảng viên xác nhận.
        </p>
      </div>
      {state.evidence.length ? (
        <div className="live-course-grid">
          {state.evidence.map((item) => (
            <article className="live-panel" key={item.assignment_id}>
              <div className="between">
                <Icon name="ShieldCheck" size={32} />
                <Badge color="green">Mức {item.level}</Badge>
              </div>
              <h2 className="space-top">{item.skill}</h2>
              <p>{item.course_title}</p>
              {item.cohort_id && (
                <p className="muted">Lớp: {item.cohort_title}</p>
              )}
              <p className="muted small">
                Xác nhận bởi {item.reviewer_name}
                <br />
                {dateLabel(item.created_at)}
              </p>
              <a
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
