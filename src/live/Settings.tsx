import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Empty } from "../ui";
import { api, dateLabel } from "./api";
import { IntegrationStatus } from "./Integrations";

function NotificationPreferences({ user, mutate, busy }) {
  const [enabled, setEnabled] = useState(true),
    [saved, setSaved] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const loadSequence = useRef(0);
  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    setError("");
    try {
      const result = await api("/account/preferences");
      if (sequence !== loadSequence.current) return;
      setEnabled(result.preferences.email_notifications);
      setSaved(result.preferences.email_notifications);
    } catch (error: any) {
      if (sequence === loadSequence.current) setError(error.message);
    } finally {
      if (sequence === loadSequence.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    return () => {
      loadSequence.current++;
    };
  }, [load]);
  async function submit(event) {
    event.preventDefault();
    const result = await mutate(
      "/account/preferences",
      "PUT",
      { email_notifications: enabled },
      "Đã lưu tùy chọn thông báo.",
    );
    if (result) {
      setEnabled(result.preferences.email_notifications);
      setSaved(result.preferences.email_notifications);
    }
  }
  return (
    <form
      className="live-panel live-form bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px]"
      onSubmit={submit}
    >
      <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-0">
        Thông báo email
      </h2>
      <p className="muted text-[11px] text-[var(--muted,#757185)] mb-0">
        Nhận cập nhật học tập và nhắc lịch qua email khi dịch vụ email của không
        gian đã được kết nối.
      </p>
      {loading ? (
        <p className="text-[12px] text-[var(--muted,#757185)]" role="status">
          Đang tải tùy chọn…
        </p>
      ) : error ? (
        <div
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8] flex items-center justify-between"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" kind="ghost" onClick={load}>
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <label className="flex items-center gap-[10px] text-[12px] text-[#1f1b2d] font-normal cursor-pointer">
            <input
              className="w-auto h-4 w-4"
              type="checkbox"
              checked={enabled}
              disabled={busy}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            Nhận thông báo học tập qua email
          </label>
          <small className="muted text-[9px] text-[var(--muted,#757185)] leading-relaxed">
            Thông báo trong ứng dụng vẫn được lưu. Hướng dẫn đặt lại mật khẩu
            được gửi khi bạn yêu cầu.
          </small>
          <div className="self-start">
            <Button type="submit" disabled={busy || enabled === saved}>
              Lưu tùy chọn
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
const auditActions = {
  "user.create": "Tạo tài khoản",
  "user.update": "Cập nhật tài khoản",
  "password.reset_link": "Tạo liên kết đặt lại mật khẩu",
  "password.reset": "Đặt lại mật khẩu",
  "password.change": "Đổi mật khẩu",
  "path.assign": "Giao lộ trình học",
};
function AuditLog() {
  const [entries, setEntries] = useState<any>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEntries((await api("/audit")).entries);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="live-panel bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="between flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-1">
            Nhật ký quản trị
          </h2>
          <p className="muted text-[11px] text-[var(--muted,#757185)] mb-0">
            200 hoạt động gần nhất, theo thời gian mới nhất.
          </p>
        </div>
        <Button kind="ghost" icon="RotateCcw" disabled={loading} onClick={load}>
          Tải lại nhật ký
        </Button>
      </div>
      {error && (
        <p
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8]"
          role="alert"
        >
          {error}
        </p>
      )}
      {loading && !entries && (
        <p className="text-[12px] text-[var(--muted,#757185)]" role="status">
          Đang tải nhật ký…
        </p>
      )}
      {entries?.length === 0 && (
        <Empty
          title="Chưa có hoạt động quản trị"
          description="Hoạt động tài khoản và giao lộ trình sẽ được ghi lại tại đây."
        />
      )}
      {!!entries?.length && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="muted text-left pb-3 text-[11px] text-[var(--muted,#757185)]">
              Lịch sử thay đổi tài khoản và giao lộ trình
            </caption>
            <thead>
              <tr className="bg-[#fcfcfd] border-b border-[var(--border,#e9eaf0)]">
                {[
                  "Thời gian",
                  "Người thực hiện",
                  "Hoạt động",
                  "Mã đối tượng",
                ].map((label) => (
                  <th
                    scope="col"
                    key={label}
                    className="p-[12px_10px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap border-b border-[#e5e5df]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  className="border-b border-[#f2f1f5] hover:bg-[#faf9fc]"
                  key={entry.id}
                >
                  <td className="p-[12px_10px] text-[11px] whitespace-nowrap text-[#555064]">
                    {dateLabel(entry.created_at)}
                  </td>
                  <td className="p-[12px_10px] text-[11px] font-medium text-[#1f1b2d]">
                    {entry.actor_name || "Hệ thống"}
                  </td>
                  <td className="p-[12px_10px] text-[11px] text-[#555064]">
                    {auditActions[entry.action] || entry.action}
                  </td>
                  <td className="p-[12px_10px] text-[11px] text-[#757185] break-words">
                    {entry.target_id || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
export function Settings({ state, mutate, busy }) {
  const [_message, _setMessage] = useState(""),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  async function profile(e) {
    e.preventDefault();
    await mutate(
      "/account/profile",
      "PUT",
      Object.fromEntries(new FormData(e.currentTarget)),
      "Đã lưu hồ sơ.",
    );
  }
  async function password(e: any) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api("/account/password", "POST", values);
      location.assign("/");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="live-page-heading mb-7">
        <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
          Cài đặt tài khoản
        </h1>
        <p className="muted text-[11px] text-[var(--muted,#757185)]">
          Thông tin cá nhân, bảo mật và dịch vụ kết nối.
        </p>
      </div>
      <div className="live-two-col grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
        <form
          className="live-panel live-form bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px]"
          onSubmit={profile}
        >
          <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-0">
            Hồ sơ của bạn
          </h2>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Họ và tên
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              name="name"
              defaultValue={state.user.name}
              required
              maxLength={100}
            />
          </label>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Chức danh
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              name="job"
              defaultValue={state.user.job}
              maxLength={150}
            />
          </label>
          <p className="muted text-[11px] text-[var(--muted,#757185)] leading-relaxed">
            {state.user.email}
            <br />
            Nhóm: {state.user.team || "Chưa được phân nhóm"}
          </p>
          <div className="self-start">
            <Button disabled={busy}>Lưu hồ sơ</Button>
          </div>
        </form>
        <form
          className="live-panel live-form bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px]"
          onSubmit={password}
        >
          <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-0">
            Đổi mật khẩu
          </h2>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Mật khẩu hiện tại
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
            />
          </label>
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Mật khẩu mới
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
              type="password"
              name="newPassword"
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>
          <small className="muted text-[9px] text-[var(--muted,#757185)]">
            Đổi mật khẩu sẽ đăng xuất các phiên đang mở.
          </small>
          {error && (
            <p
              className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] leading-[1.8]"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="self-start">
            <Button disabled={saving}>Đổi mật khẩu</Button>
          </div>
        </form>
      </div>
      <div className="space-top mt-5">
        <NotificationPreferences
          user={state.user}
          mutate={mutate}
          busy={busy}
        />
      </div>
      <div className="space-top mt-5">
        <IntegrationStatus state={state} />
      </div>
      {state.user.role === "admin" && (
        <div className="space-top mt-5">
          <AuditLog />
        </div>
      )}
    </>
  );
}
export function PasswordRecovery({
  token,
  onDone,
}: {
  token?: string;
  onDone?: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget));
      const result = await api(
        token ? "/password/reset" : "/password/forgot",
        "POST",
        token ? { token, password: body.password } : body,
      );
      setMessage(
        token ? "Đã đặt lại mật khẩu. Bạn có thể đăng nhập." : result.message,
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="live-loading min-h-screen flex items-center justify-center flex-col p-[30px]">
      <form
        className="live-panel live-form bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px] w-full max-w-[460px]"
        onSubmit={submit}
      >
        <h1 className="text-[24px] font-bold text-[#1f1b2d] mb-1">
          {token ? "Đặt lại mật khẩu" : "Quên mật khẩu"}
        </h1>
        {message ? (
          <p className="text-[12px] text-[#3b7c53]" role="status">
            {message}
          </p>
        ) : (
          <>
            {token ? (
              <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
                Mật khẩu mới
                <input
                  className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                  type="password"
                  name="password"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </label>
            ) : (
              <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
                Email tài khoản
                <input
                  className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                />
              </label>
            )}
            {error && (
              <p
                className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] leading-[1.8]"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="self-start">
              <Button disabled={busy}>
                {busy
                  ? "Đang xử lý…"
                  : token
                    ? "Lưu mật khẩu mới"
                    : "Gửi hướng dẫn"}
              </Button>
            </div>
          </>
        )}
        <div className="self-start">
          <Button type="button" kind="ghost" onClick={onDone}>
            Về đăng nhập
          </Button>
        </div>
      </form>
    </div>
  );
}
