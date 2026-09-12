export interface VideoSource {
  type: "direct" | "youtube" | "drive" | "vimeo" | "unknown";
  embedUrl: string;
  thumbnailUrl?: string | null;
}

/**
 * Phân tích và chuyển đổi URL video (R2, Google Drive, YouTube, Vimeo)
 * thành định dạng xem trước phù hợp (direct video hoặc embed iframe).
 */
export function parseVideoUrl(url: string | null | undefined): VideoSource | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. Google Drive
  // Hỗ trợ: drive.google.com/file/d/{id}/view, drive.google.com/open?id={id}, drive.google.com/uc?id={id}
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch?.[1]) {
    const fileId = driveFileMatch[1];
    return {
      type: "drive",
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w320`,
    };
  }

  const driveIdParamMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+)/i);
  if (driveIdParamMatch?.[1]) {
    const fileId = driveIdParamMatch[1];
    return {
      type: "drive",
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w320`,
    };
  }

  // 2. YouTube
  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (youtubeMatch?.[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // 3. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch?.[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // 4. File video trực tiếp (Cloudflare R2, mp4, webm, mov, url bất kỳ)
  return {
    type: "direct",
    embedUrl: trimmed,
  };
}
