import { useState } from "react";
import {
  Badge,
  Button,
  CourseCard,
  Empty,
  Icon,
  PageHead,
  Tabs,
  useApp,
} from "@/components/ui";
import { categories, normalize } from "../../portal-data";
import { progress } from "../../portal-store";

export function Catalog() {
  const { state } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [tab, setTab] = useState("Tất cả khóa học");
  const [level, setLevel] = useState("Tất cả cấp độ");

  const courses = state.courses.filter(
    (c: any) =>
      c.status === "published" &&
      (cat === "Tất cả" || c.category === cat) &&
      (level === "Tất cả cấp độ" || c.level === level) &&
      normalize(`${c.title} ${c.category} ${c.scope}`).includes(normalize(q)) &&
      (tab !== "Đã lưu" || state.bookmarks.includes(c.id)) &&
      (tab !== "Đang học" ||
        (state.enrolled.includes(c.id) && progress(state, c.id) < 100)),
  );

  return (
    <>
      <PageHead
        eyebrow="KHÁM PHÁ & HỌC HỎI"
        title="Thư viện học tập"
        description="Tri thức được sẻ chia. Năng lực được nuôi dưỡng."
      />
      <section className="library-banner flex justify-between items-center bg-[#e9e2f4] text-[#7d6698] rounded-[14px] p-[27px_35px] max-[900px]:p-[25px] mb-7 overflow-hidden">
        <div>
          <Badge color="white">BỘ SƯU TẬP NỔI BẬT</Badge>
          <h2 className="text-[27px] max-[900px]:text-[25px] leading-[1.45] my-[15px] mb-2 font-[550]">
            AI là cộng sự.
            <br />
            Bạn là người dẫn đường.
          </h2>
          <p className="text-[11px] max-[900px]:text-[10px] text-[#a18bb1] max-[900px]:max-w-[240px]">
            Học cách làm việc cùng AI một cách chủ động và có kiểm chứng.
          </p>
          <button
            className="text-btn text-[11px] text-[#9b87bc] hover:underline flex items-center gap-1.5 mt-2"
            onClick={() => setCat("AI & Dữ liệu")}
          >
            Khám phá các khóa AI <Icon name="ArrowRight" size={17} />
          </button>
        </div>
        <div className="library-banner-icon flex flex-col items-center p-[15px_70px] max-[1200px]:p-[15px_30px] max-[900px]:p-[0_15px] text-[#baa5d2] gap-[18px]">
          <Icon
            name="Sparkles"
            size={104}
            strokeWidth={1}
            className="max-[900px]:w-[72px]"
          />
          <span className="text-[12px] max-[900px]:text-[10px] tracking-[5px] max-[900px]:tracking-[3px] font-medium">
            HUMAN × AI
          </span>
        </div>
      </section>
      <Tabs
        items={["Tất cả khóa học", "Đang học", "Đã lưu"]}
        value={tab}
        onChange={setTab}
      />
      <div className="filter-row flex gap-3 max-[900px]:gap-2 items-center mb-[19px]">
        <div className="search-input flex gap-2.5 items-center border border-[var(--border,#e9eaf0)] rounded-lg bg-white px-[13px] min-w-0 flex-1 text-[#afa5b8] focus-within:outline-2 focus-within:outline-[#cbb8e0]">
          <Icon name="Search" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm khóa học, chủ đề, dự án…"
            aria-label="Tìm khóa học"
            className="border-0 bg-transparent py-3 w-full text-[11px] max-[900px]:text-[10px] outline-none text-[#56515f]"
          />
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Cấp độ khóa học"
          className="text-[11px] max-[900px]:text-[10px] p-[12px_30px_12px_12px] min-w-[160px] max-[900px]:min-w-0 max-[900px]:max-w-[145px] border border-[var(--border,#e9eaf0)] rounded-lg bg-white text-[#6c5980]"
        >
          {["Tất cả cấp độ", "Nền tảng", "Ứng dụng", "Nâng cao"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      <div className="chips flex items-center gap-2 max-[900px]:gap-1.5 flex-wrap mb-5">
        {categories.map((c) => (
          <button
            key={c}
            className={`chips-btn border border-[#e8e4ec] rounded-md text-[10px] p-[8px_12px] max-[900px]:p-[8px_9px] transition-colors ${
              cat === c
                ? "selected bg-[#eee7f6] border-[#ded2ee] text-[#9271b3] font-medium"
                : "bg-white text-[#a196aa] hover:bg-[#faf7fc]"
            }`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="between catalog-count flex items-center justify-between m-[0_0_17px]">
        <p className="muted small text-[10px] text-[var(--muted,#9b91ab)] m-0">
          {courses.length} khóa học dành cho bạn
        </p>
      </div>
      {courses.length ? (
        <div className="course-grid three grid grid-cols-3 max-md:grid-cols-1 gap-[18px]">
          {courses.map((c: any) => (
            <CourseCard
              key={c.id}
              course={c}
              progress={
                state.enrolled.includes(c.id)
                  ? progress(state, c.id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Chưa có khóa học phù hợp"
          description="Thử thay đổi từ khóa hoặc bộ lọc."
        >
          <Button
            kind="secondary"
            onClick={() => {
              setQ("");
              setCat("Tất cả");
              setLevel("Tất cả cấp độ");
              setTab("Tất cả khóa học");
            }}
          >
            Xóa bộ lọc
          </Button>
        </Empty>
      )}
    </>
  );
}
