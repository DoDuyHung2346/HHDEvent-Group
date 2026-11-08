import type { ChatSession, Customer, SessionMessage } from "@/lib/schemas";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, init);
  if (!response.ok) throw new Error("Không thể đồng bộ dữ liệu với hệ thống.");
  return response.json();
}

export function canSyncSession(id: string) {
  return UUID_RE.test(id);
}

export async function syncRemoteCustomer(customer: Customer) {
  await request("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: customer.phone,
      name: customer.name,
      memory: {
        preferredEventType: customer.preferredEventType,
        budgetMentioned: customer.budgetMentioned,
        guestCountMentioned: customer.guestCountMentioned,
        eventDateMentioned: customer.eventDateMentioned,
        notes: customer.notes,
      },
    }),
  });
}

export async function syncRemoteSession(session: ChatSession) {
  if (!canSyncSession(session.id)) return;
  await request("/api/chat/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: session.id, phone: session.customerPhone, title: session.summary }),
  });
}

export async function syncRemoteMessage(sessionId: string, message: Omit<SessionMessage, "id">) {
  if (!canSyncSession(sessionId)) return;
  await request("/api/chat/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, role: message.role, content: message.content, messageType: message.messageType }),
  });
}

export async function fetchRemoteHistory(phone: string): Promise<{ customer: Customer | null; sessions: ChatSession[] }> {
  const data = await request(`/api/chat/sessions?phone=${encodeURIComponent(phone)}`) as {
    customer: { id: string; phone: string; name: string | null; memory: Record<string, string> | null; created_at: string; updated_at: string } | null;
    sessions: ChatSession[];
  };
  if (!data.customer) return { customer: null, sessions: [] };
  const memory = data.customer.memory ?? {};
  return {
    customer: {
      id: data.customer.id,
      name: data.customer.name || "Khách hàng",
      phone: data.customer.phone,
      firstSeen: data.customer.created_at,
      lastSeen: data.customer.updated_at,
      preferredEventType: memory.preferredEventType,
      budgetMentioned: memory.budgetMentioned,
      guestCountMentioned: memory.guestCountMentioned,
      eventDateMentioned: memory.eventDateMentioned,
      notes: memory.notes || "",
      sessionIds: data.sessions.map((session) => session.id),
    },
    sessions: data.sessions,
  };
}
