import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { AppDatabase } from "./database";

const scryptOptions = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const lifetime = 8 * 60 * 60;

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, scryptOptions, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function check(
  condition: unknown,
  status: number,
  message: string,
): asserts condition {
  if (!condition) {
    throw new HttpError(status, message);
  }
}

export function textField(
  value: unknown,
  name: string,
  max = 5000,
  min = 1,
): string {
  check(
    typeof value === "string" &&
      value.trim().length >= min &&
      value.trim().length <= max,
    400,
    `${name} cần từ ${min} đến ${max} ký tự.`,
  );
  return value.trim();
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  active?: number;
  team?: string;
  job?: string;
  manager_id?: string | null;
  management?: number;
  password_hash?: string;
  created_at?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  team: string;
  job: string;
  manager_id: string | null;
}

export type AuthUser = PublicUser;

export function publicUser(user: UserRow): PublicUser {
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

export async function hashPassword(password: string): Promise<string> {
  check(
    typeof password === "string" &&
      password.length >= 12 &&
      password.length <= 128,
    400,
    "Mật khẩu cần từ 12 đến 128 ký tự.",
  );
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export async function prepareUser(body: Record<string, unknown>): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  management: number;
  password_hash: string;
}> {
  const name = textField(body.name, "Họ tên", 100);
  const email = textField(body.email, "Email", 254).toLowerCase();
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 400, "Email không hợp lệ.");
  const role = String(body.role || "");
  check(
    ["admin", "instructor", "learner", "manager"].includes(role),
    400,
    "Vai trò không hợp lệ.",
  );
  const password = String(body.password || "");
  check(
    password.length >= 12 && password.length <= 128,
    400,
    "Mật khẩu cần từ 12 đến 128 ký tự.",
  );
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt);
  return {
    id: randomUUID(),
    name,
    email,
    role: role === "manager" ? "learner" : role,
    management: role === "manager" ? 1 : 0,
    password_hash: `${salt}:${key.toString("hex")}`,
  };
}

export function insertUser(
  db: AppDatabase,
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    management: number;
    password_hash: string;
  },
): PublicUser {
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

export async function verifyPassword(
  password: unknown,
  stored?: string,
): Promise<boolean> {
  if (typeof password !== "string" || password.length > 128) return false;
  const [salt, hash] = (stored || `${"0".repeat(32)}:${"0".repeat(128)}`).split(
    ":",
  );
  const key = await deriveKey(password, salt);
  return timingSafeEqual(key, Buffer.from(hash, "hex")) && Boolean(stored);
}

const tokenHash = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

function token(req: IncomingMessage): string {
  return (
    (req.headers.cookie || "")
      .split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith("mx_session="))
      ?.slice(11) || ""
  );
}

function cookie(value: string, secure: boolean, age: number): string {
  return `mx_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure ? "; Secure" : ""}`;
}

export function startSession(
  db: AppDatabase,
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
  secure: boolean,
): void {
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

export function endSession(
  db: AppDatabase,
  req: IncomingMessage,
  res: ServerResponse,
  secure: boolean,
): void {
  db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
    tokenHash(token(req)),
  );
  res.setHeader("Set-Cookie", cookie("", secure, 0));
}

export function authenticate(db: AppDatabase, req: IncomingMessage): PublicUser {
  const user = db
    .prepare(
      "SELECT u.* FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1",
    )
    .get(tokenHash(token(req)), Date.now()) as unknown as UserRow | undefined;
  check(user, 401, "Vui lòng đăng nhập để tiếp tục.");
  return publicUser(user);
}
