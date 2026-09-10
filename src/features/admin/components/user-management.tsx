import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { api, roleLabels } from "@/lib/api-client";

export function UserManagement({
  mutate,
  busy,
}: {
  mutate: any;
  busy: boolean;
}) {
  const [users, setUsers] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [resetUrl, setResetUrl] = useState("");

  async function reset(id: string) {
    setError("");
    const result = await mutate(
      `/users/${id}/reset`,
      "POST",
      {},
      "Đã tạo liên kết đặt lại mật khẩu, có hiệu lực 20 phút.",
    );
    if (result) setResetUrl(`${location.origin}/#reset/${result.token}`);
  }

  async function load() {
    try {
      setUsers((await api("/users")).users);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: any) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = await mutate(
      "/users",
      "POST",
      Object.fromEntries(new FormData(form)),
      "Đã tạo tài khoản.",
    );
    if (result) {
      form.reset();
      setShow(false);
      await load();
    }
  }

  return (
    <>
      <div className="between live-page-heading flex items-center justify-between gap-4 mb-7">
        <div>
          <span className="live-eyebrow block text-[10px] uppercase tracking-[2px] font-semibold text-[#8b7ba8] mb-1">
            KHÔNG GIAN MATUREX
          </span>
          <h1 className="text-[28px] max-[760px]:text-[24px] font-bold text-[#1f1b2d] my-1 tracking-tight">
            Quản lý tài khoản
          </h1>
          <p className="muted text-[11px] text-[var(--muted,#757185)]">
            Cấp tài khoản và vai trò phù hợp cho từng thành viên.
          </p>
        </div>
        <Button icon="Plus" onClick={() => setShow(!show)} disabled={busy}>
          {show ? "Đóng biểu mẫu" : "Thêm tài khoản"}
        </Button>
      </div>

      {show && (
        <form
          className="live-panel live-form live-editor bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px] mb-[25px]"
          onSubmit={submit}
        >
          <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-0">
            Tài khoản mới
          </h2>
          <div className="live-two-col grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="create-name">Họ và tên</Label>
              <Input
                id="create-name"
                name="name"
                required
                maxLength={100}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="live-two-col grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="create-password">Mật khẩu ban đầu</Label>
              <Input
                id="create-password"
                type="password"
                name="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="create-role">Vai trò</Label>
              <select
                id="create-role"
                className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px] bg-white"
                name="role"
                defaultValue="learner"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <small className="muted text-[9px] text-[var(--muted,#757185)] leading-relaxed">
            Mật khẩu cần ít nhất 12 ký tự. Gửi thông tin đăng nhập cho thành
            viên qua kênh riêng.
          </small>
          <div className="self-start">
            <Button type="submit" disabled={busy}>
              {busy ? "Đang tạo…" : "Tạo tài khoản"}
            </Button>
          </div>
        </form>
      )}

      {resetUrl && (
        <div className="live-panel live-form bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px] mb-5">
          <h3 className="text-[15px] font-bold text-[#1f1b2d] mb-0">
            Liên kết đặt lại mật khẩu
          </h3>
          <div className="flex flex-col gap-1.5 min-w-0">
            <Label htmlFor="reset-url-input">
              Gửi riêng cho người sở hữu tài khoản
            </Label>
            <Input
              id="reset-url-input"
              readOnly
              value={resetUrl}
              onFocus={(e) => e.target.select()}
              className="bg-[#f8f9fb]"
            />
          </div>
          <small className="muted text-[9px] text-[var(--muted,#757185)]">
            Liên kết dùng một lần, hết hạn sau 20 phút.
          </small>
          <div className="self-start">
            <Button kind="ghost" onClick={() => setResetUrl("")}>
              Đóng liên kết
            </Button>
          </div>
        </div>
      )}

      {editing && (
        <UserEditor
          key={editing.id}
          target={editing}
          users={users}
          mutate={mutate}
          busy={busy}
          onDone={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}

      {error && (
        <div
          className="live-error bg-[#fcf0ef] text-[#9c4545] p-[15px_18px] border border-[#efd3d0] rounded-[9px] mb-[18px] leading-[1.8] flex items-center justify-between"
          role="alert"
        >
          <span>{error}</span>
          <Button kind="ghost" onClick={load}>
            Thử lại
          </Button>
        </div>
      )}

      {!users ? (
        <p className="text-[12px] text-[var(--muted,#757185)]" role="status">
          Đang tải tài khoản…
        </p>
      ) : (
        <div className="bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <Table>
            <TableHeader className="bg-[#fcfcfd]">
              <TableRow className="border-b border-[var(--border,#e9eaf0)]">
                <TableHead className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Thành viên
                </TableHead>
                <TableHead className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Email
                </TableHead>
                <TableHead className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Vai trò
                </TableHead>
                <TableHead className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Nhóm / trạng thái
                </TableHead>
                <TableHead className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Quản lý
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  className="border-b border-[var(--border,#e9eaf0)] hover:bg-[#faf9fc]"
                  key={user.id}
                >
                  <TableCell className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    <strong className="text-[#1f1b2d]">{user.name}</strong>
                  </TableCell>
                  <TableCell className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                    {user.email}
                  </TableCell>
                  <TableCell className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    <Badge>{roleLabels[user.role]}</Badge>
                  </TableCell>
                  <TableCell className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                    {user.team || "Chưa phân nhóm"}
                    <br />
                    <small className="text-[9px] text-[var(--muted,#757185)]">
                      {user.active ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                    </small>
                  </TableCell>
                  <TableCell className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Button
                        kind="ghost"
                        onClick={() => setEditing(user)}
                        disabled={busy}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        kind="ghost"
                        disabled={busy || !user.active}
                        onClick={() => reset(user.id)}
                      >
                        Đặt lại mật khẩu
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function UserEditor({
  target,
  users,
  mutate,
  busy,
  onDone,
}: {
  target: any;
  users: any;
  mutate: any;
  busy: boolean;
  onDone: () => Promise<void>;
}) {
  async function submit(e: any) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const result = await mutate(
      `/users/${target.id}`,
      "PATCH",
      {
        ...values,
        active: values.active === "1",
        manager_id: values.manager_id || null,
      },
      "Đã cập nhật tài khoản và quyền truy cập.",
    );
    if (result) onDone();
  }

  return (
    <form
      className="live-panel live-form bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-[25px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-[18px] mb-5"
      onSubmit={submit}
    >
      <div className="between flex items-center justify-between gap-4">
        <h2 className="text-[18px] font-bold text-[#1f1b2d] mb-0">
          Cập nhật: {target.name}
        </h2>
        <Button type="button" kind="ghost" onClick={onDone}>
          Đóng
        </Button>
      </div>
      <div className="live-two-col grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
        <div className="flex flex-col gap-1.5 min-w-0">
          <Label htmlFor="edit-name">Họ tên</Label>
          <Input
            id="edit-name"
            name="name"
            required
            maxLength={100}
            defaultValue={target.name}
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <Label htmlFor="edit-job">Chức danh</Label>
          <Input
            id="edit-job"
            name="job"
            maxLength={150}
            defaultValue={target.job}
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <Label htmlFor="edit-team">Nhóm</Label>
          <Input
            id="edit-team"
            name="team"
            maxLength={100}
            defaultValue={target.team}
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <Label htmlFor="edit-manager">Quản lý trực tiếp</Label>
          <select
            id="edit-manager"
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px] bg-white"
            name="manager_id"
            defaultValue={target.manager_id || ""}
          >
            <option value="">Chưa phân công</option>
            {users
              ?.filter(
                (u: any) =>
                  u.id !== target.id &&
                  u.active &&
                  ["manager", "admin"].includes(u.role),
              )
              .map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <Label htmlFor="edit-role">Vai trò tài khoản</Label>
          <select
            id="edit-role"
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px] bg-white"
            name="role"
            defaultValue={target.role}
          >
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <Label htmlFor="edit-active">Trạng thái tài khoản</Label>
          <select
            id="edit-active"
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px] bg-white"
            name="active"
            defaultValue={target.active ? "1" : "0"}
          >
            <option value="1">Đang hoạt động</option>
            <option value="0">Vô hiệu hóa</option>
          </select>
        </div>
      </div>
      <div className="self-start">
        <Button disabled={busy}>Lưu thay đổi tài khoản</Button>
      </div>
    </form>
  );
}
