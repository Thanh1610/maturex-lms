import { useEffect, useRef, useState } from "react";
import { Badge, Button } from "../ui.jsx";
import { api, dateLabel } from "./api.js";

export function Assistant({ state, go }) {
  const [courseId, setCourseId] = useState(state.courses[0]?.id || "");
  const [config, setConfig] = useState(null);
  const [threads, setThreads] = useState([]);
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const historyRequest = useRef(0);
  const bottom = useRef(null);
  useEffect(() => {
    api("/integrations/status")
      .then(setConfig)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    const request = ++historyRequest.current;
    setMessages([]);
    setThreads([]);
    setError("");
    if (!courseId) return;
    setLoading(true);
    api(
      `/assistant/history?courseId=${encodeURIComponent(courseId)}${threadId ? `&conversationId=${encodeURIComponent(threadId)}` : ""}`,
    )
      .then((data) => {
        if (request === historyRequest.current) {
          setThreads(data.conversations);
          setMessages(data.messages);
        }
      })
      .catch((e) => {
        if (request === historyRequest.current) setError(e.message);
      })
      .finally(() => {
        if (request === historyRequest.current) setLoading(false);
      });
    return () => {
      historyRequest.current++;
    };
  }, [courseId, threadId]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const data = await api("/assistant", "POST", {
        courseId,
        message: draft,
        ...(threadId ? { conversationId: threadId } : {}),
      });
      setDraft("");
      setMessages(data.messages);
      setThreadId(data.conversationId);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }
  const course = state.courses.find((c) => c.id === courseId);
  return (
    <>
      <div className="live-page-heading">
        <span className="live-eyebrow">HỌC CÙNG MATUREX</span>
        <h1>Trợ lý học tập AI</h1>
        <p className="muted">
          Đặt câu hỏi về bài học, làm rõ kiến thức và tìm hướng giải quyết bài
          tập.
        </p>
      </div>
      {config && !config.ai.configured && (
        <div className="live-panel integration-notice">
          <h2>Trợ lý chưa được kết nối</h2>
          <p>
            Quản trị viên cần cấu hình dịch vụ AI để bạn có thể bắt đầu hỏi đáp.
            Nội dung bài học vẫn có thể truy cập trong thư viện.
          </p>
          <Button kind="secondary" onClick={() => go("catalog")}>
            Mở thư viện khóa học
          </Button>
        </div>
      )}
      <div className="integration-assistant">
        <aside className="live-panel live-form integration-context">
          <h2>Không gian học tập</h2>
          <label>
            Khóa học
            <select
              value={courseId}
              disabled={sending || !state.courses.length}
              onChange={(e) => {
                setCourseId(e.target.value);
                setThreadId("");
                setDraft("");
              }}
            >
              {!state.courses.length && (
                <option value="">Chưa có khóa học</option>
              )}
              {state.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          {course && (
            <>
              <p className="muted">{course.description}</p>
              <p>
                <strong>{course.lessons.length} bài học</strong> ·{" "}
                {course.skill}
              </p>
            </>
          )}
          <Button
            kind="secondary"
            disabled={sending || loading || !courseId}
            onClick={() => {
              setThreadId("");
              setMessages([]);
              setDraft("");
            }}
          >
            Cuộc trò chuyện mới
          </Button>
          <h3>Lịch sử riêng của bạn</h3>
          {!threads.length && (
            <p className="muted">
              Các cuộc trò chuyện đã gửi sẽ xuất hiện ở đây.
            </p>
          )}
          <div className="integration-threads">
            {threads.map((t) => (
              <button
                key={t.id}
                disabled={sending}
                aria-pressed={threadId === t.id}
                onClick={() => setThreadId(t.id)}
              >
                {t.title}
                <small>{dateLabel(t.created_at)}</small>
              </button>
            ))}
          </div>
        </aside>
        <section
          className="live-panel integration-chat"
          aria-label="Cuộc trò chuyện học tập"
        >
          <div className="between integration-chat-header">
            <div>
              <h2>{course?.title || "Chọn một khóa học"}</h2>
              <span className="muted">
                Câu trả lời dựa trên nội dung khóa học đã chọn
              </span>
            </div>
            <Badge color={config?.ai.configured ? "green" : "gray"}>
              {config?.ai.configured ? "Đã cấu hình AI" : "Chưa kết nối"}
            </Badge>
          </div>
          <div
            className="integration-messages"
            role="log"
            aria-live="polite"
            aria-busy={loading || sending}
          >
            {loading ? (
              <p role="status">Đang tải cuộc trò chuyện…</p>
            ) : (
              !messages.length && (
                <div className="integration-chat-empty">
                  <h3>Bạn muốn hiểu rõ điều gì?</h3>
                  <p>
                    Hãy hỏi về một khái niệm trong bài học hoặc mô tả phần bài
                    tập bạn đang gặp khó khăn.
                  </p>
                </div>
              )
            )}
            {messages.map((m) => (
              <article key={m.id} className={`integration-message ${m.role}`}>
                <strong>{m.role === "user" ? "Bạn" : "Trợ lý AI"}</strong>
                <p>{m.content}</p>
              </article>
            ))}
            {sending && (
              <p role="status">AI đang đọc câu hỏi và nội dung khóa học…</p>
            )}
            <div ref={bottom} />
          </div>
          <form className="live-form integration-composer" onSubmit={submit}>
            {error && (
              <div className="live-error" role="alert">
                {error}
              </div>
            )}
            <label htmlFor="assistant-question">
              Câu hỏi của bạn
              <textarea
                id="assistant-question"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={4000}
                required
                rows={3}
                disabled={sending || !courseId || !config?.ai.configured}
                placeholder="Ví dụ: Giải thích khái niệm chính của bài đầu tiên…"
              />
            </label>
            <div className="between">
              <small className="muted">
                Nội dung trao đổi và tài liệu khóa học được gửi tới dịch vụ AI
                đã cấu hình. Hãy kiểm tra câu trả lời trước khi áp dụng.
              </small>
              <Button
                type="submit"
                disabled={
                  sending || loading || !draft.trim() || !config?.ai.configured
                }
              >
                {sending ? "Đang trả lời…" : "Gửi câu hỏi"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}

const deliveryLabel = {
  queued: "Đang chờ",
  sending: "Đang gửi",
  sent: "SMTP đã nhận",
  failed: "Gửi thất bại",
};
export function IntegrationStatus({ state }) {
  const [config, setConfig] = useState(null),
    [outbox, setOutbox] = useState([]),
    [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [settings, mail] = await Promise.all([
        api("/integrations/status"),
        state.user.role === "admin"
          ? api("/integrations/outbox")
          : Promise.resolve({ messages: [] }),
      ]);
      setConfig(settings);
      setOutbox(mail.messages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [load]);
  return (
    <>
      <div className="between live-page-heading">
        <div>
          <span className="live-eyebrow">VẬN HÀNH NỀN TẢNG</span>
          <h2>Kết nối dịch vụ</h2>
          <p className="muted">
            Theo dõi cấu hình AI, đăng nhập doanh nghiệp và email.
          </p>
        </div>
        <Button kind="secondary" onClick={load} disabled={loading}>
          {loading ? "Đang tải…" : "Làm mới"}
        </Button>
      </div>
      {error && (
        <div role="alert" className="live-error">
          {error}
        </div>
      )}
      {config && (
        <div className="integration-cards">
          {[
            [
              "ai",
              "Trợ lý AI",
              "Hỏi đáp dựa trên bài học và bài tập trong khóa học.",
            ],
            [
              "sso",
              "Đăng nhập SSO",
              "Đăng nhập bằng danh tính doanh nghiệp qua OpenID Connect.",
            ],
            [
              "smtp",
              "Email",
              "Gửi thông báo và liên kết đặt lại mật khẩu qua SMTP.",
            ],
          ].map(([key, title, description]) => (
            <section key={key} className="live-panel">
              <Badge color={config[key].configured ? "green" : "gray"}>
                {config[key].configured ? "Đã cấu hình" : "Chưa cấu hình"}
              </Badge>
              <h2>{title}</h2>
              <p className="muted">{description}</p>
              <p>
                {config[key].configured
                  ? "Cấu hình đã có. Khả năng kết nối phụ thuộc dịch vụ bên ngoài."
                  : "Cần bổ sung cấu hình dịch vụ trên máy chủ."}
              </p>
            </section>
          ))}
        </div>
      )}
      {state.user.role === "admin" && (
        <section className="live-panel live-table-wrap">
          <h2>Lịch sử gửi email</h2>
          <p className="muted">
            Hiển thị 100 email gần nhất. “SMTP đã nhận” nghĩa là máy chủ email
            đã chấp nhận thư; không xác nhận thư đã vào hộp thư người nhận.
          </p>
          <table className="live-table">
            <thead>
              <tr>
                <th>Người nhận</th>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Số lần thử</th>
                <th>Kết quả gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {outbox.map((m) => (
                <tr key={m.id}>
                  <td>{m.recipient}</td>
                  <td>{m.subject}</td>
                  <td>{deliveryLabel[m.status]}</td>
                  <td>{m.attempts}</td>
                  <td>
                    {m.last_error ||
                      (m.sent_at ? dateLabel(m.sent_at) : "Đang chờ xử lý")}
                  </td>
                </tr>
              ))}
              {!outbox.length && (
                <tr>
                  <td colSpan={5}>Chưa có email được đưa vào hàng đợi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
