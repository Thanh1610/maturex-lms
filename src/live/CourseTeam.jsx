import { useEffect, useRef, useState } from "react";
import { Button } from "../ui.jsx";
import { api } from "./api.js";
import "./cohorts.css";

export function CourseTeam({ course, onClose, onSaved }) {
  const [data, setData] = useState(null),
    [selected, setSelected] = useState([]);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [pending, setPending] = useState(false);
  const active = useRef(false);
  useEffect(() => {
    active.current = true;
    let current = true;
    api(`/courses/${course.id}/instructors`)
      .then((result) => {
        if (!current) return;
        setData(result);
        setSelected(result.instructors.map((person) => person.id));
      })
      .catch((e) => current && setError(e.message));
    return () => {
      current = false;
      active.current = false;
    };
  }, [course.id]);
  async function save(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      await api(`/courses/${course.id}/instructors`, "PUT", {
        instructor_ids: selected,
      });
      const result = await api(`/courses/${course.id}/instructors`);
      if (active.current) {
        setData(result);
        setNotice("Đã lưu nhóm giảng viên.");
        await onSaved?.();
      }
    } catch (e) {
      if (active.current) setError(e.message);
    } finally {
      if (active.current) setPending(false);
    }
  }
  return (
    <section className="live-panel">
      <div className="between">
        <h2>Giảng viên: {course.title}</h2>
        <Button kind="ghost" onClick={onClose}>
          Đóng nhóm giảng viên
        </Button>
      </div>
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {!data ? (
        <p role="status">
          {error
            ? "Chưa tải được nhóm giảng viên. Đóng và mở lại để thử lại."
            : "Đang tải giảng viên…"}
        </p>
      ) : data.can_manage ? (
        <form className="live-form" onSubmit={save}>
          <fieldset className="cohort-checks" disabled={pending}>
            <legend>Giảng viên cùng biên soạn khóa học</legend>
            {[
              ...new Map(
                [...data.instructors, ...data.candidates].map((person) => [
                  person.id,
                  person,
                ]),
              ).values(),
            ].map((person) => (
              <label key={person.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(person.id)}
                  disabled={person.id === course.owner_id}
                  onChange={(e) =>
                    setSelected((ids) =>
                      e.target.checked
                        ? [...ids, person.id]
                        : ids.filter((id) => id !== person.id),
                    )
                  }
                />
                {person.name}
                {person.id === course.owner_id ? " · Chủ trì" : ""}
              </label>
            ))}
          </fieldset>
          <p className="muted small">
            Giảng viên cùng biên soạn quản lý nội dung khóa học. Mỗi lớp có nhóm
            giảng viên và danh sách học viên riêng.
          </p>
          <Button disabled={pending} type="submit">
            {pending ? "Đang lưu…" : "Lưu nhóm giảng viên"}
          </Button>
        </form>
      ) : (
        <p>{data.instructors.map((person) => person.name).join(", ")}</p>
      )}
    </section>
  );
}
