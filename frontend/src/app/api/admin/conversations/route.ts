import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth/adminSession.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CustomerRow = { id: string; name: string | null; phone: string };
type SessionRow = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  customer: CustomerRow | CustomerRow[] | null;
};
type MessageRow = { id: string; session_id: string; role: "user" | "assistant"; content: string; message_type: string; created_at: string };

/** Admin-only inbox. Never expose one customer's chat history to another customer. */
export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Không có quyền xem hội thoại." }, { status: 403 });
  }

  const supabase = createServerSupabaseClient();
  const { data: rawSessions, error: sessionsError } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at, customer:customers!inner(id, name, phone)")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (sessionsError) return NextResponse.json({ error: "Không thể tải danh sách hội thoại." }, { status: 500 });

  const sessions = (rawSessions ?? []) as unknown as SessionRow[];
  const ids = sessions.map((session) => session.id);
  const { data: rawMessages, error: messagesError } = ids.length
    ? await supabase
        .from("chat_messages")
        .select("id, session_id, role, content, message_type, created_at")
        .in("session_id", ids)
        .order("created_at", { ascending: true })
    : { data: [], error: null };
  if (messagesError) return NextResponse.json({ error: "Không thể tải nội dung hội thoại." }, { status: 500 });

  const messages = (rawMessages ?? []) as MessageRow[];
  const conversations = sessions.map((session) => {
      const customer = Array.isArray(session.customer) ? session.customer[0] : session.customer;
      return {
        id: session.id,
        title: session.title,
        startedAt: session.created_at,
        updatedAt: session.updated_at,
        customer: { name: customer?.name || "Khách hàng", phone: customer?.phone || "" },
        messages: messages
          .filter((message) => message.session_id === session.id)
          .map((message) => ({ id: message.id, role: message.role, content: message.content, type: message.message_type, createdAt: message.created_at })),
      };
    })
    // Một session có thể được tạo khi khách vừa mở chatbot. Hộp thư quản trị
    // chỉ hiển thị cuộc hội thoại đã thật sự có tin nhắn, tránh các dòng
    // "Khách hàng / Chưa có tin nhắn" gây nhiễu.
    .filter((conversation) => conversation.messages.length > 0);

  return NextResponse.json({ conversations });
}
