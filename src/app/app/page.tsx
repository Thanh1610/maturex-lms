import type { Metadata } from "next";
import LiveApp from "@/features/app-shell/app-shell";

export const metadata: Metadata = {
  title: "Bảng điều khiển học tập | MatureX LMS",
  description: "Không gian trải nghiệm học tập LMS MatureX",
};

export default function AppPage() {
  return <LiveApp />;
}
