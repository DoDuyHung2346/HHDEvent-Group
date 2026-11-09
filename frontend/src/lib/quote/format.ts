import type { QuoteOption } from "./catalog";

/**
 * Định dạng số tiền VNĐ ngắn gọn dễ đọc:
 * 10_000_000 -> "10 triệu"
 * 1_250_000  -> "1,25 triệu"
 * 850_000    -> "850.000đ"
 * 0          -> "0đ"
 */
export function formatVnd(amount: number): string {
  if (amount === 0) return "0đ";

  if (amount >= 1_000_000_000) {
    const b = amount / 1_000_000_000;
    return `${Number(b.toFixed(2)).toString().replace(".", ",")} tỷ`;
  }

  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${Number(m.toFixed(2)).toString().replace(".", ",")} triệu`;
  }

  return `${amount.toLocaleString("vi-VN")}đ`;
}

/**
 * Định dạng hiển thị giá của 1 option trong catalog
 * 0 -> "Miễn phí" hoặc "Tư vấn sau"
 * 450_000 per_guest -> "450.000đ / khách"
 * 10_000_000 fixed -> "10 triệu"
 */
export function formatPrice(option: QuoteOption): string {
  if (option.maxPrice === 0) {
    if (option.id.includes("custom") || option.id.includes("none")) {
      return option.id.includes("none") ? "Miễn phí" : "Tư vấn sau";
    }
    return "Miễn phí";
  }

  const formatted = option.minPrice === option.maxPrice
    ? formatVnd(option.minPrice)
    : `${formatVnd(option.minPrice)}–${formatVnd(option.maxPrice)}`;
  if (option.unit === "per_guest") {
    return `${formatted} / khách`;
  }
  return formatted;
}

