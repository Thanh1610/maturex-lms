"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@maturex/database";
import { verifyAccessToken } from "@/features/auth/services/jwt-service";
import { courseFormSchema, type CourseFormValues } from "../schemas/course-form-schema";
import { createCourse } from "../services/course-service";

const ACCESS_COOKIE_NAME = "mx_access_token";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createCourseAction(
  values: CourseFormValues
): Promise<ActionResult<{ id: string; title: string }>> {
  try {
    // 1. Validate form values with Zod
    const validated = courseFormSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "Dữ liệu không hợp lệ";
      return { success: false, error: firstError };
    }

    // 2. Identify current authenticated Admin
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    let ownerId: string | null = null;

    if (token) {
      const payload = await verifyAccessToken(token);
      if (payload?.sub) {
        ownerId = payload.sub;
      }
    }

    // Fallback: If no token in local dev or token expired, get the first active admin/user
    if (!ownerId) {
      const defaultUser = await prisma.user.findFirst({
        where: { role: "admin", active: true },
        select: { id: true },
      });
      ownerId = defaultUser?.id || null;
    }

    if (!ownerId) {
      const fallbackUser = await prisma.user.findFirst({
        select: { id: true },
      });
      ownerId = fallbackUser?.id || null;
    }

    if (!ownerId) {
      return {
        success: false,
        error: "Không tìm thấy tài khoản quản trị viên để gán quyền tác giả.",
      };
    }

    // 3. Create course in database
    const course = await createCourse(validated.data, ownerId);

    // 4. Revalidate courses list page
    revalidatePath("/courses");

    return {
      success: true,
      data: {
        id: course.id,
        title: course.title,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tạo khóa học";
    return { success: false, error: message };
  }
}

export async function updateCourseAction(
  id: string,
  values: CourseFormValues
): Promise<ActionResult<{ id: string; title: string }>> {
  try {
    if (!id) {
      return { success: false, error: "Thiếu ID khóa học cần cập nhật" };
    }

    // 1. Validate form values with Zod
    const validated = courseFormSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "Dữ liệu không hợp lệ";
      return { success: false, error: firstError };
    }

    // 2. Update course in database
    const { updateCourse } = await import("../services/course-service");
    const updated = await updateCourse(id, validated.data);

    // 3. Revalidate paths
    revalidatePath("/courses");
    revalidatePath(`/courses/${id}`);
    revalidatePath(`/courses/${id}/edit`);

    return {
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi cập nhật khóa học";
    return { success: false, error: message };
  }
}

export async function deleteCourseAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!id) {
      return { success: false, error: "Thiếu ID khóa học cần xóa" };
    }

    const { deleteCourse } = await import("../services/course-service");
    await deleteCourse(id);

    revalidatePath("/courses");
    return { success: true, data: { id } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xóa khóa học";
    return { success: false, error: message };
  }
}

export async function deleteBulkCoursesAction(
  ids: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    if (!ids || ids.length === 0) {
      return { success: false, error: "Chưa chọn khóa học nào để xóa" };
    }

    const { deleteCourses } = await import("../services/course-service");
    const result = await deleteCourses(ids);

    revalidatePath("/courses");
    return { success: true, data: { count: result.count } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xóa danh sách khóa học";
    return { success: false, error: message };
  }
}

export async function toggleCourseStatusAction(
  id: string,
  nextStatus: "draft" | "published" | "archived"
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    if (!id || !nextStatus) {
      return { success: false, error: "Thiếu thông tin khóa học hoặc trạng thái" };
    }

    const { updateCourseStatus } = await import("../services/course-service");
    const updated = await updateCourseStatus(id, nextStatus);

    revalidatePath("/courses");
    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra khi cập nhật trạng thái";
    return { success: false, error: message };
  }
}
