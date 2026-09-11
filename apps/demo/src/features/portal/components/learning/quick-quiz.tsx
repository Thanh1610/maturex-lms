import { useState } from "react";
import { Badge, Button, Icon, useApp } from "@/components/ui";

export function QuickQuiz({ course }: { course: any }) {
  const { dispatch, notify } = useApp();
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
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
