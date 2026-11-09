import { describe, expect, it } from "vitest";
import { getPreliminaryEventEstimate } from "@/lib/quote/preliminaryEstimate";

describe("getPreliminaryEventEstimate", () => {
  const priorYEP = [
    { role: "user" as const, content: "Tôi làm YEP 150 khách với ngân sách 150 triệu." },
  ];

  it("không lấy dữ kiện cũ cho một câu hỏi mới độc lập", () => {
    expect(getPreliminaryEventEstimate("Gói dịch vụ trọn gói bao gồm những gì?", priorYEP)).toBeNull();
  });

  it("chỉ dùng dữ kiện cũ khi khách hỏi tiếp theo ngữ cảnh", () => {
    expect(getPreliminaryEventEstimate("Vậy chi phí thế nào?", priorYEP)?.answer).toContain("150 khách");
  });
});
