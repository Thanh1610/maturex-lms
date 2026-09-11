import { useState } from "react";
import {
  Badge,
  Button,
  Empty,
  Field,
  Icon,
  PageHead,
  statusColor,
  statusLabel,
  Tabs,
  useApp,
} from "@/components/ui";
import { categories, normalize, paths, people } from "../../portal-data";
import { AssignPath } from "./team-view";

export function CourseEditor({ id }: { id?: string }) {
  const { state, dispatch, close, notify } = useApp();
  const existing = state.courses.find((c: any) => c.id === id);
  const [title, setTitle] = useState(existing?.title || "");
  const [category, setCategory] = useState(
    existing?.category || "AI & Dữ liệu",
  );
  const [description, setDescription] = useState(existing?.description || "");
  const [lessons, setLessons] = useState(existing?.lessons?.join("\n") || "");
  const [exercise, setExercise] = useState(existing?.exercise || "");
  const [source, setSource] = useState("");
  const [generated, setGenerated] = useState(false);

  function generate() {
    setTitle((t) => t || "Thực hành giao việc và kiểm chứng kết quả với AI");
    setDescription(
      "Tạo đề bài rõ ràng, đánh giá nguồn và áp dụng AI vào một nhiệm vụ có phạm vi. Nội dung nháp được tạo theo kịch bản demo.",
    );
    setLessons(
      "Xác định mục tiêu và đầu ra\nViết brief có bối cảnh\nKiểm chứng sản phẩm do AI tạo\nỨng dụng và rút kinh nghiệm",
    );
    setExercise(
      "Chọn một nhiệm vụ thực tế. Viết brief, dùng AI để tạo bản nháp và ghi lại ít nhất ba điểm đã kiểm chứng trước khi sử dụng.",
    );
    setGenerated(true);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const lines = lessons
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);
        if (!lines.length) {
          notify("Cần ít nhất một bài học.");
          return;
        }
        const f = new FormData(e.currentTarget);
        const cid = id || `course-${Date.now()}`;
        dispatch({
          type: "saveCourse",
          id: cid,
          value: {
            id: cid,
            title: title.trim(),
            description,
            category,
            lessons: lines,
            exercise,
            scope: f.get("scope"),
            level: f.get("level"),
            duration: f.get("duration"),
            teacher: "Ngọc Linh",
            color: existing?.color || "lavender",
            icon: existing?.icon || "Sparkles",
            label: "LEARN & PRACTICE",
            students: existing?.students || 0,
            skill: existing?.skill || "ai",
            status: existing?.status || "draft",
            source,
          },
        });
        notify("Đã lưu khóa học. Có thể phát hành từ danh sách quản lý.");
        close();
      }}
    >
      <div className="upload-zone border border-dashed border-[#cbb3dc] bg-[#fcf9ff] rounded-[10px] p-6 text-center flex items-center flex-col text-[#b291c8] mb-5">
        <Icon name="Upload" size={28} className="text-[#9b7fad]" />
        <strong className="block text-[14px] font-medium text-[#9c7bac] my-[13px] mb-1">
          Từ buổi đào tạo đến học liệu
        </strong>
        <p className="text-[11px] text-[#887093] my-1 mb-3">
          Chọn record hoặc tài liệu để mô phỏng quy trình biên tập.
        </p>
        <input
          aria-label="Chọn record mẫu"
          type="file"
          accept="video/*,.pdf,.ppt,.pptx,.txt"
          onChange={(e) => setSource(e.target.files?.[0]?.name || "")}
          className="text-[10px] border-0 bg-transparent max-w-full p-2.5 text-[#887093]"
        />
        {source && <Badge color="green">{source}</Badge>}
        <button
          type="button"
          className="btn secondary my-3 flex items-center gap-1.5"
          onClick={generate}
        >
          <Icon name="Sparkles" size={17} />
          Tạo học liệu mẫu bằng AI
        </button>
        {generated && (
          <small className="muted block mt-1.5 text-[9px] text-[#887093]">
            Đã điền tự động các trường từ record. Bạn có thể sửa trực tiếp.
          </small>
        )}
      </div>
      <Field label="Tên khóa học">
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>
      <Field label="Chủ đề">
        <select
          aria-label="Chủ đề khóa học"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Giới thiệu ngắn">
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Field>
      <div className="form-grid grid grid-cols-3 max-sm:grid-cols-1 gap-3.5 my-3">
        <Field label="Phạm vi">
          <select
            name="scope"
            defaultValue={existing?.scope || "Nội bộ toàn công ty"}
          >
            <option>Nội bộ toàn công ty</option>
            <option>Khối nghiệp vụ</option>
            <option>Theo lời mời</option>
          </select>
        </Field>
        <Field label="Cấp độ">
          <select name="level" defaultValue={existing?.level || "Cơ bản"}>
            <option>Cơ bản</option>
            <option>Ứng dụng</option>
            <option>Nâng cao</option>
          </select>
        </Field>
        <Field label="Thời lượng dự kiến">
          <input
            name="duration"
            defaultValue={existing?.duration || "2 giờ thực hành"}
          />
        </Field>
      </div>
      <Field label="Danh sách bài học (mỗi bài một dòng)">
        <textarea
          rows={5}
          value={lessons}
          onChange={(e) => setLessons(e.target.value)}
          placeholder="Bài 1: Tổng quan\nBài 2: Thực hành\n..."
        />
      </Field>
      <Field label="Đề bài thực hành">
        <textarea
          rows={3}
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Gợi ý bài thực hành giúp học viên áp dụng kiến thức vào thực tế công việc..."
        />
      </Field>
      <div className="modal-actions flex justify-end items-center gap-2.5 mt-5 pt-4 border-t border-[#f0e8f7]">
        <Button type="submit" icon="Sparkles">
          Lưu và hoàn tất
        </Button>
      </div>
    </form>
  );
}

