import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sanitizeUser } from "@/features/auth/services/auth-service";
import { verifyAccessToken } from "@/features/auth/services/jwt-service";
import { prisma } from "@/lib/prisma";

const ACCESS_COOKIE_NAME = "mx_access_token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify user is still active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user?.active) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: sanitizeUser(user) }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
