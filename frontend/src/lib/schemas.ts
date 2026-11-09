import { z } from "zod";

// ── ChatRequest ──────────────────────────────────────────────────────────────
export const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Tin nhắn không được rỗng")
    .max(500, "Tin nhắn tối đa 500 ký tự"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(12) // 6 turns × 2 = 12 messages
    .optional()
    .default([]),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ── RequirementSelection & QuoteSnapshot ──────────────────────────────────────
export const RequirementSelectionSchema = z.object({
  guestCount: z.number().int().min(10).max(2000),
  // categoryId -> optionId (single) hoặc optionId[] (multi)
  selections: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  note: z.string().max(300).optional(),
});
export type RequirementSelection = z.infer<typeof RequirementSelectionSchema>;

export const QuoteSnapshotSchema = z.object({
  selection: RequirementSelectionSchema,
  lines: z.array(
    z.object({
      categoryLabel: z.string(),
      optionLabel: z.string(),
      amount: z.number(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
    })
  ),
  subtotal: z.number(),
  min: z.number(),
  max: z.number(),
  catalogVersion: z.number(), // để biết giá chốt theo bản catalog nào
  createdAt: z.string(),
});
export type QuoteSnapshot = z.infer<typeof QuoteSnapshotSchema>;

// ── ChatOption ───────────────────────────────────────────────────────────────
export const ChatOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  action: z.enum(["ask", "open_booking", "link", "open_requirements"]),
  payload: z.string().optional(),
});
export type ChatOption = z.infer<typeof ChatOptionSchema>;

// ── ChatResponse ─────────────────────────────────────────────────────────────
export const ChatResponseSchema = z.object({
  answer: z.string(),
  options: z
    .array(ChatOptionSchema)
    .min(2)
    .max(4),
  related_questions: z
    .tuple([z.string(), z.string(), z.string()]),
  needs_booking: z.boolean(),
  needs_requirements: z.boolean().optional(),
  // API có thể yêu cầu UI mở ngay phiếu hẹn sau khi đã dự toán sơ bộ.
  show_booking_form: z.boolean().optional(),
  prefill: z
    .object({
      guestCount: z.number().optional(),
      concept: z.string().optional(),
    })
    .optional(),
  matched_faq_ids: z.array(z.string()),
  source: z.enum(["ai", "mock"]),
  intent: z.enum(["normal", "reschedule", "urgent", "out_of_scope"]).optional(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// ── Booking ──────────────────────────────────────────────────────────────────
export const BookingSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, "Tên phải từ 2 ký tự")
    .max(50, "Tên tối đa 50 ký tự"),
  phone: z
    .string()
    .regex(
      /^(0|\+84)(3|5|7|8|9)\d{8}$/,
      "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng SĐT Việt Nam"
    ),
  date: z.string(), // YYYY-MM-DD
  time: z.string(), // HH:mm
  eventType: z.string().optional(),
  notes: z.string().max(500).optional(),
  requirements: QuoteSnapshotSchema.optional(),
  status: z.enum(["pending", "processed", "cancelled"]).default("pending"),
  assignedStaffId: z.string().optional(),
  assignedStaffName: z.string().optional(),
  assignedStaffPhone: z.string().optional(),
  shift: z.enum(["morning", "afternoon"]).optional(),
  incidentNote: z.string().optional(),
  createdAt: z.string(),
});
export type Booking = z.infer<typeof BookingSchema>;

// ── BookingStorage ────────────────────────────────────────────────────────────
export const BookingStorageSchema = z.object({
  schemaVersion: z.number(),
  bookings: z.array(BookingSchema),
});
export type BookingStorage = z.infer<typeof BookingStorageSchema>;

// ── Customer & Session schemas ────────────────────────────────────────────────
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  firstSeen: z.string(),
  lastSeen: z.string(),
  preferredEventType: z.string().optional(),
  budgetMentioned: z.string().optional(),
  guestCountMentioned: z.string().optional(),
  eventDateMentioned: z.string().optional(),
  notes: z.string().default(""),
  sessionIds: z.array(z.string()).default([]),
});

export const SessionMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  messageType: z
    .enum([
      "text",
      "pricing",
      "booking_form",
      "booking_confirmed",
      "reschedule",
      "urgent_contact",
      "requirements_form",
      "quote_summary",
    ])
    .optional(),
});

export const ChatSessionSchema = z.object({
  id: z.string(),
  customerPhone: z.string(),
  startedAt: z.string(),
  lastMessageAt: z.string(),
  summary: z.string().optional(),
  messages: z.array(SessionMessageSchema).default([]),
});

export const CustomerStorageSchema = z.object({
  schemaVersion: z.literal(1),
  customers: z.record(z.string(), CustomerSchema),
});

export const SessionStorageSchema = z.object({
  schemaVersion: z.literal(1),
  sessions: z.record(z.string(), ChatSessionSchema),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type SessionMessage = z.infer<typeof SessionMessageSchema>;
export type ChatSession = z.infer<typeof ChatSessionSchema>;

// Customer context được pass từ client lên API
export const CustomerContextSchema = z.object({
  phone: z.string().optional(),
  name: z.string().optional(),
  preferredEventType: z.string().optional(),
  budgetMentioned: z.string().optional(),
  guestCountMentioned: z.string().optional(),
  eventDateMentioned: z.string().optional(),
});

// Staff context item – để gửi lên API và backend inject vào LLM
export const StaffContextItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  roleLabel: z.string(),
  shift: z.string().optional().default("all_day"),
  status: z.string().optional().default("active"),
});
export type StaffContextItem = z.infer<typeof StaffContextItemSchema>;

// Mở rộng ChatRequestSchema để nhận customer context và staff context
export const ChatRequestWithContextSchema = ChatRequestSchema.extend({
  customerContext: CustomerContextSchema.optional(),
  staffContext: z.array(StaffContextItemSchema).optional(),
});

// Intent types cho special responses
export const ChatIntentSchema = z.enum(["normal", "reschedule", "urgent", "out_of_scope"]);

export type CustomerContext = z.infer<typeof CustomerContextSchema>;
export type ChatIntent = z.infer<typeof ChatIntentSchema>;
