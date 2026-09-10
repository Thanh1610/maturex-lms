import { useEffect, useRef, useState } from "react";
import { categories, normalize, paths, people, rubric } from "./data";
import { progress } from "./store";
import {
  Avatar,
  Badge,
  Button,
  CourseCard,
  download,
  Empty,
  Field,
  Icon,
  PageHead,
  Progress,
  SectionHead,
  Stat,
  statusColor,
  statusLabel,
  Tabs,
  useApp,
} from "./ui";

export function Dashboard() {
  const { state, go, role, open } = useApp();
  const ongoing = state.courses.filter(
    (c) => state.enrolled.includes(c.id) && progress(state, c.id) < 100,
  );
  const finished = state.enrolled.filter(
    (id) => progress(state, id) === 100,
  ).length;
  const todo = state.assignments.filter(
    (a) => a.person === "me" && ["todo", "revision"].includes(a.status),
  );
  return (
    <>
      <PageHead
        eyebrow="THỨ TƯ, 09 THÁNG 09, 2026"
        title="Chào Minh Anh, hôm nay bạn muốn học gì?"
        description="Thêm một điều mới. Tiến thêm một bước trên hành trình của bạn."
      >
        <Button
          kind="secondary"
          icon="CalendarDays"
          onClick={() => go("calendar")}
        >
          Lịch của tôi
        </Button>
      </PageHead>
      <div className="dashboard-grid grid grid-cols-[minmax(0,1fr)_280px] max-[1200px]:grid-cols-[minmax(0,1fr)_250px] max-[900px]:grid-cols-1 min-[1500px]:grid-cols-[minmax(0,1fr)_310px] gap-6 max-[1200px]:gap-[18px] min-[1500px]:gap-7">
        <div className="dashboard-primary">
          <section className="hero bg-[#ebe5f3] border border-[#e5dced] rounded-[14px] min-h-[278px] max-[1200px]:min-h-[260px] max-[900px]:min-h-[266px] max-md:min-h-[253px] min-[1500px]:min-h-[300px] flex overflow-hidden relative p-[30px_30px_27px] max-[1200px]:p-[27px_23px] max-[900px]:p-[23px] max-md:p-[22px_19px] min-[1500px]:p-[33px_38px] text-[#67567a]">
            <div className="hero-copy relative z-[1] flex-1">
              <span className="hero-kicker text-[10px] tracking-[1.4px] max-md:tracking-[0.9px] font-semibold text-[#9c87b0] flex items-center gap-1.5 mb-[17px]">
                <span className="w-[5px] h-[5px] rounded-full bg-[#bba5cb]" />{" "}
                HÀNH TRÌNH PHÁT TRIỂN CỦA BẠN
              </span>
              <h2 className="text-[28px] max-[1200px]:text-[25px] max-[900px]:text-[27px] max-md:text-[25px] min-[1500px]:text-[34px] leading-[1.5] tracking-[-0.7px] text-[#60516f] font-[550] mb-2.5">
                Học để hiểu.
                <br />
                Thực hành để trưởng thành.
              </h2>
              <p className="text-[10px] min-[1500px]:text-[12px] leading-[1.9] text-[#9a89a8] mb-5">
                Mỗi kiến thức chỉ thực sự có ý nghĩa
                <br className="desktop-break" /> khi được mang vào công việc và
                cuộc sống.
              </p>
              <Button
                kind="white"
                className="!text-[10px] !px-[15px] !py-2.5"
                onClick={() => go(`course/${ongoing[0]?.id || "ai"}`)}
              >
                Tiếp tục hành trình <Icon name="ArrowRight" size={17} />
              </Button>
            </div>
            <div className="hero-feature w-[170px] max-[1200px]:w-[120px] max-[900px]:w-[135px] min-[1500px]:w-[220px] flex flex-col items-center justify-center self-stretch ml-2.5 relative">
              <div className="hero-orbit w-[150px] h-[150px] max-[1200px]:w-[112px] max-[1200px]:h-[112px] max-[900px]:w-[117px] max-[900px]:h-[117px] min-[1500px]:w-[167px] min-[1500px]:h-[167px] rounded-full border border-[#c3b1d45e] flex items-center justify-center text-[#a7b9a0] bg-[#e5e8d580] shadow-[0_0_0_15px_#dacbe328,0_0_0_30px_#dacee121] mb-[15px] max-[1200px]:mb-5">
                <Icon
                  name="Sprout"
                  size={94}
                  strokeWidth={1.2}
                  className="max-[1200px]:w-[75px]"
                />
              </div>
              <div className="hero-pill absolute top-[141px] max-[1200px]:top-[138px] max-[900px]:top-[137px] min-[1500px]:top-[164px] left-[-26px] max-[1200px]:left-[-17px] max-[900px]:left-[-13px] min-[1500px]:left-[-6px] whitespace-nowrap bg-[#ffffffb3] backdrop-blur-[5px] border border-[#fff8] text-[10px] p-2.5 max-[1200px]:p-[7px] rounded-[7px] text-[#9d8aa7] flex items-center gap-1.5 shadow-[0_5px_20px_#957d9e0a]">
                <Icon name="Sparkles" size={16} /> Tốt hơn một chút mỗi ngày
              </div>
              <div className="hero-mini flex max-md:hidden items-center gap-[9px] mt-[15px] min-[1500px]:mt-6 text-[#b59fc5] text-[10px] tracking-[1px] max-[1200px]:tracking-[0.5px]">
                <span className="text-[28px] font-normal tracking-[-1px]">
                  01
                </span>
                <div>
                  HIỂU · LÀM · PHÁT TRIỂN
                  <small className="block text-[10px] tracking-normal text-[#a894b6] mt-1">
                    Learning is a journey.
                  </small>
                </div>
              </div>
            </div>
          </section>
          <div className="stats-grid grid grid-cols-4 max-[900px]:grid-cols-2 gap-3 max-[1200px]:gap-2 max-[900px]:gap-[11px] my-5 mb-[26px]">
            <Stat
              icon="BookOpen"
              value={ongoing.length.toString().padStart(2, "0")}
              label="Khóa đang học"
            />
            <Stat
              icon="CheckCircle2"
              color="green"
              value={finished.toString().padStart(2, "0")}
              label="Khóa hoàn thành"
            />
            <Stat
              icon="ClipboardCheck"
              color="peach"
              value={todo.length.toString().padStart(2, "0")}
              label="Bài cần thực hành"
            />
            <Stat
              icon="Target"
              color="blue"
              value={state.skills
                .filter((s) => s.level >= s.target)
                .length.toString()
                .padStart(2, "0")}
              label="Năng lực đạt mục tiêu"
            />
          </div>
          <SectionHead
            title="Tiếp tục học tập"
            description="Một khoảng thời gian nhỏ cho một bước tiến mới."
            action="Xem lộ trình"
            onClick={() => go("paths")}
          />
          <div className="course-grid two grid grid-cols-2 max-md:grid-cols-1 gap-[18px]">
            {ongoing.slice(0, 2).map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                progress={progress(state, c.id)}
              />
            ))}
            {!ongoing.length && (
              <Empty title="Bạn đã hoàn thành các khóa đang học">
                <Button onClick={() => go("catalog")}>
                  Khám phá khóa học mới
                </Button>
              </Empty>
            )}
          </div>
          <SectionHead
            title="Dành cho bước tiến tiếp theo"
            action="Khám phá thư viện"
            onClick={() => go("catalog")}
          />
          <div className="recommend-strip grid grid-cols-2 max-[900px]:grid-cols-1 gap-[15px]">
            {state.courses
              .filter(
                (c) =>
                  c.status === "published" && !state.enrolled.includes(c.id),
              )
              .slice(0, 2)
              .map((c) => (
                <button
                  className="recommend-card flex items-center gap-3 text-left p-4 bg-white border border-[var(--border,#e9eaf0)] rounded-[10px]"
                  key={c.id}
                  onClick={() => go(`course/${c.id}`)}
                >
                  <span
                    className={`icon-tile ${c.color} w-[47px] h-[54px] rounded-[7px]`}
                  >
                    <Icon name={c.icon} size={27} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="tiny muted text-[10px] text-[var(--muted,#9b91ab)]">
                      {c.category}
                    </span>
                    <strong className="text-[10px] max-[900px]:text-[12px] min-[1500px]:text-[12px] block leading-[1.8] mt-1 font-medium text-[#766b7f]">
                      {c.title}
                    </strong>
                    <small className="text-[10px] text-[#afa5b7] mt-1 block">
                      {c.duration}
                    </small>
                  </div>
                  <Icon
                    name="ArrowUpRight"
                    size={19}
                    className="text-[#ab9bb9] ml-auto shrink-0"
                  />
                </button>
              ))}
          </div>
          {role !== "learner" && (
            <div className="callout lavender p-[15px_17px] rounded-lg flex items-start gap-3 mt-5 border border-[#00000004] text-[11px]">
              <Icon name="LayoutDashboard" className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <strong className="text-[11px] font-semibold">
                  Không gian {role === "manager" ? "quản lý" : "giảng viên"} của
                  bạn
                </strong>
                <p className="m-0 text-[11px] leading-[1.8]">
                  Có{" "}
                  {
                    state.assignments.filter((a) => a.status === "submitted")
                      .length
                  }{" "}
                  bài đang chờ phản hồi.
                </p>
              </div>
              <Button
                kind="secondary"
                className="ml-auto self-center"
                onClick={() => go("reviews")}
              >
                Mở hàng chờ
              </Button>
            </div>
          )}
        </div>
        <aside className="dashboard-aside flex flex-col gap-0 max-[900px]:gap-[14px]">
          <section className="panel week-panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px] min-[1500px]:p-[22px] max-md:p-[22px] mb-[18px]">
            <div className="between flex items-center justify-between">
              <h3 className="text-[12px] min-[1500px]:text-[14px] max-md:text-[14px] font-semibold text-[#766782]">
                Nhịp học tuần này
              </h3>
              <Icon name="Sprout" size={20} className="text-[#93a38a]" />
            </div>
            <p className="muted small text-[10px] text-[#a29da9] my-[6px] mb-[19px]">
              Dành một chút thời gian cho chính mình.
            </p>
            <div className="week-days flex justify-between gap-[3px]">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => (
                <div key={d} className="text-center">
                  <span className="text-[10px] text-[#aaa4b1] block mb-[9px]">
                    {d}
                  </span>
                  <button
                    aria-label={`Nhịp học ${d}`}
                    className={`text-[10px] rounded-full h-[26px] w-[26px] max-[900px]:w-[23px] max-[900px]:h-[23px] max-md:w-[31px] max-md:h-[31px] min-[1500px]:w-[29px] min-[1500px]:h-[29px] flex items-center justify-center text-[#a6a0ae] ${
                      i < 2
                        ? "done bg-[#ece7f5] text-[#9780b4]"
                        : i === 2
                          ? "today bg-[#9b87bc] text-white shadow-[0_0_0_3px_#eee8f7]"
                          : ""
                    }`}
                    onClick={() =>
                      open(
                        "Nhịp học của bạn",
                        <div className="stack">
                          <p>
                            {i < 2
                              ? "Bạn đã có một phiên học trong dữ liệu mẫu."
                              : i === 2
                                ? "Hôm nay, hãy tiếp tục bài đang học hoặc thực hành một câu hỏi ôn tập."
                                : "Một ngày mới để học thêm điều bạn quan tâm."}
                          </p>
                          <p className="muted">
                            Nhịp học là gợi ý tự quản lý thời gian, không dùng
                            để xếp hạng nhân sự.
                          </p>
                        </div>,
                      )
                    }
                  >
                    {i < 2 ? <Icon name="Check" size={16} /> : i + 7}
                  </button>
                </div>
              ))}
            </div>
            <div className="week-bottom border-t border-[var(--border,#e9eaf0)] pt-[13px] mt-[17px] flex items-center gap-[7px] text-[#a8a0b1] text-[10px]">
              <Icon name="Clock" size={16} className="text-[#aa97bb]" />
              <span>Gợi ý: 20 phút học tập hôm nay</span>
            </div>
          </section>
          <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px] min-[1500px]:p-[22px] max-md:p-[22px] mb-[18px]">
            <SectionHead title="Việc cần làm" action="" className="!mb-[3px]" />
            <div className="task-list">
              {todo.map((a, i) => (
                <button
                  key={a.id}
                  className="flex items-start gap-2.5 text-left py-3.5 border-b border-[#f2f0f5] last:border-0 last:pb-[2px] w-full"
                  onClick={() => go("assignments")}
                >
                  <span
                    className={`task-icon ${i ? "lavender" : "peach"} flex items-center justify-center rounded-[7px] w-[31px] h-[31px] shrink-0`}
                  >
                    <Icon name="FileText" size={17} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <strong className="text-[10px] max-md:text-[12px] min-[1500px]:text-[12px] leading-[1.65] font-medium block text-[#68616f]">
                      {a.title}
                    </strong>
                    <small className="text-[10px] block text-[#afa6b6] mt-1">
                      Hạn {a.due.slice(0, 5)} · {a.type}
                    </small>
                  </div>
                  <Icon
                    name="ChevronRight"
                    size={15}
                    className="mt-[9px] text-[#b8b0bf] shrink-0"
                  />
                </button>
              ))}
              <button
                className="flex items-start gap-2.5 text-left py-3.5 border-b border-[#f2f0f5] last:border-0 last:pb-[2px] w-full"
                onClick={() =>
                  open(
                    "Ôn lại: dữ kiện hay suy luận?",
                    <QuickQuiz
                      course={state.courses.find((c) => c.id === "thinking")}
                    />,
                  )
                }
              >
                <span className="task-icon green flex items-center justify-center rounded-[7px] w-[31px] h-[31px] shrink-0">
                  <Icon name="Brain" size={17} />
                </span>
                <div className="flex-1 min-w-0">
                  <strong className="text-[10px] max-md:text-[12px] min-[1500px]:text-[12px] leading-[1.65] font-medium block text-[#68616f]">
                    Ôn một điều đã học
                  </strong>
                  <small className="text-[10px] block text-[#afa6b6] mt-1">
                    Kiểm tra nhanh · 2 phút
                  </small>
                </div>
                <Icon
                  name="ChevronRight"
                  size={15}
                  className="mt-[9px] text-[#b8b0bf] shrink-0"
                />
              </button>
            </div>
          </section>
          <section className="panel upcoming bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px] min-[1500px]:p-[22px] max-md:p-[22px] mb-[18px]">
            <div className="between flex items-center justify-between">
              <h3 className="text-[12px] min-[1500px]:text-[14px] max-md:text-[14px] font-semibold text-[#766782]">
                Sắp diễn ra
              </h3>
              <button
                className="icon-btn p-1 text-[var(--muted,#9b91ab)] hover:text-[#766782]"
                aria-label="Xem lịch đào tạo"
                onClick={() => go("calendar")}
              >
                <Icon name="ArrowUpRight" size={18} />
              </button>
            </div>
            <Badge color="lavender" className="my-2.5">
              WORKSHOP
            </Badge>
            <h3 className="leading-[1.8] text-[12px] font-[550] text-[#766782] m-[0_0_13px]">
              AI thực hành: từ brief đến sản phẩm
            </h3>
            <p className="text-[10px] text-[#aca1b4] flex items-center gap-1.5 mb-[19px]">
              <Icon name="CalendarDays" size={15} /> Thứ Năm, 10/09 · 14:00
            </p>
            <div className="between flex items-center justify-between border-t border-[#f1edf6] pt-[13px]">
              <div className="avatar-stack flex items-center pl-[3px]">
                {people.slice(0, 3).map((p) => (
                  <Avatar
                    key={p.id}
                    person={p}
                    size="small"
                    className="-ml-[3px] border-2 border-white !w-6 !h-6 !text-[10px]"
                  />
                ))}
                <span className="text-[#a69dad] text-[10px] ml-1.5">+12</span>
              </div>
              <button
                className="text-btn text-[10px] text-[#9b87bc] hover:underline flex items-center gap-1"
                onClick={() => go("calendar")}
              >
                Chi tiết
                <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </section>
          <section className="ai-nudge p-[19px_20px] bg-[#eeeaf5] border border-[#e7e0ee] rounded-[11px]">
            <span className="ai-spark inline-flex items-center justify-center rounded-[9px] text-[#a18aba] bg-[#e8dff4] w-[37px] h-[37px] shrink-0">
              <Icon name="Sparkles" size={24} />
            </span>
            <h3 className="text-[12px] min-[1500px]:text-[14px] font-semibold m-[13px_0_5px] text-[#7e6b91]">
              Có điều gì bạn chưa rõ?
            </h3>
            <p className="text-[10px] min-[1500px]:text-[11px] text-[#a091af] mb-3.5">
              Cùng AI giải thích lại, tìm ví dụ hoặc luyện tập một chút.
            </p>
            <button
              className="flex items-center justify-between gap-2 w-full bg-[#ffffffa3] border border-white rounded-md text-[#9078ac] text-[10px] p-[10px_11px] hover:bg-white"
              onClick={() => go("assistant")}
            >
              Trò chuyện với trợ lý AI
              <Icon name="ArrowRight" size={16} />
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}

