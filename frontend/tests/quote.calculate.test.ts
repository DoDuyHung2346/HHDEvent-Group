import { describe, it, expect } from "vitest";
import { calculateQuote, validateSelection } from "@/lib/quote/calculate";
import type { RequirementSelection } from "@/lib/schemas";

describe("quote calculation", () => {
  it("cộng đúng khoảng giá fixed và per_guest theo bảng giá RAG", () => {
    const sel: RequirementSelection = { guestCount: 100, selections: { concept: "concept-2d", decoration: "deco-hiflex", av: "av-standard", fb: "fb-buffet", talent: "talent-mc-vn" } };
    const quote = calculateQuote(sel);
    expect(quote.min).toBe(37_300_000);
    expect(quote.max).toBe(52_400_000);
    expect(quote.subtotal).toBe(44_850_000);
    expect(quote.lines).toHaveLength(5);
  });

  it("cộng dồn đúng khi chọn nhiều dịch vụ thêm", () => {
    const quote = calculateQuote({ guestCount: 50, selections: { concept: "concept-script", decoration: "deco-formex", av: "av-mini", addons: ["add-photo-video", "add-transport"] } });
    expect(quote.min).toBe(14_750_000);
    expect(quote.max).toBe(28_750_000);
  });

  it("bỏ qua id không tồn tại trong catalog mà không báo lỗi", () => {
    const quote = calculateQuote({ guestCount: 50, selections: { concept: "concept-2d", unknownCat: "unknown-id" } });
    expect(quote.min).toBe(1_000_000);
    expect(quote.max).toBe(5_000_000);
  });

  it("selection rỗng trả về giá bằng 0", () => {
    const quote = calculateQuote({ guestCount: 50, selections: {} });
    expect(quote.subtotal).toBe(0);
    expect(quote.min).toBe(0);
    expect(quote.max).toBe(0);
  });

  it("validateSelection kiểm tra thiếu các mục bắt buộc", () => {
    const incompleteSel: RequirementSelection = { guestCount: 50, selections: { concept: "concept-2d" } };
    expect(validateSelection(incompleteSel)).toContain("Backdrop");
  });
});
