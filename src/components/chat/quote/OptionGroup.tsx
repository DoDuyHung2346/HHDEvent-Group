"use client";

import type { QuoteCategory } from "@/lib/quote/catalog";
import { formatPrice } from "@/lib/quote/format";
import { CheckIcon } from "@/components/shared/FormIcons";

interface OptionGroupProps {
  category: QuoteCategory;
  selected: string | string[] | undefined;
  onSelect: (categoryId: string, optionId: string) => void;
}

export function OptionGroup({ category, selected, onSelect }: OptionGroupProps) {
  const isSelected = (optId: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(optId);
    }
    return selected === optId;
  };

  return (
    <div className="space-y-2 pt-1 border-t border-slate-100 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#4f46e5]">
            {category.icon}
          </span>
          <span>{category.label}</span>
          {category.required ? (
            <span className="text-red-500 text-[10px] font-bold">*</span>
          ) : (
            <span className="text-slate-400 text-[10px] font-normal">(tùy chọn)</span>
          )}
        </label>
        <span className="text-[10px] text-slate-400">
          {category.mode === "multi" ? "Chọn nhiều" : "Chọn 1"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-1.5">
        {category.options.map((opt) => {
          const active = isSelected(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(category.id, opt.id)}
              className={`p-3 sm:p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer min-h-[56px] sm:min-h-[58px] select-none active:scale-[0.98] ${
                active
                  ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs ring-2 ring-indigo-200"
                  : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 active:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <div className="flex items-center gap-1.5 min-w-0">
                  {active && (
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <CheckIcon size={11} className="text-white" />
                    </div>
                  )}
                  <span className="text-xs font-bold leading-tight truncate">{opt.label}</span>
                </div>
                <span
                  className={`text-[11px] font-extrabold shrink-0 ${
                    active ? "text-indigo-100" : "text-[#3525cd]"
                  }`}
                >
                  {formatPrice(opt)}
                </span>
              </div>
              {opt.description && (
                <p
                  className={`text-[10px] leading-tight line-clamp-1 ${
                    active ? "text-indigo-100/90" : "text-slate-500"
                  }`}
                >
                  {opt.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
