import { useEffect, useRef, useState } from "react";
import { Badge, Icon, PageHead, useApp } from "@/components/ui";
import { normalize } from "../../portal-data";

export const topicDetails: Record<string, string[]> = {
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
