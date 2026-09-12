export const API_ROUTES = {
  auth: {
    me: "/auth/me",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
} as const;

export type ApiRoutes = typeof API_ROUTES;

export const APP_ROUTES = {
  home: "/",
  courses: "/courses",
  coursesNew: "/courses/new",
  coursesEdit: (id: string) => `/courses/${id}/edit`,
  paths: "/paths",
  assignments: "/assignments",
  skills: "/skills",
  calendar: "/calendar",
  community: "/community",
  assistant: "/assistant",
  team: "/team",
  reviews: "/reviews",
  studio: "/studio",
  reports: "/reports",
  settings: "/settings",
  auth: {
    login: "/auth/login",
  },
} as const;

export type AppRoutes = typeof APP_ROUTES;
