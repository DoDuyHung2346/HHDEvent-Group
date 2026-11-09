import { QUOTE_CATALOG } from "./catalog";
import type { RequirementSelection, QuoteSnapshot } from "@/lib/schemas";

export const CATALOG_VERSION = 2;

export function calculateQuote(sel: RequirementSelection): QuoteSnapshot {
  const lines: QuoteSnapshot["lines"] = [];
  for (const cat of QUOTE_CATALOG) {
    const raw = sel.selections[cat.id];
    const ids = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const id of ids) {
      const opt = cat.options.find((o) => o.id === id);
      if (!opt) continue; // bỏ id lạ, không throw
      const multiplier = opt.unit === "per_guest" ? sel.guestCount : 1;
      const minAmount = opt.minPrice * multiplier;
      const maxAmount = opt.maxPrice * multiplier;
      // amount giữ lại để tương thích dữ liệu lịch hẹn cũ; đây là trung điểm,
      // còn mức hiển thị/chốt luôn là khoảng minAmount–maxAmount từ bảng giá.
      const amount = Math.round((minAmount + maxAmount) / 2);
      lines.push({ categoryLabel: cat.label, optionLabel: opt.label, amount, minAmount, maxAmount });
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const min = lines.reduce((s, l) => s + (l.minAmount ?? l.amount), 0);
  const max = lines.reduce((s, l) => s + (l.maxAmount ?? l.amount), 0);
  return {
    selection: sel,
    lines,
    subtotal,
    min,
    max,
    catalogVersion: CATALOG_VERSION,
    createdAt: new Date().toISOString(),
  };
}

export function validateSelection(sel: RequirementSelection): string | null {
  for (const cat of QUOTE_CATALOG) {
    if (cat.required && (!sel.selections[cat.id] || sel.selections[cat.id].length === 0)) {
      return `Vui lòng chọn mục "${cat.label}".`;
    }
  }
  return null;
}

