import { PrismaClient, Role, CourseStatus, AssignmentStatus } from "@prisma/client";
import {
  courseSeeds,
  skillSeeds,
  assignmentSeeds,
} from "./seed-data/portal-seeds";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Neon PostgreSQL database...");

  // 1. Find or create default admin user
  let admin = await prisma.user.findFirst({
    where: { role: Role.admin },
  });

  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    console.error("No user found in PostgreSQL. Please register or login first.");
    process.exit(1);
  }

  console.log(`Using admin/active user: ${admin.name} (${admin.id})`);

  // 2. Create instructor users
  const instructors = [
    {
      name: "Ngọc Linh",
      email: "ngoclinh@maturex.com",
      role: Role.instructor,
      team: "MatureX",
      job: "Learning Designer",
      passwordHash: "",
    },
    {
      name: "Đức An",
      email: "ducan@maturex.com",
      role: Role.instructor,
      team: "Microm",
      job: "Team Lead",
      passwordHash: "",
    },
  ];

  const teacherMap: Record<string, string> = {};

  for (const inst of instructors) {
    const user = await prisma.user.upsert({
      where: { email: inst.email },
      update: { name: inst.name, role: inst.role, team: inst.team, job: inst.job },
      create: inst,
    });
    teacherMap[inst.name] = user.id;
  }

  // 3. Seed Courses and Lessons
  console.log("Seeding Courses and Lessons...");
  for (const c of courseSeeds) {
    const ownerId = teacherMap[c.teacher] || admin.id;

    const course = await prisma.course.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        description: c.description,
        category: c.category,
        teacherName: c.teacher || "MatureX",
        duration: c.duration || "2 giờ",
        level: c.level || "Nền tảng",
        color: c.color || "lavender",
        icon: c.icon || "Sparkles",
        label: c.label || "",
        skill: c.skill || "",
        status: CourseStatus.published,
      },
      create: {
        id: c.id,
        ownerId,
        title: c.title,
        description: c.description,
        category: c.category,
        teacherName: c.teacher || "MatureX",
        duration: c.duration || "2 giờ",
        level: c.level || "Nền tảng",
        color: c.color || "lavender",
        icon: c.icon || "Sparkles",
        label: c.label || "",
        skill: c.skill || "",
        status: CourseStatus.published,
      },
    });

    if (Array.isArray(c.lessons)) {
      for (let idx = 0; idx < c.lessons.length; idx++) {
        const lessonTitle = c.lessons[idx];
        const lessonId = `lesson-${c.id}-${idx + 1}`;
        await prisma.lesson.upsert({
          where: {
            courseId_position: {
              courseId: course.id,
              position: idx + 1,
            },
          },
          update: {
            title: typeof lessonTitle === "string" ? lessonTitle : (lessonTitle as any).title || `Bài ${idx + 1}`,
          },
          create: {
            id: lessonId,
            courseId: course.id,
            position: idx + 1,
            title: typeof lessonTitle === "string" ? lessonTitle : (lessonTitle as any).title || `Bài ${idx + 1}`,
            content: `Nội dung chi tiết cho bài ${idx + 1} của khóa ${course.title}.`,
          },
        });
      }
    }
  }

  // 4. Enroll admin in 3 courses: 'ai', 'culture', 'research'
  console.log("Seeding Enrollments and Progress for admin...");
  const enrollCourseIds = ["ai", "culture", "research"];
  for (const cid of enrollCourseIds) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: admin.id,
          courseId: cid,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        courseId: cid,
      },
    });
  }

  // Progress:
  // 'ai': 2/4 bài hoàn thành (ongoing, progress = 50%)
  // 'culture': 4/4 bài hoàn thành (finished, progress = 100%)
  // 'research': 1/4 bài hoàn thành (ongoing, progress = 25%)
  const progressMap = [
    { courseId: "ai", count: 2 },
    { courseId: "culture", count: 4 },
    { courseId: "research", count: 1 },
  ];

  for (const pm of progressMap) {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: pm.courseId },
      orderBy: { position: "asc" },
    });

    for (let i = 0; i < Math.min(pm.count, lessons.length); i++) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: admin.id,
            lessonId: lessons[i].id,
          },
        },
        update: {},
        create: {
          userId: admin.id,
          lessonId: lessons[i].id,
        },
      });
    }
  }

  // 5. Seed Assignments for admin
  console.log("Seeding Assignments for admin...");
  for (const a of assignmentSeeds) {
    if (a.person === "me") {
      const status =
        a.status === "approved"
          ? AssignmentStatus.approved
          : a.status === "submitted"
            ? AssignmentStatus.submitted
            : a.status === "revision"
              ? AssignmentStatus.revision
              : AssignmentStatus.todo;

      await prisma.assignment.upsert({
        where: { id: a.id },
        update: {
          title: a.title,
          description: a.description,
          due: a.due,
          type: a.type,
          skill: a.skill,
          status,
          body: (a as any).body || "",
          feedback: (a as any).feedback || "",
        },
        create: {
          id: a.id,
          userId: admin.id,
          courseId: a.course,
          title: a.title,
          description: a.description,
          due: a.due,
          type: a.type,
          skill: a.skill,
          status,
          body: (a as any).body || "",
          feedback: (a as any).feedback || "",
        },
      });
    }
  }

  // 6. Seed UserSkills for admin
  console.log("Seeding Skills for admin...");
  for (const s of skillSeeds) {
    await prisma.userSkill.upsert({
      where: {
        userId_skillKey: {
          userId: admin.id,
          skillKey: s.id,
        },
      },
      update: {
        level: s.level,
        target: s.target,
        name: s.name,
        group: s.group,
        color: s.color,
      },
      create: {
        userId: admin.id,
        skillKey: s.id,
        name: s.name,
        group: s.group,
        level: s.level,
        target: s.target,
        color: s.color,
      },
    });
  }

  console.log("Prisma PostgreSQL seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
