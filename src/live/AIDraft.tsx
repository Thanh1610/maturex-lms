import { useEffect, useState } from "react";
import { Badge, Button } from "../ui";
import { api } from "./api";

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
      className="integration-draft live-form bg-[#f5f8fc] border border-[#dfe7ef] rounded-[14px] p-[22px] my-5 mb-[26px]"
      aria-label="Soạn bản nháp khóa học bằng AI"
    >
      <div className="between flex justify-between items-start gap-[18px] mb-[18px]">
        <div>
          <h3 className="text-[16px] font-[550] text-[#2c3e50] m-0 mb-2">
            Phác thảo khóa học cùng AI
          </h3>
          <p className="muted text-[12px] text-[#6b7c93] m-0 leading-[1.7]">
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
        <p className="integration-draft-notice bg-[#fff4dc] p-[12px_16px] rounded-[9px] text-[11px] text-[#825c1b] mb-4 leading-[1.6]">
          Quản trị viên cần kết nối dịch vụ AI để sử dụng tính năng này. Bạn vẫn
          có thể tự soạn khóa học bên dưới.
        </p>
      )}
      <div className="live-two-col grid grid-cols-2 max-md:grid-cols-1 gap-[18px] mb-4">
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#405167]">
          Chủ đề khóa học
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={180}
            disabled={busy || !configured}
            placeholder="Ví dụ: Kỹ năng phản hồi trong nhóm"
            className="border border-[#d0dbe7] bg-white rounded-lg p-2.5 text-[12px] outline-none focus:border-[#7b61bd]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#405167]">
          Mục tiêu học tập
          <textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            maxLength={5000}
            rows={3}
            disabled={busy || !configured}
            placeholder="Người học cần hiểu và thực hiện được điều gì sau khóa học?"
            className="border border-[#d0dbe7] bg-white rounded-lg p-2.5 text-[12px] outline-none focus:border-[#7b61bd] leading-[1.7]"
          />
        </label>
      </div>
      <div className="between flex justify-between items-center gap-4 mt-2">
        <small className="muted text-[11px] text-[#718298]">
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
        <div
          role="alert"
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] my-4 leading-[1.8] text-[12px]"
        >
          {error}
        </div>
      )}
      {busy && (
        <p role="status" className="text-[11px] text-[#607289] italic mt-3">
          AI đang xây dựng bài học và bài tập. Nội dung biểu mẫu vẫn được giữ
          nguyên.
        </p>
      )}
      {draft && (
        <div className="integration-draft-preview bg-white p-5 border border-[#e0e7ef] rounded-xl mt-5">
          <Badge>Bản nháp cần kiểm tra</Badge>
          <h4 className="text-[18px] font-semibold text-[#243347] my-3.5 mb-2.5">
            {draft.title}
          </h4>
          <p className="text-[12px] text-[#556982] leading-[1.8] whitespace-pre-wrap break-words">
            {draft.description}
          </p>
          <p className="text-[11px] text-[#6d7e93] my-2">
            <strong className="font-semibold text-[#304258]">Năng lực:</strong>{" "}
            {draft.skill} · {draft.category}
          </p>
          <ol className="my-3 pl-5 flex flex-col gap-2">
            {draft.lessons.map((lesson, index) => (
              <li key={index} className="text-[12px] text-[#40546d]">
                <details className="cursor-pointer">
                  <summary className="font-medium text-[#2d4059]">
                    {lesson.title}
                  </summary>
                  <p className="mt-1 text-[11px] text-[#61748d] leading-[1.7] pl-2 border-l-2 border-[#dde5ee]">
                    {lesson.content}
                  </p>
                </details>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-[#556982] my-3 leading-[1.7]">
            <strong className="font-semibold text-[#304258]">
              Bài tập thực hành:
            </strong>{" "}
            {draft.exercise}
          </p>
          <div className="between flex justify-between items-center gap-4 mt-4 pt-3 border-t border-[#edf2f7]">
            <small className="muted text-[10px] text-[#7d8fa5] max-w-[70%] leading-[1.6]">
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
            <p
              role="status"
              className="text-[11px] text-[#34785c] mt-2 font-medium"
            >
              Bản nháp đã được đưa vào biểu mẫu bên dưới. Hãy kiểm tra nội dung
              trước khi lưu.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
