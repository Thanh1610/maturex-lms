import { cache } from "react";
import { prisma } from "@maturex/database";

export interface ClientCourseListItem {
  id: string;
  title: string;
  category: string;
  description: string;
  teacher: string;
  duration: string;
  level: string;
  color: string;
  icon: string;
  label?: string;
  skill?: string;
  status: "published";
  students: number;
  lessons: string[];
  progress?: number;
}

export interface ClientLessonItem {
  id: string;
  position: number;
  title: string;
  content: string;
}

export interface ClientCourseDetail extends ClientCourseListItem {
  lessonsList: ClientLessonItem[];
}

/**
 * Lấy danh sách các khóa học đã công khai (published) cho học viên
 */
export async function getPublishedCourses(): Promise<ClientCourseListItem[]> {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: "published",
      },
      orderBy: { createdAt: "desc" },
      include: {
        lessons: {
          orderBy: { position: "asc" },
          select: { title: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      description: c.description,
      teacher: c.teacher,
      duration: c.duration,
      level: c.level,
      color: c.color,
      icon: c.icon,
      label: c.label || undefined,
      skill: c.skill || undefined,
      status: "published",
      students: c._count.enrollments,
      lessons: c.lessons.map((l) => l.title),
    }));
  } catch (error) {
    console.error("[getPublishedCourses] Error:", error);
    return [];
  }
}

/**
 * Lấy thông tin chi tiết một khóa học đã công khai kèm danh sách bài học
 * Sử dụng React.cache() để deduplicate request giữa generateMetadata và Page component
 */
export const getPublishedCourseById = cache(
  async (id: string): Promise<ClientCourseDetail | null> => {
    try {
      const course = await prisma.course.findFirst({
        where: {
          id,
          status: "published",
        },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              position: true,
              title: true,
              content: true,
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!course) return null;

      return {
        id: course.id,
        title: course.title,
        category: course.category,
        description: course.description,
        teacher: course.teacher,
        duration: course.duration,
        level: course.level,
        color: course.color,
        icon: course.icon,
        label: course.label || undefined,
        skill: course.skill || undefined,
        status: "published",
        students: course._count.enrollments,
        lessons: course.lessons.map((l) => l.title),
        lessonsList: course.lessons,
      };
    } catch (error) {
      console.error("[getPublishedCourseById] Error:", error);
      return null;
    }
  }
);
