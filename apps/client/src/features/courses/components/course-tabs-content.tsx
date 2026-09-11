"use client";

import { useState } from "react";
import { Badge, Button, Card, Icon, Tabs, TabsContent, TabsList, TabsTrigger, toast } from "@maturex/ui";
import type { Course } from "../mock-courses";
import { rubric } from "../mock-courses";

interface CourseTabsContentProps {
  course: Course;
  slides: string[];
  onSeekSlide?: (slideIdx: number) => void;
  onOpenQuiz?: () => void;
}

export function CourseTabsContent({
  course,
  slides,
  onSeekSlide,
  onOpenQuiz,
}: CourseTabsContentProps) {
  const [noteText, setNoteText] = useState("");

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Đã tải xuống tài liệu", { description: filename });
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${mins}:${s}`;
  };

  return (
    <div className="course-tabs-wrapper mt-5">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#f2ecf8] p-1 rounded-lg border border-[#e5dced] flex gap-1 h-auto flex-wrap">
          <TabsTrigger
            value="overview"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="transcript"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Transcript
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Ghi chú
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Tài liệu
          </TabsTrigger>
          <TabsTrigger
            value="discussion"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Thảo luận
          </TabsTrigger>
        </TabsList>

        <Card className="mt-3 p-5 sm:p-6 bg-white border border-[#e9eaf0] rounded-xl shadow-none min-h-[250px]">
          <TabsContent value="overview" className="m-0 focus-visible:outline-none">
            <h3 className="text-sm font-semibold text-[#5a486c] mb-2">
              Bạn sẽ mang theo điều gì?
            </h3>
            <p className="text-xs sm:text-sm text-[#736582] leading-relaxed mb-5">
              {course.description}
            </p>

            <div className="learning-outcomes space-y-3 mb-6">
              {[
                "Giải thích được các nguyên tắc cốt lõi trong bài học.",
                "Áp dụng vào một tình huống cụ thể của công việc.",
                "Tự kiểm tra đầu ra và chỉ rõ điều còn cần xác minh.",
              ].map((outcome) => (
                <div key={outcome} className="flex items-start gap-2.5 text-xs text-[#6e6378]">
                  <Icon name="CheckCircle2" size={16} className="text-[#649e7b] shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-[#faf7fd] border border-[#eee4f7] flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#efe4f9] text-[#79569c] flex items-center justify-center shrink-0">
                  <Icon name="Brain" size={18} />
                </div>
                <div>
                  <strong className="text-xs font-semibold text-[#4e3c63] block">
                    Dừng một chút để nhớ lại
                  </strong>
                  <p className="text-xs text-[#7d718b] m-0">
                    Thử một câu hỏi ngắn trước khi chuyển sang bài tiếp theo.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white text-[#6c508a] border-[#d8c5ea] hover:bg-[#f6effc] shrink-0"
                onClick={() => {
                  if (onOpenQuiz) onOpenQuiz();
                  else toast.info("Tính năng Kiểm tra hiểu bài đang chuẩn bị...");
                }}
              >
                Luyện tập
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="transcript" className="m-0 focus-visible:outline-none space-y-3">
            <p className="text-xs text-[#8c8297] mb-2">
              Transcript minh họa · Chọn mốc thời gian để chuyển phần trình chiếu.
            </p>
            <div className="divide-y divide-[#f2edf7]">
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left py-3 px-2 rounded-md hover:bg-[#faf7fd] transition-colors flex items-start gap-4 cursor-pointer"
                  onClick={() => onSeekSlide?.(i)}
                >
                  <span className="text-xs font-mono font-medium text-[#9377b2] shrink-0 mt-0.5">
                    {formatSeconds(i * 30)}
                  </span>
                  <p className="text-xs text-[#6e5f7c] m-0 leading-relaxed">
                    {s}
                  </p>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="m-0 focus-visible:outline-none">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#5a486c] m-0">
                Ghi chú của bạn
              </h3>
              <Badge variant="outline" className="text-[10px] bg-[#eef7ef] text-[#4d8658] border-[#c2e2c8]">
                Tự lưu trên trình duyệt
              </Badge>
            </div>

            <textarea
              className="w-full min-h-[140px] p-3 border border-[#e4ddeb] rounded-lg text-xs text-[#524462] outline-none focus:border-[#9b7fc1] focus:ring-1 focus:ring-[#9b7fc1] mb-2"
              placeholder="Điều tôi muốn ghi nhớ, câu hỏi còn mở, cách áp dụng…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />

            <p className="text-[11px] text-[#9388a1] mb-4">
              Ghi chú cá nhân không xuất hiện trong trang đội ngũ.
            </p>

            <Button
              variant="outline"
              size="sm"
              disabled={!noteText.trim()}
              className="text-xs flex items-center gap-1.5"
              onClick={() => downloadFile(`ghi-chu-${course.id}.txt`, noteText)}
            >
              <Icon name="Download" size={14} />
              <span>Tải ghi chú</span>
            </Button>
          </TabsContent>

          <TabsContent value="resources" className="m-0 focus-visible:outline-none space-y-2">
            {[
              { title: "Tóm tắt bài học", desc: "Tài liệu demo · TXT", idx: 0 },
              { title: "Mẫu thực hành & tiêu chí", desc: "Tài liệu demo · TXT", idx: 1 },
            ].map((res) => (
              <div
                key={res.title}
                className="flex items-center justify-between p-3 border border-[#eee8f5] rounded-lg hover:border-[#dfd3eb] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f0e7f7] text-[#78599a] flex items-center justify-center shrink-0">
                    <Icon name="FileText" size={16} />
                  </div>
                  <div>
                    <strong className="text-xs font-medium text-[#503d66] block">
                      {res.title}
                    </strong>
                    <span className="text-[10px] text-[#9489a2]">
                      {res.desc}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#6e548a] hover:bg-[#f3edf8] flex items-center gap-1"
                  onClick={() =>
                    downloadFile(
                      `${course.id}-${res.idx}.txt`,
                      `${res.title}\n${course.title}\n\n${
                        res.idx ? rubric.join("\n") : slides.join("\n\n")
                      }\n\nNội dung minh họa MatureX LMS.`
                    )
                  }
                >
                  <Icon name="Download" size={14} />
                  <span>Tải xuống</span>
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="discussion" className="m-0 focus-visible:outline-none">
            <div className="py-2">
              <h4 className="text-xs font-semibold text-[#5a486c] mb-1">
                Thảo luận & Trao đổi
              </h4>
              <p className="text-xs text-[#786b88] mb-4 leading-relaxed">
                Cùng trao đổi câu hỏi, bài học thực hành và thảo luận những vấn đề gặp phải cùng đồng nghiệp và giảng viên.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-2 border-[#d5c3e8] text-[#694e87] hover:bg-[#f6f0fc]"
                onClick={() => toast.info("Cộng đồng học tập đang được kết nối.")}
              >
                <Icon name="MessageCircle" size={15} />
                <span>Mở cộng đồng học tập</span>
              </Button>
            </div>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
