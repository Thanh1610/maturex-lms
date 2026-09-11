import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { invalidateSession } from "@/features/auth/services/auth-service";

const ACCESS_COOKIE_NAME = "mx_access_token";
const REFRESH_COOKIE_NAME = "mx_refresh_token";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    if (refreshToken) {
      await invalidateSession(refreshToken);
    }

    // Delete both cookies
    cookieStore.delete(ACCESS_COOKIE_NAME);
    cookieStore.set({
      name: REFRESH_COOKIE_NAME,
      value: "",
      path: "/api/auth",
      maxAge: 0,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
