import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-routes";
import type { SafeUser } from "../services/auth-service";

export interface AuthState {
  user: SafeUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<SafeUser>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<SafeUser | null>;
  setUser: (user: SafeUser | null) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),
      setError: (error) => set({ error }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api<{ user: SafeUser }>(
            API_ROUTES.auth.login,
            "POST",
            { email, password },
          );
          set({ user: res.user, isLoading: false, error: null });
          return res.user;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Đăng nhập thất bại";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api(API_ROUTES.auth.logout, "POST", {});
        } catch {
          // ignore logout network errors
        } finally {
          set({ user: null, isLoading: false, error: null });
        }
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const res = await api<{ user: SafeUser | null }>(
            API_ROUTES.auth.me,
          );
          set({ user: res.user, isLoading: false, error: null });
          return res.user;
        } catch {
          // Attempt refresh if access token expired
          try {
            const refreshRes = await api<{ user: SafeUser }>(
              API_ROUTES.auth.refresh,
              "POST",
              {},
            );
            set({ user: refreshRes.user, isLoading: false, error: null });
            return refreshRes.user;
          } catch {
            set({ user: null, isLoading: false });
            return null;
          }
        }
      },
    }),
    {
      name: "mx_auth_state",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
