import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api-client";

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
    <section className="live-panel bg-white border border-[var(--border,#e9eaf0)] rounded-xl p-[25px] max-sm:p-5 mb-6">
      <div className="between flex justify-between items-center max-sm:flex-col max-sm:items-start gap-4 mb-4">
        <h2 className="text-[19px] font-semibold text-[#333] m-0">
          Giảng viên: {course.title}
        </h2>
        <Button kind="ghost" onClick={onClose}>
          Đóng nhóm giảng viên
        </Button>
      </div>
      {error && (
        <p
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8] text-[12px]"
          role="alert"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="text-[12px] text-[#34785c] font-medium my-2"
        >
          {notice}
        </p>
      )}
      {!data ? (
        <p role="status" className="text-[12px] text-[#858894] my-4">
          {error
            ? "Chưa tải được nhóm giảng viên. Đóng và mở lại để thử lại."
            : "Đang tải giảng viên…"}
        </p>
      ) : data.can_manage ? (
        <form className="live-form flex flex-col gap-4" onSubmit={save}>
          <fieldset
            className="cohort-checks border border-[#ddd9e4] rounded-[10px] p-[14px] max-h-[280px] overflow-auto flex flex-col gap-2"
            disabled={pending}
          >
            <legend className="font-semibold text-[13px] px-1 text-[#4b3c88]">
              Giảng viên cùng biên soạn khóa học
            </legend>
            {[
              ...new Map(
                [...data.instructors, ...data.candidates].map((person) => [
                  person.id,
                  person,
                ]),
              ).values(),
            ].map((person) => (
              <label
                key={person.id}
                className="flex items-center gap-2.5 text-[12px] text-[#3d3350] cursor-pointer py-1"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(person.id)}
                  disabled={person.id === course.owner_id}
                  className="w-[18px] h-[18px] accent-[#6b57bd]"
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
          <p className="muted small text-[11px] text-[#858894] m-0 leading-[1.7]">
            Giảng viên cùng biên soạn quản lý nội dung khóa học. Mỗi lớp có nhóm
            giảng viên và danh sách học viên riêng.
          </p>
          <div>
            <Button disabled={pending} type="submit">
              {pending ? "Đang lưu…" : "Lưu nhóm giảng viên"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-[13px] text-[#404040] my-3">
          {data.instructors.map((person) => person.name).join(", ")}
        </p>
      )}
    </section>
  );
}
