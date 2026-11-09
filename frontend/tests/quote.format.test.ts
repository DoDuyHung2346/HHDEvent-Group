import { describe, it, expect } from "vitest";
import { formatVnd, formatPrice } from "@/lib/quote/format";
import type { QuoteOption } from "@/lib/quote/catalog";

describe("quote formatting", () => {
  it("định dạng đúng số tiền triệu", () => {
    expect(formatVnd(10_000_000)).toBe("10 triệu");
    expect(formatVnd(1_250_000)).toBe("1,25 triệu");
    expect(formatVnd(35_000_000)).toBe("35 triệu");
  });

  it("định dạng đúng số tiền nghìn và 0", () => {
    expect(formatVnd(850_000)).toBe("850.000đ");
    expect(formatVnd(450_000)).toBe("450.000đ");
    expect(formatVnd(0)).toBe("0đ");
  });

  it("formatPrice hiển thị đúng đơn vị fixed và per_guest", () => {
    const fixedOpt: QuoteOption = {
      id: "deco-mid",
      label: "Trung bình",
      price: 10_000_000,
      unit: "fixed",
    };
    expect(formatPrice(fixedOpt)).toBe("10 triệu");

    const perGuestOpt: QuoteOption = {
      id: "fb-standard",
      label: "Thực đơn tiêu chuẩn",
      price: 450_000,
      unit: "per_guest",
    };
    expect(formatPrice(perGuestOpt)).toBe("450.000đ / khách");

    const freeOpt: QuoteOption = {
      id: "concept-custom",
      label: "Ý tưởng riêng",
      price: 0,
      unit: "fixed",
    };
    expect(formatPrice(freeOpt)).toBe("Tư vấn sau");
  });
});

