import { describe, it, expect } from "vitest";
import { calculateQuote, validateSelection, RANGE_PCT } from "@/lib/quote/calculate";
import type { RequirementSelection } from "@/lib/schemas";

describe("quote calculation", () => {
  it("tính tổng tiền chính xác gồm cả fixed và per_guest nhân số khách", () => {
    const sel: RequirementSelection = {
      guestCount: 100,
      selections: {
        concept: "concept-modern", // 5_000_000
        decoration: "deco-mid",    // 10_000_000
        av: "av-basic",            // 8_000_000
        fb: "fb-standard",         // 450_000 * 100 = 45_000_000
        talent: "talent-mc",       // 15_000_000
      },
    };
    const quote = calculateQuote(sel);
    // Subtotal = 5M + 10M + 8M + 45M + 15M = 83_000_000
    expect(quote.subtotal).toBe(83_000_000);
    expect(quote.lines).toHaveLength(5);
  });

  it("cộng dồn chính xác khi chọn nhiều mục (multi addons)", () => {
    const sel: RequirementSelection = {
      guestCount: 50,
      selections: {
        concept: "concept-minimal", // 3_000_000
        decoration: "deco-basic",   // 5_000_000
        av: "av-basic",             // 8_000_000
        addons: ["add-photo", "add-booth"], // 6_000_000 + 4_000_000
      },
    };
    const quote = calculateQuote(sel);
    // 3M + 5M + 8M + 6M + 4M = 26_000_000
    expect(quote.subtotal).toBe(26_000_000);
  });

  it("bỏ qua id không tồn tại trong catalog mà không báo lỗi", () => {
    const sel: RequirementSelection = {
      guestCount: 50,
      selections: {
        concept: "concept-modern", // 5_000_000
        unknownCat: "unknown-id",
        decoration: "deco-basic",  // 5_000_000
      },
    };
    const quote = calculateQuote(sel);
    expect(quote.subtotal).toBe(10_000_000);
  });

  it("tính đúng biên độ min/max ±15%", () => {
    const sel: RequirementSelection = {
      guestCount: 100,
      selections: {
        decoration: "deco-mid", // 10_000_000
      },
    };
    const quote = calculateQuote(sel);
    expect(quote.subtotal).toBe(10_000_000);
    expect(quote.min).toBe(Math.round(10_000_000 * (1 - RANGE_PCT))); // 8_500_000
    expect(quote.max).toBe(Math.round(10_000_000 * (1 + RANGE_PCT))); // 11_500_000
  });

  it("selection rỗng trả về subtotal = 0", () => {
    const sel: RequirementSelection = {
      guestCount: 50,
      selections: {},
    };
    const quote = calculateQuote(sel);
    expect(quote.subtotal).toBe(0);
    expect(quote.min).toBe(0);
    expect(quote.max).toBe(0);
  });

  it("validateSelection kiểm tra thiếu các mục bắt buộc", () => {
    const incompleteSel: RequirementSelection = {
      guestCount: 50,
      selections: {
        concept: "concept-modern",
        // thiếu decoration và av
      },
    };
    const err = validateSelection(incompleteSel);
    expect(err).toContain("Trang trí");
  });
});

