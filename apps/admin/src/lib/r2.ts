import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

/**
 * Khởi tạo client S3 kết nối tới Cloudflare R2
 */
export function getR2Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "Thiếu cấu hình R2 (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY). Vui lòng kiểm tra file .env!"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Sinh Presigned URL để trình duyệt trực tiếp upload file lên Cloudflare R2
 */
export async function generateR2UploadUrl(params: {
  fileName: string;
  contentType: string;
  folder?: string;
  expiresInSeconds?: number;
}): Promise<PresignedUrlResult> {
  const { fileName, contentType, folder = "lessions/videos", expiresInSeconds = 900 } = params;

  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME chưa được cấu hình trong .env!");
  }

  // Tạo key duy nhất: folder/timestamp-random-slug.ext
  const ext = fileName.includes(".") ? fileName.split(".").pop() : "mp4";
  const cleanBase = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 40);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `${folder}/${Date.now()}-${cleanBase || "video"}-${randomSuffix}.${ext}`;

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  // URL công khai để học viên xem video
  const publicUrl = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${key}`
    : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

  return {
    uploadUrl,
    publicUrl,
    key,
  };
}

/**
 * Trích xuất S3 Key từ publicUrl nếu file thuộc bucket R2
 */
export function extractR2KeyFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // 1. Kiểm tra nếu url bắt đầu bằng R2_PUBLIC_URL
    if (R2_PUBLIC_URL) {
      const publicParsed = new URL(R2_PUBLIC_URL);
      if (parsed.origin === publicParsed.origin) {
        const pathname = parsed.pathname.replace(/^\/+/, "");
        return pathname || null;
      }
    }

    // 2. Kiểm tra nếu url trỏ tới endpoint direct cloudflarestorage.com
    if (parsed.hostname.includes("r2.cloudflarestorage.com") || parsed.hostname.includes(".r2.dev")) {
      const pathname = parsed.pathname.replace(/^\/+/, "");
      return pathname || null;
    }

    // 3. Nếu là đường dẫn tương đối có prefix lessions/videos
    if (url.startsWith("lessions/videos/")) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Xóa một file khỏi Cloudflare R2 dựa vào key hoặc publicUrl
 */
export async function deleteR2File(keyOrUrl: string): Promise<boolean> {
  if (!R2_BUCKET_NAME || !keyOrUrl) return false;

  const key = keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")
    ? extractR2KeyFromUrl(keyOrUrl)
    : keyOrUrl;

  if (!key) return false;

  try {
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error("[deleteR2File] Error deleting key from R2:", key, error);
    return false;
  }
}
