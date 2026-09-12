import { Prisma, prisma } from "@maturex/database";
import { deleteR2File } from "@/lib/r2";

export interface LessonItem {
  id: string;
  courseId: string;
  position: number;
  title: string;
  content: string;
  videoUrl?: string | null;
  slideUrl?: string | null;
  createdAt: Date;
}

export interface CreateLessonInput {
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string | null;
  slideUrl?: string | null;
  position?: number;
}

export interface UpdateLessonInput {
  id: string;
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string | null;
  slideUrl?: string | null;
}

/**
 * Lấy danh sách các bài học thuộc một khóa học, sắp xếp theo position tăng dần
 */
export async function getLessonsByCourseId(
  courseId: string,
): Promise<LessonItem[]> {
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
  });

  return lessons;
}

/**
 * Tạo một bài học mới cho khóa học, tự động tính position nếu chưa truyền
 */
export async function createLesson(
  data: CreateLessonInput,
): Promise<LessonItem> {
  let position = data.position;

  if (position === undefined) {
    const highestLesson = await prisma.lesson.findFirst({
      where: { courseId: data.courseId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    position = (highestLesson?.position ?? 0) + 1;
  }

  return await prisma.lesson.create({
    data: {
      courseId: data.courseId,
      title: data.title.trim(),
      content: data.content?.trim() || "",
      videoUrl: data.videoUrl?.trim() || null,
      slideUrl: data.slideUrl?.trim() || null,
      position,
    },
  });
}

/**
 * Cập nhật thông tin bài học (title, content, videoUrl, slideUrl).
 * Tự động dọn dẹp video hoặc slide cũ trên R2 nếu người dùng thay thế hoặc xóa.
 */
export async function updateLesson(
  data: UpdateLessonInput,
): Promise<LessonItem> {
  const existing = await prisma.lesson.findUnique({
    where: { id: data.id },
    select: { videoUrl: true, slideUrl: true },
  });

  const nextVideoUrl = data.videoUrl?.trim() || null;
  const nextSlideUrl = data.slideUrl?.trim() || null;

  // Nếu bài học từng có video R2 cũ và bị đổi/xóa => dọn dẹp file cũ trên R2
  if (existing?.videoUrl && existing.videoUrl !== nextVideoUrl) {
    deleteR2File(existing.videoUrl).catch((err) =>
      console.error("[updateLesson] Failed to cleanup old R2 video:", err),
    );
  }

  // Nếu bài học từng có slide R2 cũ và bị đổi/xóa => dọn dẹp file cũ trên R2
  if (existing?.slideUrl && existing.slideUrl !== nextSlideUrl) {
    deleteR2File(existing.slideUrl).catch((err) =>
      console.error("[updateLesson] Failed to cleanup old R2 slide:", err),
    );
  }

  return await prisma.lesson.update({
    where: { id: data.id },
    data: {
      title: data.title.trim(),
      content: data.content?.trim() || "",
      videoUrl: nextVideoUrl,
      slideUrl: nextSlideUrl,
    },
  });
}

/**
 * Xóa một bài học và cập nhật lại thứ tự position của các bài học còn lại.
 * Tự động xóa file video và slide trên R2 nếu có.
 */
export async function deleteLesson(
  id: string,
  courseId: string,
): Promise<void> {
  const existing = await prisma.lesson.findUnique({
    where: { id },
    select: { videoUrl: true, slideUrl: true },
  });

  if (existing?.videoUrl) {
    deleteR2File(existing.videoUrl).catch((err) =>
      console.error("[deleteLesson] Failed to cleanup R2 video:", err),
    );
  }

  if (existing?.slideUrl) {
    deleteR2File(existing.slideUrl).catch((err) =>
      console.error("[deleteLesson] Failed to cleanup R2 slide:", err),
    );
  }

  await prisma.$transaction(async (tx) => {
    // 1. Xóa bài học
    await tx.lesson.delete({
      where: { id },
    });

    // 2. Lấy danh sách các bài học còn lại và re-index position từ 1
    const remaining = await tx.lesson.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
      select: { id: true },
    });

    for (let i = 0; i < remaining.length; i++) {
      await tx.lesson.update({
        where: { id: remaining[i].id },
        data: { position: i + 1 },
      });
    }
  });
}

/**
 * Cập nhật thứ tự các bài học theo mảng ID truyền vào bằng 1 câu lệnh SQL duy nhất
 */
export async function reorderLessons(
  courseId: string,
  orderedIds: string[],
): Promise<void> {
  if (!orderedIds.length) return;

  // Xây dựng danh sách cặp giá trị (id::uuid, new_position)
  const values = orderedIds.map(
    (id, index) => Prisma.sql`(${id}::uuid, ${index + 1}::int)`,
  );

  // Thực thi duy nhất 1 câu query raw, Postgres tự động map và cập nhật toàn bộ bài học
  await prisma.$executeRaw`
    UPDATE lessons AS l
    SET position = v.new_pos
    FROM (VALUES ${Prisma.join(values)}) AS v(id, new_pos)
    WHERE l.id = v.id AND l.course_id = ${courseId}::uuid
  `;
}
