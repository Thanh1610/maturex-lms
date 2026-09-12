"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Card, Icon, SimpleTooltip } from "@maturex/ui";
import { parseVideoUrl } from "@/lib/video-url-helper";
import type { LessonItem } from "../services/lesson-service";

interface SortableLessonItemProps {
  lesson: LessonItem;
  index: number;
  isDeleting: boolean;
  onEdit: (lesson: LessonItem) => void;
  onDelete: (id: string, title: string) => void;
  onPreviewVideo: (lesson: LessonItem) => void;
}

export function SortableLessonItem({
  lesson,
  index,
  isDeleting,
  onEdit,
  onDelete,
  onPreviewVideo,
}: SortableLessonItemProps) {
  const [imgError, setImgError] = useState(false);
  const parsed = parseVideoUrl(lesson.videoUrl);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`p-3 bg-white border flex items-center justify-between gap-3 transition-shadow ${
          isDragging
            ? "border-[#71548e] shadow-lg opacity-85 ring-2 ring-[#71548e]/20"
            : "border-[#eae5f2] hover:border-[#cfc2de]"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Drag Handle */}
          <SimpleTooltip content="Nhấn giữ và kéo để đổi thứ tự" side="top">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="p-1 -ml-1 text-[#a397b2] hover:text-[#71548e] hover:bg-[#f6f2fa] rounded cursor-grab active:cursor-grabbing focus:outline-none transition-colors shrink-0"
              aria-label="Kéo để đổi thứ tự bài học"
            >
              <Icon name="GripVertical" size={16} />
            </button>
          </SimpleTooltip>

          {/* Position Badge */}
          <span className="w-7 h-7 rounded-lg bg-[#f3edf9] text-[#71548e] text-xs font-semibold flex items-center justify-center shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Video Thumbnail (Nếu có video) - Bấm vào để mở Preview modal */}
          {parsed && (
            <SimpleTooltip content="Bấm để xem trước video" side="top">
              <div
                onClick={() => onPreviewVideo(lesson)}
                className="relative w-28 h-16 sm:w-32 sm:h-18 rounded-lg overflow-hidden bg-[#1f172b] border border-[#e1d9ea] shrink-0 cursor-pointer group/thumb hover:ring-2 hover:ring-[#71548e] shadow-sm transition-all"
              >
              {parsed.type === "drive" ? (
                // Google Drive: Dùng thumbnail ảnh của Drive
                !imgError && parsed.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={parsed.thumbnailUrl}
                    alt={lesson.title}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.warn("[Drive Thumbnail Error]:", parsed.thumbnailUrl, e);
                      setImgError(true);
                    }}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#4285F4]/10 text-[#4285F4]">
                    <Icon name="Video" size={20} />
                  </div>
                )
              ) : parsed.type === "direct" ? (
                // Cloudflare R2 / Direct Video: Render 1 frame đầu tiên làm thumbnail
                <video
                  src={parsed.thumbnailUrl || parsed.embedUrl}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover pointer-events-none group-hover/thumb:scale-105 transition-transform duration-300"
                />
              ) : parsed.thumbnailUrl && !imgError ? (
                // YouTube / Other
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={parsed.thumbnailUrl}
                  alt={lesson.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#71548e]/10 text-[#71548e]">
                  <Icon name="Video" size={20} />
                </div>
              )}

              {/* Overlay Play Icon mờ đè lên thumbnail */}
              <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/15 flex items-center justify-center transition-colors">
                <div className="w-7 h-7 rounded-full bg-black/65 group-hover/thumb:bg-[#71548e] text-white flex items-center justify-center shadow transition-all">
                  <Icon name="Play" size={13} className="fill-current ml-0.5" />
                </div>
              </div>
            </div>
            </SimpleTooltip>
          )}

          {/* Title & Preview */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-medium text-[#352a44] truncate m-0">
                {lesson.title}
              </h4>

              {/* Tag phân loại nguồn video nhỏ */}
              {parsed && (
                <span className="text-[10px] text-[#6b5c7d] font-normal shrink-0">
                  ({parsed.type === "drive" ? "Google Drive" : "R2 Video"})
                </span>
              )}
            </div>
            {lesson.content && (
              <p className="text-[11px] text-[#8e829d] truncate mt-0.5 m-0 max-w-xl">
                {lesson.content.split("\n")[0]}
              </p>
            )}
          </div>
        </div>

        {/* Actions (Edit & Delete) */}
        <div className="flex items-center gap-1 shrink-0">
          <SimpleTooltip content="Chỉnh sửa bài học" side="top">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#736885] hover:text-[#71548e]"
              onClick={() => onEdit(lesson)}
              aria-label="Chỉnh sửa bài học"
            >
              <Icon name="Pencil" size={14} />
            </Button>
          </SimpleTooltip>

          <SimpleTooltip content="Xóa bài học" side="top">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#ab5454] hover:text-red-700 hover:bg-red-50"
              disabled={isDeleting}
              onClick={() => onDelete(lesson.id, lesson.title)}
              aria-label="Xóa bài học"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </SimpleTooltip>
        </div>
      </Card>
    </div>
  );
}
