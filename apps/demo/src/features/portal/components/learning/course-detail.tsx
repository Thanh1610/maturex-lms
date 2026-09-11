import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  download,
  Empty,
  Icon,
  Progress,
  Tabs,
  useApp,
} from "@/components/ui";
import { people, rubric } from "../../portal-data";
import { progress } from "../../portal-store";
import { QuickQuiz } from "./quick-quiz";
import { Tutor, topicDetails } from "./tutor";

export function Course({ id }: { id: string }) {
  const { state, dispatch, go, open, notify } = useApp();
  const course = state.courses.find((c: any) => c.id === id);
  const [lesson, setLesson] = useState(() => {
    const c = state.courses.find((c: any) => c.id === id);
    return c
      ? Math.max(
          0,
          c.lessons.findIndex(
            (_: any, i: number) => !state.completed[id]?.includes(i),
          ),
        )
      : 0;
  });
  const [tab, setTab] = useState("Tổng quan");
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speed, setSpeed] = useState(1);
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
    ...(topicDetails.ai?.slice(1) || []),
  ];
  const slide = Math.min(3, Math.floor(seconds / 30));
  const done = state.completed[id]?.includes(lesson);
  const fmt = (v: number) =>
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
                {slides.map((s: string, i: number) => (
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
              {course.lessons.map((l: string, i: number) => (
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