export function CreatePath() {
  const { state, dispatch, close, notify } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!selected.length) {
          notify("Chọn ít nhất một khóa học.");
          return;
        }
        const f = new FormData(e.currentTarget);
        dispatch({
          type: "addPath",
          value: {
            id: `path-${Date.now()}`,
            title: f.get("title"),
            description: f.get("description"),
            target: f.get("target"),
            courses: selected,
            weeks: `${f.get("weeks")} tuần`,
            color: "blue",
            icon: "Compass",
          },
        });
        notify("Đã tạo lộ trình mới.");
        close();
      }}
    >
      <Field label="Tên lộ trình">
        <input name="title" required minLength={5} />
      </Field>
      <Field label="Mô tả">
        <textarea name="description" required />
      </Field>
      <div className="form-grid grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 my-3">
        <Field label="Năng lực / kết quả mục tiêu">
          <input name="target" required />
        </Field>
        <Field label="Số tuần dự kiến">
          <input
            name="weeks"
            type="number"
            min="1"
            max="52"
            defaultValue="4"
            required
          />
        </Field>
      </div>
      <h3 className="text-[14px] font-[550] text-[#9b77ad] mt-4 mb-2">
        Chọn khóa học theo thứ tự
      </h3>
      <div className="course-picker border border-[#eee5f5] rounded-[9px] max-h-[220px] overflow-y-auto p-2 bg-[#fcf9ff]">
        {state.courses
          .filter((c: any) => c.status === "published")
          .map((c: any) => (
            <label
              key={c.id}
              className="flex items-center gap-2.5 py-[13px] border-b border-[#eee5f5] text-[11px] text-[#aa8bbd]"
            >
              <input
                type="checkbox"
                className="accent-[#ac8dc5]"
                checked={selected.includes(c.id)}
                onChange={() =>
                  setSelected((s) =>
                    s.includes(c.id)
                      ? s.filter((id) => id !== c.id)
                      : [...s, c.id],
                  )
                }
              />
              <span>{c.title}</span>
              {selected.includes(c.id) && (
                <Badge className="ml-auto">{selected.indexOf(c.id) + 1}</Badge>
              )}
            </label>
          ))}
      </div>
      <div className="modal-actions flex justify-end items-center gap-2.5 mt-5 pt-4 border-t border-[#f0e8f7]">
        <Button type="submit" icon="Compass">
          Tạo lộ trình
        </Button>
      </div>
    </form>
  );
}

