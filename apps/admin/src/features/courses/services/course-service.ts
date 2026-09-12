import { prisma } from "@maturex/database";

export interface CourseListItem {
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
  status: "draft" | "published" | "archived";
  students: number;
  lessons: string[];
}

export async function getCoursesList(): Promise<CourseListItem[]> {
  const courses = await prisma.course.findMany({
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
    label: c.label,
    skill: c.skill,
    status: c.status as "draft" | "published" | "archived",
    students: c._count.enrollments,
    lessons: c.lessons.map((l) => l.title),
  }));
}

export interface CreateCourseInput {
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
  status: "draft" | "published" | "archived";
}

export async function createCourse(data: CreateCourseInput, ownerId: string) {
  return await prisma.course.create({
    data: {
      ownerId,
      title: data.title,
      category: data.category,
      description: data.description,
      teacher: data.teacher,
      duration: data.duration,
      level: data.level,
      color: data.color,
      icon: data.icon,
      label: data.label || "",
      skill: data.skill || "",
      status: data.status,
    },
  });
}

export async function getCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { position: "asc" },
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
    label: course.label,
    skill: course.skill,
    status: course.status as "draft" | "published" | "archived",
    students: course._count.enrollments,
    lessons: course.lessons.map((l) => l.title),
    lessonsList: course.lessons,
  };
}

export type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourseById>>>;

export type UpdateCourseInput = CreateCourseInput;

export async function updateCourse(id: string, data: UpdateCourseInput) {
  return await prisma.course.update({
    where: { id },
    data: {
      title: data.title,
      category: data.category,
      description: data.description,
      teacher: data.teacher,
      duration: data.duration,
      level: data.level,
      color: data.color,
      icon: data.icon,
      label: data.label || "",
      skill: data.skill || "",
      status: data.status,
    },
  });
}

export async function deleteCourse(id: string) {
  return await prisma.course.delete({
    where: { id },
  });
}

export async function deleteCourses(ids: string[]) {
  return await prisma.course.deleteMany({
    where: {
      id: { in: ids },
    },
  });
}

export async function updateCourseStatus(
  id: string,
  status: "draft" | "published" | "archived"
) {
  return await prisma.course.update({
    where: { id },
    data: { status },
  });
}
