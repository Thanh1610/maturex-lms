"use client";

import { Badge, Button, Card, Icon } from "@maturex/ui";
import { useEffect, useRef, useState } from "react";

interface CourseTutorProps {
  courseTitle: string;
  courseDescription: string;
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export function CourseTutor({
  courseTitle,
  courseDescription,
}: CourseTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || busy) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setBusy(true);

    setTimeout(() => {
      let reply = "";
      const lower = trimmed.toLowerCase();
      if (
        lower.includes("vi du") ||
        lower.includes("ví dụ") ||
        lower.includes("áp dụng")
      ) {
        reply = `Ví dụ luyện tập: Khi bạn áp dụng nội dung của "${courseTitle}", hãy xác định rõ câu hỏi cần giải quyết, bằng chứng kiểm chứng và điều kiện dừng trước khi triển khai.`;
      } else if (
        lower.includes("kiểm tra") ||
        lower.includes("kiem tra") ||
        lower.includes("hiểu")
      ) {
        reply = `Cùng thử một câu nhé: Trong “${courseTitle}”, bạn sẽ dùng bằng chứng nào để biết mình đã áp dụng đúng? Hãy nêu một tình huống thực tế của bạn.`;
      } else {
        reply = `Điểm chính trong nội dung này: ${courseDescription} Bạn đang vướng ở phần lý thuyết hay bài tập thực hành?`;
      }

      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setBusy(false);
    }, 600);
  };

  return (
    <Card className="tutor-panel p-5 overflow-hidden flex flex-col">
      <div className="tutor-heading flex items-center gap-2.5 border-b border-[#eee8f5] pb-3.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#efe4f9] text-[#7d5b9f] flex items-center justify-center shrink-0">
          <Icon name="Sparkles" size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-[#5a466f] m-0 truncate">
            Trợ lý học tập
          </h3>
          <span className="text-[10px] text-[#9a8da8]">
            Học sâu hơn, từng câu hỏi
          </span>
        </div>
        <Badge
          variant="lavender"
          className="text-[10px] bg-[#f0e9f7] text-[#71538f] border-0 px-1.5 py-0.5"
        >
          AI demo
        </Badge>
      </div>

      <div className="tutor-messages min-h-[220px] max-h-[300px] overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.length === 0 ? (
          <div className="py-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#f7f2fb] text-[#9375b4] flex items-center justify-center mx-auto mb-3">
              <Icon name="Sparkles" size={20} />
            </div>
            <h4 className="text-xs font-medium text-[#5c4a70] mb-1.5">
              Cùng làm rõ điều bạn đang học.
            </h4>
            <p className="text-[11px] text-[#8e819b] mb-4 leading-relaxed">
              Mình đang đồng hành cùng bạn trong khóa “{courseTitle}”.
            </p>

            <div className="space-y-1.5">
              {[
                "Giải thích nội dung này",
                "Cho tôi một ví dụ áp dụng",
                "Kiểm tra tôi đã hiểu chưa",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="w-full text-left p-2 rounded-lg border border-[#ebe2f3] bg-white hover:bg-[#fbf8fe] text-[11px] text-[#76638a] flex items-center justify-between cursor-pointer transition-colors"
                  onClick={() => handleSend(prompt)}
                >
                  <span>{prompt}</span>
                  <Icon
                    name="ArrowUpRight"
                    size={13}
                    className="text-[#a493b8]"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${
                m.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0 font-medium ${
                  m.role === "user"
                    ? "bg-[#6c518b] text-white"
                    : "bg-[#efe4f9] text-[#7d5b9f]"
                }`}
              >
                {m.role === "user" ? "B" : <Icon name="Sparkles" size={13} />}
              </div>
              <div
                className={`max-w-[82%] rounded-lg p-2.5 text-[11px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#f3ecf9] text-[#4d3b60]"
                    : "bg-[#f9f7fc] border border-[#eee6f5] text-[#5b4a6e]"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}

        {busy && (
          <div className="text-[10px] text-[#937db0] italic py-1">
            Đang chuẩn bị phản hồi...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="mt-3 flex gap-1.5 border border-[#e4d8ee] rounded-lg p-1.5 bg-white"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
      >
        <input
          type="text"
          aria-label="Câu hỏi cho trợ lý AI"
          placeholder="Điều bạn muốn hiểu rõ hơn…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full text-xs text-[#524462] px-2 py-1 outline-none border-0"
        />
        <Button
          type="submit"
          size="icon"
          disabled={busy || !input.trim()}
          className="h-7 w-7 bg-[#7d5b9f] hover:bg-[#6c4d8b] text-white shrink-0 rounded-md"
        >
          <Icon name="ArrowUpRight" size={14} />
        </Button>
      </form>
    </Card>
  );
}
