import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Empty } from "../ui.jsx";
import { api, dateLabel } from "./api.js";
import { IntegrationStatus } from "./Integrations.jsx";

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
    } catch (error) {
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
    <form className="live-panel live-form" onSubmit={submit}>
      <h2>Thông báo email</h2>
      <p className="muted">
        Nhận cập nhật học tập và nhắc lịch qua email khi dịch vụ email của không
        gian đã được kết nối.
      </p>
      {loading ? (
        <p role="status">Đang tải tùy chọn…</p>
      ) : error ? (
        <div className="live-error" role="alert">
          {error}
          <Button type="button" kind="ghost" onClick={load}>
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              style={{ width: "auto" }}
              type="checkbox"
              checked={enabled}
              disabled={busy}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            Nhận thông báo học tập qua email
          </label>
          <small className="muted">
            Thông báo trong ứng dụng vẫn được lưu. Hướng dẫn đặt lại mật khẩu
            được gửi khi bạn yêu cầu.
          </small>
          <Button type="submit" disabled={busy || enabled === saved}>
            Lưu tùy chọn
          </Button>
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
  const [entries, setEntries] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEntries((await api("/audit")).entries);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="live-panel">
      <div className="between">
        <div>
          <h2>Nhật ký quản trị</h2>
          <p className="muted">
            200 hoạt động gần nhất, theo thời gian mới nhất.
          </p>
        </div>
        <Button kind="ghost" icon="RotateCcw" disabled={loading} onClick={load}>
          Tải lại nhật ký
        </Button>
      </div>
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      {loading && !entries && <p role="status">Đang tải nhật ký…</p>}
      {entries?.length === 0 && (
        <Empty
          title="Chưa có hoạt động quản trị"
          description="Hoạt động tài khoản và giao lộ trình sẽ được ghi lại tại đây."
        />
      )}
      {!!entries?.length && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <caption
              className="muted"
              style={{ textAlign: "left", paddingBottom: 12 }}
            >
              Lịch sử thay đổi tài khoản và giao lộ trình
            </caption>
            <thead>
              <tr>
                {[
                  "Thời gian",
                  "Người thực hiện",
                  "Hoạt động",
                  "Mã đối tượng",
                ].map((label) => (
                  <th
                    scope="col"
                    key={label}
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #e5e5df",
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                    {dateLabel(entry.created_at)}
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    {entry.actor_name || "Hệ thống"}
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    {auditActions[entry.action] || entry.action}
                  </td>
                  <td
                    style={{ padding: "12px 10px", overflowWrap: "anywhere" }}
                  >
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
  async function password(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api("/account/password", "POST", values);
      location.assign("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="live-page-heading">
        <h1>Cài đặt tài khoản</h1>
        <p className="muted">Thông tin cá nhân, bảo mật và dịch vụ kết nối.</p>
      </div>
      <div className="live-two-col">
        <form className="live-panel live-form" onSubmit={profile}>
          <h2>Hồ sơ của bạn</h2>
          <label>
            Họ và tên
            <input
              name="name"
              defaultValue={state.user.name}
              required
              maxLength={100}
            />
          </label>
          <label>
            Chức danh
            <input name="job" defaultValue={state.user.job} maxLength={150} />
          </label>
          <p className="muted">
            {state.user.email}
            <br />
            Nhóm: {state.user.team || "Chưa được phân nhóm"}
          </p>
          <Button disabled={busy}>Lưu hồ sơ</Button>
        </form>
        <form className="live-panel live-form" onSubmit={password}>
          <h2>Đổi mật khẩu</h2>
          <label>
            Mật khẩu hiện tại
            <input
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
            />
          </label>
          <label>
            Mật khẩu mới
            <input
              type="password"
              name="newPassword"
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>
          <small className="muted">
            Đổi mật khẩu sẽ đăng xuất các phiên đang mở.
          </small>
          {error && (
            <p className="live-error" role="alert">
              {error}
            </p>
          )}
          <Button disabled={saving}>Đổi mật khẩu</Button>
        </form>
      </div>
      <div className="space-top">
        <NotificationPreferences
          user={state.user}
          mutate={mutate}
          busy={busy}
        />
      </div>
      <div className="space-top">
        <IntegrationStatus state={state} />
      </div>
      {state.user.role === "admin" && (
        <div className="space-top">
          <AuditLog />
        </div>
      )}
    </>
  );
}
export function PasswordRecovery({ token, onDone }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function submit(e) {
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
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="live-loading">
      <form
        className="live-panel live-form"
        onSubmit={submit}
        style={{ width: "100%", maxWidth: 460 }}
      >
        <h1>{token ? "Đặt lại mật khẩu" : "Quên mật khẩu"}</h1>
        {message ? (
          <p role="status">{message}</p>
        ) : (
          <>
            {token ? (
              <label>
                Mật khẩu mới
                <input
                  type="password"
                  name="password"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </label>
            ) : (
              <label>
                Email tài khoản
                <input type="email" name="email" required maxLength={254} />
              </label>
            )}
            {error && (
              <p className="live-error" role="alert">
                {error}
              </p>
            )}
            <Button disabled={busy}>
              {busy
                ? "Đang xử lý…"
                : token
                  ? "Lưu mật khẩu mới"
                  : "Gửi hướng dẫn"}
            </Button>
          </>
        )}
        <Button type="button" kind="ghost" onClick={onDone}>
          Về đăng nhập
        </Button>
      </form>
    </div>
  );
}
