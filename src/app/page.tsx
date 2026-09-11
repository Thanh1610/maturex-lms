import type { Metadata } from "next";
import PortalApp from "@/features/portal/portal-app";

export const metadata: Metadata = {
  title: "MatureX LMS - Nền tảng học tập & phát triển",
  description:
    "Không gian học tập, rèn luyện kỹ năng và cộng tác chuyên nghiệp",
};

export default function HomePage() {
  return <PortalApp />;
}
