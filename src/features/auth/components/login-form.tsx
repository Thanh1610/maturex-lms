import { useEffect, useState } from "react";
import { Badge, Button, Icon } from "@/components/ui";
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
  useEffect(() => {
    api("/auth/providers")
      .then((d) => setProvider(d.oidc))
      .catch(() => {});
  }, []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: any) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
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
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="live-login">
      <div className="live-welcome">
        <a className="live-wordmark" href="/">
          mature<span>×</span>
        </a>
        <Badge>LEARNING SPACE</Badge>
        <h1>
          Học hỏi mỗi ngày.
          <br />
          Trưởng thành cùng nhau.
        </h1>
        <p>
          Một không gian để học, thực hành và nhìn thấy sự tiến bộ của chính
          mình.
        </p>
        <div className="live-welcome-note">
          <Icon name="Sprout" size={32} />
          <span>
            Từ kiến thức đến hành động.
            <br />
            Từ trải nghiệm đến năng lực.
          </span>
        </div>
      </div>
      <div className="live-login-panel">
        <form className="live-form" onSubmit={submit}>
          <span className="live-eyebrow">MATUREX LMS</span>
          <h2>
            {setup ? "Khởi tạo không gian học tập" : "Chào mừng bạn trở lại"}
          </h2>
          <p className="muted">
            {resumeUser
              ? "Phiên đã hết hạn. Đăng nhập lại đúng tài khoản để tiếp tục; bản nháp vẫn được giữ trong trang này."
              : setup
                ? "Tạo tài khoản quản trị đầu tiên để bắt đầu tổ chức đào tạo."
                : "Đăng nhập bằng tài khoản được quản trị viên cấp."}
          </p>
          {setup && (
            <label>
              Họ và tên
              <input name="name" required maxLength={100} autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              defaultValue={resumeUser?.email || ""}
              type="email"
              required
              autoComplete="username"
              maxLength={254}
            />
          </label>
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              required
              minLength={setup ? 12 : undefined}
              maxLength={128}
              autoComplete={setup ? "new-password" : "current-password"}
            />
          </label>
          {setup && (
            <small className="muted">Dùng mật khẩu từ 12 đến 128 ký tự.</small>
          )}
          {error && (
            <div className="live-error" role="alert">
              {error}
            </div>
          )}
          <Button disabled={busy} type="submit" icon="ArrowRight">
            {busy
              ? "Đang xử lý…"
              : setup
                ? "Tạo không gian học tập"
                : "Đăng nhập"}
          </Button>
          <a className="live-demo-link" href="/demo.html">
            Xem bản demo giao diện <Icon name="ArrowUpRight" size={14} />
          </a>
          {!setup && !resumeUser && (
            <>
              <a className="live-demo-link" href="#forgot">
                Quên mật khẩu?
              </a>
              {provider?.configured && (
                <a className="btn secondary" href={provider.startUrl}>
                  Đăng nhập với {provider.label}
                </a>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
