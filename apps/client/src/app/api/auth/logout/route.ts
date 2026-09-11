import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { invalidateSession } from "@/features/auth/services/auth-service";

const ACCESS_COOKIE_NAME = "mx_access_token";
const REFRESH_COOKIE_NAME = "mx_refresh_token";

export async function POST(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    if (refreshToken) {
      await invalidateSession(refreshToken);
    }

    cookieStore.delete(ACCESS_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
