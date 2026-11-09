import { describe, it, expect } from "vitest";
import { retrieveTopFAQs, getTopScore } from "@/lib/kb/retrieve";

describe("retrieveTopFAQs", () => {
  it("CA-1: Hỏi 'giá tổ chức year-end party' → trả đúng FAQ, có 3 results", () => {
    const results = retrieveTopFAQs("giá tổ chức year-end party");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    // FAQ về giá (faq-03) và loại sự kiện (faq-02) phải có trong top
    const ids = results.map((r) => r.faq.id);
    const hasRelevant = ids.some((id) => ["faq-03", "faq-02"].includes(id));
    expect(hasRelevant).toBe(true);
  });

  it("CA-2: Câu hỏi rỗng → trả về array rỗng", () => {
    const results = retrieveTopFAQs("");
    expect(results).toHaveLength(0);
  });

  it("CA-3: Câu hỏi không liên quan 'thời tiết hôm nay' → score thấp", () => {
    const score = getTopScore("thời tiết hôm nay");
    // Score phải thấp hơn threshold (2)
    expect(score).toBeLessThan(2);
  });

  it("CA-4: Hỏi về SĐT → không match FAQ sự kiện", () => {
    const results = retrieveTopFAQs("số điện thoại bưu điện");
    // Score phải thấp
    const topScore = results.length > 0 ? results[0].score : 0;
    expect(topScore).toBeLessThan(5);
  });

  it("CA-5: Hỏi 'âm thanh ánh sáng' → match faq-06", () => {
    const results = retrieveTopFAQs("âm thanh ánh sáng thiết bị");
    const ids = results.map((r) => r.faq.id);
    expect(ids).toContain("faq-06");
  });

  it("CA-6: Hỏi 'khu vực phục vụ' → match faq-10", () => {
    const results = retrieveTopFAQs("EventViet phục vụ khu vực nào");
    const ids = results.map((r) => r.faq.id);
    expect(ids).toContain("faq-10");
  });
});
