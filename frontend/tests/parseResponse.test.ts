import { describe, it, expect } from "vitest";
import { parseAIResponse } from "@/lib/ai/parseResponse";

describe("parseAIResponse", () => {
  const validResponse = {
    answer: "EventViet Demo cung cấp dịch vụ tổ chức sự kiện trọn gói.",
    options: [
      { id: "opt-1", label: "Hỏi về giá", action: "ask", payload: "Giá bao nhiêu?" },
      { id: "opt-2", label: "Đặt lịch", action: "open_booking", payload: "" },
    ],
    related_questions: ["Câu 1?", "Câu 2?", "Câu 3?"],
    needs_booking: false,
    matched_faq_ids: ["faq-01"],
    source: "ai",
  };

  it("CA-1: Parse JSON hợp lệ thành công", () => {
    const result = parseAIResponse(JSON.stringify(validResponse));
    expect(result.answer).toBe(validResponse.answer);
    expect(result.source).toBe("ai");
    expect(result.related_questions).toHaveLength(3);
  });

  it("CA-2: Strip markdown code fences ```json ... ```", () => {
    const wrapped = "```json\n" + JSON.stringify(validResponse) + "\n```";
    const result = parseAIResponse(wrapped);
    expect(result.source).toBe("ai");
  });

  it("CA-3: Strip ``` without json tag", () => {
    const wrapped = "```\n" + JSON.stringify(validResponse) + "\n```";
    const result = parseAIResponse(wrapped);
    expect(result.answer).toBe(validResponse.answer);
  });

  it("CA-4: JSON hỏng → throw error", () => {
    expect(() => parseAIResponse("{ invalid json }")).toThrow();
  });

  it("CA-5: JSON thiếu field bắt buộc → throw zod error", () => {
    const incomplete = { answer: "test", source: "ai" };
    expect(() => parseAIResponse(JSON.stringify(incomplete))).toThrow();
  });

  it("CA-6: options ít hơn 2 → throw zod error", () => {
    const bad = { ...validResponse, options: [validResponse.options[0]] };
    expect(() => parseAIResponse(JSON.stringify(bad))).toThrow();
  });
});
