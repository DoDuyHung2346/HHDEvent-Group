import { describe, it, expect } from "vitest";
import { formatVnd, formatPrice } from "@/lib/quote/format";
import type { QuoteOption } from "@/lib/quote/catalog";

describe("quote formatting", () => {
  it("định dạng đúng số tiền triệu", () => {
    expect(formatVnd(10_000_000)).toBe("10 triệu");
    expect(formatVnd(1_250_000)).toBe("1,25 triệu");
  });

  it("formatPrice hiển thị khoảng giá và đơn vị", () => {
    const fixedOpt: QuoteOption = { id: "av-standard", label: "Âm thanh", minPrice: 6_000_000, maxPrice: 9_000_000, unit: "fixed" };
    expect(formatPrice(fixedOpt)).toBe("6 triệu–9 triệu");
    const perGuestOpt: QuoteOption = { id: "fb-buffet", label: "Buffet", minPrice: 250_000, maxPrice: 300_000, unit: "per_guest" };
    expect(formatPrice(perGuestOpt)).toBe("250.000đ–300.000đ / khách");
    const customOpt: QuoteOption = { id: "concept-custom", label: "Ý tưởng riêng", minPrice: 0, maxPrice: 0, unit: "fixed" };
    expect(formatPrice(customOpt)).toBe("Tư vấn sau");
  });
});
