"use server";

import { prisma } from "@maturex/database";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/features/auth/services/jwt-service";
import { generateR2UploadUrl, type PresignedUrlResult } from "@/lib/r2";
import {
  createLesson,
  deleteLesson,
  type LessonItem,
  reorderLessons,
  updateLesson,
} from "../services/lesson-service";

const ACCESS_COOKIE_NAME = "mx_access_token";
// Giới hạn dung lượng tối đa cho file video: 1GB (1024 * 1024 * 1024 bytes)
const MAX_VIDEO_FILE_SIZE_BYTES = 1024 * 1024 * 1024;
// Giới hạn dung lượng tối đa cho file slide (PDF/PPTX): 100MB (100 * 1024 * 1024 bytes)
const MAX_SLIDE_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Xác thực quyền Admin và cấp Presigned URL để upload video lên Cloudflare R2.
 * - Kiểm tra session cookie mx_access_token
 * - Ràng buộc định dạng video
 * - Giới hạn kích thước file tối đa (1GB)
 */
export async function getLessonUploadUrlAction(input: {
  fileName: string;
  contentType: string;
  fileSize?: number;
}): Promise<ActionResult<PresignedUrlResult>> {
  try {
    // 1. Kiểm tra xác thực Admin
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    let isAdmin = false;

    if (token) {
      const payload = await verifyAccessToken(token);
      if (
        payload?.sub &&
        (!payload.role ||
          ["admin", "superadmin", "instructor", "tutor"].includes(payload.role))
      ) {
        isAdmin = true;
      }
    }

    // Fallback cho môi trường local dev nếu cookie token chưa set hoặc expired
    if (!isAdmin && process.env.NODE_ENV !== "production") {
      const adminUser = await prisma.user.findFirst({
        where: { role: "admin", active: true },
        select: { id: true },
      });
      if (adminUser) {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return {
        success: false,
        error: "Bạn chưa đăng nhập hoặc không có quyền tải lên video.",
      };
    }

    // 2. Validate định dạng video
    const { fileName, contentType, fileSize } = input;
    const allowedPrefixes = [
      "video/",
      "application/x-mpegURL",
      "application/vnd.apple.mpegurl",
    ];
    const isVideo = allowedPrefixes.some((p) => contentType?.startsWith(p));
    const isVideoExt = fileName?.match(/\.(mp4|webm|mov|mkv|m4v)$/i);

    if (!isVideo && !isVideoExt) {
      return {
        success: false,
        error:
          "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các file video (.mp4, .webm, .mov).",
      };
    }

    // 3. Ràng buộc dung lượng tối đa (1GB)
    if (fileSize && fileSize > MAX_VIDEO_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: "Kích thước tệp vượt quá giới hạn tối đa cho phép (1GB).",
      };
    }

    // 4. Khởi tạo Presigned URL upload trực tiếp vào lessions/videos
    const result = await generateR2UploadUrl({
      fileName: fileName || "lesson-video.mp4",
      contentType: contentType || "video/mp4",
      folder: "lessions/videos",
      expiresInSeconds: 900, // 15 phút
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[getLessonUploadUrlAction] Error:", error);
    const msg =
      error instanceof Error ? error.message : "Không thể tạo URL tải lên.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Cấp Presigned URL để upload file slide (.pptx, .pdf) lên Cloudflare R2:
 * Thư mục lưu trữ: "lessions/slides/"
 * Dung lượng tối đa: 100MB
 */
export async function getSlideUploadUrlAction(input: {
  fileName: string;
  contentType: string;
  fileSize?: number;
}): Promise<ActionResult<PresignedUrlResult>> {
  try {
    // 1. Kiểm tra xác thực Admin
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    let isAdmin = false;

    if (token) {
      const payload = await verifyAccessToken(token);
      if (
        payload?.sub &&
        (!payload.role ||
          ["admin", "superadmin", "instructor", "tutor"].includes(payload.role))
      ) {
        isAdmin = true;
      }
    }

    if (!isAdmin && process.env.NODE_ENV !== "production") {
      const adminUser = await prisma.user.findFirst({
        where: { role: "admin", active: true },
        select: { id: true },
      });
      if (adminUser) {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return {
        success: false,
        error: "Bạn chưa đăng nhập hoặc không có quyền tải lên slide.",
      };
    }

    // 2. Validate định dạng file: PPTX hoặc PDF
    const { fileName, contentType, fileSize } = input;
    const isPdf =
      contentType === "application/pdf" ||
      fileName?.toLowerCase().endsWith(".pdf");
    const isPptx =
      contentType?.includes("presentation") ||
      contentType?.includes("powerpoint") ||
      fileName?.match(/\.(pptx|ppt)$/i);

    if (!isPdf && !isPptx) {
      return {
        success: false,
        error:
          "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các file trình chiếu (.pptx, .ppt) hoặc (.pdf).",
      };
    }

    // 3. Ràng buộc dung lượng tối đa (100MB)
    if (fileSize && fileSize > MAX_SLIDE_FILE_SIZE_BYTES) {
      return {
        success: false,
        error:
          "Kích thước tệp slide vượt quá giới hạn tối đa cho phép (100MB).",
      };
    }

    // 4. Khởi tạo Presigned URL upload trực tiếp vào lessions/slides
    const result = await generateR2UploadUrl({
      fileName: fileName || "lesson-slide.pptx",
      contentType:
        contentType ||
        (isPdf
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
      folder: "lessions/slides",
      expiresInSeconds: 900,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[getSlideUploadUrlAction] Error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Không thể tạo URL tải slide lên.";
    return { success: false, error: msg };
  }
}

export async function createLessonAction(input: {
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string | null;
  slideUrl?: string | null;
}): Promise<ActionResult<LessonItem>> {
  try {
    if (!input.title?.trim()) {
      return { success: false, error: "Tiêu đề bài học không được để trống" };
    }

    const lesson = await createLesson(input);
    revalidatePath(`/courses/${input.courseId}/edit`);
    revalidatePath(`/courses/${input.courseId}`);
    revalidatePath("/courses");

    return { success: true, data: lesson };
  } catch (error) {
    console.error("[createLessonAction] Error:", error);
    return {
      success: false,
      error: "Không thể tạo bài học. Vui lòng thử lại.",
    };
  }
}

export async function updateLessonAction(input: {
  id: string;
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string | null;
  slideUrl?: string | null;
}): Promise<ActionResult<LessonItem>> {
  try {
    if (!input.title?.trim()) {
      return { success: false, error: "Tiêu đề bài học không được để trống" };
    }

    const lesson = await updateLesson(input);
    revalidatePath(`/courses/${input.courseId}/edit`);
    revalidatePath(`/courses/${input.courseId}`);
    revalidatePath("/courses");

    return { success: true, data: lesson };
  } catch (error) {
    console.error("[updateLessonAction] Error:", error);
    return {
      success: false,
      error: "Không thể cập nhật bài học. Vui lòng thử lại.",
    };
  }
}

export async function deleteLessonAction(input: {
  id: string;
  courseId: string;
}): Promise<ActionResult<void>> {
  try {
    await deleteLesson(input.id, input.courseId);
    revalidatePath(`/courses/${input.courseId}/edit`);
    revalidatePath(`/courses/${input.courseId}`);
    revalidatePath("/courses");

    return { success: true };
  } catch (error) {
    console.error("[deleteLessonAction] Error:", error);
    return {
      success: false,
      error: "Không thể xóa bài học. Vui lòng thử lại.",
    };
  }
}

export async function reorderLessonsAction(input: {
  courseId: string;
  orderedIds: string[];
}): Promise<ActionResult<void>> {
  try {
    await reorderLessons(input.courseId, input.orderedIds);
    revalidatePath(`/courses/${input.courseId}/edit`);
    revalidatePath(`/courses/${input.courseId}`);
    revalidatePath("/courses");

    return { success: true };
  } catch (error) {
    console.error("[reorderLessonsAction] Error:", error);
    return { success: false, error: "Không thể cập nhật thứ tự bài học." };
  }
}
