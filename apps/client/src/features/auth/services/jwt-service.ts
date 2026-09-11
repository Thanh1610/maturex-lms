import { jwtVerify, SignJWT } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET environment variable is missing in production!",
    );
  }
  return new TextEncoder().encode(
    secret || "maturex_jwt_secret_key_default_development_change_me",
  );
}

const JWT_SECRET = getJwtSecret();

export interface TokenPayload {
  sub: string; // userId
  email: string;
  name: string;
  role: string;
}

export const ACCESS_TOKEN_EXPIRATION =
  process.env.JWT_ACCESS_EXPIRATION || "15m"; // 15 minutes
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60; // 900 seconds
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.sub || typeof payload.email !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: String(payload.name || ""),
      role: String(payload.role || "learner"),
    };
  } catch {
    return null;
  }
}
