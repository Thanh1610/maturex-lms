import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Empty,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { api } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/api-routes";
import { dateLabel } from "@/lib/formatters";
import type { AppState, LiveUser } from "@/types";
import { IntegrationStatus } from "../../admin/components/service-integrations";

function NotificationPreferences({
  user,
  mutate,
  busy,
}: {
  user: LiveUser;
  mutate: (
    path: string,
    method?: string,
    body?: unknown,
    message?: string,
  ) => Promise<unknown>;
  busy: boolean;
}) {
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const loadSequence = useRef(0);

  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    setError("");
    try {
      const result = await api<{
        preferences: { email_notifications: boolean };
      }>("/account/preferences");
      if (sequence !== loadSequence.current) return;
      setEnabled(result.preferences.email_notifications);
      setSaved(result.preferences.email_notifications);
    } catch (err: unknown) {
      if (sequence === loadSequence.current) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      }
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
    const result = (await mutate(
      "/account/preferences",
      "PUT",
      { email_notifications: enabled },
      "Đã lưu tùy chọn thông báo.",
    )) as { preferences: { email_notifications: boolean } } | null;
    if (result?.preferences) {
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
            <Checkbox
              checked={enabled}
              disabled={busy}
              onCheckedChange={(checked) => setEnabled(Boolean(checked))}
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
interface AuditEntry {
  id: string;
  actor_name?: string;
  action: string;
  target_id?: string;
  created_at: string;
}

function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ entries: AuditEntry[] }>("/audit");
      setEntries(data.entries);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
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
        <div className="bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <Table>
            <TableHeader className="bg-[#fcfcfd]">
              <TableRow className="border-b border-[var(--border,#e9eaf0)]">
                {[
                  "Thời gian",
                  "Người thực hiện",
                  "Hoạt động",
                  "Mã đối tượng",
                ].map((label) => (
                  <TableHead
                    key={label}
                    className="p-[12px_14px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap"
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  className="border-b border-[#f2f1f5] hover:bg-[#faf9fc]"
                  key={entry.id}
                >
                  <TableCell className="p-[12px_14px] text-[11px] whitespace-nowrap text-[#555064]">
                    {dateLabel(entry.created_at)}
                  </TableCell>
                  <TableCell className="p-[12px_14px] text-[11px] font-medium text-[#1f1b2d]">
                    {entry.actor_name || "Hệ thống"}
                  </TableCell>
                  <TableCell className="p-[12px_14px] text-[11px] text-[#555064]">
                    {(auditActions as Record<string, string>)[entry.action] ||
                      entry.action}
                  </TableCell>
                  <TableCell className="p-[12px_14px] text-[11px] text-[#757185] break-words">
                    {entry.target_id || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

export function Settings({
  state,
  mutate,
  busy,
}: {
  state: AppState & { user: LiveUser };
  mutate: (
    path: string,
    method?: string,
    body?: unknown,
    message?: string,
  ) => Promise<unknown>;
  busy: boolean;
}) {
  const [_message, _setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function profile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await mutate(
      "/account/profile",
      "PUT",
      Object.fromEntries(new FormData(e.currentTarget)),
      "Đã lưu hồ sơ.",
    );
  }

  async function password(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(API_ROUTES.account.password, "POST", values);
      location.assign("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
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
          <div className="flex flex-col gap-1.5 min-w-0">
            <Label htmlFor="profile-name">Họ và tên</Label>
            <Input
              id="profile-name"
              name="name"
              defaultValue={state.user.name}
              required
              maxLength={100}
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <Label htmlFor="profile-job">Chức danh</Label>
            <Input
              id="profile-job"
              name="job"
              defaultValue={state.user.job}
              maxLength={150}
            />
          </div>
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
          <div className="flex flex-col gap-1.5 min-w-0">
            <Label htmlFor="current-pwd">Mật khẩu hiện tại</Label>
            <Input
              id="current-pwd"
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <Label htmlFor="new-pwd">Mật khẩu mới</Label>
            <Input
              id="new-pwd"
              type="password"
              name="newPassword"
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
            />
          </div>
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
            <Button disabled={saving || busy}>
              {saving ? "Đang cập nhật…" : "Đổi mật khẩu"}
            </Button>
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
