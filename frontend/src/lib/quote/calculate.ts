import { QUOTE_CATALOG } from "./catalog";
import type { RequirementSelection, QuoteSnapshot } from "@/lib/schemas";

export const CATALOG_VERSION = 1;
export const RANGE_PCT = 0.15;

export function calculateQuote(sel: RequirementSelection): QuoteSnapshot {
  const lines: QuoteSnapshot["lines"] = [];
  for (const cat of QUOTE_CATALOG) {
    const raw = sel.selections[cat.id];
    const ids = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const id of ids) {
      const opt = cat.options.find((o) => o.id === id);
      if (!opt) continue; // bỏ id lạ, không throw
      const amount = opt.unit === "per_guest" ? opt.price * sel.guestCount : opt.price;
      lines.push({ categoryLabel: cat.label, optionLabel: opt.label, amount });
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  return {
    selection: sel,
    lines,
    subtotal,
    min: Math.round(subtotal * (1 - RANGE_PCT)),
    max: Math.round(subtotal * (1 + RANGE_PCT)),
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

