import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { verifyAccessToken } from "@/features/auth/services/jwt-service";

export const metadata: Metadata = {
  title: "Đăng nhập | MatureX LMS",
  description: "Đăng nhập vào hệ thống học tập MatureX LMS",
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mx_access_token")?.value;

  if (token) {
    const user = await verifyAccessToken(token);
    if (user) {
      redirect("/");
    }
  }

  return <LoginForm />;
}
