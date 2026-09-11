import {
  Avatar,
  Badge,
  Button,
  CourseCard,
  Empty,
  Icon,
  PageHead,
  SectionHead,
  Stat,
  useApp,
} from "@/components/ui";
import { people } from "../../portal-data";
import { progress } from "../../portal-store";
import { QuickQuiz } from "./quick-quiz";

export function Dashboard() {
  const { state, go, role, open } = useApp();
  const ongoing = state.courses.filter(
    (c: any) => state.enrolled.includes(c.id) && progress(state, c.id) < 100,
  );
  const finished = state.enrolled.filter(
    (id: string) => progress(state, id) === 100,
  ).length;
  const todo = state.assignments.filter(
    (a: any) => a.person === "me" && ["todo", "revision"].includes(a.status),
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
                .filter((s: any) => s.level >= s.target)
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
            {ongoing.slice(0, 2).map((c: any) => (
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
                (c: any) =>
                  c.status === "published" && !state.enrolled.includes(c.id),
              )
              .slice(0, 2)
              .map((c: any) => (
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
                    <span className="text-xs font-medium text-[#7a6a94]">
                      {c.category}
                    </span>
                    <strong className="text-[13px] block leading-snug mt-1 font-semibold text-[#2d2838]">
                      {c.title}
                    </strong>
                    <small className="text-xs text-[#6e6878] mt-1 block">
                      {c.duration}
                    </small>
                  </div>
                  <Icon
                    name="ArrowUpRight"
                    size={19}
                    className="text-[#8c7ba3] ml-auto shrink-0"
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
                    state.assignments.filter(
                      (a: any) => a.status === "submitted",
                    ).length
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
              {todo.map((a: any, i: number) => (
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
                      course={state.courses.find(
                        (c: any) => c.id === "thinking",
                      )}
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
