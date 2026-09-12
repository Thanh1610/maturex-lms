import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@maturex/database";
import { verifyAccessToken } from "@/features/auth/services/jwt-service";

const ACCESS_COOKIE_NAME = "mx_access_token";

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.active) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
