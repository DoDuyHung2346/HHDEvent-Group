"use client";

import type { QuoteSnapshot } from "@/lib/schemas";
import { formatVnd } from "@/lib/quote/format";
import { ChevronRightIcon } from "@/components/shared/FormIcons";

interface LiveEstimateBarProps {
  quote: QuoteSnapshot;
  onConfirm: () => void;
  disabled?: boolean;
}

export function LiveEstimateBar({ quote, onConfirm, disabled = false }: LiveEstimateBarProps) {
  return (
    <div className="pt-3 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 sm:p-3 rounded-xl mt-2">
      <div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 font-medium">Tạm tính:</span>
          <span className="text-base sm:text-lg font-black text-[#3525cd]">
            {formatVnd(quote.subtotal)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            ({formatVnd(quote.min)} – {formatVnd(quote.max)})
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          *Ước tính ±15% chưa gồm VAT. Báo giá chính xác khi tư vấn 1-1.
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="w-full sm:w-auto min-h-[46px] sm:min-h-0 px-5 py-3 sm:py-2.5 bg-gradient-to-r from-[#3525cd] to-[#4f46e5] hover:from-[#2a1ca4] hover:to-[#4338ca] active:scale-[0.99] text-white font-bold text-sm sm:text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        <span>Xem báo giá tạm tính</span>
        <ChevronRightIcon size={16} className="shrink-0" />
      </button>
    </div>
  );
}
