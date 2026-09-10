import type { ReactNode } from "react";

export type Role = "learner" | "manager" | "instructor" | "admin";

export interface Person {
  name: string;
  role: string;
  color: string;
  avatar?: string;
  email?: string;
}

export interface Lesson {
  id?: string;
  title: string;
  duration?: string;
  type?: string;
  completed?: boolean;
}

export interface Course {
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
  students?: number;
  scope?: string;
  lessons: string[] | Lesson[];
  skill?: string;
  status: "draft" | "published" | "archived";
}

export interface Path {
  id: string;
  title: string;
  category: string;
  description: string;
  courses: string[];
  level?: string;
  color?: string;
  icon?: string;
}

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

export interface AppState {
  courses: Course[];
  enrolled: string[];
  completed: string[];
  notifications: NotificationItem[];
  bookmarks?: string[];
  progress?: Record<string, number>;
  user?: LiveUser;
  [key: string]: unknown;
}

export interface AppContextType {
  state: AppState & { [key: string]: any };
  dispatch: (action: any) => void;
  role: Role;
  selectRole: (role: Role) => void;
  active: string;
  go: (tab: string) => void;
  modal: { title: string; body: ReactNode; wide?: boolean } | null;
  open: (title: string, body: ReactNode, wide?: boolean) => void;
  close: () => void;
  toast: string;
  setToast: (msg: string) => void;
  notify: (msg: string) => void;
  narrow: boolean;
  mobile: boolean;
  setMobile: (open: boolean) => void;
}

export interface LiveUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  team?: string;
  job?: string;
}
