"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Badge,
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
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

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
      toast.success("Đăng nhập thành công!", {
        description: `Chào mừng ${user.name || user.email} trở lại không gian học tập.`,
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
      {/* Left side: Welcome Branding */}
      <div className="bg-[#f0ecf6] flex flex-col items-start justify-center p-8 sm:p-12 md:p-16 lg:px-20">
        <a
          className="text-[#343340] text-3xl font-extrabold tracking-tight no-underline mb-8 md:mb-16 inline-flex items-center gap-1 cursor-pointer"
          href="/"
        >
          maturex<span className="text-[#8b76cf]">×</span>
        </a>
        <div className="hidden md:block">
          <Badge>LEARNING SPACE</Badge>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#514660] mt-4 md:mt-6 leading-tight">
          Học hỏi mỗi ngày.
          <br />
          Trưởng thành cùng nhau.
        </h1>
        <p className="text-[#8a7f98] max-w-sm mt-3 leading-relaxed hidden md:block">
          Một không gian để học, thực hành và nhìn thấy sự tiến bộ của chính
          mình.
        </p>
        <div className="mt-12 md:mt-16 flex items-center gap-4 text-[#8b7b9b] text-xs leading-relaxed hidden md:flex">
          <Icon name="Sprout" size={32} />
          <span>
            Từ kiến thức đến hành động.
            <br />
            Từ trải nghiệm đến năng lực.
          </span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 md:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-[380px] space-y-6">
          <div>
            <span className="text-[10px] tracking-[2px] font-semibold text-[#8b7ba8] uppercase block mb-1">
              MATUREX LMS
            </span>
            <h2 className="text-2xl font-bold text-[#1f1b2d] tracking-tight">
              Chào mừng bạn trở lại
            </h2>
            <p className="text-xs text-[#858894] leading-relaxed mt-1">
              Đăng nhập bằng tài khoản được quản trị viên cấp.
            </p>
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
