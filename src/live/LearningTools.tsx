import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "../ui";
import { api } from "./api";

export function FilePanel({
  courseId,
  lessonId,
  assignmentId,
  cohortAssignmentId,
  editable = false,
  version = 0,
}: {
  courseId?: string;
  lessonId?: string;
  assignmentId?: string;
  cohortAssignmentId?: string;
  editable?: boolean;
  version?: number;
}) {
  const [files, setFiles] = useState<any[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const loadSequence = useRef(0);
  async function load() {
    const sequence = ++loadSequence.current;
    try {
      const result = await api("/files");
      if (sequence !== loadSequence.current) return;
      setFiles(
        result.files.filter((f) =>
          cohortAssignmentId
            ? f.cohort_assignment_id === cohortAssignmentId
            : assignmentId
              ? f.assignment_id === assignmentId
              : !f.assignment_id &&
                !f.cohort_assignment_id &&
                f.course_id === courseId &&
                (!lessonId || !f.lesson_id || f.lesson_id === lessonId),
        ),
      );
    } catch (e: any) {
      if (sequence === loadSequence.current) setError(e.message);
    }
  }
  useEffect(() => {
    load();
    return () => {
      loadSequence.current++;
    };
  }, [load]);
  async function upload(event: any) {
    event.preventDefault();
    const form = event.currentTarget,
      file = form.elements.file.files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (file.size > 128 * 1024 * 1024) throw new Error("Tệp tối đa 128 MB.");
      const query = new URLSearchParams(
        cohortAssignmentId
          ? { cohortAssignmentId }
          : assignmentId
            ? { assignmentId }
            : { courseId: courseId || "", ...(lessonId ? { lessonId } : {}) },
      );
      const response = await fetch(`/api/files?${query}`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "X-File-Name": encodeURIComponent(file.name),
        },
        body: file,
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401)
          window.dispatchEvent(new Event("lms:unauthorized"));
        throw new Error(result.error || "Không tải được tệp.");
      }
      form.reset();
      setNotice("Đã tải tệp lên.");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: any) {
    setBusy(true);
    setError("");
    try {
      await api(`/files/${id}`, "DELETE", {});
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="learning-tool mb-6">
      <h3 className="text-[14px] font-bold text-[#1f1b2d] flex items-center gap-2 mb-3">
        <Icon name="Paperclip" size={17} />{" "}
        {assignmentId || cohortAssignmentId
          ? "Tệp bài thực hành"
          : "Video & tài liệu"}
      </h3>
      {error && (
        <p
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8]"
          role="alert"
        >
          {error}
        </p>
      )}
      {notice && (
        <p className="text-[12px] text-[#3b7c53] mb-3" role="status">
          {notice}
        </p>
      )}
      {files.length ? (
        files.map((file) => (
          <div
            key={file.id}
            className="border border-[var(--border,#e9eaf0)] p-[14px] rounded-[9px] mb-3 bg-[#faf9fc]"
          >
            {file.mime.startsWith("video/") ? (
              <video
                controls
                preload="metadata"
                className="w-full max-h-[460px] bg-[#17141f] rounded-lg mb-3"
                src={`/api/files/${file.id}`}
                aria-label={file.name}
              />
            ) : file.mime.startsWith("audio/") ? (
              <audio
                controls
                preload="metadata"
                className="w-full mb-3"
                src={`/api/files/${file.id}`}
              />
            ) : null}
            <div className="between flex items-center justify-between gap-2 flex-wrap">
              <a
                className="[overflow-wrap:anywhere] text-[12px] font-medium text-[#74609f] hover:underline"
                href={`/api/files/${file.id}`}
                target="_blank"
                rel="noreferrer"
              >
                {file.name}
              </a>
              <small className="muted text-[9px] text-[var(--muted,#757185)]">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </small>
              {editable &&
                (!(assignmentId || cohortAssignmentId) ||
                  (cohortAssignmentId
                    ? file.cohort_assignment_version
                    : file.assignment_version) > version) && (
                  <Button
                    type="button"
                    kind="ghost"
                    disabled={busy}
                    onClick={() => remove(file.id)}
                  >
                    Gỡ tệp
                  </Button>
                )}
            </div>
          </div>
        ))
      ) : (
        <p className="muted small text-[9px] text-[var(--muted,#757185)] mb-3">
          Chưa có tệp đính kèm.
        </p>
      )}
      {editable && (
        <form
          onSubmit={upload}
          className="live-form flex flex-col gap-[14px] mt-3"
        >
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Chọn tệp
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px] bg-white"
              type="file"
              name="file"
              required
              accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.mp4,.webm,.mp3,.wav,.png,.jpg,.jpeg"
            />
          </label>
          <small className="muted text-[9px] text-[var(--muted,#757185)] leading-relaxed">
            PDF, Office, văn bản, ảnh, video hoặc âm thanh. Tối đa 128 MB mỗi
            tệp.
          </small>
          <div className="self-start">
            <Button disabled={busy} type="submit" icon="Upload">
              {busy ? "Đang tải…" : "Tải tệp lên"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
export function LessonTools({
  course,
  lesson,
  state,
}: {
  course: any;
  lesson: any;
  state?: any;
}) {
  const [data, setData] = useState<any>(null),
    [note, setNote] = useState(""),
    [answer, setAnswer] = useState(""),
    [result, setResult] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    let current = true;
    api("/learning")
      .then((d) => {
        if (!current) return;
        setData(d);
        const savedNote = d.notes.find((n: any) => n.lesson_id === lesson.id);
        if (savedNote) {
          setNote(savedNote.body);
          setSaved(true);
        }
      })
      .catch((e: any) => current && setError(e.message));
    return () => {
      current = false;
    };
  }, [lesson.id]);
  const quiz = data?.quizzes.find((q: any) => q.lesson_id === lesson.id);
  async function saveNote(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/learning/notes/${lesson.id}`, "PUT", { text: note });
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setResult(
        await api(`/learning/quizzes/${lesson.id}/attempt`, "POST", {
          answerIndex: Number(answer),
        }),
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="lesson-tools mt-6">
      <FilePanel courseId={course.id} lessonId={lesson.id} />
      {error && (
        <p
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8]"
          role="alert"
        >
          {error}
        </p>
      )}
      <section className="border-t border-[var(--border,#e9eaf0)] mt-6 pt-6">
        <h3 className="text-[14px] font-bold text-[#1f1b2d] mb-2">
          Ghi chú riêng của bạn
        </h3>
        {data ? (
          <form
            className="live-form flex flex-col gap-[14px] mt-[14px]"
            onSubmit={saveNote}
          >
            <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
              Ghi chú bài học
              <textarea
                className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                rows={4}
                maxLength={30000}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setSaved(false);
                }}
              />
            </label>
            <div className="self-start">
              <Button type="submit" kind="secondary" disabled={busy}>
                {saved ? "Đã lưu ghi chú" : "Lưu ghi chú"}
              </Button>
            </div>
            <small className="muted text-[9px] text-[var(--muted,#757185)]">
              Chỉ bạn xem được ghi chú này.
            </small>
          </form>
        ) : (
          <p className="text-[12px] text-[var(--muted,#757185)]">
            Đang tải ghi chú…
          </p>
        )}
      </section>
      {quiz && (
        <section className="border-t border-[var(--border,#e9eaf0)] mt-6 pt-6">
          <h3 className="text-[14px] font-bold text-[#1f1b2d] mb-2">
            Câu hỏi ôn tập
          </h3>
          <form
            className="live-form flex flex-col gap-[14px] mt-[14px]"
            onSubmit={submit}
          >
            <fieldset className="border-0 p-0 m-0">
              <legend className="font-semibold leading-[1.8] mb-3 text-[13px] text-[#1f1b2d]">
                {quiz.question}
              </legend>
              {quiz.options.map((option, index) => (
                <label
                  key={index}
                  className="flex flex-row items-center gap-3 p-3 bg-[#f8f6fc] rounded-lg mb-2 text-[12px] text-[#1f1b2d] cursor-pointer hover:bg-[#f0ebf9]"
                >
                  <input
                    type="radio"
                    required
                    className="w-auto"
                    name={`quiz-${lesson.id}`}
                    checked={answer === String(index)}
                    onChange={() => setAnswer(String(index))}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
            <div className="self-start">
              <Button type="submit" disabled={busy || answer === ""}>
                Kiểm tra đáp án
              </Button>
            </div>
            {result && (
              <div
                role="status"
                className="live-feedback flex items-start gap-[12px] p-[18px] bg-[#f3f0fa] rounded-[8px] mt-2"
              >
                <div>
                  <strong className="text-[12px] text-[#1f1b2d] font-semibold">
                    {result.passed ? "Chính xác" : "Chưa đúng — hãy thử lại"}
                  </strong>
                  <p className="text-[12px] text-[#4f4861] leading-[1.8] mt-1 mb-0">
                    {result.explanation}
                  </p>
                </div>
              </div>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
export function ContentTools({
  course,
  onClose,
}: {
  course: any;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(course.lessons[0].id),
    [question, setQuestion] = useState(""),
    [options, setOptions] = useState(""),
    [correct, setCorrect] = useState("0"),
    [explanation, setExplanation] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    let current = true;
    api("/learning")
      .then((d: any) => {
        if (!current) return;
        const quiz = d.quizzes.find((q: any) => q.lesson_id === selected);
        setQuestion(quiz?.question || "");
        setOptions(quiz?.options.join("\n") || "");
        setCorrect(String(quiz?.correct_index ?? 0));
        setExplanation(quiz?.explanation || "");
      })
      .catch((e: any) => current && setError(e.message));
    return () => {
      current = false;
    };
  }, [selected]);
  async function save(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/learning/quizzes/${selected}`, "PUT", {
        question,
        options: options
          .split("\n")
          .map((x: any) => x.trim())
          .filter(Boolean),
        correctIndex: Number(correct),
        explanation,
      });
      setNotice("Đã lưu câu hỏi ôn tập.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="live-panel bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-6">
      <div className="between flex items-center justify-between gap-4 mb-4">
        <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-0">
          Học liệu: {course.title}
        </h2>
        <Button kind="ghost" onClick={onClose}>
          Đóng học liệu
        </Button>
      </div>
      <label className="live-form flex flex-col gap-2 text-[11px] font-medium min-w-0 mb-4">
        Bài học
        <select
          className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
          aria-label="Chọn bài học quản lý"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {course.lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </label>
      <FilePanel
        key={selected}
        courseId={course.id}
        lessonId={selected}
        editable
      />
      <form
        className="live-form flex flex-col gap-[16px] border-t border-[var(--border,#e9eaf0)] mt-6 pt-6"
        onSubmit={save}
      >
        <h3 className="text-[15px] font-bold text-[#1f1b2d] mb-0">
          Biên soạn câu hỏi ôn tập
        </h3>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Câu hỏi
          <input
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            required
            maxLength={2000}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Lựa chọn — mỗi dòng một đáp án
          <textarea
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            required
            rows={4}
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Đáp án đúng
          <select
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            aria-label="Đáp án đúng"
            value={correct}
            onChange={(e) => setCorrect(e.target.value)}
          >
            {options
              .split("\n")
              .filter((x) => x.trim())
              .map((x, i) => (
                <option key={i} value={i}>
                  {i + 1}. {x}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Giải thích
          <textarea
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            maxLength={5000}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </label>
        {error && (
          <p
            role="alert"
            className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] leading-[1.8]"
          >
            {error}
          </p>
        )}
        {notice && (
          <p className="text-[12px] text-[#3b7c53]" role="status">
            {notice}
          </p>
        )}
        <div className="self-start">
          <Button disabled={busy}>Lưu câu hỏi</Button>
        </div>
      </form>
    </div>
  );
}
