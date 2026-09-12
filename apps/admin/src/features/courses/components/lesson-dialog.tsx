"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
  Label,
} from "@maturex/ui";
import { useEffect, useRef, useState } from "react";
import {
  getLessonUploadUrlAction,
  getSlideUploadUrlAction,
} from "../actions/lesson-actions";
import type { LessonItem } from "../services/lesson-service";

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: LessonItem | null;
  onSave: (data: {
    title: string;
    content: string;
    videoUrl?: string | null;
    slideUrl?: string | null;
  }) => Promise<void>;
}

export function LessonDialog({
  open,
  onOpenChange,
  lesson,
  onSave,
}: LessonDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [slideUrl, setSlideUrl] = useState("");
  const [lessonType, setLessonType] = useState<"video" | "slide">("video");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Slide Upload state (.pptx, .pdf)
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);
  const [uploadSlideProgress, setUploadSlideProgress] = useState(0);
  const slideFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(lesson?.title || "");
      setContent(lesson?.content || "");
      const currentVideo = lesson?.videoUrl || "";
      const currentSlide = lesson?.slideUrl || "";
      setVideoUrl(currentVideo);
      setSlideUrl(currentSlide);

      // Tự động chọn tab: nếu có slide hoặc có content mà không có video -> tab slide
      if (
        !currentVideo &&
        (currentSlide || (lesson?.content || "").trim().length > 0)
      ) {
        setLessonType("slide");
      } else {
        setLessonType("video");
      }
      setError(null);
      setIsUploading(false);
      setUploadProgress(0);
      setIsUploadingSlide(false);
      setUploadSlideProgress(0);
    }
  }, [open, lesson]);

  // Xử lý upload trực tiếp video qua Presigned URL cấp bởi Server Action
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // 1. Gọi Server Action để xác thực Admin và cấp presigned PUT URL
      const res = await getLessonUploadUrlAction({
        fileName: file.name,
        contentType: file.type || "video/mp4",
        fileSize: file.size,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || "Không thể khởi tạo phiên tải lên.");
      }

      const { uploadUrl, publicUrl } = res.data;

      // 2. Upload trực tiếp file lên Cloudflare R2 bằng XMLHttpRequest để theo dõi % tiến trình
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Tải lên thất bại với mã lỗi HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(
            new Error(
              "Lỗi kết nối mạng khi tải lên. Vui lòng kiểm tra lại đường truyền mạng.",
            ),
          );
        };

        xhr.send(file);
      });

      // 3. Tải lên thành công, cập nhật videoUrl
      setVideoUrl(publicUrl);
    } catch (err: unknown) {
      console.error("[handleFileUpload Error]:", err);
      const msg =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải video.";
      setError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Xử lý upload trực tiếp file slide (.pptx, .pdf) lên R2 thư mục lessions/slides/
  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingSlide(true);
      setUploadSlideProgress(0);
      setError(null);

      const res = await getSlideUploadUrlAction({
        fileName: file.name,
        contentType:
          file.type ||
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        fileSize: file.size,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || "Không thể khởi tạo phiên tải lên slide.");
      }

      const { uploadUrl, publicUrl } = res.data;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader(
          "Content-Type",
          file.type || "application/octet-stream",
        );

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setUploadSlideProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(
              new Error(`Tải lên slide thất bại với mã HTTP ${xhr.status}`),
            );
          }
        };

        xhr.onerror = () => {
          reject(
            new Error("Lỗi kết nối mạng khi tải slide. Vui lòng thử lại."),
          );
        };

        xhr.send(file);
      });

      setSlideUrl(publicUrl);
    } catch (err: unknown) {
      console.error("[handleSlideUpload Error]:", err);
      const msg =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải slide.";
      setError(msg);
    } finally {
      setIsUploadingSlide(false);
      if (slideFileInputRef.current) {
        slideFileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài học");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        title: title.trim(),
        content: content.trim(),
        videoUrl: videoUrl.trim() || null,
        slideUrl: slideUrl.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("[LessonDialog] Submit error:", err);
      setError("Đã xảy ra lỗi khi lưu bài học");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isUploading) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[560px]"
        onPointerDownOutside={(e) => {
          if (isUploading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isUploading) e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {lesson ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
            </DialogTitle>
            <DialogDescription>
              {lesson
                ? "Cập nhật tiêu đề, video bài giảng và nội dung bài học."
                : "Điền tiêu đề, tải lên tệp video hoặc dán đường dẫn bài học."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2.5">
                {error}
              </div>
            )}

            {/* Tiêu đề bài học */}
            <div className="space-y-1.5">
              <Label
                htmlFor="lesson-title"
                className="text-xs font-medium text-[#483959]"
              >
                Tiêu đề bài học <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lesson-title"
                placeholder="VD: Giới thiệu tổng quan & Mục tiêu khóa học"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs"
                autoFocus
              />
            </div>

            {/* Định dạng bài học: Chọn Video hoặc Slide / Tài liệu */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#f0eaf7] rounded-lg border border-[#e5dcee]">
                <button
                  type="button"
                  onClick={() => setLessonType("video")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    lessonType === "video"
                      ? "bg-white text-[#674b88] shadow-sm font-semibold"
                      : "text-[#837699] hover:text-[#674b88] hover:bg-white/50"
                  }`}
                >
                  <Icon name="Video" size={14} />
                  <span>Video bài giảng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLessonType("slide")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    lessonType === "slide"
                      ? "bg-white text-[#674b88] shadow-sm font-semibold"
                      : "text-[#837699] hover:text-[#674b88] hover:bg-white/50"
                  }`}
                >
                  <Icon name="FileText" size={14} />
                  <span>Slide / Tài liệu</span>
                </button>
              </div>

              {/* Tab 1: Video bài học */}
              {lessonType === "video" && (
                <div className="space-y-3">
                  <div className="space-y-2 p-3.5 bg-[#faf9fc] rounded-lg border border-[#ebe5f2]">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="lesson-video"
                        className="text-xs font-medium text-[#483959] flex items-center gap-1.5"
                      >
                        <Icon
                          name="Video"
                          size={14}
                          className="text-[#71548e]"
                        />
                        <span>Nguồn video</span>
                      </Label>
                      {videoUrl && (
                        <button
                          type="button"
                          onClick={() => setVideoUrl("")}
                          className="text-[11px] text-red-600 hover:underline cursor-pointer border-0 bg-transparent p-0 font-medium"
                        >
                          Xóa video
                        </button>
                      )}
                    </div>

                    {/* Upload Button & File Input */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs bg-white border-[#d8cee5] hover:bg-[#f3edf9] text-[#553c70] flex items-center gap-1.5"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Icon name="Upload" size={13} />
                        <span>
                          {isUploading
                            ? "Đang tải video lên..."
                            : "Tải lên tệp video"}
                        </span>
                      </Button>

                      <span className="text-[11px] text-[#9b8fa9]">
                        hoặc nhập link video
                      </span>
                    </div>

                    {/* Progress Bar khi Upload */}
                    {isUploading && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-[#71548e]">
                          <span>Tiến độ tải lên</span>
                          <span className="font-semibold">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#e8e2f0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#71548e] transition-all duration-150 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* URL Input */}
                    <Input
                      id="lesson-video"
                      placeholder="Dán URL video (Cloudflare R2, YouTube, Vimeo, Google Drive...)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={isUploading}
                      className="h-8 text-xs bg-white"
                    />

                    {videoUrl && (
                      <p className="text-[10px] text-[#558261] flex items-center gap-1 mt-1 m-0">
                        <Icon name="CheckCircle2" size={12} />
                        <span>Đã gắn video cho bài học này</span>
                      </p>
                    )}
                  </div>

                  {/* Mô tả / Ghi chú phụ cho bài video (tùy chọn) */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="video-notes"
                      className="text-xs font-medium text-[#483959]"
                    >
                      Mô tả bài học / Tóm tắt đi kèm video (Tùy chọn)
                    </Label>
                    <textarea
                      id="video-notes"
                      rows={3}
                      placeholder="Nhập mô tả hoặc tóm tắt các điểm chính của bài học..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full rounded-md border border-[#e5dced] bg-white px-3 py-2 text-xs text-[#2d223c] placeholder:text-[#9c93a8] focus:outline-none focus:ring-1 focus:ring-[#71548e] transition-colors resize-y leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Slide / Trình chiếu / Tài liệu */}
              {lessonType === "slide" && (
                <div className="space-y-3">
                  {/* Upload File Slide (PowerPoint .pptx hoặc PDF) */}
                  <div className="space-y-2 p-3.5 bg-[#faf9fc] rounded-lg border border-[#ebe5f2]">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="lesson-slide"
                        className="text-xs font-medium text-[#483959] flex items-center gap-1.5"
                      >
                        <Icon
                          name="FileText"
                          size={14}
                          className="text-[#71548e]"
                        />
                        <span>Tệp trình chiếu (PowerPoint / PDF)</span>
                      </Label>
                      {slideUrl && (
                        <button
                          type="button"
                          onClick={() => setSlideUrl("")}
                          className="text-[11px] text-red-600 hover:underline cursor-pointer border-0 bg-transparent p-0 font-medium"
                        >
                          Xóa tệp slide
                        </button>
                      )}
                    </div>

                    {/* Upload Button & File Input */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        ref={slideFileInputRef}
                        type="file"
                        accept=".pptx,.ppt,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        className="hidden"
                        onChange={handleSlideUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs bg-white border-[#d8cee5] hover:bg-[#f3edf9] text-[#553c70] flex items-center gap-1.5"
                        disabled={isUploadingSlide}
                        onClick={() => slideFileInputRef.current?.click()}
                      >
                        <Icon name="Upload" size={13} />
                        <span>
                          {isUploadingSlide
                            ? "Đang tải slide lên..."
                            : "Tải lên tệp .pptx hoặc .pdf"}
                        </span>
                      </Button>

                      <span className="text-[11px] text-[#9b8fa9]">
                        hoặc nhập link slide R2
                      </span>
                    </div>

                    {/* Progress Bar khi Upload Slide */}
                    {isUploadingSlide && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-[#71548e]">
                          <span>Tiến độ tải lên</span>
                          <span className="font-semibold">
                            {uploadSlideProgress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#e8e2f0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#71548e] transition-all duration-150 rounded-full"
                            style={{ width: `${uploadSlideProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Slide URL Input */}
                    <Input
                      id="lesson-slide"
                      placeholder="Dán URL slide Cloudflare R2 (maturex-lms/lessions/slides/...)"
                      value={slideUrl}
                      onChange={(e) => setSlideUrl(e.target.value)}
                      disabled={isUploadingSlide}
                      className="h-8 text-xs bg-white"
                    />

                    {slideUrl && (
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-[10px] text-[#558261] flex items-center gap-1 m-0">
                          <Icon name="CheckCircle2" size={12} />
                          <span>
                            Đã gắn slide (
                            {slideUrl.endsWith(".pdf") ? "PDF" : "PowerPoint"})
                          </span>
                        </p>
                        <a
                          href={slideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#71548e] hover:underline flex items-center gap-1"
                        >
                          <span>Mở thử tệp</span>
                          <Icon name="ExternalLink" size={10} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Soạn thảo mô tả / nội dung kèm theo */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="slide-content"
                      className="text-xs font-medium text-[#483959]"
                    >
                      Mô tả bài học / Tóm tắt nội dung slide bài học
                    </Label>
                    <textarea
                      id="slide-content"
                      rows={5}
                      placeholder="Nhập mô tả, mục tiêu hoặc tóm tắt bài học đi kèm slide..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full rounded-md border border-[#e5dced] bg-white px-3 py-2 text-xs text-[#2d223c] placeholder:text-[#9c93a8] focus:outline-none focus:ring-1 focus:ring-[#71548e] transition-colors resize-y leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
              disabled={isSubmitting || isUploading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="bg-[#71548e] hover:bg-[#5f4479] text-white text-xs h-8"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? "Đang lưu..."
                : lesson
                  ? "Lưu thay đổi"
                  : "Tạo bài học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
