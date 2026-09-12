"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Icon,
} from "@maturex/ui";
import type { LessonItem } from "../services/lesson-service";
import { getLessonUploadUrlAction } from "../actions/lesson-actions";

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: LessonItem | null;
  onSave: (data: { title: string; content: string; videoUrl?: string | null }) => Promise<void>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(lesson?.title || "");
      setContent(lesson?.content || "");
      setVideoUrl(lesson?.videoUrl || "");
      setError(null);
      setIsUploading(false);
      setUploadProgress(0);
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
          reject(new Error("Lỗi kết nối mạng khi tải lên. Vui lòng kiểm tra lại đường truyền mạng."));
        };

        xhr.send(file);
      });

      // 3. Tải lên thành công, cập nhật videoUrl
      setVideoUrl(publicUrl);
    } catch (err: unknown) {
      console.error("[handleFileUpload Error]:", err);
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải video.";
      setError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
              <Label htmlFor="lesson-title" className="text-xs font-medium text-[#483959]">
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

            {/* Video bài học */}
            <div className="space-y-2 p-3 bg-[#faf9fc] rounded-lg border border-[#ebe5f2]">
              <div className="flex items-center justify-between">
                <Label htmlFor="lesson-video" className="text-xs font-medium text-[#483959] flex items-center gap-1.5">
                  <Icon name="Video" size={14} className="text-[#71548e]" />
                  <span>Video bài giảng</span>
                </Label>
                {videoUrl && (
                  <button
                    type="button"
                    onClick={() => setVideoUrl("")}
                    className="text-[11px] text-red-600 hover:underline cursor-pointer border-0 bg-transparent p-0"
                  >
                    Xóa video
                  </button>
                )}
              </div>

              {/* Upload Button & File Input */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading || isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSubmitting}
                  className="text-xs h-8 flex items-center gap-1.5 bg-white border-[#d8cde6] hover:bg-[#f6f2fa]"
                >
                  <Icon name="Upload" size={13} />
                  <span>{isUploading ? `Đang tải lên (${uploadProgress}%)...` : "Tải video lên"}</span>
                </Button>
                <span className="text-[11px] text-[#8e829d]">hoặc dán đường dẫn trực tiếp:</span>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="w-full bg-[#e8e0f0] rounded-full h-1.5 overflow-hidden my-1">
                  <div
                    className="bg-[#71548e] h-1.5 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* URL Input */}
              <Input
                id="lesson-video"
                placeholder="Dán đường dẫn video (.mp4, YouTube, Vimeo...)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="h-8 text-xs bg-white"
              />

              {videoUrl && (
                <p className="text-[10px] text-[#558261] flex items-center gap-1 mt-1 m-0">
                  <Icon name="CheckCircle2" size={12} />
                  <span>Đã gắn video cho bài học này</span>
                </p>
              )}
            </div>

            {/* Nội dung bài học */}
            <div className="space-y-1.5">
              <Label htmlFor="lesson-content" className="text-xs font-medium text-[#483959]">
                Nội dung bài giảng / Slide ghi chú (Mỗi dòng là 1 ý slide)
              </Label>
              <textarea
                id="lesson-content"
                rows={5}
                placeholder="Nhập nội dung bài học tại đây (hỗ trợ văn bản hoặc các gạch đầu dòng tương ứng với các slide trong trình phát)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-md border border-[#e5dced] bg-white px-3 py-2 text-xs text-[#2d223c] placeholder:text-[#9c93a8] focus:outline-none focus:ring-1 focus:ring-[#71548e] transition-colors resize-y leading-relaxed"
              />
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
              {isSubmitting ? "Đang lưu..." : lesson ? "Lưu thay đổi" : "Tạo bài học"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
