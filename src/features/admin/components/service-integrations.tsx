import { useEffect, useRef, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { api } from "@/lib/api-client";
import { dateLabel } from "@/lib/formatters";

export function ServiceIntegrations({
  state,
  go,
}: {
  state: any;
  go: (path: string) => void;
}) {
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
      <div className="live-page-heading mb-7">
        <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
          HỌC CÙNG MATUREX
        </span>
        <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
          Trợ lý học tập AI
        </h1>
        <p className="muted text-[11px] text-[var(--muted,#757185)]">
          Đặt câu hỏi về bài học, làm rõ kiến thức và tìm hướng giải quyết bài
          tập.
        </p>
      </div>
      {config && !config.ai.configured && (
        <div className="live-panel integration-notice bg-[#fffaf0] border border-[#fae2b8] rounded-[12px] p-[25px] mb-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h2 className="text-[18px] font-bold text-[#8a5b14] mb-2">
            Trợ lý chưa được kết nối
          </h2>
          <p className="text-[12px] text-[#8a5b14] mb-4 leading-relaxed">
            Quản trị viên cần cấu hình dịch vụ AI để bạn có thể bắt đầu hỏi đáp.
            Nội dung bài học vẫn có thể truy cập trong thư viện.
          </p>
          <Button kind="secondary" onClick={() => go("catalog")}>
            Mở thư viện khóa học
          </Button>
        </div>
      )}
      <div className="integration-assistant grid grid-cols-[290px_minmax(0,1fr)] max-[900px]:grid-cols-1 gap-[22px] items-start">
        <aside className="live-panel live-form integration-context bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px]">
          <h2 className="text-[18px] font-bold text-[#1f1b2d] mt-0 mb-0">
            Không gian học tập
          </h2>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Khóa học
            <select
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
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
              <p className="muted text-[11px] text-[var(--muted,#757185)] leading-[1.65] my-0">
                {course.description}
              </p>
              <p className="text-[12px] text-[#1f1b2d] my-0 leading-[1.65]">
                <strong>{course.lessons.length} bài học</strong> ·{" "}
                {course.skill}
              </p>
            </>
          )}
          <div className="self-start">
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
          </div>
          <h3 className="text-[14px] font-bold text-[#1f1b2d] mt-[28px] mb-2">
            Lịch sử riêng của bạn
          </h3>
          {!threads.length && (
            <p className="muted text-[11px] text-[var(--muted,#757185)] leading-[1.65]">
              Các cuộc trò chuyện đã gửi sẽ xuất hiện ở đây.
            </p>
          )}
          <div className="integration-threads grid gap-[8px]">
            {threads.map((t) => (
              <button
                key={t.id}
                disabled={sending}
                aria-pressed={threadId === t.id}
                className={`text-left p-3 border rounded-[10px] bg-white cursor-pointer break-words transition-colors ${
                  threadId === t.id
                    ? "bg-[#edf6f5] border-[#96c5bc] text-[#1f1b2d]"
                    : "border-[#e2e8f0] text-[#332f42] hover:bg-[#faf9fc]"
                }`}
                onClick={() => setThreadId(t.id)}
              >
                <div className="text-[12px] font-medium leading-snug">
                  {t.title}
                </div>
                <small className="block text-[#68788b] text-[10px] mt-[6px]">
                  {dateLabel(t.created_at)}
                </small>
              </button>
            ))}
          </div>
        </aside>
        <section
          className="live-panel integration-chat bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden"
          aria-label="Cuộc trò chuyện học tập"
        >
          <div className="between integration-chat-header flex items-center justify-between p-[22px] border-b border-[#e8edf2] gap-[15px]">
            <div>
              <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-[6px]">
                {course?.title || "Chọn một khóa học"}
              </h2>
              <span className="muted text-[12px] text-[var(--muted,#757185)]">
                Câu trả lời dựa trên nội dung khóa học đã chọn
              </span>
            </div>
            <Badge color={config?.ai.configured ? "green" : "gray"}>
              {config?.ai.configured ? "Đã cấu hình AI" : "Chưa kết nối"}
            </Badge>
          </div>
          <div
            className="integration-messages min-h-[300px] max-h-[520px] overflow-auto p-[24px] flex flex-col gap-[18px]"
            role="log"
            aria-live="polite"
            aria-busy={loading || sending}
          >
            {loading ? (
              <p
                className="text-[12px] text-[var(--muted,#757185)]"
                role="status"
              >
                Đang tải cuộc trò chuyện…
              </p>
            ) : (
              !messages.length && (
                <div className="integration-chat-empty m-auto text-center max-w-[430px] p-[35px_10px] text-[#65758b] leading-[1.7]">
                  <h3 className="text-[16px] font-bold text-[#23354b] mb-2">
                    Bạn muốn hiểu rõ điều gì?
                  </h3>
                  <p className="text-[12px]">
                    Hãy hỏi về một khái niệm trong bài học hoặc mô tả phần bài
                    tập bạn đang gặp khó khăn.
                  </p>
                </div>
              )
            )}
            {messages.map((m) => (
              <article
                key={m.id}
                className={`integration-message p-[16px_18px] rounded-[14px] max-w-[94%] text-[13px] leading-[1.75] break-words ${
                  m.role === "user"
                    ? "user bg-[#e9f4f0] self-end text-[#1f3a33]"
                    : "bg-[#f2f5f8] self-start text-[#23354b]"
                }`}
              >
                <strong className="text-[11px] block font-semibold mb-1">
                  {m.role === "user" ? "Bạn" : "Trợ lý AI"}
                </strong>
                <p className="m-0 whitespace-pre-wrap">{m.content}</p>
              </article>
            ))}
            {sending && (
              <p
                className="text-[12px] text-[var(--muted,#757185)]"
                role="status"
              >
                AI đang đọc câu hỏi và nội dung khóa học…
              </p>
            )}
            <div ref={bottom} />
          </div>
          <form
            className="live-form integration-composer p-[20px] border-t border-[#e8edf2] bg-[#fbfcfd] flex flex-col gap-[12px]"
            onSubmit={submit}
          >
            {error && (
              <div
                className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[12px] leading-[1.8]"
                role="alert"
              >
                {error}
              </div>
            )}
            <label
              className="flex flex-col gap-2 text-[11px] font-medium min-w-0"
              htmlFor="assistant-question"
            >
              Câu hỏi của bạn
              <textarea
                id="assistant-question"
                className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px] bg-white"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={4000}
                required
                rows={3}
                disabled={sending || !courseId || !config?.ai.configured}
                placeholder="Ví dụ: Giải thích khái niệm chính của bài đầu tiên…"
              />
            </label>
            <div className="between flex items-center justify-between gap-[18px]">
              <small className="muted text-[11px] text-[var(--muted,#757185)] leading-[1.55] max-w-[75%]">
                Nội dung trao đổi và tài liệu khóa học được gửi tới dịch vụ AI
                đã cấu hình. Hãy kiểm tra câu trả lời trước khi áp dụng.
              </small>
              <div className="shrink-0">
                <Button
                  type="submit"
                  disabled={
                    sending ||
                    loading ||
                    !draft.trim() ||
                    !config?.ai.configured
                  }
                >
                  {sending ? "Đang trả lời…" : "Gửi câu hỏi"}
                </Button>
              </div>
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
export function IntegrationStatus({ state }: { state: any }) {
  const [config, setConfig] = useState<any>(null),
    [outbox, setOutbox] = useState<any[]>([]),
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
    } catch (e: any) {
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
      <div className="between live-page-heading flex items-center justify-between gap-4 mb-7">
        <div>
          <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
            VẬN HÀNH NỀN TẢNG
          </span>
          <h2 className="text-[24px] font-bold text-[#1f1b2d] my-1">
            Kết nối dịch vụ
          </h2>
          <p className="muted text-[11px] text-[var(--muted,#757185)]">
            Theo dõi cấu hình AI, đăng nhập doanh nghiệp và email.
          </p>
        </div>
        <Button kind="secondary" onClick={load} disabled={loading}>
          {loading ? "Đang tải…" : "Làm mới"}
        </Button>
      </div>
      {error && (
        <div
          role="alert"
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8]"
        >
          {error}
        </div>
      )}
      {config && (
        <div className="integration-cards grid grid-cols-3 max-[900px]:grid-cols-1 gap-[20px] mb-[24px]">
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
            <section
              key={key}
              className="live-panel bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-start"
            >
              <Badge color={config[key].configured ? "green" : "gray"}>
                {config[key].configured ? "Đã cấu hình" : "Chưa cấu hình"}
              </Badge>
              <h2 className="text-[18px] font-bold text-[#1f1b2d] mt-3 mb-2">
                {title}
              </h2>
              <p className="muted text-[11px] text-[var(--muted,#757185)] leading-relaxed mb-3">
                {description}
              </p>
              <p className="text-[12px] text-[#555064] mt-auto">
                {config[key].configured
                  ? "Cấu hình đã có. Khả năng kết nối phụ thuộc dịch vụ bên ngoài."
                  : "Cần bổ sung cấu hình dịch vụ trên máy chủ."}
              </p>
            </section>
          ))}
        </div>
      )}
      {state.user.role === "admin" && (
        <section className="live-panel live-table-wrap bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto mb-6">
          <div className="p-[22px] border-b border-[var(--border,#e9eaf0)]">
            <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-1">
              Lịch sử gửi email
            </h2>
            <p className="muted text-[11px] text-[var(--muted,#757185)] mb-0">
              Hiển thị 100 email gần nhất. “SMTP đã nhận” nghĩa là máy chủ email
              đã chấp nhận thư; không xác nhận thư đã vào hộp thư người nhận.
            </p>
          </div>
          <table className="live-table w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#fcfcfd] border-b border-[var(--border,#e9eaf0)]">
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Người nhận
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Tiêu đề
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Số lần thử
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Kết quả gần nhất
                </th>
              </tr>
            </thead>
            <tbody>
              {outbox.map((m) => (
                <tr
                  className="border-b border-[var(--border,#e9eaf0)] hover:bg-[#faf9fc]"
                  key={m.id}
                >
                  <td className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    {m.recipient}
                  </td>
                  <td className="p-[18px_22px] text-[11px] text-[#332f42] font-medium whitespace-nowrap">
                    {m.subject}
                  </td>
                  <td className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    {deliveryLabel[m.status]}
                  </td>
                  <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                    {m.attempts}
                  </td>
                  <td className="p-[18px_22px] text-[11px] text-[#757185] whitespace-nowrap">
                    {m.last_error ||
                      (m.sent_at ? dateLabel(m.sent_at) : "Đang chờ xử lý")}
                  </td>
                </tr>
              ))}
              {!outbox.length && (
                <tr>
                  <td
                    className="p-[18px_22px] text-[11px] text-[var(--muted,#757185)]"
                    colSpan={5}
                  >
                    Chưa có email được đưa vào hàng đợi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
