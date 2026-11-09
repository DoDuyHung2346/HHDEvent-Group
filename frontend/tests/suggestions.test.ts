import { describe, it, expect } from "vitest";
import { extractEntities, mergeEntities } from "@/lib/suggestions/entities";
import { generateSuggestions, refineSuggestions } from "@/lib/suggestions";

describe("suggestions engine", () => {
  it("bóc tách chính xác số khách, loại sự kiện, địa điểm và ngân sách", () => {
    const e = extractEntities("Tổ chức tiệc cưới 200 khách tại Đà Nẵng ngân sách 300 triệu");
    expect(e.guests).toBe(200);
    expect(e.eventLabel).toBe("tiệc cưới");
    expect(e.location).toBe("Đà Nẵng");
    expect(e.outsideHcm).toBe(true);
    expect(e.budget).toContain("300 triệu");
  });

  it("gộp thực thể từ nhiều lượt trao đổi (thông tin mới ghi đè cũ)", () => {
    const merged = mergeEntities([
      "Tổ chức tiệc tất niên",
      "Quy mô khoảng 150 người",
      "Ngân sách 200 triệu",
    ]);
    expect(merged.eventLabel).toBe("year-end party");
    expect(merged.guests).toBe(150);
    expect(merged.budget).toContain("200 triệu");
  });

  it("generateSuggestions luôn trả về đúng 3 câu gợi ý duy nhất", () => {
    const suggestions = generateSuggestions({
      message: "Tôi muốn tổ chức gala dinner 100 khách",
      history: [],
    });
    expect(suggestions).toHaveLength(3);
    const unique = new Set(suggestions);
    expect(unique.size).toBe(3);
  });

  it("gợi ý cá nhân hóa có chứa thông tin khách hàng đã nêu", () => {
    const suggestions = generateSuggestions({
      message: "Tôi muốn tổ chức year-end party 200 khách",
      history: [],
    });
    const combined = suggestions.join(" ");
    expect(combined).toMatch(/year-end party|200 khách/);
  });

  it("không gợi ý lại câu mà người dùng vừa hỏi", () => {
    const message = "Chi phí tổ chức sự kiện tại EventViet là bao nhiêu?";
    const suggestions = generateSuggestions({
      message,
      history: [],
    });
    for (const s of suggestions) {
      expect(s.toLowerCase()).not.toContain(message.toLowerCase());
    }
  });

  it("refineSuggestions loại bỏ đánh số đầu dòng, lọc trùng và bù đủ 3 câu", () => {
    const rawLlm = [
      "1. Chi phí tổ chức thế nào?",
      "2. Chi phí tổ chức thế nào?", // trùng
      "Ngắn?", // quá ngắn
    ];
    const refined = refineSuggestions(rawLlm, {
      message: "Tư vấn tiệc cưới",
      history: [],
    });
    expect(refined).toHaveLength(3);
    for (const r of refined) {
      expect(r).not.toMatch(/^\d+\./);
    }
    const unique = new Set(refined);
    expect(unique.size).toBe(3);
  });
});

