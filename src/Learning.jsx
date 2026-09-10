import { useEffect, useRef, useState } from "react";
import { categories, normalize, paths, people, rubric } from "./data.js";
import { progress } from "./store.js";
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
} from "./ui.jsx";

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
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <section className="hero">
            <div className="hero-copy">
              <span className="hero-kicker">
                <span /> HÀNH TRÌNH PHÁT TRIỂN CỦA BẠN
              </span>
              <h2>
                Học để hiểu.
                <br />
                Thực hành để trưởng thành.
              </h2>
              <p>
                Mỗi kiến thức chỉ thực sự có ý nghĩa
                <br className="desktop-break" /> khi được mang vào công việc và
                cuộc sống.
              </p>
              <Button
                kind="white"
                onClick={() => go(`course/${ongoing[0]?.id || "ai"}`)}
              >
                Tiếp tục hành trình <Icon name="ArrowRight" size={17} />
              </Button>
            </div>
            <div className="hero-feature">
              <div className="hero-orbit">
                <Icon name="Sprout" size={94} strokeWidth={1.2} />
              </div>
              <div className="hero-pill">
                <Icon name="Sparkles" size={16} /> Tốt hơn một chút mỗi ngày
              </div>
              <div className="hero-mini">
                <span>01</span>
                <div>
                  HIỂU · LÀM · PHÁT TRIỂN<small>Learning is a journey.</small>
                </div>
              </div>
            </div>
          </section>
          <div className="stats-grid">
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
          <div className="course-grid two">
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
          <div className="recommend-strip">
            {state.courses
              .filter(
                (c) =>
                  c.status === "published" && !state.enrolled.includes(c.id),
              )
              .slice(0, 2)
              .map((c) => (
                <button
                  className="recommend-card"
                  key={c.id}
                  onClick={() => go(`course/${c.id}`)}
                >
                  <span className={`icon-tile ${c.color}`}>
                    <Icon name={c.icon} size={27} />
                  </span>
                  <div>
                    <span className="tiny muted">{c.category}</span>
                    <strong>{c.title}</strong>
                    <small>{c.duration}</small>
                  </div>
                  <Icon name="ArrowUpRight" size={19} />
                </button>
              ))}
          </div>
          {role !== "learner" && (
            <div className="callout lavender">
              <Icon name="LayoutDashboard" />
              <div>
                <strong>
                  Không gian {role === "manager" ? "quản lý" : "giảng viên"} của
                  bạn
                </strong>
                <p>
                  Có{" "}
                  {
                    state.assignments.filter((a) => a.status === "submitted")
                      .length
                  }{" "}
                  bài đang chờ phản hồi.
                </p>
              </div>
              <Button kind="secondary" onClick={() => go("reviews")}>
                Mở hàng chờ
              </Button>
            </div>
          )}
        </div>
        <aside className="dashboard-aside">
          <section className="panel week-panel">
            <div className="between">
              <h3>Nhịp học tuần này</h3>
              <Icon name="Sprout" size={20} />
            </div>
            <p className="muted small">
              Dành một chút thời gian cho chính mình.
            </p>
            <div className="week-days">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => (
                <div key={d}>
                  <span>{d}</span>
                  <button
                    aria-label={`Nhịp học ${d}`}
                    className={i < 2 ? "done" : i === 2 ? "today" : ""}
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
            <div className="week-bottom">
              <Icon name="Clock" size={16} />
              <span>Gợi ý: 20 phút học tập hôm nay</span>
            </div>
          </section>
          <section className="panel">
            <SectionHead title="Việc cần làm" action="" />
            <div className="task-list">
              {todo.map((a, i) => (
                <button key={a.id} onClick={() => go("assignments")}>
                  <span className={`task-icon ${i ? "lavender" : "peach"}`}>
                    <Icon name="FileText" size={17} />
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <small>
                      Hạn {a.due.slice(0, 5)} · {a.type}
                    </small>
                  </div>
                  <Icon name="ChevronRight" size={15} />
                </button>
              ))}
              <button
                onClick={() =>
                  open(
                    "Ôn lại: dữ kiện hay suy luận?",
                    <QuickQuiz
                      course={state.courses.find((c) => c.id === "thinking")}
                    />,
                  )
                }
              >
                <span className="task-icon green">
                  <Icon name="Brain" size={17} />
                </span>
                <div>
                  <strong>Ôn một điều đã học</strong>
                  <small>Kiểm tra nhanh · 2 phút</small>
                </div>
                <Icon name="ChevronRight" size={15} />
              </button>
            </div>
          </section>
          <section className="panel upcoming">
            <div className="between">
              <h3>Sắp diễn ra</h3>
              <button
                className="icon-btn"
                aria-label="Xem lịch đào tạo"
                onClick={() => go("calendar")}
              >
                <Icon name="ArrowUpRight" size={18} />
              </button>
            </div>
            <Badge color="lavender">WORKSHOP</Badge>
            <h3>AI thực hành: từ brief đến sản phẩm</h3>
            <p>
              <Icon name="CalendarDays" size={15} /> Thứ Năm, 10/09 · 14:00
            </p>
            <div className="between">
              <div className="avatar-stack">
                {people.slice(0, 3).map((p) => (
                  <Avatar key={p.id} person={p} size="small" />
                ))}
                <span>+12</span>
              </div>
              <button className="text-btn" onClick={() => go("calendar")}>
                Chi tiết
                <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </section>
          <section className="ai-nudge">
            <span className="ai-spark">
              <Icon name="Sparkles" size={24} />
            </span>
            <h3>Có điều gì bạn chưa rõ?</h3>
            <p>Cùng AI giải thích lại, tìm ví dụ hoặc luyện tập một chút.</p>
            <button onClick={() => go("assistant")}>
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
      <section className="library-banner">
        <div>
          <Badge color="white">BỘ SƯU TẬP NỔI BẬT</Badge>
          <h2>
            AI là cộng sự.
            <br />
            Bạn là người dẫn đường.
          </h2>
          <p>Học cách làm việc cùng AI một cách chủ động và có kiểm chứng.</p>
          <button className="text-btn" onClick={() => setCat("AI & Dữ liệu")}>
            Khám phá các khóa AI <Icon name="ArrowRight" size={17} />
          </button>
        </div>
        <div className="library-banner-icon">
          <Icon name="Sparkles" size={104} strokeWidth={1} />
          <span>HUMAN × AI</span>
        </div>
      </section>
      <Tabs
        items={["Tất cả khóa học", "Đang học", "Đã lưu"]}
        value={tab}
        onChange={setTab}
      />
      <div className="filter-row">
        <div className="search-input">
          <Icon name="Search" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm khóa học, chủ đề, dự án…"
            aria-label="Tìm khóa học"
          />
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Cấp độ khóa học"
        >
          {["Tất cả cấp độ", "Nền tảng", "Ứng dụng", "Nâng cao"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      <div className="chips">
        {categories.map((c) => (
          <button
            key={c}
            className={cat === c ? "selected" : ""}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="between catalog-count">
        <p className="muted small">{courses.length} khóa học dành cho bạn</p>
        <span className="tiny muted">
          Nội dung minh họa · Được biên tập cho demo
        </span>
      </div>
      {courses.length ? (
        <div className="course-grid three">
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
export function Tutor({ course, compact = false }) {
  const { state, go } = useApp();
  const [messages, setMessages] = useState([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false);
  const timer = useRef();
  const end = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (messages.length)
      end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);
  function send(text) {
    if (!text.trim() || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    timer.current = setTimeout(() => {
      const c = course || state.courses.find((c) => c.id === "ai");
      const n = normalize(text);
      let answer;
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
      <div className="tutor-heading">
        <span className="ai-spark">
          <Icon name="Sparkles" size={22} />
        </span>
        <div>
          <h3>Trợ lý học tập</h3>
          <span>Học sâu hơn, từng câu hỏi</span>
        </div>
        <Badge color="lavender">AI demo</Badge>
      </div>
      <div className="tutor-messages">
        {!messages.length && (
          <div className="tutor-welcome">
            <div className="tutor-emblem">
              <Icon name="Sparkles" size={32} />
            </div>
            <h3>Cùng làm rõ điều bạn đang học.</h3>
            <p>
              {course
                ? `Mình đang đồng hành cùng bạn trong khóa “${course.title}”.`
                : "Bạn muốn hiểu một khái niệm, thử một ví dụ hay luyện tập từ những gì đã học?"}
            </p>
            <div className="prompt-chips">
              {[
                "Giải thích nội dung này",
                "Cho tôi một ví dụ áp dụng",
                "Kiểm tra tôi đã hiểu chưa",
              ].map((p) => (
                <button key={p} onClick={() => send(p)}>
                  {p}
                  <Icon name="ArrowUpRight" size={14} />
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            <span
              className={`chat-avatar ${m.role === "ai" ? "lavender" : "gray"}`}
            >
              <Icon name={m.role === "ai" ? "Sparkles" : "Users"} size={15} />
            </span>
            <div>
              <small>
                {m.role === "ai" ? "MX Learning AI · mô phỏng" : "Bạn"}
              </small>
              <p>{m.text}</p>
              {m.source && (
                <button
                  className="source-chip"
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
          <div className="typing">
            Đang chuẩn bị gợi ý<span>•••</span>
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        className="tutor-form"
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
        />
        <button aria-label="Gửi câu hỏi" disabled={busy || !input.trim()}>
          <Icon name="ArrowUpRight" size={21} />
        </button>
      </form>
      <p className="ai-disclaimer">
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
      <div className="assistant-layout">
        <section className="panel">
          <Tutor />
        </section>
        <aside>
          <div className="panel">
            <span className="icon-tile lavender">
              <Icon name="BookOpen" />
            </span>
            <h3>Hỏi trong bối cảnh bài học</h3>
            <p className="muted">
              Mở AI ngay trong từng khóa học để nhận gợi ý theo nội dung đang
              xem.
            </p>
          </div>
          <div className="panel">
            <span className="icon-tile green">
              <Icon name="Brain" />
            </span>
            <h3>Thử trước, hỏi sau</h3>
            <p className="muted">
              Viết ra suy nghĩ của bạn. Dùng AI để phản biện, kiểm tra và tìm
              góc nhìn còn thiếu.
            </p>
          </div>
          <div className="callout sand">
            <Icon name="Info" />
            <p>
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
  const isCulture = course.id === "culture";
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
      <h3>
        {isCulture
          ? "Khi một cam kết có nguy cơ không hoàn thành, bạn nên làm gì?"
          : "Trước một nhận định chưa chắc chắn, cách xử lý phù hợp nhất là gì?"}
      </h3>
      {options.map((x, i) => (
        <button
          key={x}
          className={`quiz-option ${answer === i ? "selected" : ""} ${checked && i === 1 ? "correct" : ""}`}
          onClick={() => {
            setAnswer(i);
            setChecked(false);
          }}
        >
          <span>{String.fromCharCode(65 + i)}</span>
          {x}
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
  const playerRef = useRef();
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
      <button className="back-link" onClick={() => go("catalog")}>
        <Icon name="ArrowLeft" size={16} />
        Thư viện học tập
      </button>
      <div className="course-page-heading">
        <div>
          <div className="flex">
            <Badge>{course.category}</Badge>
            <span className="muted small">
              {course.level} · {course.scope}
            </span>
          </div>
          <h1>{course.title}</h1>
          <p className="muted small">
            Hướng dẫn bởi {course.teacher}{" "}
            <span className="dot-separator">·</span> {course.lessons.length} bài
            học <span className="dot-separator">·</span> {course.duration}
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
      <div className="course-layout">
        <div className="lesson-column">
          <section className="lesson-player" ref={playerRef}>
            <div className="player-top">
              <span>
                mature<span className="mint-text">x</span> / classroom
              </span>
              <Badge color="white">BÀI GIẢNG MÔ PHỎNG</Badge>
            </div>
            <div className="slide-content">
              <span>
                BÀI {lesson + 1} / {course.lessons[lesson]}
              </span>
              <h2>{slides[slide]}</h2>
              <div className="slide-pagination">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    className={slide === i ? "active" : ""}
                    onClick={() => setSeconds(i * 30)}
                    aria-label={`Đến phần ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="player-speaker">
              <Avatar person={people[4]} size="small" />
              <div>
                <strong>{course.teacher}</strong>
                <small>Học liệu minh họa cho demo</small>
              </div>
              <Icon name={course.icon} size={35} />
            </div>
            <div className="player-controls">
              <input
                type="range"
                min="0"
                max="120"
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                aria-label="Vị trí bài giảng"
              />
              <div className="between">
                <div className="flex">
                  <button
                    aria-label={
                      playing ? "Tạm dừng bài giảng" : "Phát bài giảng"
                    }
                    onClick={() => {
                      if (seconds >= 120) setSeconds(0);
                      setPlaying(!playing);
                    }}
                  >
                    <Icon name={playing ? "Pause" : "Play"} size={19} />
                  </button>
                  <span>{fmt(seconds)} / 02:00</span>
                </div>
                <div className="flex">
                  <select
                    aria-label="Tốc độ phát"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  >
                    {[1, 1.5, 2].map((x) => (
                      <option key={x} value={x}>
                        {x}×
                      </option>
                    ))}
                  </select>
                  <button
                    aria-label="Phóng to bài giảng"
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
          <div className="lesson-actions">
            <div>
              <span className="tiny muted">BẠN ĐANG HỌC</span>
              <h3>{course.lessons[lesson]}</h3>
            </div>
            <Button
              icon={done ? "CheckCircle2" : enrolled ? "Check" : "Plus"}
              kind={done ? "secondary" : "primary"}
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
          <div className="lesson-tab-content">
            {tab === "Tổng quan" && (
              <>
                <h3>Bạn sẽ mang theo điều gì?</h3>
                <p>{course.description}</p>
                <div className="learning-outcomes">
                  {[
                    "Giải thích được các nguyên tắc cốt lõi trong bài học.",
                    "Áp dụng vào một tình huống cụ thể của công việc.",
                    "Tự kiểm tra đầu ra và chỉ rõ điều còn cần xác minh.",
                  ].map((x) => (
                    <p key={x}>
                      <Icon name="CheckCircle2" size={18} />
                      {x}
                    </p>
                  ))}
                </div>
                <div className="callout lavender">
                  <Icon name="Brain" />
                  <div>
                    <strong>Dừng một chút để nhớ lại</strong>
                    <p>
                      Thử một câu hỏi ngắn trước khi chuyển sang bài tiếp theo.
                    </p>
                  </div>
                  <Button
                    kind="secondary"
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
                <p className="muted small">
                  Transcript minh họa · Chọn mốc thời gian để chuyển phần trình
                  chiếu.
                </p>
                {slides.map((s, i) => (
                  <button
                    className={`transcript-line ${slide === i ? "active" : ""}`}
                    key={i}
                    onClick={() => setSeconds(i * 30)}
                  >
                    <span>{fmt(i * 30)}</span>
                    <p>{s}</p>
                  </button>
                ))}
              </>
            )}
            {tab === "Ghi chú" && (
              <>
                <div className="between">
                  <h3>Ghi chú của bạn</h3>
                  <Badge color="green">Tự lưu trên trình duyệt</Badge>
                </div>
                <textarea
                  className="notes-area"
                  placeholder="Điều tôi muốn ghi nhớ, câu hỏi còn mở, cách áp dụng…"
                  value={state.notes[id] || ""}
                  onChange={(e) =>
                    dispatch({ type: "note", id, value: e.target.value })
                  }
                />
                <p className="tiny muted">
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
                <div className="resource-row" key={x}>
                  <span className="icon-tile lavender">
                    <Icon name="FileText" />
                  </span>
                  <div>
                    <strong>{x}</strong>
                    <small>Tài liệu demo · TXT</small>
                  </div>
                  <Button
                    kind="ghost"
                    icon="Download"
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
              <div className="stack">
                <p>
                  Cùng trao đổi câu hỏi và bài học ứng dụng với đồng nghiệp.
                </p>
                <Button
                  kind="secondary"
                  icon="MessageCircle"
                  onClick={() => go("community")}
                >
                  Mở cộng đồng học tập
                </Button>
              </div>
            )}
          </div>
        </div>
        <aside className="course-side">
          <section className="panel curriculum">
            <div className="between">
              <h3>Nội dung khóa học</h3>
              <span className="tiny muted">
                {state.completed[id]?.length || 0}/{course.lessons.length}
              </span>
            </div>
            <Progress value={progress(state, id)} />
            <div className="lesson-list">
              {course.lessons.map((l, i) => (
                <button
                  key={l}
                  className={lesson === i ? "active" : ""}
                  onClick={() => {
                    setLesson(i);
                    setSeconds(0);
                    setPlaying(false);
                  }}
                >
                  <span
                    className={
                      state.completed[id]?.includes(i) ? "lesson-done" : ""
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
                  <div>
                    <strong>
                      {String(i + 1).padStart(2, "0")}. {l}
                    </strong>
                    <small>Video & thực hành</small>
                  </div>
                </button>
              ))}
              <button onClick={() => go("assignments")}>
                <Icon name="ClipboardCheck" size={18} />
                <div>
                  <strong>Bài thực hành cuối khóa</strong>
                  <small>Nộp bài & nhận phản hồi</small>
                </div>
                <Icon name="ArrowUpRight" size={15} />
              </button>
            </div>
          </section>
          <section className="panel tutor-panel">
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
      <div className={`path-detail-intro ${path.color}`}>
        <Icon name={path.icon} size={40} />
        <h2>{path.title}</h2>
        <p>{path.description}</p>
        <Badge color="white">Mục tiêu: {path.target}</Badge>
      </div>
      <p className="muted small">
        Gợi ý học theo thứ tự. Mỗi bước gồm bài học và thực hành; đánh giá năng
        lực dựa trên bằng chứng riêng.
      </p>
      <div className="path-steps">
        {path.courses.map((id, i) => {
          const c = state.courses.find((c) => c.id === id);
          return (
            <button
              key={id}
              onClick={() => {
                go(`course/${id}`);
                close();
              }}
            >
              <span className={progress(state, id) === 100 ? "done" : ""}>
                {progress(state, id) === 100 ? (
                  <Icon name="Check" size={16} />
                ) : (
                  i + 1
                )}
              </span>
              <div>
                <strong>{c.title}</strong>
                <small>
                  {c.duration} · {progress(state, id)}% hoàn thành
                </small>
              </div>
              <Icon name="ArrowUpRight" size={17} />
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
      <div className="path-highlight">
        <span className="icon-tile lavender">
          <Icon name="Compass" size={34} />
        </span>
        <div>
          <span className="eyebrow">MỤC TIÊU PHÁT TRIỂN HIỆN TẠI</span>
          <h2>Ứng dụng AI có kiểm chứng vào nghiên cứu khách hàng</h2>
          <p>Lộ trình gợi ý cho vai trò Product Researcher · Thedeerly</p>
        </div>
        <Button kind="secondary" onClick={() => go("skills")}>
          Xem năng lực
          <Icon name="ArrowUpRight" size={17} />
        </Button>
      </div>
      <div className="paths-list">
        {[...paths, ...(state.customPaths || [])].map((p, i) => {
          const done = Math.round(
            p.courses.reduce((n, id) => n + progress(state, id), 0) /
              p.courses.length,
          );
          return (
            <article key={p.id} className="path-card">
              <div className={`path-art ${p.color}`}>
                <Icon name={p.icon} size={57} strokeWidth={1.3} />
                <span>PATH / 0{i + 1}</span>
              </div>
              <div className="path-card-main">
                <div className="between">
                  <Badge color={p.color}>
                    {i === 0
                      ? "Đang theo học"
                      : i === 1
                        ? "Nền tảng chung"
                        : "Hướng phát triển"}
                  </Badge>
                  <span className="muted small">
                    {p.weeks} · {p.courses.length} khóa học
                  </span>
                </div>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <div className="path-mini-courses">
                  {p.courses.map((id, j) => (
                    <button key={id} onClick={() => go(`course/${id}`)}>
                      <span
                        className={progress(state, id) === 100 ? "done" : ""}
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
                <div className="path-card-bottom">
                  <div>
                    <Progress value={done} />
                    <small>{done}% nội dung đã hoàn thành</small>
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
        <section className="panel">
          <h3>Lộ trình được giao</h3>
          {state.pathAssignments
            .filter((x) => x.person === "me")
            .map((x) => (
              <div className="resource-row" key={x.id}>
                <Icon name="Compass" />
                <div>
                  <strong>{x.title}</strong>
                  <small>
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
      <div className="flex">
        <Badge color={statusColor[a.status]}>{statusLabel[a.status]}</Badge>
        <span className="muted small">
          Hạn {a.due} · {a.type}
        </span>
      </div>
      <p>{a.description}</p>
      <h3>Tiêu chí đánh giá</h3>
      <div className="rubric-preview">
        {rubric.map((r, i) => (
          <div key={r}>
            <span>{i + 1}</span>
            {r}
          </div>
        ))}
      </div>
      {a.feedback && (
        <div
          className={`feedback-box ${a.status === "approved" ? "green" : "peach"}`}
        >
          <div className="flex">
            <Icon name="MessageCircle" size={19} />
            <strong>Phản hồi từ {a.reviewer || "Ngọc Linh"}</strong>
          </div>
          <p>{a.feedback}</p>
          {a.scores && (
            <span className="small">
              Tiêu chí: {a.scores.join(" / ")} (thang 4)
            </span>
          )}
        </div>
      )}
      {a.body && (
        <details open={!canSubmit}>
          <summary>Bài đã nộp · Lần {a.attempt || 1}</summary>
          <p className="submitted-body">{a.body}</p>
          {a.file && (
            <p className="tiny muted">
              Tệp minh họa: {a.file} (chỉ lưu tên tệp)
            </p>
          )}
        </details>
      )}
      {a.history?.length > 0 && (
        <details>
          <summary>Lịch sử sửa bài ({a.history.length})</summary>
          {a.history.map((h, i) => (
            <div className="history-item" key={i}>
              <strong>Lần {i + 1}</strong>
              <p>{h.body}</p>
              <small>Phản hồi: {h.feedback}</small>
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
            />
          </Field>
          <Field
            label="Tệp đính kèm (tùy chọn)"
            hint="Demo chỉ lưu tên tệp, không tải nội dung lên máy chủ."
          >
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0]?.name || "")}
            />
          </Field>
          <button
            type="button"
            className="ai-feedback-btn"
            onClick={() => setHint(true)}
          >
            <Icon name="Sparkles" size={17} />
            Nhờ AI góp ý trước khi nộp
          </button>
          {hint && (
            <div className="callout lavender">
              <Icon name="Sparkles" />
              <p>
                <strong>Gợi ý mô phỏng:</strong>{" "}
                {body.length < 30
                  ? "Bạn hãy viết bản nháp trước. Bắt đầu bằng người sử dụng kết quả và quyết định cần hỗ trợ."
                  : "Hãy rà soát: từng nhận định đã có nguồn chưa, bạn đã phân biệt suy luận với dữ kiện chưa, và người khác có thể kiểm chứng đầu ra bằng cách nào?"}
              </p>
            </div>
          )}
          <div className="modal-actions">
            <Button type="button" kind="secondary" onClick={close}>
              Để sau
            </Button>
            <Button type="submit" icon="Send">
              {a.status === "revision" ? "Nộp lại bài" : "Nộp bài thực hành"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="callout blue">
          <Icon name="Info" />
          <p>
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
      <div className="stats-grid three-stats">
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
      <div className="assignment-list">
        {filtered.map((a) => {
          const c = state.courses.find((c) => c.id === a.course);
          return (
            <article className="assignment-card" key={a.id}>
              <span className={`assignment-symbol ${c.color}`}>
                <Icon
                  name={a.type === "Phản tư" ? "MessageCircle" : "FileText"}
                  size={29}
                />
              </span>
              <div className="assignment-summary">
                <div className="flex">
                  <span className="category">{c.category}</span>
                  <Badge color={statusColor[a.status]}>
                    {statusLabel[a.status]}
                  </Badge>
                </div>
                <h3>{a.title}</h3>
                <p>{c.title}</p>
                <div className="course-meta">
                  <span>
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
      <h2>{e.title}</h2>
      <p>
        <Icon name="CalendarDays" size={18} />
        Ngày {e.day}/{e.month}/2026 · {e.time}
      </p>
      <p>
        <Icon name="Users" size={18} />
        Hướng dẫn: {e.teacher}
      </p>
      <div className="callout lavender">
        <Icon name="Video" />
        <p>
          Buổi đào tạo trực tuyến minh họa. Demo chưa kết nối phòng họp hoặc gửi
          lời mời lịch.
        </p>
      </div>
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
  );
}
function NewEvent() {
  const { dispatch, close, notify } = useApp();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.target),
          date = f.get("date").split("-");
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
        />
      </Field>
      <div className="form-grid">
        <Field label="Ngày tổ chức">
          <input
            type="date"
            name="date"
            min="2026-01-01"
            max="2026-12-31"
            defaultValue="2026-09-16"
            required
          />
        </Field>
        <Field label="Hình thức">
          <select name="type">
            <option>Workshop</option>
            <option>Mentoring</option>
            <option>Chia sẻ</option>
          </select>
        </Field>
        <Field label="Bắt đầu">
          <input type="time" name="start" defaultValue="14:00" required />
        </Field>
        <Field label="Kết thúc">
          <input type="time" name="end" defaultValue="15:30" required />
        </Field>
      </div>
      <Field label="Người hướng dẫn">
        <input name="teacher" defaultValue="Ngọc Linh" required />
      </Field>
      <div className="modal-actions">
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
      <div className="calendar-layout">
        <section className="panel calendar-panel">
          <div className="calendar-toolbar">
            <h2>Tháng {month + 1}, 2026</h2>
            <div className="flex">
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
                className="icon-btn"
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
                className="icon-btn"
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
          <div className="calendar-weekdays">
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
          <div className="calendar-grid">
            {Array.from({ length: offset }, (_, i) => (
              <div key={`empty${i}`} className="calendar-cell outside" />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = i + 1,
                es = state.events.filter(
                  (e) => e.day === date && e.month === month + 1,
                );
              return (
                <div
                  key={date}
                  className={`calendar-cell ${date === 9 && month === 8 ? "today" : ""} ${day === date ? "selected" : ""}`}
                >
                  <button
                    className="date-number"
                    aria-label={`Ngày ${date} tháng ${month + 1}`}
                    onClick={() => setDay(day === date ? null : date)}
                  >
                    {date}
                  </button>
                  {es.map((e) => (
                    <button
                      key={e.id}
                      className={`calendar-event ${e.color}`}
                      onClick={() => open(e.title, <EventDetails id={e.id} />)}
                    >
                      <span>{e.time.slice(0, 5)}</span>
                      {e.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
        <aside className="panel calendar-events">
          <div className="between">
            <h3>{day ? `Ngày ${day}/${month + 1}` : "Trong tháng này"}</h3>
            {day && (
              <button className="text-btn" onClick={() => setDay(null)}>
                Xem tất cả
              </button>
            )}
          </div>
          {events.map((e) => (
            <button
              className="schedule-event"
              key={e.id}
              onClick={() => open(e.title, <EventDetails id={e.id} />)}
            >
              <span className={`date-tile ${e.color}`}>
                <small>TH{e.month}</small>
                <strong>{e.day}</strong>
              </span>
              <div>
                <Badge color={e.color}>{e.type}</Badge>
                <h4>{e.title}</h4>
                <p>{e.time}</p>
                {e.registered && (
                  <small className="green-text">✓ Đã đăng ký</small>
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
