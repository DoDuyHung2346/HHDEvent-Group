import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validatePhone } from "@/lib/booking/validate";

const CreateSessionSchema = z.object({
  phone: z.string().trim().max(20),
  title: z.string().trim().max(120).optional(),
  id: z.string().uuid().optional(),
});

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
}

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "Cần số điện thoại." }, { status: 400 });
  const normalized = normalizePhone(phone);
  if (validatePhone(normalized)) return NextResponse.json({ error: "Số điện thoại không hợp lệ." }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, phone, name, memory, created_at, updated_at")
    .eq("phone", normalized)
    .maybeSingle();
  if (customerError) return NextResponse.json({ error: "Không thể tải hồ sơ khách hàng." }, { status: 500 });
  if (!customer) return NextResponse.json({ customer: null, sessions: [] });

  const { data: sessionRows, error: sessionsError } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("customer_id", customer.id)
    .order("updated_at", { ascending: false });
  if (sessionsError) return NextResponse.json({ error: "Không thể tải lịch sử chat." }, { status: 500 });

  const sessionIds = (sessionRows ?? []).map((session) => session.id);
  const { data: messages, error: messagesError } = sessionIds.length
    ? await supabase
        .from("chat_messages")
        .select("id, session_id, role, content, message_type, created_at")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };
  if (messagesError) return NextResponse.json({ error: "Không thể tải tin nhắn." }, { status: 500 });

  const sessions = (sessionRows ?? []).map((session) => ({
    id: session.id,
    customerPhone: customer.phone,
    startedAt: session.created_at,
    lastMessageAt: session.updated_at,
    summary: session.title ?? undefined,
    messages: (messages ?? [])
      .filter((message) => message.session_id === session.id)
      .map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.created_at,
        messageType: message.message_type,
      })),
  }));

  return NextResponse.json({ customer, sessions });
}

export async function POST(request: NextRequest) {
  const parsed = CreateSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu phiên chat không hợp lệ." }, { status: 400 });
  const phone = normalizePhone(parsed.data.phone);
  const phoneError = validatePhone(phone);
  if (phoneError) return NextResponse.json({ error: phoneError }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert({ phone, updated_at: new Date().toISOString() }, { onConflict: "phone" })
    .select("id")
    .single();
  if (customerError || !customer) return NextResponse.json({ error: "Không thể tạo hồ sơ khách hàng." }, { status: 500 });

  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .upsert(
      { id: parsed.data.id, customer_id: customer.id, title: parsed.data.title ?? null, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    )
    .select("id, title, created_at, updated_at")
    .single();
  if (sessionError || !session) return NextResponse.json({ error: "Không thể tạo phiên chat." }, { status: 500 });
  return NextResponse.json({ session: { id: session.id, customerPhone: phone, startedAt: session.created_at, lastMessageAt: session.updated_at, summary: session.title ?? undefined, messages: [] } }, { status: 201 });
}
