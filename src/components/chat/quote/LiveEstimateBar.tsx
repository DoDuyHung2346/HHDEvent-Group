"use client";

import type { QuoteSnapshot } from "@/lib/schemas";
import { formatVnd } from "@/lib/quote/format";

interface LiveEstimateBarProps {
  quote: QuoteSnapshot;
  onConfirm: () => void;
  disabled?: boolean;
}

export function LiveEstimateBar({ quote, onConfirm, disabled = false }: LiveEstimateBarProps) {
  return (
    <div className="pt-3 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl mt-2">
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-slate-500 font-medium">Tạm tính:</span>
          <span className="text-base sm:text-lg font-black text-[#3525cd]">
            {formatVnd(quote.subtotal)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            ({formatVnd(quote.min)} – {formatVnd(quote.max)})
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          *Ước tính ±15% chưa gồm VAT. Báo giá chính xác khi tư vấn 1-1.
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="px-4 py-2.5 bg-gradient-to-r from-[#3525cd] to-[#4f46e5] hover:from-[#2a1ca4] hover:to-[#4338ca] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        <span>Xem báo giá tạm tính</span>
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </div>
  );
}

