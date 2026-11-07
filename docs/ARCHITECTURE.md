# Architecture – EventViet Demo Chatbot

## Luồng Chat (POST /api/chat)

```
User Message
     │
     ▼
[Validate Input]  ← zod: ≤500 ký tự, không rỗng
     │ ❌ → 400 Bad Request
     ▼
[Rate Limit]  ← in-memory, 20 req/min/IP
     │ ❌ → 429 Too Many Requests
     ▼
[Normalize & Retrieve]  ← bỏ dấu tiếng Việt, lowercase, tokenize
     │                    top-3 FAQ theo keyword score
     ▼
[Score ≥ Threshold?]
  NO  │                    YES │
      ▼                        ▼
[Out-of-scope]          [Call AI with FAQs]
needs_booking=true       ↓ timeout 8s
source="mock"            ├── Parse & Validate JSON (zod)
     │                   │    ❌ → Retry 1 lần
     │                   │         ❌ → Fallback mock
     │                   └── source="ai" hoặc "mock"
     └──────────────────────┐
                            ▼
                     [Return ChatResponse]
                     answer, options(2-4), related_questions(3),
                     needs_booking, matched_faq_ids, source
```

## Kiến trúc Phân lớp

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Client)                      │
│  page.tsx → ChatWindow → MessageBubble + OptionChips     │
│             RelatedQuestions + BookingPrompt              │
│             BookingForm + SlotPicker                      │
│             admin/page.tsx → BookingTable + ConfirmDialog │
├─────────────────────────────────────────────────────────┤
│                   Hooks Layer                             │
│  useChat.ts (messages, history, fetch)                    │
│  useBookings.ts (CRUD localStorage)                       │
├─────────────────────────────────────────────────────────┤
│                  Service Layer (Server)                   │
│  api/chat/route.ts (orchestration)                        │
├────────────────────────┬────────────────────────────────┤
│    lib/ai/             │    lib/kb/                      │
│  client.ts (timeout,   │  faq.data.ts (10 FAQs)         │
│    retry, fallback)    │  normalize.ts (remove tones)    │
│  prompt.ts (system     │  retrieve.ts (keyword score +   │
│    prompt + anti-      │    stop words)                  │
│    injection)          │                                 │
│  mock.ts (fallback)    ├────────────────────────────────┤
│  parseResponse.ts      │    lib/booking/                 │
│    (strip+parse+zod)   │  validate.ts (SĐT, date, slot) │
├────────────────────────┤  slots.ts (T2-T7, 08-17, 30')  │
│    lib/schemas.ts      │  storage.ts (localStorage safe) │
│  (zod: ChatRequest,    ├────────────────────────────────┤
│   ChatResponse,        │  lib/rateLimit.ts (IP-based)   │
│   Booking)             │  lib/constants.ts               │
└────────────────────────┴────────────────────────────────┘
```

## Lý do chọn công nghệ

| Công nghệ | Lý do |
|---|---|
| Next.js 15 App Router | Route handler giấu API key server-side; không cần backend riêng |
| TypeScript strict | Zod schema infer type dùng chung client/server, bắt lỗi compile time |
| Tailwind CSS v4 | Utility-first, không cần CSS files phức tạp, dark mode dễ |
| Zod | Schema-first validation, generate TypeScript types, dùng một chỗ |
| Vitest | Fast, compatible với TypeScript, không cần Jest transform config |
| localStorage | Đủ dùng cho demo; không phức tạp hóa với backend/DB |
| vilao.ai provider | OpenAI-compatible endpoint, hỗ trợ Gemini model |

## Bảo mật

- API key **chỉ** nằm trong `process.env` server-side, không bao giờ expose ra client
- System prompt có chống prompt injection (ignore role switching commands)
- Rate limiting: 20 req/phút/IP (in-memory)
- Input validation: zod ở cả client (preview) và server (enforcement)
- localStorage: schemaVersion + try/catch để phòng dữ liệu hỏng
