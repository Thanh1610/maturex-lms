"use client";

import { Empty, Icon } from "@maturex/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseVideoUrl } from "@/lib/video-url-helper";

interface CoursePlayerProps {
  courseTitle: string;
  lessonTitle: string;
  videoUrl?: string | null;
  slideUrl?: string | null;
  content?: string;
}

export function CoursePlayer({
  courseTitle,
  lessonTitle,
  videoUrl,
  slideUrl,
  content = "",
}: CoursePlayerProps) {
  const [, setPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerEngine, setViewerEngine] = useState<"office" | "google">(
    "office",
  );
  const playerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Phân tách slide từ nội dung: hỗ trợ dấu phân đoạn "---" hoặc các đoạn văn 2 dòng trống
  const slides = useMemo(() => {
    if (!content.trim()) return [];
    if (content.includes("---")) {
      return content
        .split("---")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // Nếu không có "---", tách theo đoạn văn bản
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return paragraphs.length > 0 ? paragraphs : [content.trim()];
  }, [content]);

  // Reset slide index khi chuyển bài học
  useEffect(() => {
    setCurrentSlide(0);
  }, [lessonTitle, videoUrl, slideUrl]);

  const parsed = parseVideoUrl(videoUrl);

  // Toggle fullscreen cho slide
  const handleToggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current
        .requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  // Lắng nghe sự kiện fullscreenchange
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // 1. Nếu có video -> Ưu tiên phát video
  if (parsed) {
    return (
      <div
        ref={playerRef}
        className="lesson-player bg-black text-white rounded-[13px] overflow-hidden flex flex-col shadow-sm relative group"
      >
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {parsed.type === "direct" ? (
            <video
              key={parsed.embedUrl}
              ref={videoRef}
              src={parsed.embedUrl}
              className="w-full h-full object-contain"
              controls
              playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            >
              Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
            </video>
          ) : (
            <iframe
              key={parsed.embedUrl}
              src={parsed.embedUrl}
              title={`${courseTitle} - ${lessonTitle}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  }

  // 2. Nếu có tệp slide (PowerPoint .pptx hoặc .pdf) -> Nhúng Viewer trực tiếp với cơ chế Fallback
  if (slideUrl) {
    const isPdf = slideUrl.toLowerCase().includes(".pdf");
    const isLocal =
      typeof window !== "undefined" &&
      (slideUrl.includes("localhost") ||
        slideUrl.includes("127.0.0.1") ||
        slideUrl.startsWith("/"));

    const embedSrc = isPdf
      ? slideUrl
      : viewerEngine === "office"
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(slideUrl)}`
        : `https://docs.google.com/viewer?url=${encodeURIComponent(slideUrl)}&embedded=true`;

    return (
      <div
        ref={playerRef}
        className="lesson-player bg-[#1f1a26] text-white rounded-[13px] overflow-hidden flex flex-col shadow-sm relative border border-[#3e344a]"
      >
        {/* Slide Bar Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d2538] border-b border-white/10 text-xs gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-[#71548e] text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
              {isPdf ? "PDF SLIDE" : "POWERPOINT"}
            </span>
            <span className="text-white/80 font-medium truncate max-w-[160px] sm:max-w-xs">
              {lessonTitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Nếu không phải PDF và không phải Localhost: cho phép chuyển đổi giữa Microsoft Viewer & Google Viewer */}
            {!isPdf && !isLocal && (
              <div className="flex items-center bg-white/5 rounded p-0.5 border border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setViewerEngine("office")}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer border-0 ${
                    viewerEngine === "office"
                      ? "bg-[#71548e] text-white font-medium"
                      : "text-white/70 hover:text-white bg-transparent"
                  }`}
                  title="Xem qua Microsoft Office Online"
                >
                  Office
                </button>
                <button
                  type="button"
                  onClick={() => setViewerEngine("google")}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer border-0 ${
                    viewerEngine === "google"
                      ? "bg-[#71548e] text-white font-medium"
                      : "text-white/70 hover:text-white bg-transparent"
                  }`}
                  title="Xem qua Google Docs Viewer"
                >
                  Google
                </button>
              </div>
            )}

            <a
              href={slideUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-[#c9b7de] hover:text-white px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              title="Tải tệp slide về máy"
            >
              <Icon name="Download" size={13} />
              <span className="hidden sm:inline">Tải về</span>
            </a>
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1 text-[11px] text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer"
              title={isFullscreen ? "Thu nhỏ màn hình" : "Toàn màn hình"}
            >
              <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={14} />
            </button>
          </div>
        </div>

        {/* Embedded Iframe Viewer hoặc Localhost Warning Banner */}
        <div className="relative aspect-video w-full bg-[#17131d]">
          {!isPdf && isLocal ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#71548e]/20 text-[#c8b3dc] flex items-center justify-center mb-3">
                <Icon name="FileText" size={24} />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Tệp trình chiếu PowerPoint (Local URL)
              </h4>
              <p className="text-xs text-white/60 max-w-md mb-4 leading-relaxed">
                Máy chủ Microsoft/Google Online Viewer không thể truy cập trực
                tiếp các địa chỉ nội bộ (localhost hoặc private storage). Bạn có
                thể tải file hoặc mở trực tiếp trên thiết bị:
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={slideUrl}
                  download
                  className="flex items-center gap-1.5 text-xs bg-[#71548e] hover:bg-[#8363a4] text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Icon name="Download" size={14} />
                  Tải slide (.pptx)
                </a>
                <a
                  href={slideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 text-white/90 px-4 py-2 rounded-lg transition-colors"
                >
                  <Icon name="ExternalLink" size={14} />
                  Mở liên kết
                </a>
              </div>
            </div>
          ) : (
            <iframe
              key={embedSrc}
              src={embedSrc}
              title={`Slide bài học: ${lessonTitle}`}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  }

  // 3. Nếu không có video nhưng có nội dung slide -> Hiển thị trình chiếu Slide tương tác xịn sò
  if (slides.length > 0) {
    const totalSlides = slides.length;
    const activeText = slides[currentSlide] || "";

    return (
      <div
        ref={playerRef}
        className="lesson-player bg-[#2d2538] text-white rounded-[13px] overflow-hidden aspect-video flex flex-col justify-between p-6 sm:p-8 shadow-sm relative select-none border border-[#483d56]"
      >
        {/* Slide Header */}
        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#71548e] text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
              SLIDE
            </span>
            <span className="text-white/70 font-medium truncate max-w-[280px] sm:max-w-md">
              {lessonTitle}
            </span>
          </div>
          <span className="text-white/60 font-mono text-xs">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        {/* Slide Main Content */}
        <div className="flex-1 flex items-center justify-center my-4 overflow-y-auto px-2">
          <div className="max-w-xl text-center">
            <p className="text-base sm:text-lg min-[1500px]:text-xl text-[#f3edfa] leading-relaxed whitespace-pre-line m-0">
              {activeText}
            </p>
          </div>
        </div>

        {/* Slide Navigation Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            type="button"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1 text-xs text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors px-3 py-1.5 rounded-md hover:bg-white/10 cursor-pointer border-0 bg-transparent"
          >
            <Icon name="ChevronLeft" size={16} />
            <span className="hidden sm:inline">Trang trước</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer border-0 p-0 ${
                  currentSlide === i
                    ? "w-5 bg-[#c8b3dc]"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={currentSlide === totalSlides - 1}
            onClick={() =>
              setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))
            }
            className="flex items-center gap-1 text-xs text-white/80 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors px-3 py-1.5 rounded-md hover:bg-white/10 cursor-pointer border-0 bg-transparent"
          >
            <span className="hidden sm:inline">Trang tiếp</span>
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 3. Nếu không có cả video lẫn slide: Hiển thị giao diện "Chưa có dữ liệu" sạch đẹp
  return (
    <div className="lesson-player bg-[#faf8fc] border border-[#e8dfef] rounded-[13px] overflow-hidden aspect-video flex items-center justify-center p-6 shadow-sm">
      <Empty
        title="Chưa có học liệu cho bài học này"
        description={`Bài học "${lessonTitle}" hiện chưa được tải lên video hoặc nội dung slide.`}
      />
    </div>
  );
}