export function Catalog() {
  const { state } = useApp();
  const [q, setQ] = useState(""),
    [cat, setCat] = useState("Tất cả"),
    [tab, setTab] = useState("Tất cả khóa học"),
    [level, setLevel] = useState("Tất cả cấp độ");
  const courses = state.courses.filter(
    (c) =>
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
        <span className="tiny muted text-[10px] text-[var(--muted,#9b91ab)]">
          Nội dung minh họa · Được biên tập cho demo
        </span>
      </div>
      {courses.length ? (
        <div className="course-grid three grid grid-cols-3 max-md:grid-cols-1 gap-[18px]">
          {courses.map((c) => (
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

const topicDetails = {
  ai: [
    "Một đề bài tốt giúp AI hiểu kết quả bạn cần.",
    "Nêu bối cảnh, mục tiêu, đầu vào và tiêu chí đầu ra.",
    "Đối chiếu câu trả lời với nguồn. Ghi rõ điều chưa chắc chắn.",
    "Thử trên một nhiệm vụ nhỏ và tự giải thích lựa chọn của bạn.",
  ],
  culture: [
    "Môi trường học tập được tạo nên từ cách chúng ta làm việc với nhau.",
    "Làm rõ cam kết: ai làm gì, kết quả nào, khi nào hoàn thành.",
    "Khi có sai lệch, trao đổi sớm và giữ căn cứ để cùng tìm cách xử lý.",
    "Nhìn lại một hành động cụ thể và chọn điều muốn làm tốt hơn.",
  ],
  research: [
    "Bắt đầu bằng vấn đề khách hàng, chưa vội chọn giải pháp.",
    "Thu thập quan sát có nguồn và thời điểm. Phân biệt dữ kiện với diễn giải.",
    "Một giả thuyết cần có cách kiểm chứng và giới hạn áp dụng.",
    "Thiết kế thử nghiệm nhỏ: người phụ trách, bằng chứng cần thu, điều kiện dừng.",
  ],
  thinking: [
    "Điều gì đã được quan sát? Điều gì là suy luận của bạn?",
    "Đặt câu hỏi về nguồn, bối cảnh và những cách giải thích khác.",
    "Tìm bằng chứng có thể bác bỏ giả định, không chỉ bằng chứng ủng hộ.",
    "Nêu giới hạn trước khi đưa khuyến nghị hành động.",
  ],
  lead: [
    "Coaching bắt đầu từ mục tiêu phát triển của người được hướng dẫn.",
    "Làm rõ nhiệm vụ, phạm vi quyết định và tiêu chí hoàn thành.",
    "Dùng câu hỏi giúp người học tự suy nghĩ, rồi phản hồi bằng bằng chứng.",
    "Giảm hỗ trợ khi người học chứng minh được khả năng tự thực hiện.",
  ],
  builder: [
    "Một ý tưởng cần được chuyển thành giả thuyết có thể kiểm chứng.",
    "Xác định khách hàng, vấn đề, người chịu trách nhiệm và giới hạn nguồn lực.",
    "Chốt bằng chứng cần thu và điều kiện dừng trước khi thử nghiệm.",
    "Kết thúc bằng những điều đã học và phần còn cần kiểm chứng.",
  ],
  ops: [
    "Ngoại lệ cần được nhìn thấy và có người chịu trách nhiệm.",
    "Giữ thông tin về sự kiện, tác động và bằng chứng liên quan.",
    "Phân công cách xử lý và mốc kiểm tra thay vì chỉ gửi thông báo.",
    "Đọc lại kết quả thực tế trước khi xác nhận hoàn tất.",
  ],
  data: [
    "Một báo cáo hữu ích bắt đầu từ câu hỏi cần quyết định.",
    "Kiểm tra nguồn, thời điểm, phạm vi và dữ liệu còn thiếu.",
    "Phân biệt sự thay đổi quan sát được với nguyên nhân chưa xác minh.",
    "Viết khuyến nghị có căn cứ, giới hạn và bước kiểm chứng tiếp theo.",
  ],
};
export function Tutor({
  course,
  compact = false,
}: {
  course?: any;
  compact?: boolean;
}) {
  const { state, go } = useApp();
  const [messages, setMessages] = useState<any[]>([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false);
  const timer = useRef<any>(null);
  const end = useRef<HTMLDivElement | null>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (messages.length)
      end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);
  function send(text: string) {
    if (!text.trim() || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    timer.current = setTimeout(() => {
      const c = course || state.courses.find((c: any) => c.id === "ai");
      const n = normalize(text);
      let answer = "";
      if (/luat|tai chinh|y te|mat khau/.test(n))
        answer =
          "Kho nội dung demo chưa có căn cứ phù hợp cho câu hỏi này. Bạn có thể hỏi giảng viên hoặc chọn một nội dung trong khóa học để cùng luyện tập.";
      else if (/kiem tra|hoi toi|luyen tap/.test(n))
        answer = `Cùng thử một câu nhé: trong “${c.title}”, bạn sẽ dùng bằng chứng nào để biết mình đã áp dụng đúng? Hãy nêu một tình huống, lựa chọn của bạn và cách kiểm chứng. Mình sẽ gợi ý bước tiếp theo.`;
      else if (/vi du|ap dung/.test(n))
        answer = `Ví dụ luyện tập: bạn nhận một nhiệm vụ nghiên cứu khách hàng. Trước khi làm, hãy viết rõ người sử dụng kết quả, câu hỏi cần trả lời và tiêu chí đánh giá. Sau đó ghi tách ba cột: quan sát có nguồn, suy luận của bạn, điều cần kiểm chứng. Với công việc hiện tại, bạn sẽ chọn câu hỏi nào?`;
      else if (/brief|de bai/.test(n))
        answer =
          "Bạn có thể kiểm tra brief bằng 4 phần: (1) Bối cảnh và người sử dụng; (2) Kết quả cụ thể cần tạo; (3) Đầu vào và giới hạn; (4) Tiêu chí kiểm chứng. Hãy viết thử phần mục tiêu trước. Một mục tiêu tốt giúp người nhận biết chính xác đầu ra sẽ phục vụ quyết định nào.";
      else
        answer = `Điểm chính trong nội dung minh họa này: ${(topicDetails[c.id] || topicDetails.ai)[1]} ${(topicDetails[c.id] || topicDetails.ai)[2]} Bạn đang vướng ở khái niệm hay cách áp dụng? Hãy mô tả một tình huống để cùng phân tích.`;
      setMessages((m) => [...m, { role: "ai", text: answer, source: c.id }]);
      setBusy(false);
    }, 650);
  }
  return (
    <div className={`tutor ${compact ? "compact" : ""}`}>
      <div className="tutor-heading flex items-center gap-2 border-b border-[#eee8f5] pb-[15px]">
        <span
          className={`ai-spark flex items-center justify-center rounded-[7px] text-[#a18aba] bg-[#e8dff4] ${compact ? "w-[30px] h-[30px]" : "w-[37px] h-[37px]"} shrink-0`}
        >
          <Icon name="Sparkles" size={compact ? 18 : 22} />
        </span>
        <div>
          <h3 className="text-[12px] m-0 text-[#8d72a5] font-semibold">
            Trợ lý học tập
          </h3>
          <span className="text-[10px] text-[#b0a0bd]">
            Học sâu hơn, từng câu hỏi
          </span>
        </div>
        <Badge color="lavender" className="ml-auto !text-[10px] !p-[3px_5px]">
          AI demo
        </Badge>
      </div>
      <div
        className={`tutor-messages overflow-y-auto [overscroll-behavior:contain] ${compact ? "min-h-[265px] max-h-[350px]" : "min-h-[400px] max-h-[530px]"}`}
      >
        {!messages.length && (
          <div
            className={`tutor-welcome text-center m-auto ${compact ? "p-[24px_1px_10px]" : "p-[40px_20px_20px] max-w-[520px]"}`}
          >
            <div
              className={`tutor-emblem m-[0_auto_17px] text-[#baa0cd] bg-[#f5f0fb] flex items-center justify-center ${compact ? "w-10 h-10 rounded-xl" : "w-[55px] h-[55px] rounded-[17px]"}`}
            >
              <Icon name="Sparkles" size={compact ? 24 : 32} />
            </div>
            <h3
              className={`text-[#877096] font-medium mb-3 ${compact ? "text-[12px] leading-[1.75]" : "text-[19px]"}`}
            >
              Cùng làm rõ điều bạn đang học.
            </h3>
            <p
              className={`text-[#ac9bb8] leading-[1.85] mb-5 ${compact ? "text-[10px]" : "text-[11px] min-[1500px]:text-[11px]"}`}
            >
              {course
                ? `Mình đang đồng hành cùng bạn trong khóa “${course.title}”.`
                : "Bạn muốn hiểu một khái niệm, thử một ví dụ hay luyện tập từ những gì đã học?"}
            </p>
            <div className="prompt-chips flex flex-col gap-[9px]">
              {[
                "Giải thích nội dung này",
                "Cho tôi một ví dụ áp dụng",
                "Kiểm tra tôi đã hiểu chưa",
              ].map((p) => (
                <button
                  key={p}
                  className={`border border-[#eae1f2] rounded-[7px] text-[#a18bb2] text-left bg-white hover:bg-[#f7f2fd] flex items-center justify-between gap-2 ${compact ? "text-[10px] p-[9px]" : "text-[10px] p-[11px_12px]"}`}
                  onClick={() => send(p)}
                >
                  {p}
                  <Icon name="ArrowUpRight" size={14} />
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-message flex items-start gap-[9px] my-5 ${m.role}`}
          >
            <span
              className={`chat-avatar w-[25px] h-[25px] rounded-[7px] flex items-center justify-center shrink-0 ${m.role === "ai" ? "lavender" : "gray"}`}
            >
              <Icon name={m.role === "ai" ? "Sparkles" : "Users"} size={15} />
            </span>
            <div className="flex-1 min-w-0">
              <small className="text-[10px] text-[#b4a3c0]">
                {m.role === "ai" ? "MX Learning AI · mô phỏng" : "Bạn"}
              </small>
              <p
                className={`my-1.5 whitespace-pre-wrap [overflow-wrap:anywhere] ${m.role === "user" ? "bg-[#f5f0fa] rounded-lg p-[10px_12px] text-[#826992]" : "text-[#8b7898]"} ${compact ? "text-[10px]" : "text-[11px]"}`}
              >
                {m.text}
              </p>
              {m.source && (
                <button
                  className="source-chip border border-[#e7dced] rounded-[5px] text-[#a68cb9] inline-flex items-center gap-[5px] p-[5px] text-[10px] flex-wrap hover:bg-[#fcfaff]"
                  onClick={() => go(`course/${m.source}`)}
                >
                  <Icon name="BookOpen" size={13} />
                  Nguồn: nội dung bài học demo
                  <Icon name="ArrowUpRight" size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="typing text-[10px] text-[#ab92bd] p-[15px]">
            Đang chuẩn bị gợi ý
            <span className="tracking-[4px] ml-[9px]">•••</span>
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        className="tutor-form flex gap-2 border border-[#e6dbee] rounded-lg p-[6px_7px_6px_12px] bg-white mt-[17px]"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          placeholder="Điều bạn muốn hiểu rõ hơn…"
          aria-label="Câu hỏi cho AI"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`border-0 py-1.5 w-full outline-none flex-1 text-[#6c5980] ${compact ? "text-[10px]" : "text-[11px]"}`}
        />
        <button
          aria-label="Gửi câu hỏi"
          disabled={busy || !input.trim()}
          className="flex justify-center items-center text-white bg-[#aa8fc3] rounded-md w-[31px] h-[31px] shrink-0 disabled:opacity-45"
        >
          <Icon name="ArrowUpRight" size={21} />
        </button>
      </form>
      <p className="ai-disclaimer text-[10px] text-[#baacc5] text-center leading-[1.7] mt-2.5">
        Phản hồi theo kịch bản minh họa, chưa kết nối mô hình AI.
      </p>
    </div>
  );
}
export function Assistant() {
  return (
    <>
      <PageHead
        eyebrow="HỌC CÙNG MỘT NGƯỜI CỘNG SỰ"
        title="Trợ lý học tập AI"
        description="Đặt câu hỏi, khám phá góc nhìn mới và luyện cách tự giải quyết vấn đề."
      />
      <div className="assistant-layout grid grid-cols-[minmax(0,1fr)_290px] max-[900px]:grid-cols-1 gap-[23px]">
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px]">
          <Tutor />
        </section>
        <aside className="flex flex-col gap-[18px]">
          <div className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
            <span className="icon-tile lavender w-[34px] h-[34px] rounded-[9px] flex items-center justify-center">
              <Icon name="BookOpen" size={18} />
            </span>
            <h3 className="text-[12px] font-semibold mt-[15px] mb-2 text-[#766782]">
              Hỏi trong bối cảnh bài học
            </h3>
            <p className="muted text-[11px] text-[var(--muted,#9b91ab)] m-0 leading-[1.8]">
              Mở AI ngay trong từng khóa học để nhận gợi ý theo nội dung đang
              xem.
            </p>
          </div>
          <div className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
            <span className="icon-tile green w-[34px] h-[34px] rounded-[9px] flex items-center justify-center">
              <Icon name="Brain" size={18} />
            </span>
            <h3 className="text-[12px] font-semibold mt-[15px] mb-2 text-[#766782]">
              Thử trước, hỏi sau
            </h3>
            <p className="muted text-[11px] text-[var(--muted,#9b91ab)] m-0 leading-[1.8]">
              Viết ra suy nghĩ của bạn. Dùng AI để phản biện, kiểm tra và tìm
              góc nhìn còn thiếu.
            </p>
          </div>
          <div className="callout sand p-[15px_17px] rounded-lg flex items-start gap-3 border border-[#00000004] text-[11px]">
            <Icon name="Info" className="mt-0.5 shrink-0" />
            <p className="m-0 text-[11px] leading-[1.8]">
              Demo minh họa trải nghiệm. Chất lượng AI thực tế sẽ được kiểm
              chứng khi triển khai hệ thống.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export function QuickQuiz({ course }) {
  const { dispatch, notify } = useApp();
  const [answer, setAnswer] = useState(null),
    [checked, setChecked] = useState(false);
  const isCulture = course?.id === "culture";
  const options = isCulture
    ? [
        "Chờ đến khi hoàn thành mới báo",
        "Trao đổi sớm, nêu bằng chứng và cùng điều chỉnh",
        "Chuyển trách nhiệm cho người khác",
      ]
    : [
        "Chấp nhận vì câu trả lời nghe hợp lý",
        "Đối chiếu nguồn và nêu rõ phần còn thiếu bằng chứng",
        "Chỉ chọn thông tin ủng hộ ý kiến ban đầu",
      ];
  return (
    <div className="quiz">
      <Badge color="lavender">KIỂM TRA HIỂU BÀI · 1 CÂU</Badge>
      <h3 className="text-[17px] my-5 font-semibold text-[#6a557b]">
        {isCulture
          ? "Khi một cam kết có nguy cơ không hoàn thành, bạn nên làm gì?"
          : "Trước một nhận định chưa chắc chắn, cách xử lý phù hợp nhất là gì?"}
      </h3>
      {options.map((x, i) => (
        <button
          key={x}
          className={`quiz-option w-full p-[13px] text-left flex items-center gap-3 border rounded-lg my-2.5 text-[12px] transition-colors ${
            answer === i
              ? "selected border-[#b9a0cc] bg-[#faf6fd]"
              : "border-[#e8dfef] bg-white hover:bg-[#faf7fc]"
          } ${checked && i === 1 ? "correct !border-[#95b99e] !bg-[#f0f7f0]" : ""}`}
          onClick={() => {
            setAnswer(i);
            setChecked(false);
          }}
        >
          <span className="rounded-[5px] bg-[#f3edf8] text-[#a489b8] w-[26px] h-[26px] flex items-center justify-center font-medium shrink-0">
            {String.fromCharCode(65 + i)}
          </span>
          <span className="text-[#685c74]">{x}</span>
        </button>
      ))}
      {checked && (
        <div className={`callout ${answer === 1 ? "green" : "peach"}`}>
          <Icon name={answer === 1 ? "CheckCircle2" : "Lightbulb"} />
          <p>
            {answer === 1
              ? "Đúng rồi. Căn cứ rõ ràng và việc trao đổi kịp thời giúp lựa chọn hành động phù hợp."
              : "Thử nghĩ lại: điều gì giúp bạn và người phối hợp kiểm chứng được tình huống, thay vì chỉ dựa vào cảm giác?"}
          </p>
        </div>
      )}
      <Button
        disabled={answer === null}
        onClick={() => {
          setChecked(true);
          if (answer === 1) {
            dispatch({ type: "quiz", id: course.id });
            notify("Đã hoàn thành câu hỏi ôn tập.");
          }
        }}
      >
        {checked && answer !== 1 ? "Thử lại" : "Kiểm tra câu trả lời"}
      </Button>
      <p className="tiny muted">
        Câu hỏi minh họa. Kết quả ôn tập không tự xác nhận năng lực.
      </p>
    </div>
  );
}

export function Course({ id }) {
  const { state, dispatch, go, open, notify } = useApp();
  const course = state.courses.find((c) => c.id === id);
  const [lesson, setLesson] = useState(() => {
      const c = state.courses.find((c) => c.id === id);
      return c
        ? Math.max(
            0,
            c.lessons.findIndex((_, i) => !state.completed[id]?.includes(i)),
          )
        : 0;
    }),
    [tab, setTab] = useState("Tổng quan"),
    [playing, setPlaying] = useState(false),
    [seconds, setSeconds] = useState(0),
    [speed, setSpeed] = useState(1);
  const playerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () =>
        setSeconds((v) => {
          if (v >= 120) {
            setPlaying(false);
            return 120;
          }
          return Math.min(120, v + speed);
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [playing, speed]);
  if (!course)
    return (
      <Empty title="Không tìm thấy khóa học">
        <Button onClick={() => go("catalog")}>Về thư viện</Button>
      </Empty>
    );
  const enrolled = state.enrolled.includes(id);
  const slides = topicDetails[id] || [
    course.title,
    ...topicDetails.ai.slice(1),
  ];
  const slide = Math.min(3, Math.floor(seconds / 30));
  const done = state.completed[id]?.includes(lesson);
  const fmt = (v) =>
    `${Math.floor(v / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(v % 60)
      .toString()
      .padStart(2, "0")}`;
  return (
    <>
      <button
        className="back-link text-[10px] text-[#a091ac] flex items-center gap-1.5 p-0 mb-[18px] hover:text-[#8464ae]"
        onClick={() => go("catalog")}
      >
        <Icon name="ArrowLeft" size={16} />
        Thư viện học tập
      </button>
      <div className="course-page-heading flex items-center justify-between gap-[15px] mb-[23px] flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Badge>{course.category}</Badge>
            <span className="muted small text-[10px] text-[var(--muted,#9b91ab)]">
              {course.level} · {course.scope}
            </span>
          </div>
          <h1 className="text-[24px] max-[1200px]:text-[22px] min-[1500px]:text-[28px] mt-3 max-w-[800px] font-semibold text-[#56515f]">
            {course.title}
          </h1>
          <p className="muted small text-[10px] text-[var(--muted,#9b91ab)] mb-0">
            Hướng dẫn bởi {course.teacher}{" "}
            <span className="dot-separator mx-2.5">·</span>{" "}
            {course.lessons.length} bài học{" "}
            <span className="dot-separator mx-2.5">·</span> {course.duration}
          </p>
        </div>
        <Button
          kind="secondary"
          icon="Bookmark"
          onClick={() => dispatch({ type: "bookmark", id })}
        >
          {state.bookmarks.includes(id) ? "Đã lưu" : "Lưu khóa học"}
        </Button>
      </div>
      <div className="course-layout grid grid-cols-[minmax(0,1fr)_325px] max-[1200px]:grid-cols-[minmax(0,1fr)_285px] max-[900px]:grid-cols-1 min-[1500px]:grid-cols-[minmax(0,1fr)_355px] gap-[22px] max-[1200px]:gap-[17px]">
        <div className="lesson-column min-w-0">
          <section
            className="lesson-player bg-[#40384f] text-[#ddd1e8] rounded-[13px] overflow-hidden min-h-[370px] min-[1500px]:min-h-[440px] flex flex-col"
            ref={playerRef}
          >
            <div className="player-top p-[21px_25px] flex items-center justify-between text-[13px] tracking-[-0.3px] border-b border-[#ffffff10]">
              <span>
                mature<span className="mint-text text-[#7cbfa2]">x</span> /
                classroom
              </span>
              <Badge
                color="white"
                className="!text-[10px] !bg-[#ffffff0d] !text-[#c1b0cf] !border !border-[#ffffff19] !tracking-[0.7px]"
              >
                BÀI GIẢNG MÔ PHỎNG
              </Badge>
            </div>
            <div className="slide-content p-[29px_35px_20px] max-[1200px]:p-6 min-[1500px]:p-[37px_43px] flex-1 min-h-[205px]">
              <span className="text-[10px] uppercase tracking-[1.2px] text-[#a896b6]">
                BÀI {lesson + 1} / {course.lessons[lesson]}
              </span>
              <h2 className="text-[25px] max-[1200px]:text-[22px] min-[1500px]:text-[32px] font-[450] leading-[1.6] max-w-[610px] my-[17px] mb-[21px] text-[#eee4f4]">
                {slides[slide]}
              </h2>
              <div className="slide-pagination flex gap-[5px]">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    className={`h-1.5 rounded-[3px] p-0 transition-all ${slide === i ? "active w-[25px] bg-[#c7b2d8]" : "w-1.5 bg-[#8c789747]"}`}
                    onClick={() => setSeconds(i * 30)}
                    aria-label={`Đến phần ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="player-speaker flex items-center gap-2 p-[0_35px_20px]">
              <Avatar
                person={people[4]}
                size="small"
                className="!bg-[#b39abe38] !text-[#ccb6d9]"
              />
              <div>
                <strong className="block text-[10px] text-[#d9c5e3]">
                  {course.teacher}
                </strong>
                <small className="block text-[10px] text-[#9b8aa8] mt-[3px]">
                  Học liệu minh họa cho demo
                </small>
              </div>
              <Icon
                name={course.icon}
                size={35}
                className="ml-auto text-[#bba4cd66]"
              />
            </div>
            <div className="player-controls bg-[#352f41] p-[10px_17px_13px]">
              <input
                type="range"
                min="0"
                max="120"
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                aria-label="Vị trí bài giảng"
                className="w-full h-[3px] m-[0_0_10px] p-0 accent-[#b39ac9] block"
              />
              <div className="between flex items-center justify-between text-[10px] text-[#c9b7d5]">
                <div className="flex items-center gap-2">
                  <button
                    aria-label={
                      playing ? "Tạm dừng bài giảng" : "Phát bài giảng"
                    }
                    className="p-[3px] text-[#c9b7d5] hover:text-white"
                    onClick={() => {
                      if (seconds >= 120) setSeconds(0);
                      setPlaying(!playing);
                    }}
                  >
                    <Icon name={playing ? "Pause" : "Play"} size={19} />
                  </button>
                  <span>{fmt(seconds)} / 02:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Tốc độ phát"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="bg-[#352f41] text-[#c9b7d5] text-[10px] p-[3px] border-0 outline-none rounded"
                  >
                    {[1, 1.5, 2].map((x) => (
                      <option key={x} value={x}>
                        {x}×
                      </option>
                    ))}
                  </select>
                  <button
                    aria-label="Phóng to bài giảng"
                    className="p-[3px] text-[#c9b7d5] hover:text-white"
                    onClick={() => {
                      if (document.fullscreenElement) document.exitFullscreen();
                      else
                        playerRef.current
                          ?.requestFullscreen?.()
                          .catch(() =>
                            notify("Trình duyệt không hỗ trợ toàn màn hình."),
                          );
                    }}
                  >
                    <Icon name="Maximize2" size={17} />
                  </button>
                </div>
              </div>
            </div>
          </section>
          <div className="lesson-actions flex items-center justify-between gap-3 my-5 mb-[15px]">
            <div>
              <span className="tiny muted text-[10px] text-[var(--muted,#9b91ab)]">
                BẠN ĐANG HỌC
              </span>
              <h3 className="m-[6px_0_0] text-[14px] max-[1200px]:text-[12px] font-semibold text-[#685c74]">
                {course.lessons[lesson]}
              </h3>
            </div>
            <Button
              icon={done ? "CheckCircle2" : enrolled ? "Check" : "Plus"}
              kind={done ? "secondary" : "primary"}
              className="max-[1200px]:!text-[10px] max-[1200px]:!p-[9px]"
              onClick={() => {
                if (!enrolled) {
                  dispatch({ type: "enroll", id });
                  notify("Đã thêm khóa học vào lộ trình của bạn.");
                } else {
                  dispatch({ type: "complete", id, value: lesson });
                  notify("Đã ghi nhận hoàn thành bài học.");
                }
              }}
            >
              {done
                ? "Đã hoàn thành"
                : enrolled
                  ? "Hoàn thành bài học"
                  : "Đăng ký học"}
            </Button>
          </div>
          <Tabs
            items={[
              "Tổng quan",
              "Transcript",
              "Ghi chú",
              "Tài liệu",
              "Thảo luận",
            ]}
            value={tab}
            onChange={setTab}
          />
          <div className="lesson-tab-content bg-white p-[23px] border border-[var(--border,#e9eaf0)] rounded-[10px] -mt-[3px] text-[12px] leading-[1.8] min-h-[245px]">
            {tab === "Tổng quan" && (
              <>
                <h3 className="text-[13px] font-semibold text-[#6a5b78] mb-2">
                  Bạn sẽ mang theo điều gì?
                </h3>
                <p className="text-[#887896] mb-4">{course.description}</p>
                <div className="learning-outcomes my-3">
                  {[
                    "Giải thích được các nguyên tắc cốt lõi trong bài học.",
                    "Áp dụng vào một tình huống cụ thể của công việc.",
                    "Tự kiểm tra đầu ra và chỉ rõ điều còn cần xác minh.",
                  ].map((x) => (
                    <p
                      key={x}
                      className="flex items-center gap-[9px] text-[#8f8599] text-[11px] my-[13px]"
                    >
                      <Icon
                        name="CheckCircle2"
                        size={18}
                        className="text-[#91ad97] shrink-0"
                      />
                      {x}
                    </p>
                  ))}
                </div>
                <div className="callout lavender p-[15px_17px] rounded-lg flex items-start gap-3 mt-5 border border-[#00000004] text-[11px]">
                  <Icon name="Brain" className="mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <strong className="text-[11px] font-semibold">
                      Dừng một chút để nhớ lại
                    </strong>
                    <p className="m-0 text-[11px] leading-[1.8]">
                      Thử một câu hỏi ngắn trước khi chuyển sang bài tiếp theo.
                    </p>
                  </div>
                  <Button
                    kind="secondary"
                    className="ml-auto self-center"
                    onClick={() =>
                      open("Kiểm tra hiểu bài", <QuickQuiz course={course} />)
                    }
                  >
                    Luyện tập
                  </Button>
                </div>
              </>
            )}
            {tab === "Transcript" && (
              <>
                <p className="muted small text-[10px] text-[var(--muted,#9b91ab)] mb-3">
                  Transcript minh họa · Chọn mốc thời gian để chuyển phần trình
                  chiếu.
                </p>
                {slides.map((s, i) => (
                  <button
                    className={`transcript-line flex gap-[17px] text-left items-start p-[14px_10px] w-full rounded-[7px] transition-colors ${slide === i ? "active bg-[#f3ecfb]" : "hover:bg-[#faf7fc]"}`}
                    key={i}
                    onClick={() => setSeconds(i * 30)}
                  >
                    <span className="text-[#aa8dc2] text-[10px] whitespace-nowrap mt-[3px]">
                      {fmt(i * 30)}
                    </span>
                    <p className="text-[11px] text-[#9884a7] m-0">{s}</p>
                  </button>
                ))}
              </>
            )}
            {tab === "Ghi chú" && (
              <>
                <div className="between flex items-center justify-between mb-2">
                  <h3 className="text-[13px] font-semibold text-[#6a5b78] m-0">
                    Ghi chú của bạn
                  </h3>
                  <Badge color="green">Tự lưu trên trình duyệt</Badge>
                </div>
                <textarea
                  className="notes-area w-full min-h-[150px] my-2.5 p-3 border border-[var(--border,#e9eaf0)] rounded-lg text-[12px] text-[#6c5980] outline-none focus:border-[#cbb8e0]"
                  placeholder="Điều tôi muốn ghi nhớ, câu hỏi còn mở, cách áp dụng…"
                  value={state.notes[id] || ""}
                  onChange={(e) =>
                    dispatch({ type: "note", id, value: e.target.value })
                  }
                />
                <p className="tiny muted text-[10px] text-[var(--muted,#9b91ab)] mb-3">
                  Ghi chú cá nhân không xuất hiện trong trang đội ngũ.
                </p>
                <Button
                  kind="secondary"
                  icon="Download"
                  disabled={!state.notes[id]}
                  onClick={() => download(`ghi-chu-${id}.txt`, state.notes[id])}
                >
                  Tải ghi chú
                </Button>
              </>
            )}
            {tab === "Tài liệu" &&
              ["Tóm tắt bài học", "Mẫu thực hành & tiêu chí"].map((x, i) => (
                <div
                  className="resource-row flex items-center gap-3 py-[15px] border-b border-[#efe9f4] last:border-0 text-[11px] text-left w-full"
                  key={x}
                >
                  <span className="icon-tile lavender w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0">
                    <Icon name="FileText" size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <strong className="text-[11px] text-[#81718d] font-medium block">
                      {x}
                    </strong>
                    <small className="block text-[10px] text-[#ad9db7] mt-[5px]">
                      Tài liệu demo · TXT
                    </small>
                  </div>
                  <Button
                    kind="ghost"
                    icon="Download"
                    className="ml-auto"
                    onClick={() =>
                      download(
                        `${id}-${i}.txt`,
                        `${x}\n${course.title}\n\n${i ? rubric.join("\n") : slides.join("\n\n")}\n\nNội dung minh họa, không phải tài liệu đào tạo chính thức.`,
                      )
                    }
                  >
                    Tải xuống
                  </Button>
                </div>
              ))}
            {tab === "Thảo luận" && (
              <div className="stack flex flex-col gap-3">
                <p className="text-[#887896]">
                  Cùng trao đổi câu hỏi và bài học ứng dụng với đồng nghiệp.
                </p>
                <div>
                  <Button
                    kind="secondary"
                    icon="MessageCircle"
                    onClick={() => go("community")}
                  >
                    Mở cộng đồng học tập
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <aside className="course-side flex flex-col gap-[18px]">
          <section className="panel curriculum bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
            <div className="between flex items-center justify-between mb-1">
              <h3 className="text-[13px] font-semibold text-[#6a5b78] m-0">
                Nội dung khóa học
              </h3>
              <span className="tiny muted text-[10px] text-[var(--muted,#9b91ab)]">
                {state.completed[id]?.length || 0}/{course.lessons.length}
              </span>
            </div>
            <div className="my-3.5">
              <Progress value={progress(state, id)} />
            </div>
            <div className="lesson-list m-[0_-10px_-9px]">
              {course.lessons.map((l, i) => (
                <button
                  key={l}
                  className={`flex w-full items-center gap-[9px] text-left rounded-[7px] p-[12px_10px] transition-colors ${
                    lesson === i
                      ? "active bg-[#f0e9f8] text-[#987bb7]"
                      : "text-[#aba0b4] hover:bg-[#faf7fc]"
                  }`}
                  onClick={() => {
                    setLesson(i);
                    setSeconds(0);
                    setPlaying(false);
                  }}
                >
                  <span
                    className={
                      state.completed[id]?.includes(i)
                        ? "lesson-done text-[#8eac94]"
                        : ""
                    }
                  >
                    <Icon
                      name={
                        state.completed[id]?.includes(i)
                          ? "CheckCircle2"
                          : lesson === i
                            ? "Play"
                            : "Circle"
                      }
                      size={18}
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-[10px] leading-[1.7] font-medium text-[#7d6f89]">
                      {String(i + 1).padStart(2, "0")}. {l}
                    </strong>
                    <small className="block text-[10px] text-[#b1a7b9] mt-[3px]">
                      Video & thực hành
                    </small>
                  </div>
                </button>
              ))}
              <button
                className="flex w-full items-center gap-[9px] text-left p-[17px_10px_12px] mt-[5px] border-t border-[#eee8f2] text-[#aba0b4] hover:bg-[#faf7fc]"
                onClick={() => go("assignments")}
              >
                <Icon
                  name="ClipboardCheck"
                  size={18}
                  className="text-[#a18cb2]"
                />
                <div className="flex-1 min-w-0">
                  <strong className="block text-[10px] leading-[1.7] font-medium text-[#7d6f89]">
                    Bài thực hành cuối khóa
                  </strong>
                  <small className="block text-[10px] text-[#b1a7b9] mt-[3px]">
                    Nộp bài & nhận phản hồi
                  </small>
                </div>
                <Icon
                  name="ArrowUpRight"
                  size={15}
                  className="ml-auto text-[#baa0cd]"
                />
              </button>
            </div>
          </section>
          <section className="panel tutor-panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px] overflow-hidden">
            <Tutor key={id} course={course} compact />
          </section>
        </aside>
      </div>
    </>
  );
}

function PathDetails({ path }) {
  const { state, go, dispatch, notify, close } = useApp();
  return (
    <>
      <div
        className={`path-detail-intro ${path.color} rounded-[9px] p-6 text-left`}
      >
        <Icon name={path.icon} size={40} />
        <h2 className="my-[15px] mb-2.5 text-[18px] font-semibold">
          {path.title}
        </h2>
        <p className="text-[12px] leading-[1.8]">{path.description}</p>
        <Badge color="white">Mục tiêu: {path.target}</Badge>
      </div>
      <p className="muted small text-[10px] text-[var(--muted,#9b91ab)] my-3">
        Gợi ý học theo thứ tự. Mỗi bước gồm bài học và thực hành; đánh giá năng
        lực dựa trên bằng chứng riêng.
      </p>
      <div className="path-steps my-5 mb-[25px]">
        {path.courses.map((id, i) => {
          const c = state.courses.find((c) => c.id === id);
          return (
            <button
              key={id}
              className="flex items-center gap-[13px] py-4 border-b border-[#efe8f3] text-left w-full hover:bg-[#faf8fd] px-1 rounded-md transition-colors"
              onClick={() => {
                go(`course/${id}`);
                close();
              }}
            >
              <span
                className={`w-[30px] h-[30px] rounded-full bg-[#f1e8fa] text-[#b199c3] flex items-center justify-center text-[11px] shrink-0 ${progress(state, id) === 100 ? "done !bg-[#e9f2e5] !text-[#90a27d]" : ""}`}
              >
                {progress(state, id) === 100 ? (
                  <Icon name="Check" size={16} />
                ) : (
                  i + 1
                )}
              </span>
              <div className="flex-1 min-w-0">
                <strong className="text-[12px] block text-[#6a5a78]">
                  {c.title}
                </strong>
                <small className="text-[10px] block text-[#aa9ab4] mt-[5px]">
                  {c.duration} · {progress(state, id)}% hoàn thành
                </small>
              </div>
              <Icon
                name="ArrowUpRight"
                size={17}
                className="ml-auto text-[#bba4c9]"
              />
            </button>
          );
        })}
      </div>
      <Button
        icon="Plus"
        onClick={() => {
          path.courses.forEach((id) => {
            dispatch({ type: "enroll", id });
          });
          notify("Đã thêm các khóa học trong lộ trình.");
          close();
        }}
      >
        Thêm vào hành trình của tôi
      </Button>
    </>
  );
}
export function Paths() {
  const { state, open, go } = useApp();
  return (
    <>
      <PageHead
        eyebrow="HÀNH TRÌNH CÓ ĐỊNH HƯỚNG"
        title="Lộ trình của tôi"
        description="Biết mình đang ở đâu. Hiểu bước tiếp theo cần làm gì."
      />
      <div className="path-highlight flex items-center gap-5 p-[27px] bg-[#f0eaf7] border border-[#e6dcef] rounded-xl mb-6 max-md:flex-col max-md:items-start">
        <span className="icon-tile lavender w-[58px] h-[58px] bg-[#e9dff3] rounded-lg flex items-center justify-center shrink-0">
          <Icon name="Compass" size={34} />
        </span>
        <div className="flex-1">
          <span className="eyebrow text-[10px] tracking-[1.4px] font-semibold text-[#9c87b0] block mb-1">
            MỤC TIÊU PHÁT TRIỂN HIỆN TẠI
          </span>
          <h2 className="text-[17px] font-[550] text-[#866a98] my-1">
            Ứng dụng AI có kiểm chứng vào nghiên cứu khách hàng
          </h2>
          <p className="text-[10px] text-[#aa97b6] m-0">
            Lộ trình gợi ý cho vai trò Product Researcher · Thedeerly
          </p>
        </div>
        <Button
          kind="secondary"
          className="max-md:mt-2"
          onClick={() => go("skills")}
        >
          Xem năng lực
          <Icon name="ArrowUpRight" size={17} />
        </Button>
      </div>
      <div className="paths-list flex flex-col gap-5">
        {[...paths, ...(state.customPaths || [])].map((p, i) => {
          const done = Math.round(
            p.courses.reduce((n, id) => n + progress(state, id), 0) /
              p.courses.length,
          );
          return (
            <article
              key={p.id}
              className="path-card flex rounded-xl overflow-hidden bg-white border border-[var(--border,#e9eaf0)] max-md:flex-col"
            >
              <div
                className={`path-art ${p.color} w-[175px] max-[1200px]:w-[135px] max-md:w-full max-md:h-[110px] flex items-center justify-center flex-col gap-[25px] max-md:gap-2 shrink-0`}
              >
                <Icon name={p.icon} size={57} strokeWidth={1.3} />
                <span className="text-[10px] tracking-[2px] opacity-60">
                  PATH / 0{i + 1}
                </span>
              </div>
              <div className="path-card-main p-[23px_27px] flex-1 min-w-0">
                <div className="between flex items-center justify-between flex-wrap gap-2">
                  <Badge color={p.color}>
                    {i === 0
                      ? "Đang theo học"
                      : i === 1
                        ? "Nền tảng chung"
                        : "Hướng phát triển"}
                  </Badge>
                  <span className="muted small text-[10px] text-[var(--muted,#9b91ab)]">
                    {p.weeks} · {p.courses.length} khóa học
                  </span>
                </div>
                <h2 className="text-[19px] mt-3.5 mb-[7px] font-[550] text-[#71627b]">
                  {p.title}
                </h2>
                <p className="text-[11px] text-[#a798b2] mb-[18px]">
                  {p.description}
                </p>
                <div className="path-mini-courses flex gap-[17px] flex-wrap mb-4">
                  {p.courses.map((id, j) => (
                    <button
                      key={id}
                      className="flex gap-[7px] items-center p-0 text-[10px] text-[#a38bb6] hover:text-[#8464ae]"
                      onClick={() => go(`course/${id}`)}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-[#f3ecfa] flex items-center justify-center text-[10px] ${progress(state, id) === 100 ? "done !bg-[#ecf3e9] !text-[#96ac87]" : ""}`}
                      >
                        {progress(state, id) === 100 ? (
                          <Icon name="Check" size={13} />
                        ) : (
                          j + 1
                        )}
                      </span>
                      {state.courses.find((c) => c.id === id).category}
                    </button>
                  ))}
                </div>
                <div className="path-card-bottom flex justify-between gap-[35px] items-center mt-1.5 max-md:flex-col max-md:items-start max-md:gap-3">
                  <div className="flex-1 max-w-[400px] max-md:max-w-full w-full">
                    <Progress value={done} />
                    <small className="text-[10px] text-[#b4a5bd] mt-1 block">
                      {done}% nội dung đã hoàn thành
                    </small>
                  </div>
                  <Button
                    kind={i === 0 ? "primary" : "secondary"}
                    onClick={() => open(p.title, <PathDetails path={p} />)}
                  >
                    Xem lộ trình
                    <Icon name="ArrowRight" size={17} />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {state.pathAssignments.filter((x) => x.person === "me").length > 0 && (
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px] mt-6">
          <h3 className="text-[13px] font-semibold text-[#6a5b78] mb-3">
            Lộ trình được giao
          </h3>
          {state.pathAssignments
            .filter((x) => x.person === "me")
            .map((x) => (
              <div
                className="resource-row flex items-center gap-3 py-[15px] border-b border-[#efe9f4] last:border-0 text-[11px] text-left w-full"
                key={x.id}
              >
                <Icon name="Compass" className="text-[#a18cb2]" />
                <div className="flex-1 min-w-0">
                  <strong className="text-[11px] text-[#81718d] font-medium block">
                    {x.title}
                  </strong>
                  <small className="block text-[10px] text-[#ad9db7] mt-[5px]">
                    Hạn {x.due} · {x.reason}
                  </small>
                </div>
              </div>
            ))}
        </section>
      )}
    </>
  );
}

export function AssignmentDetail({ id }) {
  const { state, dispatch, notify, close } = useApp();
  const a = state.assignments.find((a) => a.id === id);
  const [body, setBody] = useState(a?.status === "revision" ? a.body : ""),
    [file, setFile] = useState(""),
    [hint, setHint] = useState(false);
  if (!a) return <Empty />;
  const canSubmit = ["todo", "revision"].includes(a.status);
  return (
    <div className="assignment-detail">
      <div className="flex items-center gap-2">
        <Badge color={statusColor[a.status]}>{statusLabel[a.status]}</Badge>
        <span className="muted small text-[10px] text-[var(--muted,#9b91ab)]">
          Hạn {a.due} · {a.type}
        </span>
      </div>
      <p className="text-[12px] text-[#918098] my-[19px] leading-[1.8]">
        {a.description}
      </p>
      <h3 className="text-[13px] font-semibold text-[#6a5b78] mb-2.5">
        Tiêu chí đánh giá
      </h3>
      <div className="rubric-preview grid grid-cols-3 max-md:grid-cols-1 gap-2.5 mb-5">
        {rubric.map((r, i) => (
          <div
            key={r}
            className="text-[10px] bg-[#f8f5fb] p-3 rounded-[7px] text-[#a18cad] leading-[1.8]"
          >
            <span className="block text-[#baa5cc] text-[15px] mb-[5px] font-bold">
              {i + 1}
            </span>
            {r}
          </div>
        ))}
      </div>
      {a.feedback && (
        <div
          className={`feedback-box p-[18px] rounded-[9px] my-5 ${a.status === "approved" ? "green bg-[#e9f2e5] text-[#55785a]" : "peach bg-[#faede6] text-[#8e614d]"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="MessageCircle" size={19} />
            <strong className="font-semibold text-[12px]">
              Phản hồi từ {a.reviewer || "Ngọc Linh"}
            </strong>
          </div>
          <p className="text-[12px] my-2 leading-[1.7]">{a.feedback}</p>
          {a.scores && (
            <span className="small text-[10px] block opacity-80 mt-1">
              Tiêu chí: {a.scores.join(" / ")} (thang 4)
            </span>
          )}
        </div>
      )}
      {a.body && (
        <details
          open={!canSubmit}
          className="my-[15px] text-[#a38eaf] text-[11px] leading-[1.8]"
        >
          <summary className="cursor-pointer font-medium mb-2">
            Bài đã nộp · Lần {a.attempt || 1}
          </summary>
          <p className="submitted-body whitespace-pre-wrap bg-[#faf7fc] p-4 rounded-[7px] text-[12px] text-[#907c9d]">
            {a.body}
          </p>
          {a.file && (
            <p className="tiny muted text-[10px] text-[var(--muted,#9b91ab)] mt-1">
              Tệp minh họa: {a.file} (chỉ lưu tên tệp)
            </p>
          )}
        </details>
      )}
      {a.history?.length > 0 && (
        <details className="my-[15px] text-[#a38eaf] text-[11px] leading-[1.8]">
          <summary className="cursor-pointer font-medium mb-2">
            Lịch sử sửa bài ({a.history.length})
          </summary>
          {a.history.map((h, i) => (
            <div
              className="history-item border-l-2 border-[#e8dcef] p-3 my-3 pl-4"
              key={i}
            >
              <strong className="block text-[11px] text-[#716179]">
                Lần {i + 1}
              </strong>
              <p className="text-[11px] whitespace-pre-wrap my-1">{h.body}</p>
              <small className="block text-[10px] text-[#b09abd]">
                Phản hồi: {h.feedback}
              </small>
            </div>
          ))}
        </details>
      )}
      {canSubmit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "submit", id, value: { body, file } });
            notify("Đã nộp bài. Giảng viên có thể xem trong Đánh giá bài tập.");
            close();
          }}
        >
          <Field
            label="Bài làm của bạn"
            hint="Tối thiểu 30 ký tự. Nêu bối cảnh, cách làm, nguồn và điều bạn đã kiểm chứng."
          >
            <textarea
              required
              minLength={30}
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Trình bày bài làm hoặc dán đường dẫn sản phẩm, kèm giải thích cách bạn thực hiện…"
              className="w-full p-3 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none focus:border-[#cbb8e0]"
            />
          </Field>
          <Field
            label="Tệp đính kèm (tùy chọn)"
            hint="Demo chỉ lưu tên tệp, không tải nội dung lên máy chủ."
          >
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0]?.name || "")}
              className="text-[10px] p-3 border border-[#e5dceb] rounded-[7px] w-full"
            />
          </Field>
          <button
            type="button"
            className="ai-feedback-btn flex items-center gap-[7px] text-[#a084b7] text-[11px] py-[5px] my-3 hover:text-[#8464ae]"
            onClick={() => setHint(true)}
          >
            <Icon name="Sparkles" size={17} />
            Nhờ AI góp ý trước khi nộp
          </button>
          {hint && (
            <div className="callout lavender p-[15px_17px] rounded-lg flex items-start gap-3 border border-[#00000004] text-[11px]">
              <Icon name="Sparkles" className="mt-0.5 shrink-0" />
              <p className="m-0 text-[11px] leading-[1.8]">
                <strong>Gợi ý mô phỏng:</strong>{" "}
                {body.length < 30
                  ? "Bạn hãy viết bản nháp trước. Bắt đầu bằng người sử dụng kết quả và quyết định cần hỗ trợ."
                  : "Hãy rà soát: từng nhận định đã có nguồn chưa, bạn đã phân biệt suy luận với dữ kiện chưa, và người khác có thể kiểm chứng đầu ra bằng cách nào?"}
              </p>
            </div>
          )}
          <div className="modal-actions flex justify-end gap-2.5 mt-[25px] border-t border-[#ede7f2] pt-5">
            <Button type="button" kind="secondary" onClick={close}>
              Để sau
            </Button>
            <Button type="submit" icon="Send">
              {a.status === "revision" ? "Nộp lại bài" : "Nộp bài thực hành"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="callout blue p-[15px_17px] rounded-lg flex items-start gap-3 border border-[#00000004] text-[11px]">
          <Icon name="Info" className="mt-0.5 shrink-0" />
          <p className="m-0 text-[11px] leading-[1.8]">
            {a.status === "submitted"
              ? "Bài đã vào hàng chờ. Chuyển sang vai Giảng viên để trải nghiệm đánh giá và phản hồi."
              : "Kết quả và phản hồi đã được lưu. Xem hồ sơ năng lực để theo dõi bằng chứng được xác nhận."}
          </p>
        </div>
      )}
    </div>
  );
}
export function Assignments() {
  const { state, open } = useApp();
  const [tab, setTab] = useState("all");
  const mine = state.assignments.filter((a) => a.person === "me");
  const filtered = mine.filter(
    (a) =>
      tab === "all" ||
      (tab === "todo" && ["todo", "revision"].includes(a.status)) ||
      a.status === tab,
  );
  return (
    <>
      <PageHead
        eyebrow="HIỂU QUA THỰC HÀNH"
        title="Bài tập & phản hồi"
        description="Thử sức, nhận góp ý và làm tốt hơn qua mỗi lần thực hành."
      />
      <div className="stats-grid three-stats grid grid-cols-3 max-md:grid-cols-1 gap-3 my-5 mb-[26px]">
        <Stat
          icon="FileText"
          color="peach"
          value={
            mine.filter((a) => ["todo", "revision"].includes(a.status)).length
          }
          label="Cần thực hành"
        />
        <Stat
          icon="MessageCircle"
          color="blue"
          value={mine.filter((a) => a.status === "submitted").length}
          label="Đang chờ phản hồi"
        />
        <Stat
          icon="CheckCircle2"
          color="green"
          value={mine.filter((a) => a.status === "approved").length}
          label="Đã đạt yêu cầu"
        />
      </div>
      <Tabs
        items={[
          { id: "all", label: "Tất cả", count: mine.length },
          { id: "todo", label: "Cần thực hành" },
          { id: "submitted", label: "Chờ phản hồi" },
          { id: "approved", label: "Đã đánh giá" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="assignment-list flex flex-col gap-[18px]">
        {filtered.map((a) => {
          const c = state.courses.find((c) => c.id === a.course);
          return (
            <article
              className="assignment-card flex items-center gap-[19px] bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-md:flex-col max-md:items-start"
              key={a.id}
            >
              <span
                className={`assignment-symbol ${c.color} w-[66px] h-[78px] flex items-center justify-center rounded-[9px] shrink-0`}
              >
                <Icon
                  name={a.type === "Phản tư" ? "MessageCircle" : "FileText"}
                  size={29}
                />
              </span>
              <div className="assignment-summary flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="category text-[10px] text-[#a28db4] font-medium">
                    {c.category}
                  </span>
                  <Badge color={statusColor[a.status]}>
                    {statusLabel[a.status]}
                  </Badge>
                </div>
                <h3 className="text-[15px] font-[550] my-2.5 mb-[5px] text-[#716179]">
                  {a.title}
                </h3>
                <p className="text-[10px] text-[#afa0b7] mb-3.5">{c.title}</p>
                <div className="course-meta flex flex-wrap gap-3 text-[10px] text-[#a9a1b0] items-center">
                  <span className="flex items-center gap-1">
                    <Icon name="CalendarDays" size={14} />
                    Hạn {a.due}
                  </span>
                  <span>{a.type}</span>
                  {a.attempt && <span>Lần nộp {a.attempt}</span>}
                </div>
              </div>
              <Button
                kind={
                  ["todo", "revision"].includes(a.status)
                    ? "primary"
                    : "secondary"
                }
                className="max-md:w-full"
                onClick={() =>
                  open(a.title, <AssignmentDetail id={a.id} />, true)
                }
              >
                {a.status === "todo"
                  ? "Làm bài"
                  : a.status === "revision"
                    ? "Bổ sung bài"
                    : "Xem bài & phản hồi"}
                <Icon name="ArrowRight" size={16} />
              </Button>
            </article>
          );
        })}
        {!filtered.length && (
          <Empty
            title="Chưa có bài tập trong mục này"
            description="Các bài tập và phản hồi sẽ được cập nhật theo lộ trình của bạn."
          />
        )}
      </div>
    </>
  );
}

function EventDetails({ id }) {
  const { state, dispatch, notify } = useApp();
  const e = state.events.find((e) => e.id === id);
  return (
    <div className="event-details">
      <Badge color={e.color}>{e.type}</Badge>
      <h2 className="text-[21px] my-[15px] font-semibold text-[#6a557b]">
        {e.title}
      </h2>
      <p className="flex gap-2.5 items-center text-[#a18cab] text-[12px] my-2">
        <Icon name="CalendarDays" size={18} />
        Ngày {e.day}/{e.month}/2026 · {e.time}
      </p>
      <p className="flex gap-2.5 items-center text-[#a18cab] text-[12px] my-2">
        <Icon name="Users" size={18} />
        Hướng dẫn: {e.teacher}
      </p>
      <div className="callout lavender p-[15px_17px] rounded-lg flex items-start gap-3 mt-5 border border-[#00000004] text-[11px]">
        <Icon name="Video" className="mt-0.5 shrink-0" />
        <p className="m-0 text-[11px] leading-[1.8]">
          Buổi đào tạo trực tuyến minh họa. Demo chưa kết nối phòng họp hoặc gửi
          lời mời lịch.
        </p>
      </div>
      <div className="flex gap-2.5 mt-[23px]">
        <Button
          icon={e.registered ? "Check" : "Plus"}
          kind={e.registered ? "secondary" : "primary"}
          onClick={() => {
            dispatch({ type: "event", id });
            notify(
              e.registered
                ? "Đã hủy đăng ký trong demo."
                : "Đã đăng ký buổi đào tạo trong demo.",
            );
          }}
        >
          {e.registered ? "Hủy đăng ký" : "Đăng ký tham gia"}
        </Button>
        <Button
          kind="ghost"
          icon="Download"
          onClick={() => {
            const date = `2026${String(e.month).padStart(2, "0")}${String(e.day).padStart(2, "0")}`;
            download(
              "maturex-lich-hoc.ics",
              `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MatureX//LMS Demo//VI\r\nBEGIN:VEVENT\r\nUID:${e.id}@maturex-demo\r\nDTSTAMP:20260909T000000Z\r\nDTSTART;TZID=Asia/Ho_Chi_Minh:${date}T${e.time.slice(0, 5).replace(":", "")}00\r\nDTEND;TZID=Asia/Ho_Chi_Minh:${date}T${e.time.slice(-5).replace(":", "")}00\r\nSUMMARY:[DEMO] ${e.title}\r\nEND:VEVENT\r\nEND:VCALENDAR`,
              "text/calendar",
            );
          }}
        >
          Tải tệp lịch
        </Button>
      </div>
    </div>
  );
}
function NewEvent() {
  const { dispatch, close, notify } = useApp();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget),
          date = ((f.get("date") as string) || "").split("-");
        if (f.get("end") <= f.get("start")) {
          notify("Giờ kết thúc cần sau giờ bắt đầu.");
          return;
        }
        dispatch({
          type: "addEvent",
          value: {
            id: `e${Date.now()}`,
            title: f.get("title"),
            day: Number(date[2]),
            month: Number(date[1]),
            time: `${f.get("start")} – ${f.get("end")}`,
            teacher: f.get("teacher"),
            type: f.get("type"),
            color: "lavender",
            registered: false,
          },
        });
        notify("Đã tạo buổi đào tạo trong lịch demo.");
        close();
      }}
    >
      <Field label="Tên buổi đào tạo">
        <input
          name="title"
          required
          placeholder="Ví dụ: AI thực hành cùng đội ngũ"
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none focus:border-[#cbb8e0]"
        />
      </Field>
      <div className="form-grid grid grid-cols-2 max-md:grid-cols-1 gap-x-[18px]">
        <Field label="Ngày tổ chức">
          <input
            type="date"
            name="date"
            min="2026-01-01"
            max="2026-12-31"
            defaultValue="2026-09-16"
            required
            className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
          />
        </Field>
        <Field label="Hình thức">
          <select
            name="type"
            className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
          >
            <option>Workshop</option>
            <option>Mentoring</option>
            <option>Chia sẻ</option>
          </select>
        </Field>
        <Field label="Bắt đầu">
          <input
            type="time"
            name="start"
            defaultValue="14:00"
            required
            className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
          />
        </Field>
        <Field label="Kết thúc">
          <input
            type="time"
            name="end"
            defaultValue="15:30"
            required
            className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
          />
        </Field>
      </div>
      <Field label="Người hướng dẫn">
        <input
          name="teacher"
          defaultValue="Ngọc Linh"
          required
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none focus:border-[#cbb8e0]"
        />
      </Field>
      <div className="modal-actions flex justify-end gap-2.5 mt-[25px] border-t border-[#ede7f2] pt-5">
        <Button type="submit" icon="Plus">
          Tạo buổi đào tạo
        </Button>
      </div>
    </form>
  );
}
export function Calendar() {
  const { state, open, role } = useApp();
  const [month, setMonth] = useState(8),
    [day, setDay] = useState(null);
  const count = new Date(2026, month + 1, 0).getDate(),
    offset = (new Date(2026, month, 1).getDay() + 6) % 7;
  const events = state.events.filter(
    (e) => e.month === month + 1 && (!day || e.day === day),
  );
  return (
    <>
      <PageHead
        eyebrow="HỌC TẬP CÙNG NHAU"
        title="Lịch đào tạo"
        description="Những cuộc gặp để sẻ chia kiến thức và cùng tiến bộ."
      >
        {role !== "learner" && (
          <Button
            icon="Plus"
            onClick={() => open("Tạo buổi đào tạo", <NewEvent />)}
          >
            Tạo buổi đào tạo
          </Button>
        )}
      </PageHead>
      <div className="calendar-layout grid grid-cols-[minmax(0,1fr)_285px] max-[1200px]:grid-cols-[minmax(0,1fr)_240px] max-[900px]:grid-cols-1 gap-[22px] max-[1200px]:gap-[15px]">
        <section className="panel calendar-panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-5 max-[1200px]:p-3.5 min-w-0">
          <div className="calendar-toolbar flex justify-between gap-3 items-center mb-6">
            <h2 className="text-[18px] font-semibold text-[#60516f] m-0">
              Tháng {month + 1}, 2026
            </h2>
            <div className="flex items-center gap-2">
              <Button
                kind="secondary"
                onClick={() => {
                  setMonth(8);
                  setDay(null);
                }}
              >
                Tháng demo
              </Button>
              <button
                className="icon-btn p-1 text-[var(--muted,#9b91ab)] hover:text-[#60516f] disabled:opacity-40"
                disabled={month === 0}
                aria-label="Tháng trước"
                onClick={() => {
                  setMonth((m) => m - 1);
                  setDay(null);
                }}
              >
                <Icon name="ChevronLeft" />
              </button>
              <button
                className="icon-btn p-1 text-[var(--muted,#9b91ab)] hover:text-[#60516f] disabled:opacity-40"
                disabled={month === 11}
                aria-label="Tháng sau"
                onClick={() => {
                  setMonth((m) => m + 1);
                  setDay(null);
                }}
              >
                <Icon name="ChevronRight" />
              </button>
            </div>
          </div>
          <div className="calendar-weekdays grid grid-cols-7 text-[10px] text-[#aa98b6] text-center pb-[15px] font-medium">
            {[
              "Thứ Hai",
              "Thứ Ba",
              "Thứ Tư",
              "Thứ Năm",
              "Thứ Sáu",
              "Thứ Bảy",
              "Chủ Nhật",
            ].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid grid grid-cols-7 border-t border-l border-[#eee8f4]">
            {Array.from({ length: offset }, (_, i) => (
              <div
                key={`empty${i}`}
                className="calendar-cell outside border-b border-r border-[#eee8f4] min-h-[110px] max-[1200px]:min-h-[98px] p-[5px] bg-[#faf8fd]"
              />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = i + 1,
                es = state.events.filter(
                  (e) => e.day === date && e.month === month + 1,
                );
              return (
                <div
                  key={date}
                  className={`calendar-cell border-b border-r border-[#eee8f4] min-h-[110px] max-[1200px]:min-h-[98px] p-[5px] min-w-0 transition-colors ${
                    date === 9 && month === 8 ? "today" : ""
                  } ${day === date ? "selected bg-[#f7f0fd]" : "hover:bg-[#faf9fd]"}`}
                >
                  <button
                    className={`date-number text-[10px] w-[25px] h-[25px] rounded-full flex items-center justify-center p-0 mb-1.5 font-medium ${
                      date === 9 && month === 8
                        ? "bg-[#b294c8] text-white"
                        : "text-[#a18cae] hover:bg-[#eee6f6]"
                    }`}
                    aria-label={`Ngày ${date} tháng ${month + 1}`}
                    onClick={() => setDay(day === date ? null : date)}
                  >
                    {date}
                  </button>
                  {es.map((e) => (
                    <button
                      key={e.id}
                      className={`calendar-event ${e.color} block text-left w-full text-[10px] leading-[1.65] p-[5px] rounded mb-1 [overflow-wrap:anywhere]`}
                      onClick={() => open(e.title, <EventDetails id={e.id} />)}
                    >
                      <span className="block text-[10px] opacity-80">
                        {e.time.slice(0, 5)}
                      </span>
                      <strong className="font-normal block truncate">
                        {e.title}
                      </strong>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
        <aside className="panel calendar-events bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
          <div className="between flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-semibold text-[#60516f] m-0">
              {day ? `Ngày ${day}/${month + 1}` : "Trong tháng này"}
            </h3>
            {day && (
              <button
                className="text-btn text-[10px] text-[#9b87bc] hover:underline"
                onClick={() => setDay(null)}
              >
                Xem tất cả
              </button>
            )}
          </div>
          {events.map((e) => (
            <button
              className="schedule-event flex items-start gap-3 text-left py-5 border-b border-[#f0e8f6] last:border-0 w-full hover:bg-[#faf7fc] px-1 rounded-md transition-colors"
              key={e.id}
              onClick={() => open(e.title, <EventDetails id={e.id} />)}
            >
              <span
                className={`date-tile ${e.color} w-10 shrink-0 rounded-[7px] flex items-center justify-center flex-col p-[8px_4px]`}
              >
                <small className="text-[10px] uppercase">{`TH${e.month}`}</small>
                <strong className="text-[21px] font-medium leading-none">
                  {e.day}
                </strong>
              </span>
              <div className="flex-1 min-w-0">
                <Badge color={e.color} className="!text-[10px]">
                  {e.type}
                </Badge>
                <h4 className="text-[10px] font-medium my-[9px] text-[#90779e]">
                  {e.title}
                </h4>
                <p className="text-[10px] text-[#b09cbe] m-0">{e.time}</p>
                {e.registered && (
                  <small className="green-text text-[10px] text-[#6d9673] block mt-1">
                    ✓ Đã đăng ký
                  </small>
                )}
              </div>
            </button>
          ))}
          {!events.length && (
            <Empty
              title="Lịch đang trống"
              description="Bạn có thể dành thời gian cho lộ trình cá nhân."
            />
          )}
        </aside>
      </div>
    </>
  );
}
