import type { AppState } from "@/types/index";
import { initialState } from "./demo-data";
export const STORAGE_KEY = "maturex-lms-demo-v1";
function enrollCourse(s: any, id: string, person = "me", due = "25/09/2026") {
  const c = s.courses.find((c: any) => c.id === id);
  if (!c) return;
  if (person === "me" && !s.enrolled.includes(id)) s.enrolled.push(id);
  if (!s.assignments.some((a: any) => a.course === id && a.person === person)) {
    s.assignments.push({
      id: `task-${person}-${id}`,
      course: id,
      title: `Thực hành: ${c.title}`,
      description:
        c.exercise ||
        "Chọn một tình huống công việc, áp dụng nội dung đã học và giải thích cách kiểm chứng kết quả.",
      due,
      type: "Áp dụng công việc",
      skill: c.skill || "ai",
      person,
      status: "todo",
    });
  }
}
export function progress(state: any, id: string): number {
  const c = state.courses.find((c: any) => c.id === id);
  return c
    ? Math.round(((state.completed[id]?.length || 0) / c.lessons.length) * 100)
    : 0;
}
export function transition(state: any, action: any): any {
  const s = structuredClone(state);
  const { type, id, value } = action;
  switch (type) {
    case "enroll":
      enrollCourse(s, id);
      break;
    case "complete": {
      const c = s.courses.find((c) => c.id === id);
      if (
        !c ||
        !Number.isInteger(value) ||
        value < 0 ||
        value >= c.lessons.length
      )
        return state;
      enrollCourse(s, id);
      s.completed[id] = [...new Set([...(s.completed[id] || []), value])];
      break;
    }
    case "bookmark":
      s.bookmarks = s.bookmarks.includes(id)
        ? s.bookmarks.filter((x) => x !== id)
        : [...s.bookmarks, id];
      break;
    case "note":
      s.notes[id] = value;
      break;
    case "quiz":
      s.quizPassed[id] = true;
      break;
    case "submit": {
      const a = s.assignments.find((a) => a.id === id);
      if (!a || !["todo", "revision"].includes(a.status) || !value.body?.trim())
        return state;
      a.history = [
        ...(a.history || []),
        ...(a.body
          ? [{ body: a.body, feedback: a.feedback, status: a.status }]
          : []),
      ];
      a.body = value.body.trim();
      a.file = value.file || "";
      a.status = "submitted";
      a.attempt = (a.attempt || 0) + 1;
      a.feedback = "";
      a.submittedAt = new Date().toISOString();
      s.notifications.unshift({
        id: `${Date.now()}`,
        text: `Bài “${a.title}” đã được nộp trong demo.`,
        route: "assignments",
        read: false,
      });
      break;
    }
    case "review": {
      const a = s.assignments.find((a) => a.id === id);
      if (
        a?.status !== "submitted" ||
        !value.feedback?.trim() ||
        !["approved", "revision"].includes(value.status)
      )
        return state;
      a.status = value.status;
      a.feedback = value.feedback.trim();
      a.scores = value.scores;
      a.reviewer = "Ngọc Linh";
      a.reviewedAt = new Date().toISOString();
      if (value.status === "approved") {
        s.evidence = s.evidence.filter((e) => e.assignment !== id);
        s.evidence.push({
          id: `ev-${id}`,
          assignment: id,
          skill: a.skill,
          person: a.person,
          title: a.title,
          level: value.level || 2,
          date: "09/09/2026",
          reviewer: "Ngọc Linh",
          scope: s.courses.find((c) => c.id === a.course)?.scope || "MatureX",
        });
        if (a.person === "me")
          s.skills = s.skills.map((k) =>
            k.id === a.skill
              ? { ...k, level: Math.max(k.level, value.level || 2) }
              : k,
          );
      }
      s.notifications.unshift({
        id: `${Date.now()}`,
        text: `Có phản hồi mới cho bài “${a.title}”.`,
        route: "assignments",
        read: false,
      });
      break;
    }
    case "saveCourse": {
      const index = s.courses.findIndex((c) => c.id === id);
      if (index >= 0) {
        if (
          JSON.stringify(s.courses[index].lessons) !==
          JSON.stringify(value.lessons)
        ) {
          s.completed[id] = [];
          delete s.quizPassed[id];
        }
        s.courses[index] = { ...s.courses[index], ...value };
      } else s.courses.push(value);
      break;
    }
    case "publish": {
      const c = s.courses.find((c) => c.id === id);
      if (c) c.status = value;
      break;
    }
    case "event": {
      const e = s.events.find((e) => e.id === id);
      if (e) e.registered = !e.registered;
      break;
    }
    case "addEvent":
      s.events.push(value);
      break;
    case "assignPath":
      s.pathAssignments.push({
        ...value,
        id: `${Date.now()}`,
        date: "09/09/2026",
      });
      value.courses.forEach((courseId) => {
        enrollCourse(
          s,
          courseId,
          value.person,
          value.due?.split("-").reverse().join("/") || "25/09/2026",
        );
      });
      break;
    case "readNotifications":
      s.notifications = s.notifications.map((n) => ({ ...n, read: true }));
      break;
    case "settings":
      s.settings = { ...s.settings, ...value };
      break;
    case "addMember":
      s.members = [...(s.members || []), value];
      break;
    case "addPath":
      s.customPaths = [...(s.customPaths || []), value];
      break;
    case "post":
      s.posts.unshift(value);
      break;
    case "like": {
      const p = s.posts.find((p) => p.id === id);
      if (p) {
        p.likes += p.liked ? -1 : 1;
        p.liked = !p.liked;
      }
      break;
    }
    case "reply": {
      const p = s.posts.find((p) => p.id === id);
      if (p) p.replies.push(value);
      break;
    }
    case "reset":
      return initialState();
    default:
      return state;
  }
  return s;
}
