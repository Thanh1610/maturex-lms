import { useEffect, useState } from "react";
import { Badge, Button } from "../ui";
import { api, roleLabels } from "./api";

export function Admin({ mutate, busy }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null),
    [resetUrl, setResetUrl] = useState("");
  async function reset(id) {
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
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [load]);
  async function submit(event) {
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
            <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
              Họ và tên
              <input
                className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                name="name"
                required
                maxLength={100}
                autoComplete="off"
              />
            </label>
            <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
              Email
              <input
                className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="off"
              />
            </label>
          </div>
          <div className="live-two-col grid grid-cols-2 max-[760px]:grid-cols-1 gap-[18px]">
            <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
              Mật khẩu ban đầu
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
            <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
              Vai trò
              <select
                className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
                name="role"
                defaultValue="learner"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
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
          <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
            Gửi riêng cho người sở hữu tài khoản
            <input
              className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px] bg-[#f8f9fb]"
              readOnly
              value={resetUrl}
              onFocus={(e) => e.target.select()}
            />
          </label>
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
        <div className="live-panel live-table-wrap bg-white border border-[var(--border,#e9eaf0)] rounded-[12px] p-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto">
          <table className="live-table w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#fcfcfd] border-b border-[var(--border,#e9eaf0)]">
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Thành viên
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Email
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Vai trò
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Nhóm / trạng thái
                </th>
                <th className="p-[18px_22px] text-[10px] font-medium text-[var(--muted,#757185)] whitespace-nowrap">
                  Quản lý
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  className="border-b border-[var(--border,#e9eaf0)] hover:bg-[#faf9fc]"
                  key={user.id}
                >
                  <td className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    <strong className="text-[#1f1b2d]">{user.name}</strong>
                  </td>
                  <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="p-[18px_22px] text-[11px] whitespace-nowrap">
                    <Badge>{roleLabels[user.role]}</Badge>
                  </td>
                  <td className="p-[18px_22px] text-[11px] text-[#555064] whitespace-nowrap">
                    {user.team || "Chưa phân nhóm"}
                    <br />
                    <small className="text-[9px] text-[var(--muted,#757185)]">
                      {user.active ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                    </small>
                  </td>
                  <td className="p-[18px_22px] text-[11px] whitespace-nowrap">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function UserEditor({ target, users, mutate, busy, onDone }) {
  async function submit(e) {
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
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Họ tên
          <input
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            name="name"
            required
            maxLength={100}
            defaultValue={target.name}
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Chức danh
          <input
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            name="job"
            maxLength={150}
            defaultValue={target.job}
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Nhóm
          <input
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            name="team"
            maxLength={100}
            defaultValue={target.team}
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Quản lý trực tiếp
          <select
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            name="manager_id"
            defaultValue={target.manager_id || ""}
          >
            <option value="">Chưa phân công</option>
            {users
              .filter(
                (u) =>
                  u.id !== target.id &&
                  u.active &&
                  ["manager", "admin"].includes(u.role),
              )
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Vai trò tài khoản
          <select
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            name="role"
            defaultValue={target.role}
          >
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium min-w-0">
          Trạng thái tài khoản
          <select
            className="w-full font-normal border border-[var(--border,#e9eaf0)] rounded-[8px] p-2 text-[12px]"
            name="active"
            defaultValue={target.active ? "1" : "0"}
          >
            <option value="1">Đang hoạt động</option>
            <option value="0">Vô hiệu hóa</option>
          </select>
        </label>
      </div>
      <div className="self-start">
        <Button disabled={busy}>Lưu thay đổi tài khoản</Button>
      </div>
    </form>
  );
}
