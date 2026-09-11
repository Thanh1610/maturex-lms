import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  signAccessToken,
  type TokenPayload,
} from "./jwt-service";

const scryptOptions = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function checkAuth(
  condition: unknown,
  status: number,
  message: string,
): asserts condition {
  if (!condition) {
    throw new AuthError(status, message);
  }
}

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "instructor" | "learner";
  active: boolean;
  team: string;
  job: string;
  manager_id: string | null;
}

export function sanitizeUser(user: User): SanitizedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    team: user.team,
    job: user.job,
    manager_id: user.managerId,
  };
}

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, scryptOptions, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  checkAuth(
    typeof password === "string" &&
      password.length >= 8 &&
      password.length <= 128,
    400,
    "Mật khẩu cần từ 8 đến 128 ký tự.",
  );
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(
  password: unknown,
  stored?: string,
): Promise<boolean> {
  if (typeof password !== "string" || password.length > 128) return false;
  const [salt, hash] = (stored || `${"0".repeat(32)}:${"0".repeat(128)}`).split(
    ":",
  );
  if (!salt || !hash) return false;
  const key = await deriveKey(password, salt);
  return timingSafeEqual(key, Buffer.from(hash, "hex")) && Boolean(stored);
}

export const hashToken = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

/**
 * Issue new Access Token (JWT Stateless) and Refresh Token (Prisma DB)
 */
export async function issueTokens(user: User): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const tokenPayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const accessToken = await signAccessToken(tokenPayload);

  // Generate 32-byte secure random refresh token
  const rawRefreshToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

/**
 * Authenticate with email and password
 */
export async function authenticateWithPassword(
  emailInput: string,
  passwordInput: string,
): Promise<{
  user: SanitizedUser;
  accessToken: string;
  refreshToken: string;
}> {
  const email = emailInput?.trim().toLowerCase();
  checkAuth(email, 400, "Vui lòng nhập email.");

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const passwordValid = await verifyPassword(passwordInput, user?.passwordHash);
  checkAuth(
    user?.active && passwordValid,
    401,
    "Email hoặc mật khẩu không đúng.",
  );

  const tokens = await issueTokens(user);
  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * Rotate Refresh Token & issue a fresh Access Token
 */
export async function refreshSession(rawRefreshToken?: string): Promise<{
  user: SanitizedUser;
  accessToken: string;
  refreshToken: string;
}> {
  checkAuth(rawRefreshToken, 401, "Thiếu refresh token.");
  const tokenHash = hashToken(rawRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt.getTime() <= Date.now()) {
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { tokenHash } });
    }
    throw new AuthError(401, "Phiên đăng nhập đã hết hạn.");
  }

  checkAuth(storedToken.user.active, 401, "Tài khoản đã bị vô hiệu hóa.");

  // Token rotation: delete old refresh token, issue new pair
  await prisma.refreshToken.delete({ where: { tokenHash } });
  const tokens = await issueTokens(storedToken.user);

  return {
    user: sanitizeUser(storedToken.user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * Revoke refresh token on logout
 */
export async function invalidateSession(
  rawRefreshToken?: string,
): Promise<void> {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.deleteMany({
    where: { tokenHash },
  });
}
