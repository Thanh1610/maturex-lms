"use client";

import {
  Badge,
  Button,
  Card,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@maturex/ui";
import { useState } from "react";

interface CourseTabsContentProps {
  courseDescription: string;
  lessonContent?: string;
  lessonTitle: string;
}

export function CourseTabsContent({
  courseDescription,
  lessonContent,
  lessonTitle,
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

  return (
    <div className="course-tabs-wrapper mt-5">
      <Tabs defaultValue="course-info" className="w-full">
        <TabsList className="bg-[#f2ecf8] p-1 rounded-lg border border-[#e5dced] flex gap-1 h-auto flex-wrap">
          <TabsTrigger
            value="course-info"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Tổng quan khóa học
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Mô tả bài học
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Ghi chú
          </TabsTrigger>
          <TabsTrigger
            value="discussion"
            className="text-xs py-1.5 px-3 data-[state=active]:bg-white data-[state=active]:text-[#624781] data-[state=active]:shadow-sm rounded-md"
          >
            Thảo luận
          </TabsTrigger>
        </TabsList>

        <Card className="mt-3 p-5 sm:p-6 bg-white border border-[#e9eaf0] rounded-xl shadow-none min-h-[200px]">
          {/* Tổng quan khóa học */}
          <TabsContent
            value="course-info"
            className="m-0 focus-visible:outline-none"
          >
            <h3 className="text-sm font-semibold text-[#5a486c] mb-2">
              Tổng quan khóa học
            </h3>
            <p className="text-xs sm:text-sm text-[#736582] leading-relaxed m-0 whitespace-pre-line">
              {courseDescription}
            </p>
          </TabsContent>

          {/* Mô tả bài học */}
          <TabsContent
            value="overview"
            className="m-0 focus-visible:outline-none"
          >
            <h3 className="text-sm font-semibold text-[#5a486c] mb-3">
              {lessonTitle}
            </h3>
            {lessonContent ? (
              <div className="text-xs sm:text-sm text-[#5f546c] leading-relaxed whitespace-pre-line">
                {lessonContent}
              </div>
            ) : (
              <p className="text-xs text-[#8c8297] italic m-0">
                Bài học này hiện chưa có mô tả văn bản bổ sung.
              </p>
            )}
          </TabsContent>

          <TabsContent value="notes" className="m-0 focus-visible:outline-none">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#5a486c] m-0">
                Ghi chú của bạn
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] bg-[#eef7ef] text-[#4d8658] border-[#c2e2c8]"
              >
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
              onClick={() =>
                downloadFile(`ghi-chu-${lessonTitle}.txt`, noteText)
              }
            >
              <Icon name="Download" size={14} />
              <span>Tải ghi chú</span>
            </Button>
          </TabsContent>

          <TabsContent
            value="discussion"
            className="m-0 focus-visible:outline-none"
          >
            <div className="py-2">
              <h4 className="text-xs font-semibold text-[#5a486c] mb-1">
                Thảo luận & Trao đổi
              </h4>
              <p className="text-xs text-[#786b88] mb-4 leading-relaxed">
                Cùng trao đổi câu hỏi, bài học thực hành và thảo luận những vấn
                đề gặp phải cùng đồng nghiệp và giảng viên.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-2 border-[#d5c3e8] text-[#694e87] hover:bg-[#f6f0fc]"
                onClick={() =>
                  toast.info("Cộng đồng học tập đang được kết nối.")
                }
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
