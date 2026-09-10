import { randomBytes, randomUUID, createHash } from "node:crypto";
import {
  check,
  textField,
  publicUser,
  hashPassword,
  verifyPassword,
  authenticate,
} from "./auth.js";
import { transaction } from "./database.js";
const digest = (value) => createHash("sha256").update(value).digest("hex");
export function audit(db, actor, action, target) {
  db.prepare("INSERT INTO audit_log VALUES (?,?,?,?,?)").run(
    randomUUID(),
    actor || null,
    action,
    target || null,
    new Date().toISOString(),
  );
}
function resetLink(db, userId) {
  const token = randomBytes(32).toString("hex");
  db.prepare("DELETE FROM password_resets WHERE user_id=? OR expires_at<?").run(
    userId,
    Date.now(),
  );
  db.prepare("INSERT INTO password_resets VALUES (?,?,?,NULL)").run(
    digest(token),
    userId,
    Date.now() + 20 * 60 * 1000,
  );
  return token;
}
export async function handlePublicAccounts({
  db,
  path,
  method,
  body,
  integrations,
  origin,
}) {
  if (method !== "POST") return null;
  if (path === "/api/password/forgot") {
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const user = db
      .prepare("SELECT id FROM users WHERE email=? AND active=1")
      .get(email);
    if (user && integrations?.status().smtp.configured) {
      const token = resetLink(db, user.id);
      await integrations.enqueueEmail({
        to: email,
        subject: "Đặt lại mật khẩu MatureX LMS",
        text: `Mở ${origin}/#reset/${token} để đặt mật khẩu mới. Liên kết có hiệu lực 20 phút.`,
        key: "reset-" + digest(token),
      });
    }
    return {
      status: 200,
      data: {
        message:
          "Nếu tài khoản đang hoạt động và email đã được kết nối, hướng dẫn đặt lại mật khẩu sẽ được gửi. Bạn cũng có thể liên hệ quản trị viên.",
      },
    };
  }
  if (path === "/api/password/reset") {
    check(
      typeof body.token === "string" && /^[a-f0-9]{64}$/.test(body.token),
      400,
      "Liên kết không hợp lệ hoặc đã hết hạn.",
    );
    const tokenHash = digest(body.token);
    const hashed = await hashPassword(body.password);
    transaction(db, () => {
      const reset = db
        .prepare(
          "SELECT r.* FROM password_resets r JOIN users u ON u.id=r.user_id WHERE token_hash=? AND used_at IS NULL AND expires_at>? AND u.active=1",
        )
        .get(tokenHash, Date.now());
      check(reset, 400, "Liên kết không hợp lệ hoặc đã hết hạn.");
      db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(
        hashed,
        reset.user_id,
      );
      db.prepare("UPDATE password_resets SET used_at=? WHERE token_hash=?").run(
        Date.now(),
        tokenHash,
      );
      db.prepare("DELETE FROM sessions WHERE user_id=?").run(reset.user_id);
      audit(db, reset.user_id, "password.reset", reset.user_id);
    });
    return { status: 200, data: { ok: true } };
  }
  return null;
}
export async function handleAccounts({ db, user, path, method, body, req }) {
  if (path === "/api/account/preferences" && ["GET", "PUT"].includes(method)) {
    if (method === "PUT") {
      check(
        typeof body?.email_notifications === "boolean",
        400,
        "Tùy chọn thông báo email phải là bật hoặc tắt.",
      );
      db.prepare(
        "INSERT INTO user_preferences (user_id,email_notifications) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET email_notifications=excluded.email_notifications",
      ).run(user.id, body.email_notifications ? 1 : 0);
    }
    const row = db
      .prepare(
        "SELECT email_notifications FROM user_preferences WHERE user_id=?",
      )
      .get(user.id);
    return {
      status: 200,
      data: {
        preferences: {
          email_notifications: row ? row.email_notifications === 1 : true,
        },
      },
    };
  }
  if (path === "/api/account/profile" && method === "PUT") {
    const name = textField(body.name, "Họ tên", 100),
      job = textField(body.job ?? "", "Chức danh", 150, 0);
    db.prepare("UPDATE users SET name=?,job=? WHERE id=?").run(
      name,
      job,
      user.id,
    );
    return {
      status: 200,
      data: {
        user: publicUser(
          db.prepare("SELECT * FROM users WHERE id=?").get(user.id),
        ),
      },
    };
  }
  if (path === "/api/account/password" && method === "POST") {
    const record = db.prepare("SELECT * FROM users WHERE id=?").get(user.id);
    check(
      await verifyPassword(body.currentPassword, record.password_hash),
      400,
      "Mật khẩu hiện tại không đúng.",
    );
    const hashed = await hashPassword(body.newPassword);
    transaction(db, () => {
      check(req?.headers, 401, "Vui lòng đăng nhập để tiếp tục.");
      check(
        authenticate(db, req).id === user.id,
        401,
        "Phiên đăng nhập đã thay đổi. Hãy đăng nhập lại.",
      );
      const current = db
        .prepare("SELECT active,password_hash FROM users WHERE id=?")
        .get(user.id);
      check(current?.active === 1, 401, "Tài khoản không còn hoạt động.");
      check(
        current.password_hash === record.password_hash,
        409,
        "Mật khẩu đã thay đổi, hãy thử lại.",
      );
      db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(
        hashed,
        user.id,
      );
      db.prepare("DELETE FROM sessions WHERE user_id=?").run(user.id);
      db.prepare("DELETE FROM password_resets WHERE user_id=?").run(user.id);
      audit(db, user.id, "password.change", user.id);
    });
    return { status: 200, data: { ok: true, reauthenticate: true } };
  }
  let match = path.match(/^\/api\/users\/([^/]+)(\/reset)?$/);
  if (match && ["PATCH", "POST"].includes(method)) {
    check(user.role === "admin", 403, "Chỉ quản trị được quản lý tài khoản.");
    const target = db.prepare("SELECT * FROM users WHERE id=?").get(match[1]);
    check(target, 404, "Không tìm thấy tài khoản.");
    if (match[2] && method === "POST") {
      check(
        target.active === 1,
        409,
        "Hãy kích hoạt tài khoản trước khi đặt lại mật khẩu.",
      );
      const token = resetLink(db, target.id);
      audit(db, user.id, "password.reset_link", target.id);
      return { status: 200, data: { token, expiresInMinutes: 20 } };
    }
    if (!match[2] && method === "PATCH") {
      const name = textField(body.name, "Họ tên", 100);
      const team = textField(body.team ?? "", "Nhóm", 100, 0),
        job = textField(body.job ?? "", "Chức danh", 150, 0);
      check(
        ["admin", "instructor", "learner", "manager"].includes(body.role),
        400,
        "Vai trò không hợp lệ.",
      );
      check(
        typeof body.active === "boolean",
        400,
        "Trạng thái tài khoản không hợp lệ.",
      );
      check(
        target.id !== user.id || (body.active && body.role === "admin"),
        409,
        "Không thể tự tắt hoặc bỏ quyền quản trị của mình.",
      );
      const manager = body.manager_id || null;
      if (manager) {
        const m = db
          .prepare("SELECT * FROM users WHERE id=? AND active=1")
          .get(manager);
        check(
          m && m.id !== target.id && (m.management || m.role === "admin"),
          400,
          "Người quản lý không hợp lệ.",
        );
      }
      transaction(db, () => {
        db.prepare(
          "UPDATE users SET name=?,team=?,job=?,manager_id=?,role=?,management=?,active=? WHERE id=?",
        ).run(
          name,
          team,
          job,
          manager,
          body.role === "manager" ? "learner" : body.role,
          body.role === "manager" ? 1 : 0,
          body.active ? 1 : 0,
          target.id,
        );
        // Revoke sessions on any administrative role/scope change.
        db.prepare("DELETE FROM sessions WHERE user_id=?").run(target.id);
        audit(db, user.id, "user.update", target.id);
      });
      return {
        status: 200,
        data: {
          user: publicUser(
            db.prepare("SELECT * FROM users WHERE id=?").get(target.id),
          ),
        },
      };
    }
  }
  if (path === "/api/audit" && method === "GET") {
    check(user.role === "admin", 403, "Chỉ quản trị được xem nhật ký.");
    return {
      status: 200,
      data: {
        entries: db
          .prepare(
            "SELECT a.*,u.name AS actor_name FROM audit_log a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 200",
          )
          .all(),
      },
    };
  }
  return null;
}
