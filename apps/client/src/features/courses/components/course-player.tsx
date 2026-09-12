"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Icon, toast } from "@maturex/ui";
import { parseVideoUrl } from "@/lib/video-url-helper";
import type { Course } from "../mock-courses";

interface CoursePlayerProps {
  course: Course;
  currentLessonIndex: number;
  slides: string[];
  videoUrl?: string | null;
}

export function CoursePlayer({
  course,
  currentLessonIndex,
  slides,
  videoUrl,
}: CoursePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speed, setSpeed] = useState(1);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Cập nhật khi bài học thay đổi
  useEffect(() => {
    setSeconds(0);
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [currentLessonIndex, videoUrl]);

  // Điều khiển video HTML5 khi có videoUrl
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.play().catch(() => setPlaying(false));
    } else {
      videoRef.current.pause();
    }
  }, [playing]);

  // Điều khiển playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Timer giả lập nếu bài học KHÔNG CÓ video
  useEffect(() => {
    if (videoUrl || !playing) return;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= 120) {
          setPlaying(false);
          return 120;
        }
        return Math.min(120, prev + speed);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, speed, videoUrl]);

  const slideIndex = Math.min(slides.length - 1, Math.floor(seconds / 30));

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      playerRef.current?.requestFullscreen?.().catch(() => {
        toast.error("Trình duyệt không hỗ trợ chế độ toàn màn hình.");
      });
    }
  };

  // Nếu bài học có video URL (Cloudflare R2, Google Drive, YouTube, Vimeo...)
  const parsed = parseVideoUrl(videoUrl);
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
              title={course.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  }

  // Chế độ Slide mô phỏng (khi bài học chưa có video)
  return (
    <div
      ref={playerRef}
      className="lesson-player bg-[#40384f] text-[#ddd1e8] rounded-[13px] overflow-hidden min-h-[370px] min-[1500px]:min-h-[440px] flex flex-col shadow-sm"
    >
      <div className="player-top p-[18px_24px] flex items-center justify-between text-xs tracking-[-0.3px] border-b border-white/10">
        <span className="font-semibold text-white/80">
          mature<span className="text-[#7cbfa2]">x</span> / classroom
        </span>
        <Badge
          variant="outline"
          className="text-[10px] bg-white/5 text-[#c1b0cf] border-white/10 tracking-widest uppercase font-medium px-2 py-0.5"
        >
          BÀI GIẢNG SLIDE
        </Badge>
      </div>

      <div className="slide-content p-7 sm:p-9 flex-1 min-h-[200px] flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#a896b6] font-semibold">
            BÀI {currentLessonIndex + 1} / {course.lessons[currentLessonIndex]}
          </span>
          <h2 className="text-xl sm:text-2xl min-[1500px]:text-3xl font-normal leading-relaxed max-w-[620px] my-4 text-[#eee4f4]">
            {slides[slideIndex] || course.title}
          </h2>
        </div>

        <div className="slide-pagination flex gap-1.5 pt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                slideIndex === i ? "w-6 bg-[#c7b2d8]" : "w-1.5 bg-[#8c7897]/40 hover:bg-[#8c7897]/70"
              }`}
              onClick={() => setSeconds(i * 30)}
              aria-label={`Đến phần ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="player-speaker flex items-center gap-3 px-7 sm:px-9 pb-5">
        <div className="w-8 h-8 rounded-full bg-[#b39abe]/20 text-[#ccb6d9] flex items-center justify-center font-semibold text-xs shrink-0">
          {course.teacher.slice(0, 1)}
        </div>
        <div>
          <strong className="block text-xs font-semibold text-[#d9c5e3]">
            {course.teacher}
          </strong>
          <small className="block text-[11px] text-[#9b8aa8]">
            Học liệu & tài liệu khóa học
          </small>
        </div>
        <Icon
          name={course.icon}
          size={36}
          className="ml-auto text-white/10 pointer-events-none"
        />
      </div>

      <div className="player-controls bg-[#352f41] p-3 sm:px-5">
        <input
          type="range"
          min="0"
          max="120"
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
          aria-label="Vị trí bài giảng"
          className="w-full h-1 mb-2.5 accent-[#b39ac9] cursor-pointer block rounded-lg bg-[#534b62]"
        />

        <div className="flex items-center justify-between text-xs text-[#c9b7d5]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#c9b7d5] hover:text-white hover:bg-white/10 p-0 cursor-pointer"
              onClick={() => {
                if (seconds >= 120) setSeconds(0);
                setPlaying(!playing);
              }}
              aria-label={playing ? "Tạm dừng bài giảng" : "Phát bài giảng"}
            >
              <Icon name={playing ? "Pause" : "Play"} size={18} />
            </Button>
            <span className="font-mono text-[11px]">
              {formatTime(seconds)} / 02:00
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Tốc độ phát"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-[#2a2534] text-[#c9b7d5] text-xs px-2 py-1 rounded border border-white/10 outline-none cursor-pointer"
            >
              {[1, 1.5, 2].map((val) => (
                <option key={val} value={val} className="bg-[#2a2534]">
                  {val}×
                </option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#c9b7d5] hover:text-white hover:bg-white/10 p-0 cursor-pointer"
              onClick={handleToggleFullscreen}
              aria-label="Toàn màn hình"
            >
              <Icon name="Maximize2" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