export function Studio() {
  const { state, dispatch, open, go, notify, close } = useApp();
  const [tab, setTab] = useState("Khóa học");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const list = state.courses.filter(
    (c: any) =>
      normalize(c.title).includes(normalize(q)) &&
      (status === "all" || c.status === status),
  );

  return (
    <>
      <PageHead
        eyebrow="BIẾN TRI THỨC THÀNH TRẢI NGHIỆM HỌC"
        title="Quản lý đào tạo"
        description="Biên tập học liệu, xây lộ trình và tổ chức những buổi học có ý nghĩa."
      >
        <Button
          icon="Plus"
          onClick={() =>
            open(
              tab === "Lộ trình" ? "Tạo lộ trình" : "Tạo khóa học từ học liệu",
              tab === "Lộ trình" ? <CreatePath /> : <CourseEditor />,
              true,
            )
          }
        >
          {tab === "Lộ trình" ? "Tạo lộ trình" : "Tạo khóa học"}
        </Button>
      </PageHead>
      <div className="studio-banner flex items-center gap-[19px] p-[25px] bg-[#f1eaf7] border border-[#eaddf2] rounded-[11px] mb-[25px] text-[#b093c1]">
        <span className="icon-tile lavender w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="Sparkles" size={28} />
        </span>
        <div className="flex-1">
          <h3 className="text-[15px] text-[#9471a7] font-[550] m-0 mb-1.5">
            Một buổi chia sẻ. Nhiều cơ hội học tập.
          </h3>
          <p className="text-[11px] text-[#817489] m-0 leading-[1.7]">
            AI hỗ trợ chia chương, tóm tắt và soạn bài tập. Bạn giữ vai trò biên
            tập và duyệt.
          </p>
        </div>
        <Button
          kind="secondary"
          onClick={() => open("Biên tập từ record", <CourseEditor />, true)}
        >
          Thử với record
          <Icon name="ArrowUpRight" size={17} />
        </Button>
      </div>
      <Tabs items={["Khóa học", "Lộ trình"]} value={tab} onChange={setTab} />
      {tab === "Khóa học" ? (
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
          <div className="filter-row flex gap-3 max-[900px]:gap-2 items-center mb-[19px]">
            <div className="search-input flex gap-2.5 items-center border border-[var(--border,#e9eaf0)] rounded-lg bg-white px-[13px] min-w-0 flex-1 text-[#afa5b8] focus-within:outline-2 focus-within:outline-[#cbb8e0]">
              <Icon name="Search" size={18} />
              <input
                aria-label="Tìm khóa học quản lý"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm trong nội dung của bạn…"
                className="border-0 bg-transparent py-3 w-full text-[11px] outline-none text-[#56515f]"
              />
            </div>
            <select
              aria-label="Trạng thái khóa học"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-[11px] p-[12px_30px_12px_12px] min-w-[160px] border border-[var(--border,#e9eaf0)] rounded-lg bg-white text-[#6c5980]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="published">Đã phát hành</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>
          <div className="table-scroll overflow-x-auto max-w-full">
            <table className="studio-table w-full text-left whitespace-nowrap border-collapse">
              <thead>
                <tr className="border-b border-[#efe7f5]">
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    KHÓA HỌC
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    PHẠM VI
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    TRẠNG THÁI
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#efe7f5] last:border-0 hover:bg-[#fcfaff]"
                  >
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <button
                        className="studio-course flex items-center gap-3 text-left p-0 whitespace-normal min-w-[260px] max-w-[400px] hover:opacity-80"
                        onClick={() => go(`course/${c.id}`)}
                      >
                        <span
                          className={`icon-tile ${c.color} w-[38px] h-[44px] rounded-[7px] flex items-center justify-center shrink-0`}
                        >
                          <Icon name={c.icon} />
                        </span>
                        <div>
                          <strong className="text-[11px] leading-[1.8] font-medium text-[#977ba7] block">
                            {c.title}
                          </strong>
                          <small className="text-[10px] text-[#817489] block mt-1">
                            {c.category} · {c.lessons.length} bài học
                          </small>
                        </div>
                      </button>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <span className="small text-[10px] text-[#6c5980]">
                        {c.scope}
                      </span>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <Badge color={statusColor[c.status]}>
                        {statusLabel[c.status]}
                      </Badge>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <div className="table-actions flex items-center gap-2">
                        <button
                          className="icon-btn p-1.5 rounded-md hover:bg-[#f3edf8] text-[#8f749e]"
                          aria-label={`Sửa ${c.title}`}
                          onClick={() =>
                            open(
                              "Biên tập khóa học",
                              <CourseEditor id={c.id} />,
                              true,
                            )
                          }
                        >
                          <Icon name="Pencil" size={17} />
                        </button>
                        <button
                          className="text-btn text-[10px] text-[#9b87bc] hover:underline"
                          onClick={() =>
                            open(
                              c.status === "published"
                                ? "Lưu trữ khóa học?"
                                : "Phát hành khóa học?",
                              <div className="stack flex flex-col gap-3">
                                <p>
                                  <strong>{c.title}</strong>
                                </p>
                                <p className="text-[11px] text-[#817489] leading-[1.8]">
                                  {c.status === "published"
                                    ? "Khóa sẽ được ẩn khỏi thư viện khám phá. Hồ sơ học tập đã có được giữ lại."
                                    : "Khóa sẽ xuất hiện trong thư viện demo. Xác nhận bạn đã rà soát nội dung và bài tập."}
                                </p>
                                <Button
                                  onClick={() => {
                                    dispatch({
                                      type: "publish",
                                      id: c.id,
                                      value:
                                        c.status === "published"
                                          ? "archived"
                                          : "published",
                                    });
                                    notify(
                                      c.status === "published"
                                        ? "Đã lưu trữ khóa học."
                                        : "Đã phát hành khóa học vào thư viện.",
                                    );
                                    close();
                                  }}
                                >
                                  {c.status === "published"
                                    ? "Lưu trữ"
                                    : "Xác nhận phát hành"}
                                </Button>
                              </div>,
                            )
                          }
                        >
                          {c.status === "published" ? "Lưu trữ" : "Phát hành"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!list.length && <Empty title="Chưa có nội dung phù hợp" />}
        </section>
      ) : (
        <div className="studio-paths grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-5">
          {[...paths, ...(state.customPaths || [])].map((p: any) => (
            <div
              className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[22px] flex flex-col justify-between"
              key={p.id}
            >
              <div>
                <span
                  className={`icon-tile ${p.color} w-10 h-10 rounded-lg flex items-center justify-center`}
                >
                  <Icon name={p.icon} />
                </span>
                <h3 className="text-[15px] font-[550] text-[#9b77ad] my-4 mb-2">
                  {p.title}
                </h3>
                <p className="muted small text-[11px] text-[#817489] leading-[1.8] min-h-[60px]">
                  {p.description}
                </p>
              </div>
              <div className="between flex justify-between items-center mt-4 pt-3 border-t border-[#f2e9f8]">
                <Badge color={p.color}>
                  {p.courses.length} khóa · {p.weeks}
                </Badge>
                <button
                  className="text-btn text-[11px] text-[#9b87bc] hover:underline flex items-center gap-1"
                  onClick={() =>
                    open("Giao lộ trình", <AssignPath person={people[0]} />)
                  }
                >
                  Giao học
                  <Icon name="ArrowRight" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
