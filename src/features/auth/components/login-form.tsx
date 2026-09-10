import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
} from "@/components/ui";
import { api } from "@/lib/api-client";

export function LoginForm({
  setup,
  onLogin,
  resumeUser,
}: {
  setup: boolean;
  onLogin: () => void;
  resumeUser?: any;
}) {
  const [provider, setProvider] = useState<any>(null);
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/auth/providers")
      .then((d) => setProvider(d.oidc))
      .catch(() => {});
  }, []);

  const formSchema = z.object({
    name: setup
      ? z
          .string()
          .min(1, "Vui lòng nhập họ và tên")
          .max(100, "Tối đa 100 ký tự")
      : z.string().optional(),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Email không đúng định dạng")
      .max(254, "Email quá dài"),
    password: setup
      ? z
          .string()
          .min(12, "Mật khẩu tối thiểu 12 ký tự cho tài khoản khởi tạo")
          .max(128, "Mật khẩu tối đa 128 ký tự")
      : z
          .string()
          .min(1, "Vui lòng nhập mật khẩu")
          .max(128, "Mật khẩu tối đa 128 ký tự"),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: resumeUser?.email || "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (busy) return;
    setBusy(true);
    setServerError("");
    try {
      const result = await api(setup ? "/setup" : "/login", "POST", values);
      if (resumeUser && result.user.id !== resumeUser.id) {
        await api("/logout", "POST", {});
        throw new Error(
          "Hãy đăng nhập đúng tài khoản " +
            resumeUser.email +
            " để tiếp tục bản nháp.",
        );
      }
      await onLogin();
    } catch (error: any) {
      setServerError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left side: Welcome Branding */}
      <div className="bg-[#f0ecf6] flex flex-col items-start justify-center p-8 sm:p-12 md:p-16 lg:px-20">
        <a
          className="text-[#343340] text-3xl font-extrabold tracking-tight no-underline mb-8 md:mb-16"
          href="/"
        >
          mature<span className="text-[#8b76cf]">×</span>
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
              {setup ? "Khởi tạo không gian học tập" : "Chào mừng bạn trở lại"}
            </h2>
            <p className="text-xs text-[#858894] leading-relaxed mt-1">
              {resumeUser
                ? "Phiên đã hết hạn. Đăng nhập lại đúng tài khoản để tiếp tục; bản nháp vẫn được giữ trong trang này."
                : setup
                  ? "Tạo tài khoản quản trị đầu tiên để bắt đầu tổ chức đào tạo."
                  : "Đăng nhập bằng tài khoản được quản trị viên cấp."}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {setup && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nguyễn Văn A"
                          autoComplete="name"
                          disabled={busy}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                        disabled={busy}
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
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        autoComplete={
                          setup ? "new-password" : "current-password"
                        }
                        disabled={busy}
                        {...field}
                      />
                    </FormControl>
                    {setup && (
                      <p className="text-[11px] text-[#858894]">
                        Dùng mật khẩu từ 12 đến 128 ký tự.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <div
                  className="bg-[#fcf0ef] text-[#9c4545] p-3 border border-[#efd3d0] rounded-lg text-xs leading-relaxed"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <Button
                disabled={busy}
                type="submit"
                icon="ArrowRight"
                className="w-full mt-2"
              >
                {busy
                  ? "Đang xử lý…"
                  : setup
                    ? "Tạo không gian học tập"
                    : "Đăng nhập"}
              </Button>

              <a
                className="text-center text-xs text-[#9b91ab] hover:text-[#6b57bd] flex items-center justify-center gap-1 pt-1 transition-colors"
                href="/demo"
              >
                Xem bản demo giao diện <Icon name="ArrowUpRight" size={14} />
              </a>

              {!setup && !resumeUser && (
                <div className="flex flex-col items-center gap-2 pt-2 border-t border-[#f1f2f5]">
                  <a
                    className="text-xs text-[#747080] hover:text-[#6b57bd] transition-colors"
                    href="#forgot"
                  >
                    Quên mật khẩu?
                  </a>
                  {provider?.configured && (
                    <a
                      className="w-full text-center py-2 px-4 rounded-md border border-[#e4e3eb] text-xs text-[#747080] hover:bg-[#fdfbff] transition-colors"
                      href={provider.startUrl}
                    >
                      Đăng nhập với {provider.label}
                    </a>
                  )}
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
