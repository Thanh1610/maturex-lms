import {
  randomBytes,
  randomUUID,
  createHash,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const scryptOptions = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const lifetime = 8 * 60 * 60;
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function check(condition, status, message) {
  if (!condition) throw new HttpError(status, message);
}
export function textField(value, name, max = 5000, min = 1) {
  check(
    typeof value === "string" &&
      value.trim().length >= min &&
      value.trim().length <= max,
    400,
    `${name} cần từ ${min} đến ${max} ký tự.`,
  );
  return value.trim();
}
export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.management && user.role === "learner" ? "manager" : user.role,
    active: user.active !== 0,
    team: user.team || "",
    job: user.job || "",
    manager_id: user.manager_id || null,
  };
}
export async function hashPassword(password) {
  check(
    typeof password === "string" &&
      password.length >= 12 &&
      password.length <= 128,
    400,
    "Mật khẩu cần từ 12 đến 128 ký tự.",
  );
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64, scryptOptions);
  return `${salt}:${key.toString("hex")}`;
}
export async function prepareUser(body) {
  const name = textField(body.name, "Họ tên", 100);
  const email = textField(body.email, "Email", 254).toLowerCase();
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 400, "Email không hợp lệ.");
  check(
    ["admin", "instructor", "learner", "manager"].includes(body.role),
    400,
    "Vai trò không hợp lệ.",
  );
  check(
    typeof body.password === "string" &&
      body.password.length >= 12 &&
      body.password.length <= 128,
    400,
    "Mật khẩu cần từ 12 đến 128 ký tự.",
  );
  const salt = randomBytes(16).toString("hex");
  const key = await derive(body.password, salt, 64, scryptOptions);
  return {
    id: randomUUID(),
    name,
    email,
    role: body.role === "manager" ? "learner" : body.role,
    management: body.role === "manager" ? 1 : 0,
    password_hash: `${salt}:${key.toString("hex")}`,
  };
}
export function insertUser(db, user) {
  check(
    !db.prepare("SELECT id FROM users WHERE email=?").get(user.email),
    409,
    "Email đã được sử dụng.",
  );
  db.prepare(
    "INSERT INTO users (id,name,email,role,password_hash,created_at,management) VALUES (?,?,?,?,?,?,?)",
  ).run(
    user.id,
    user.name,
    user.email,
    user.role,
    user.password_hash,
    new Date().toISOString(),
    user.management || 0,
  );
  return publicUser(user);
}
export async function verifyPassword(password, stored) {
  if (typeof password !== "string" || password.length > 128) return false;
  // Also derive for unknown accounts, keeping the login error and work consistent.
  const [salt, hash] = (stored || `${"0".repeat(32)}:${"0".repeat(128)}`).split(
    ":",
  );
  const key = await derive(password, salt, 64, scryptOptions);
  return timingSafeEqual(key, Buffer.from(hash, "hex")) && Boolean(stored);
}
const tokenHash = (value) => createHash("sha256").update(value).digest("hex");
function token(req) {
  return (
    (req.headers.cookie || "")
      .split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith("mx_session="))
      ?.slice(11) || ""
  );
}
function cookie(value, secure, age) {
  return `mx_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure ? "; Secure" : ""}`;
}
export function startSession(db, req, res, userId, secure) {
  db.prepare("DELETE FROM sessions WHERE token_hash=? OR expires_at<=?").run(
    tokenHash(token(req)),
    Date.now(),
  );
  const raw = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions VALUES (?,?,?)").run(
    tokenHash(raw),
    userId,
    Date.now() + lifetime * 1000,
  );
  res.setHeader("Set-Cookie", cookie(raw, secure, lifetime));
}
export function endSession(db, req, res, secure) {
  db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
    tokenHash(token(req)),
  );
  res.setHeader("Set-Cookie", cookie("", secure, 0));
}
export function authenticate(db, req) {
  const user = db
    .prepare(
      "SELECT u.* FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1",
    )
    .get(tokenHash(token(req)), Date.now());
  check(user, 401, "Vui lòng đăng nhập để tiếp tục.");
  return publicUser(user);
}
