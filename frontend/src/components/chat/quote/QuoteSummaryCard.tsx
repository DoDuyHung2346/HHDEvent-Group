"use client";

import type { QuoteSnapshot } from "@/lib/schemas";
import { formatVnd } from "@/lib/quote/format";

interface QuoteSummaryCardProps {
  quote: QuoteSnapshot;
  onEdit?: () => void;
  onBookConsultation?: () => void;
}

export function QuoteSummaryCard({
  quote,
  onEdit,
  onBookConsultation,
}: QuoteSummaryCardProps) {
  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden space-y-3 p-4 my-2 max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#3525cd] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Bảng Tạm Tính Yêu Cầu Sự Kiện
            </h4>
            <p className="text-[10px] text-slate-500">
              Quy mô dự kiến: <strong className="text-slate-800">{quote.selection.guestCount} khách</strong>
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-100">
          Ước tính sơ bộ
        </span>
      </div>

      {/* Itemized Table */}
      <div className="space-y-1.5 text-xs">
        {quote.lines.map((line, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1 border-b border-slate-50 last:border-b-0"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">
                {line.categoryLabel}:
              </span>
              <span className="font-bold text-slate-800">{line.optionLabel}</span>
            </div>
            <span className="font-extrabold text-[#3525cd]">
              {line.amount === 0 ? "0đ" : formatVnd(line.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Note if any */}
      {quote.selection.note && (
        <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 border border-slate-150">
          <span className="font-bold text-slate-700">Ghi chú:</span> {quote.selection.note}
        </div>
      )}

      {/* Total & Range */}
      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100/80 space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold text-slate-700">Tổng tạm tính:</span>
          <span className="text-base sm:text-lg font-black text-[#3525cd]">
            {formatVnd(quote.subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Biên độ ước lượng (±15%):</span>
          <span className="font-semibold text-slate-700">
            {formatVnd(quote.min)} – {formatVnd(quote.max)}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 italic pt-1">
          *Giá tham khảo chưa bao gồm VAT 8% và địa điểm tổ chức (nếu thuê ngoài). Báo giá chính xác sau khi khảo sát thực địa.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer text-center"
          >
            Chỉnh sửa yêu cầu
          </button>
        )}
        {onBookConsultation && (
          <button
            type="button"
            onClick={onBookConsultation}
            className="flex-1 py-2 text-xs font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-lg shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Đặt lịch tư vấn 1-1</span>
          </button>
        )}
      </div>
    </div>
  );
}

