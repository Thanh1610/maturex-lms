"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Icon,
} from "@maturex/ui";
import { parseVideoUrl } from "@/lib/video-url-helper";

interface VideoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  videoUrl: string | null;
}

export function VideoPreviewModal({
  open,
  onOpenChange,
  title,
  videoUrl,
}: VideoPreviewModalProps) {
  const parsed = parseVideoUrl(videoUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] p-0 overflow-hidden bg-black border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#1e1728] text-white border-b border-white/10 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <DialogTitle className="text-sm font-semibold text-[#f1ecf7] truncate m-0">
              Xem trước: {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#a99bb8] truncate mt-0.5 m-0">
              {parsed?.type === "drive"
                ? "Nguồn: Google Drive"
                : parsed?.type === "youtube"
                  ? "Nguồn: YouTube"
                  : parsed?.type === "vimeo"
                    ? "Nguồn: Vimeo"
                    : "Nguồn: Video trực tiếp (Cloudflare R2)"}
            </DialogDescription>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {!parsed ? (
            <div className="text-center p-6 text-white/60 text-xs">
              <Icon
                name="AlertCircle"
                size={24}
                className="mx-auto mb-2 text-white/40"
              />
              Không có đường dẫn video hợp lệ.
            </div>
          ) : parsed.type === "direct" ? (
            <video
              key={parsed.embedUrl}
              src={parsed.embedUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Trình duyệt không hỗ trợ thẻ video HTML5.
            </video>
          ) : (
            <iframe
              key={parsed.embedUrl}
              src={parsed.embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
