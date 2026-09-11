import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  authenticateWithPassword,
} from "@/features/auth/services/auth-service";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/features/auth/services/jwt-service";

const ACCESS_COOKIE_NAME = "mx_access_token";
const REFRESH_COOKIE_NAME = "mx_refresh_token";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    const { user, accessToken, refreshToken } = await authenticateWithPassword(
      email,
      password,
    );

    const isSecure = req.nextUrl.protocol === "https:";
    const cookieStore = await cookies();

    // Set Access Token (15m)
    cookieStore.set({
      name: ACCESS_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    // Set Refresh Token (7d)
    cookieStore.set({
      name: REFRESH_COOKIE_NAME,
      value: refreshToken,
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
      path: "/api/auth",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
