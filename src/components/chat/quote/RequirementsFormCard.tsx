"use client";

import { useState, useMemo } from "react";
import { QUOTE_CATALOG } from "@/lib/quote/catalog";
import { calculateQuote, validateSelection } from "@/lib/quote/calculate";
import type { QuoteSnapshot, RequirementSelection } from "@/lib/schemas";
import { GuestCountInput } from "./GuestCountInput";
import { OptionGroup } from "./OptionGroup";
import { LiveEstimateBar } from "./LiveEstimateBar";

interface RequirementsFormCardProps {
  initialGuestCount?: number;
  initialSelections?: Record<string, string | string[]>;
  initialNote?: string;
  onSubmit: (quote: QuoteSnapshot) => void;
  disabled?: boolean;
}

export function RequirementsFormCard({
  initialGuestCount = 50,
  initialSelections = {},
  initialNote = "",
  onSubmit,
  disabled = false,
}: RequirementsFormCardProps) {
  const [guestCount, setGuestCount] = useState<number>(initialGuestCount);
  const [selections, setSelections] = useState<Record<string, string | string[]>>(() => {
    const defaultSel: Record<string, string | string[]> = { ...initialSelections };
    // Default selection cho required fields nếu chưa có
    if (!defaultSel.concept) defaultSel.concept = "concept-modern";
    if (!defaultSel.decoration) defaultSel.decoration = "deco-mid";
    if (!defaultSel.av) defaultSel.av = "av-basic";
    return defaultSel;
  });
  const [note, setNote] = useState<string>(initialNote);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelect = (categoryId: string, optionId: string) => {
    if (disabled) return;
    const cat = QUOTE_CATALOG.find((c) => c.id === categoryId);
    if (!cat) return;

    setSelections((prev) => {
      if (cat.mode === "multi") {
        const current = (prev[categoryId] as string[]) || [];
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [categoryId]: next };
      }
      return { ...prev, [categoryId]: optionId };
    });
    setErrorMessage(null);
  };

  const currentSelection: RequirementSelection = useMemo(
    () => ({
      guestCount,
      selections,
      note: note.trim() || undefined,
    }),
    [guestCount, selections, note]
  );

  const currentQuote = useMemo(
    () => calculateQuote(currentSelection),
    [currentSelection]
  );

  const handleConfirm = () => {
    if (disabled) return;
    const err = validateSelection(currentSelection);
    if (err) {
      setErrorMessage(err);
      return;
    }
    onSubmit(currentQuote);
  };

  return (
    <div
      className={`bg-white rounded-2xl border-2 border-indigo-200/90 shadow-md p-4 sm:p-5 space-y-4 my-2 max-w-2xl transition-all ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3525cd] to-[#4f46e5] text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">design_services</span>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>EventViet Concierge</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#3525cd]">Phiếu Chọn Yêu Cầu Sự Kiện</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Chọn concept, mức trang trí & thiết bị để xem bảng giá dự toán tức thời
            </p>
          </div>
        </div>

        {disabled && (
          <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
            Đã gửi yêu cầu
          </span>
        )}
      </div>

      {/* Guest count */}
      <GuestCountInput value={guestCount} onChange={(c) => !disabled && setGuestCount(c)} />

      {/* Categories */}
      <div className="space-y-3.5">
        {QUOTE_CATALOG.map((cat) => (
          <OptionGroup
            key={cat.id}
            category={cat}
            selected={selections[cat.id]}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Note input */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#4f46e5]">edit_note</span>
          <span>Ghi chú thêm về mong muốn riêng (tùy chọn):</span>
        </label>
        <textarea
          rows={2}
          maxLength={300}
          disabled={disabled}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Tông màu chủ đạo xanh midnight, cần hiệu ứng pháo sáng lạnh khi cắt bánh..."
          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] bg-white shadow-2xs"
        />
        <div className="text-right text-[10px] text-slate-400">
          {note.length}/300 ký tự
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-1.5 border border-red-200 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Estimate Bar */}
      <LiveEstimateBar
        quote={currentQuote}
        onConfirm={handleConfirm}
        disabled={disabled}
      />
    </div>
  );
}

