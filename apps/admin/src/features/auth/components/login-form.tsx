"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icon,
  Input,
  toast,
} from "@maturex/ui";
import { useAuthStore } from "../stores/auth-store";
import { APP_ROUTES } from "@/lib/api-routes";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng")
    .max(254, "Email quá dài"),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .max(128, "Mật khẩu tối đa 128 ký tự"),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({ onLogin }: { onLogin?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || APP_ROUTES.home;
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const errorParam = searchParams.get("error");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (isLoading) return;
    try {
      const user = await login(values.email, values.password);

      if (user.role !== "admin" && user.role !== "instructor") {
        await useAuthStore.getState().logout();
        toast.error("Truy cập bị từ chối", {
          description: "Tài khoản của bạn không có quyền truy cập Cổng Quản trị.",
        });
        return;
      }

      toast.success("Đăng nhập thành công!", {
        description: `Chào mừng ${user.name || user.email} vào Cổng Quản trị.`,
      });

      if (onLogin) {
        onLogin();
      } else {
        router.replace(callbackUrl);
        router.refresh();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Email hoặc mật khẩu không chính xác.";
      toast.error("Đăng nhập thất bại", {
        description: message,
      });
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left side: Welcome Banner Image */}
      <div className="relative hidden md:block w-full h-full min-h-screen bg-[#f0ecf6]">
        <Image
          src="/images/auth-banner.webp"
          alt="MatureX - Không gian quản trị"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Right side: Login Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 md:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-[380px] space-y-6">
          <div>
            <span className="text-[10px] tracking-[2px] font-semibold text-[#8b7ba8] uppercase block mb-1">
              MATUREX LMS · CỔNG QUẢN TRỊ
            </span>
            <h2 className="text-2xl font-bold text-[#1f1b2d] tracking-tight">
              Đăng nhập Quản trị viên
            </h2>
            <p className="text-xs text-[#858894] leading-relaxed mt-1">
              Dành cho Ban Quản trị và Giảng viên MatureX.
            </p>

            {errorParam === "unauthorized" && (
              <div className="mt-3 p-2.5 rounded-md bg-[#fdf2f2] border border-[#f8d7da] text-xs text-[#b02a37]">
                Tài khoản của bạn không có quyền truy cập trang quản trị.
              </div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ten@congty.com"
                        autoComplete="username"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          disabled={isLoading}
                          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          className="absolute right-2.5 p-1 text-[#8b7ba8] hover:text-[#514660] transition-colors cursor-pointer border-0 bg-transparent rounded-sm flex items-center justify-center outline-none"
                        >
                          <Icon
                            name={showPassword ? "EyeOff" : "Eye"}
                            size={16}
                          />
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={isLoading}
                type="submit"
                className="w-full mt-2 cursor-pointer"
              >
                {isLoading ? "Đang xử lý…" : "Đăng nhập"}
                <Icon name="ArrowRight" size={15} />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
