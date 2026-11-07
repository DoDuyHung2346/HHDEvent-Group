"use client";

import type { ChatOption } from "@/lib/schemas";

interface OptionChipsProps {
  options: ChatOption[];
  onOptionClick: (action: string, payload?: string) => void;
  align?: "left" | "right";
}

export default function OptionChips({
  options,
  onOptionClick,
  align = "left",
}: OptionChipsProps) {
  if (!options || options.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap gap-2 mt-2.5 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      {options.map((opt) => {
        const isBooking = opt.action === "open_booking";
        return (
          <button
            key={opt.id}
            id={`chip-${opt.id}`}
            type="button"
            onClick={() => onOptionClick(opt.action, opt.payload)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
              border cursor-pointer select-none flex items-center gap-1.5 shadow-xs
              hover:scale-[1.02] active:scale-[0.98]
              ${
                isBooking
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-100"
                  : "bg-white hover:bg-indigo-50/70 text-slate-800 hover:text-indigo-700 border-slate-200 hover:border-indigo-300"
              }
            `}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isBooking ? "calendar_add_on" : opt.action === "link" ? "open_in_new" : "chat_bubble"}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
