import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession, createAdminSession, isValidAdminCredential } from "@/lib/auth/adminSession.server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  if (typeof body?.email !== "string" || typeof body?.password !== "string") {
    return NextResponse.json({ error: "Thông tin đăng nhập không hợp lệ." }, { status: 400 });
  }
  if (!isValidAdminCredential(body.email, body.password)) {
    return NextResponse.json({ error: "Tài khoản hoặc mật khẩu quản trị không chính xác." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return new NextResponse(null, { status: 204 });
}
