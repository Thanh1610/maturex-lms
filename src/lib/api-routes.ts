/**
 * Centralized API route definitions.
 * Paths are relative to /api (as handled by api-client.ts) or full paths where needed.
 */
export const API_ROUTES = {
  auth: {
    me: "/auth/me",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  account: {
    password: "/account/password",
  },
  app: {
    state: "/state",
    health: "/health",
  },
  learning: {
    root: "/learning",
    bookmarks: (id: string) => `/learning/bookmarks/${id}`,
    notes: (lessonId: string) => `/learning/notes/${lessonId}`,
    quizzes: (quizId: string) => `/learning/quizzes/${quizId}`,
  },
  courses: {
    root: "/courses",
    instructors: (courseId: string) => `/courses/${courseId}/instructors`,
  },
  cohorts: {
    root: "/cohorts",
    report: (cohortId: string) => `/cohorts/${cohortId}/report?format=csv`,
  },
  files: {
    byId: (id: string) => `/files/${id}`,
  },
  integrations: {
    status: "/integrations/status",
    outbox: "/integrations/outbox",
    assistant: "/assistant",
  },
  reports: {
    exportCsv: "/reports?format=csv",
  },
} as const;

export type ApiRoutes = typeof API_ROUTES;
