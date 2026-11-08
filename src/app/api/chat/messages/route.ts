import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MessageSchema = z.object({
  sessionId: z.string().uuid(),
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(5000),
  messageType: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = MessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tin nhắn không hợp lệ." }, { status: 400 });
  const input = parsed.data;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ session_id: input.sessionId, role: input.role, content: input.content, message_type: input.messageType ?? "text" })
    .select("id, created_at")
    .single();
  if (error || !data) return NextResponse.json({ error: "Không thể lưu tin nhắn." }, { status: 500 });
  await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", input.sessionId);
  return NextResponse.json({ id: data.id, timestamp: data.created_at }, { status: 201 });
}
