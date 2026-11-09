import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock modules BEFORE any imports that use them
vi.mock("@/lib/ai/client", () => ({
  callAIWithFallback: vi.fn(),
}));

vi.mock("@/lib/rateLimit", () => ({
  isRateLimited: vi.fn(() => false),
}));

// Import mocked modules
import { isRateLimited } from "@/lib/rateLimit";
import { callAIWithFallback } from "@/lib/ai/client";

// Import the route handler (after mocks)
import { POST } from "@/app/api/chat/route";

// Helper: build a valid mock AI response
function buildMockResponse(partial: Record<string, unknown> = {}) {
  return {
    answer: "EventViet Demo cung cấp dịch vụ sự kiện.",
    options: [
      { id: "o1", label: "Hỏi thêm", action: "ask" as const, payload: "Dịch vụ gì?" },
      { id: "o2", label: "Đặt lịch", action: "open_booking" as const, payload: "" },
    ],
    related_questions: ["Câu 1?", "Câu 2?", "Câu 3?"] as [string, string, string],
    needs_booking: false,
    matched_faq_ids: ["faq-01"],
    source: "ai" as const,
    ...partial,
  };
}

async function postChat(body: unknown, ip = "127.0.0.1") {
  const req = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
  return POST(req as Parameters<typeof POST>[0]);
}

beforeEach(() => {
  vi.mocked(isRateLimited).mockReturnValue(false);
  vi.mocked(callAIWithFallback).mockResolvedValue(buildMockResponse());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/chat", () => {
  it("CA-1 (Thường): Câu hỏi hợp lệ về dịch vụ → 200", async () => {
    const res = await postChat({
      message: "EventViet Demo cung cấp những dịch vụ gì?",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.answer).toBeDefined();
    expect(data.options).toBeDefined();
  });

  it("CA-1b: Hỏi chi phí tổng quan → hướng dẫn dự toán, không ép đặt lịch", async () => {
    const res = await postChat({ message: "Chi phí tổ chức sự kiện của công ty mình là gì?" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.needs_booking).toBe(false);
    expect(data.answer).toContain("không có một mức cố định");
    expect(data.options.some((option: { action: string }) => option.action === "open_booking")).toBe(false);
  });

  it("CA-1c: RAG thiếu dữ liệu về uy tín → minh bạch, không ép đặt lịch", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "fallback", answer: "", meta: { intent: "faq" } }), { status: 200 })
    );
    const res = await postChat({ message: "Công ty có uy tín không?" });
    const data = await res.json();
    expect(data.needs_booking).toBe(false);
    expect(data.answer).toContain("chưa có tài liệu đã xác thực");
    expect(data.options.some((option: { action: string }) => option.action === "open_booking")).toBe(false);
    fetchMock.mockRestore();
  });

  it("CA-1d: RAG bỏ sót FAQ quy trình → dùng FAQ chuẩn trước khi fallback", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "fallback", answer: "", meta: { intent: "faq" } }), { status: 200 })
    );
    const res = await postChat({ message: "Quy trình làm việc với EventHHD như thế nào?" });
    const data = await res.json();
    expect(data.needs_booking).toBe(false);
    expect(data.answer).toContain("6 bước");
    expect(data.matched_faq_ids).toContain("faq-07");
    fetchMock.mockRestore();
  });

  it("CA-1e: Chính sách đổi lịch sự kiện không bị nhầm thành đổi lịch hẹn", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "fallback", answer: "", meta: { intent: "policy" } }), { status: 200 })
    );
    const res = await postChat({ message: "Chính sách hủy và đổi lịch sự kiện?" });
    const data = await res.json();
    expect(data.intent).toBe("normal");
    expect(data.answer).toContain("Hủy trước 30 ngày");
    fetchMock.mockRestore();
  });

  it("CA-2 (Sai): Tin nhắn rỗng → 400", async () => {
    const res = await postChat({ message: "" });
    expect(res.status).toBe(400);
  });

  it("CA-3 (Sai): Tin nhắn > 500 ký tự → 400", async () => {
    const res = await postChat({ message: "a".repeat(501) });
    expect(res.status).toBe(400);
  });

  it("CA-4 (Biên): Câu ngoài phạm vi → needs_booking=true, không gọi AI", async () => {
    // Reset mock để đảm bảo không bị gọi
    vi.mocked(callAIWithFallback).mockClear();

    // Query hoàn toàn không liên quan đến sự kiện
    const res = await postChat({ message: "thời tiết hôm nay ở Hà Nội" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.needs_booking).toBe(true);
    expect(data.source).toBe("mock");
    // Vì score < threshold nên AI không được gọi
    expect(callAIWithFallback).not.toHaveBeenCalled();
  });

  it("CA-5 (Sự cố): AI trả mock → source='mock'", async () => {
    vi.mocked(callAIWithFallback).mockResolvedValue(buildMockResponse({ source: "mock" }));
    const res = await postChat({ message: "EventViet Demo cung cấp dịch vụ gì?" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.source).toBe("mock");
  });

  it("CA-6 (Sự cố): Rate limit → 429", async () => {
    vi.mocked(isRateLimited).mockReturnValue(true);
    const res = await postChat({ message: "Xin chào" }, "10.0.0.1");
    expect(res.status).toBe(429);
  });

  it("CA-7 (Sai): JSON request hỏng → 400", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ bad json }",
    });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
  });
});
