import {
  CustomerSchema,
  CustomerStorageSchema,
  SessionStorageSchema,
  ChatSessionSchema,
  type Customer,
  type ChatSession,
  type SessionMessage,
} from "@/lib/schemas";
import {
  CUSTOMER_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  CUSTOMER_SCHEMA_VERSION,
  SESSION_SCHEMA_VERSION,
  MAX_SESSIONS_PER_CUSTOMER,
  MAX_MESSAGES_PER_SESSION,
} from "@/lib/constants";

// ── Helper: Safe Read from localStorage ──────────────────────────────────────
export function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ── Customer CRUD ────────────────────────────────────────────────────────────

/**
 * Đọc toàn bộ danh sách Customer từ localStorage.
 * Nếu dữ liệu hỏng hoặc schemaVersion không khớp → reset an toàn về {}.
 */
export function loadCustomers(): Record<string, Customer> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    const result = CustomerStorageSchema.safeParse(parsed);

    if (
      !result.success ||
      result.data.schemaVersion !== CUSTOMER_SCHEMA_VERSION
    ) {
      try {
        localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      } catch {
        // ignore
      }
      return {};
    }

    return result.data.customers;
  } catch {
    try {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    } catch {
      // ignore
    }
    return {};
  }
}

/**
 * Lưu danh bạ Customer vào localStorage.
 */
export function saveCustomers(customers: Record<string, Customer>): void {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      schemaVersion: CUSTOMER_SCHEMA_VERSION,
      customers,
    };
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Không thể lưu danh bạ khách hàng vào localStorage:", error);
  }
}

/**
 * Lấy thông tin một khách hàng theo số điện thoại.
 */
export function getCustomer(phone: string): Customer | null {
  const normalized = phone.trim();
  if (!normalized) return null;
  const customers = loadCustomers();
  return customers[normalized] ?? null;
}

/**
 * Tạo mới hoặc cập nhật thông tin khách hàng theo số điện thoại.
 */
