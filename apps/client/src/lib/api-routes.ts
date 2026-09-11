export const API_ROUTES = {
  auth: {
    me: "/auth/me",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
} as const;

export type ApiRoutes = typeof API_ROUTES;
