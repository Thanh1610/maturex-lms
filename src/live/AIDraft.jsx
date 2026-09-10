import { useEffect, useState } from "react";
import { Badge, Button } from "../ui.jsx";
import { api } from "./api.js";
import "./integrations.css";

export function AIDraft({ onDraft }) {
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [configured, setConfigured] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  useEffect(() => {
    let active = true;
    api("/integrations/status")
      .then((data) => {
        if (active) setConfigured(data.ai.configured);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function generate() {
    if (!topic.trim() || !objectives.trim() || busy) return;
    setBusy(true);
    setError("");
    setApplied(false);
    try {
      setDraft(
        (await api("/assistant/draft", "POST", { topic, objectives })).draft,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="integration-draft live-form"
      aria-label="Soạn bản nháp khóa học bằng AI"
    >
      <div className="between">
        <div>
          <h3>Phác thảo khóa học cùng AI</h3>
          <p className="muted">
            Mô tả chủ đề và kết quả mong muốn để tạo nội dung khởi đầu. Bạn sẽ
            kiểm tra và chỉnh sửa trước khi lưu.
          </p>
        </div>
        <Badge color={configured ? "green" : "gray"}>
          {configured
            ? "Đã cấu hình AI"
            : configured === false
              ? "Chưa kết nối"
              : "Đang kiểm tra…"}
        </Badge>
      </div>
      {configured === false && (
        <p className="integration-draft-notice">
          Quản trị viên cần kết nối dịch vụ AI để sử dụng tính năng này. Bạn vẫn
          có thể tự soạn khóa học bên dưới.
        </p>
      )}
      <div className="live-two-col">
        <label>
          Chủ đề khóa học
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={180}
            disabled={busy || !configured}
            placeholder="Ví dụ: Kỹ năng phản hồi trong nhóm"
          />
        </label>
        <label>
          Mục tiêu học tập
          <textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            maxLength={5000}
            rows={3}
            disabled={busy || !configured}
            placeholder="Người học cần hiểu và thực hiện được điều gì sau khóa học?"
          />
        </label>
      </div>
      <div className="between">
        <small className="muted">
          Chủ đề và mục tiêu sẽ được gửi tới dịch vụ AI đã cấu hình.
        </small>
        <Button
          type="button"
          kind="secondary"
          onClick={generate}
          disabled={busy || !configured || !topic.trim() || !objectives.trim()}
        >
          {busy ? "Đang soạn bản nháp…" : "Tạo bản nháp AI"}
        </Button>
      </div>
      {error && (
        <div role="alert" className="live-error">
          {error}
        </div>
      )}
      {busy && (
        <p role="status">
          AI đang xây dựng bài học và bài tập. Nội dung biểu mẫu vẫn được giữ
          nguyên.
        </p>
      )}
      {draft && (
        <div className="integration-draft-preview">
          <Badge>Bản nháp cần kiểm tra</Badge>
          <h4>{draft.title}</h4>
          <p>{draft.description}</p>
          <p>
            <strong>Năng lực:</strong> {draft.skill} · {draft.category}
          </p>
          <ol>
            {draft.lessons.map((lesson, index) => (
              <li key={index}>
                <details>
                  <summary>{lesson.title}</summary>
                  <p>{lesson.content}</p>
                </details>
              </li>
            ))}
          </ol>
          <p>
            <strong>Bài tập thực hành:</strong> {draft.exercise}
          </p>
          <div className="between">
            <small className="muted">
              Áp dụng sẽ thay nội dung hiện tại trong biểu mẫu bằng bản nháp.
              Khóa học chỉ được lưu khi bạn chọn lưu biểu mẫu.
            </small>
            <Button
              type="button"
              disabled={busy || applied}
              onClick={() => {
                onDraft(draft);
                setApplied(true);
              }}
            >
              {applied ? "Đã đưa vào biểu mẫu" : "Dùng bản nháp này"}
            </Button>
          </div>
          {applied && (
            <p role="status">
              Bản nháp đã được đưa vào biểu mẫu bên dưới. Hãy kiểm tra nội dung
              trước khi lưu.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
