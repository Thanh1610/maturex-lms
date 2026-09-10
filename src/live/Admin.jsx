import { useEffect, useState } from "react";
import { Badge, Button } from "../ui.jsx";
import { api, roleLabels } from "./api.js";

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
      <div className="between live-page-heading">
        <div>
          <span className="live-eyebrow">KHÔNG GIAN MATUREX</span>
          <h1>Quản lý tài khoản</h1>
          <p className="muted">
            Cấp tài khoản và vai trò phù hợp cho từng thành viên.
          </p>
        </div>
        <Button icon="Plus" onClick={() => setShow(!show)} disabled={busy}>
          {show ? "Đóng biểu mẫu" : "Thêm tài khoản"}
        </Button>
      </div>
      {show && (
        <form className="live-panel live-form live-editor" onSubmit={submit}>
          <h2>Tài khoản mới</h2>
          <div className="live-two-col">
            <label>
              Họ và tên
              <input name="name" required maxLength={100} autoComplete="off" />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="off"
              />
            </label>
          </div>
          <div className="live-two-col">
            <label>
              Mật khẩu ban đầu
              <input
                type="password"
                name="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
              />
            </label>
            <label>
              Vai trò
              <select name="role" defaultValue="learner">
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <small className="muted">
            Mật khẩu cần ít nhất 12 ký tự. Gửi thông tin đăng nhập cho thành
            viên qua kênh riêng.
          </small>
          <Button type="submit" disabled={busy}>
            {busy ? "Đang tạo…" : "Tạo tài khoản"}
          </Button>
        </form>
      )}
      {resetUrl && (
        <div className="live-panel live-form" style={{ marginBottom: 20 }}>
          <h3>Liên kết đặt lại mật khẩu</h3>
          <label>
            Gửi riêng cho người sở hữu tài khoản
            <input
              readOnly
              value={resetUrl}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <small className="muted">
            Liên kết dùng một lần, hết hạn sau 20 phút.
          </small>
          <Button kind="ghost" onClick={() => setResetUrl("")}>
            Đóng liên kết
          </Button>
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
        <div className="live-error" role="alert">
          {error}
          <Button kind="ghost" onClick={load}>
            Thử lại
          </Button>
        </div>
      )}
      {!users ? (
        <p role="status">Đang tải tài khoản…</p>
      ) : (
        <div className="live-panel live-table-wrap">
          <table className="live-table">
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Nhóm / trạng thái</th>
                <th>Quản lý</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge>{roleLabels[user.role]}</Badge>
                  </td>
                  <td>
                    {user.team || "Chưa phân nhóm"}
                    <br />
                    <small>
                      {user.active ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                    </small>
                  </td>
                  <td>
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
      className="live-panel live-form"
      onSubmit={submit}
      style={{ marginBottom: 20 }}
    >
      <div className="between">
        <h2>Cập nhật: {target.name}</h2>
        <Button type="button" kind="ghost" onClick={onDone}>
          Đóng
        </Button>
      </div>
      <div className="live-two-col">
        <label>
          Họ tên
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={target.name}
          />
        </label>
        <label>
          Chức danh
          <input name="job" maxLength={150} defaultValue={target.job} />
        </label>
        <label>
          Nhóm
          <input name="team" maxLength={100} defaultValue={target.team} />
        </label>
        <label>
          Quản lý trực tiếp
          <select name="manager_id" defaultValue={target.manager_id || ""}>
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
        <label>
          Vai trò tài khoản
          <select name="role" defaultValue={target.role}>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái tài khoản
          <select name="active" defaultValue={target.active ? "1" : "0"}>
            <option value="1">Đang hoạt động</option>
            <option value="0">Vô hiệu hóa</option>
          </select>
        </label>
      </div>
      <Button disabled={busy}>Lưu thay đổi tài khoản</Button>
    </form>
  );
}
