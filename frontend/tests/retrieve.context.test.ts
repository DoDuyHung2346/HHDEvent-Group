import { describe, it, expect } from "vitest";
import { isContextDependent, retrieveWithContext } from "@/lib/kb/retrieve";

describe("retrieveWithContext", () => {
  it("nhận diện câu phụ thuộc ngữ cảnh (câu ngắn, bắt đầu bằng từ nối)", () => {
    expect(isContextDependent("Vậy thì sao?")).toBe(true);
    expect(isContextDependent("Rẻ hơn được không?")).toBe(true);
    expect(isContextDependent("Ok")).toBe(true);
    expect(isContextDependent("Gói đó thế nào?")).toBe(true);
  });

  it("nhận diện câu đầy đủ không phụ thuộc ngữ cảnh", () => {
    expect(isContextDependent("Chính sách hủy sự kiện tại EventViet như thế nào?")).toBe(false);
    expect(isContextDependent("Chi phí tổ chức tiệc tất niên trọn gói là bao nhiêu?")).toBe(false);
  });

  it("câu tự đủ điểm không mượn ngữ cảnh từ câu trước", () => {
    const res = retrieveWithContext("Chi phí tổ chức tiệc tất niên trọn gói", [
      { role: "user", content: "Chính sách đặt cọc thế nào?" },
    ]);
    expect(res.usedContext).toBe(false);
    expect(res.score).toBeGreaterThanOrEqual(2);
  });

  it("câu cụt mượn ngữ cảnh câu trước để match đúng FAQ", () => {
    const res = retrieveWithContext("Rẻ hơn được không?", [
      { role: "user", content: "Chi phí tổ chức tiệc cưới" },
    ]);
    expect(res.usedContext).toBe(true);
    expect(res.results.length).toBeGreaterThan(0);
    // Chủ đề vẫn là chi phí tiệc cưới
    expect(["faq-02", "faq-03"]).toContain(res.results[0].faq.id);
  });

  it("không có history thì không mượn ngữ cảnh", () => {
    const res = retrieveWithContext("Vậy thì sao?", []);
    expect(res.usedContext).toBe(false);
  });

  it("câu dài ngoài phạm vi không bị cứu bởi ngữ cảnh", () => {
    const res = retrieveWithContext(
      "Hôm nay thời tiết Hà Nội mát mẻ nhiều mây trời lộng gió",
      [{ role: "user", content: "Chi phí tổ chức tiệc cưới" }]
    );
    expect(res.usedContext).toBe(false);
    expect(res.score).toBeLessThan(2);
  });
});
