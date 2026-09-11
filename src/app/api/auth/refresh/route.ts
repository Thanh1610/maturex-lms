import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  refreshSession,
} from "@/features/auth/services/auth-service";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/features/auth/services/jwt-service";

const ACCESS_COOKIE_NAME = "mx_access_token";
const REFRESH_COOKIE_NAME = "mx_refresh_token";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const rawRefreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    const { user, accessToken, refreshToken } =
      await refreshSession(rawRefreshToken);

    const isSecure = req.nextUrl.protocol === "https:";

    // Set new Access Token
    cookieStore.set({
      name: ACCESS_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    // Set rotated Refresh Token
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