export function upsertCustomer(
  phone: string,
  updates: Partial<Customer>
): Customer {
  const normalized = phone.trim();
  const customers = loadCustomers();
  const existing = customers[normalized];
  const now = new Date().toISOString();

  let merged: Customer;
  if (existing) {
    merged = {
      ...existing,
      ...updates,
      phone: normalized,
      lastSeen: updates.lastSeen ?? now,
      id: updates.id ?? existing.id,
      firstSeen: existing.firstSeen || now,
      notes: updates.notes !== undefined ? updates.notes : existing.notes,
      sessionIds:
        updates.sessionIds !== undefined
          ? updates.sessionIds
          : existing.sessionIds,
    };
  } else {
    merged = {
      id:
        updates.id ??
        `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: updates.name ?? "Khách hàng",
      phone: normalized,
      firstSeen: updates.firstSeen ?? now,
      lastSeen: updates.lastSeen ?? now,
      preferredEventType: updates.preferredEventType,
      budgetMentioned: updates.budgetMentioned,
      guestCountMentioned: updates.guestCountMentioned,
      eventDateMentioned: updates.eventDateMentioned,
      notes: updates.notes ?? "",
      sessionIds: updates.sessionIds ?? [],
      ...updates,
    };
  }

  const validated = CustomerSchema.parse(merged);
  customers[normalized] = validated;
  saveCustomers(customers);
  return validated;
}

/**
 * Cập nhật thông tin ghi nhớ ngữ cảnh (memory) của khách hàng.
 */
export function updateCustomerMemory(
  phone: string,
  memory: {
    preferredEventType?: string;
    budgetMentioned?: string;
    guestCountMentioned?: string;
    eventDateMentioned?: string;
  }
): void {
  const normalized = phone.trim();
  if (!normalized) return;
  upsertCustomer(normalized, {
    ...memory,
    lastSeen: new Date().toISOString(),
  });
}

// ── Session CRUD ─────────────────────────────────────────────────────────────

/**
 * Đọc toàn bộ Session trò chuyện từ localStorage.
 * Reset an toàn nếu dữ liệu hỏng hoặc sai schemaVersion.
 */
export function loadSessions(): Record<string, ChatSession> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    const result = SessionStorageSchema.safeParse(parsed);

    if (
      !result.success ||
      result.data.schemaVersion !== SESSION_SCHEMA_VERSION
    ) {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
      return {};
    }

    return result.data.sessions;
  } catch {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    return {};
  }
}

/**
 * Lưu danh sách ChatSession vào localStorage.
 */
export function saveSessions(sessions: Record<string, ChatSession>): void {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      schemaVersion: SESSION_SCHEMA_VERSION,
      sessions,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Không thể lưu phiên chat vào localStorage:", error);
  }
}

/**
 * Lấy phiên chat theo ID.
 */
export function getSession(sessionId: string): ChatSession | null {
  if (!sessionId) return null;
  const sessions = loadSessions();
  return sessions[sessionId] ?? null;
}

/**
 * Lấy toàn bộ danh sách phiên chat của một khách hàng, sắp xếp mới nhất lên đầu.
 */
export function getCustomerSessions(phone: string): ChatSession[] {
  const normalized = phone.trim();
  if (!normalized) return [];
  const sessions = loadSessions();
  return Object.values(sessions)
    .filter((session) => session.customerPhone === normalized)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
}

/**
 * Tạo một phiên chat mới cho khách hàng.
 */
export function createSession(phone: string): ChatSession {
  const normalized = phone.trim();
  const now = new Date().toISOString();
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newSession: ChatSession = {
    id: sessionId,
    customerPhone: normalized,
    startedAt: now,
    lastMessageAt: now,
    summary: undefined,
    messages: [],
  };

  const validatedSession = ChatSessionSchema.parse(newSession);

  // Lưu session vào storage
  const sessions = loadSessions();
  sessions[sessionId] = validatedSession;
  saveSessions(sessions);

  // Liên kết session ID vào Customer profile
  const existingCustomer = getCustomer(normalized);
  const currentSessionIds = existingCustomer?.sessionIds ?? [];
  const updatedSessionIds = [
    sessionId,
    ...currentSessionIds.filter((id) => id !== sessionId),
  ].slice(0, MAX_SESSIONS_PER_CUSTOMER);

  upsertCustomer(normalized, {
    sessionIds: updatedSessionIds,
    lastSeen: now,
  });

  return validatedSession;
}

/**
 * Thêm một tin nhắn mới vào session đã có.
 */
export function addMessageToSession(
  sessionId: string,
  message: Omit<SessionMessage, "id">
): void {
  if (!sessionId) return;
  const sessions = loadSessions();
  const session = sessions[sessionId];
  if (!session) return;

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const fullMessage: SessionMessage = {
    ...message,
    id: msgId,
  };

  const updatedMessages = [...session.messages, fullMessage];
  const trimmedMessages =
    updatedMessages.length > MAX_MESSAGES_PER_SESSION
      ? updatedMessages.slice(-MAX_MESSAGES_PER_SESSION)
      : updatedMessages;

  const updatedSession: ChatSession = {
    ...session,
    lastMessageAt: message.timestamp || new Date().toISOString(),
    messages: trimmedMessages,
  };

  sessions[sessionId] = ChatSessionSchema.parse(updatedSession);
  saveSessions(sessions);

  // Đồng bộ lastSeen của Customer nếu có
  if (session.customerPhone) {
    upsertCustomer(session.customerPhone, {
      lastSeen: updatedSession.lastMessageAt,
    });
  }
}

/**
 * Lấy session gần nhất của khách hàng hoặc tạo mới nếu chưa có session nào.
 */
export function getOrCreateCurrentSession(phone: string): ChatSession {
  const normalized = phone.trim();
  const customerSessions = getCustomerSessions(normalized);
  if (customerSessions.length > 0) {
    return customerSessions[0];
  }
  return createSession(normalized);
}
