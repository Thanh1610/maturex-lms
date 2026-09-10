import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "../ui.jsx";
import { api } from "./api.js";

export function FilePanel({
  courseId,
  lessonId,
  assignmentId,
  cohortAssignmentId,
  editable = false,
  version = 0,
}) {
  const [files, setFiles] = useState([]),
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
    } catch (e) {
      if (sequence === loadSequence.current) setError(e.message);
    }
  }
  useEffect(() => {
    load();
    return () => {
      loadSequence.current++;
    };
  }, [load]);
  async function upload(event) {
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
            : { courseId, ...(lessonId ? { lessonId } : {}) },
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
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id) {
    setBusy(true);
    setError("");
    try {
      await api(`/files/${id}`, "DELETE", {});
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="learning-tool">
      <h3>
        <Icon name="Paperclip" size={17} />{" "}
        {assignmentId || cohortAssignmentId
          ? "Tệp bài thực hành"
          : "Video & tài liệu"}
      </h3>
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {files.length ? (
        files.map((file) => (
          <div
            key={file.id}
            className="border border-[var(--border)] p-[14px] rounded-[9px] mb-3"
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
            <div className="between flex-wrap">
              <a
                className="[overflow-wrap:anywhere]"
                href={`/api/files/${file.id}`}
                target="_blank"
                rel="noreferrer"
              >
                {file.name}
              </a>
              <small className="muted">
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
        <p className="muted small">Chưa có tệp đính kèm.</p>
      )}
      {editable && (
        <form onSubmit={upload} className="live-form">
          <label>
            Chọn tệp
            <input
              type="file"
              name="file"
              required
              accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.mp4,.webm,.mp3,.wav,.png,.jpg,.jpeg"
            />
          </label>
          <small className="muted">
            PDF, Office, văn bản, ảnh, video hoặc âm thanh. Tối đa 128 MB mỗi
            tệp.
          </small>
          <Button disabled={busy} type="submit" icon="Upload">
            {busy ? "Đang tải…" : "Tải tệp lên"}
          </Button>
        </form>
      )}
    </section>
  );
}
export function LessonTools({ course, lesson, state }) {
  const [data, setData] = useState(null),
    [note, setNote] = useState(""),
    [answer, setAnswer] = useState(""),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    let current = true;
    setData(null);
    api("/learning")
      .then((d) => {
        if (current) {
          setData(d);
          setNote(d.notes.find((n) => n.lesson_id === lesson.id)?.text || "");
        }
      })
      .catch((e) => current && setError(e.message));
    return () => {
      current = false;
    };
  }, [lesson.id]);
  const quiz = data?.quizzes.find((q) => q.lesson_id === lesson.id);
  async function saveNote(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/learning/notes/${lesson.id}`, "PUT", { text: note });
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setResult(
        await api(`/learning/quizzes/${lesson.id}/attempt`, "POST", {
          answerIndex: Number(answer),
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="lesson-tools">
      <FilePanel courseId={course.id} lessonId={lesson.id} />
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      <section className="border-t border-[var(--border)] mt-6 pt-6">
        <h3>Ghi chú riêng của bạn</h3>
        {data ? (
          <form className="live-form mt-[14px]" onSubmit={saveNote}>
            <label>
              Ghi chú bài học
              <textarea
                rows={4}
                maxLength={30000}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setSaved(false);
                }}
              />
            </label>
            <Button type="submit" kind="secondary" disabled={busy}>
              {saved ? "Đã lưu ghi chú" : "Lưu ghi chú"}
            </Button>
            <small className="muted">Chỉ bạn xem được ghi chú này.</small>
          </form>
        ) : (
          <p>Đang tải ghi chú…</p>
        )}
      </section>
      {quiz && (
        <section className="border-t border-[var(--border)] mt-6 pt-6">
          <h3>Câu hỏi ôn tập</h3>
          <form className="live-form mt-[14px]" onSubmit={submit}>
            <fieldset className="border-0 p-0 m-0">
              <legend className="font-semibold leading-[1.8] mb-3">
                {quiz.question}
              </legend>
              {quiz.options.map((option, index) => (
                <label
                  key={index}
                  className="flex flex-row items-center p-3 bg-[#f8f6fc] rounded-lg mb-2"
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
            <Button type="submit" disabled={busy || answer === ""}>
              Kiểm tra đáp án
            </Button>
            {result && (
              <div role="status" className="live-feedback">
                <div>
                  <strong>
                    {result.passed ? "Chính xác" : "Chưa đúng — hãy thử lại"}
                  </strong>
                  <p>{result.explanation}</p>
                </div>
              </div>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
export function ContentTools({ course, onClose }) {
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
      .then((d) => {
        if (!current) return;
        const quiz = d.quizzes.find((q) => q.lesson_id === selected);
        setQuestion(quiz?.question || "");
        setOptions(quiz?.options.join("\n") || "");
        setCorrect(String(quiz?.correct_index ?? 0));
        setExplanation(quiz?.explanation || "");
      })
      .catch((e) => current && setError(e.message));
    return () => {
      current = false;
    };
  }, [selected]);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/learning/quizzes/${selected}`, "PUT", {
        question,
        options: options
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
        correctIndex: Number(correct),
        explanation,
      });
      setNotice("Đã lưu câu hỏi ôn tập.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="live-panel">
      <div className="between">
        <h2>Học liệu: {course.title}</h2>
        <Button kind="ghost" onClick={onClose}>
          Đóng học liệu
        </Button>
      </div>
      <label className="live-form">
        Bài học
        <select
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
        className="live-form border-t border-[var(--border)] mt-6 pt-6"
        onSubmit={save}
      >
        <h3>Biên soạn câu hỏi ôn tập</h3>
        <label>
          Câu hỏi
          <input
            required
            maxLength={2000}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        <label>
          Lựa chọn — mỗi dòng một đáp án
          <textarea
            required
            rows={4}
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />
        </label>
        <label>
          Đáp án đúng
          <select
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
        <label>
          Giải thích
          <textarea
            maxLength={5000}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="live-error">
            {error}
          </p>
        )}
        {notice && <p role="status">{notice}</p>}
        <Button disabled={busy}>Lưu câu hỏi</Button>
      </form>
    </div>
  );
}
