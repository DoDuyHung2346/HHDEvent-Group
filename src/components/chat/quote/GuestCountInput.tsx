"use client";

import { UsersIcon } from "@/components/shared/FormIcons";

interface GuestCountInputProps {
  value: number;
  onChange: (count: number) => void;
}

export function GuestCountInput({ value, onChange }: GuestCountInputProps) {
  const presets = [30, 50, 100, 200];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <UsersIcon size={16} className="text-[#4f46e5] shrink-0" />
          <span>Số lượng khách mời tham dự:</span>
        </label>
        <span className="text-xs font-extrabold text-[#3525cd] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
          {value} khách
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="numeric"
            min={10}
            max={2000}
            value={value || ""}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              onChange(isNaN(v) ? 10 : Math.min(2000, Math.max(10, v)));
            }}
            className="w-full px-3.5 py-2.5 text-base sm:text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] bg-white shadow-2xs min-h-[46px] sm:min-h-0"
            placeholder="Nhập số khách (10 - 2000)"
          />
        </div>

        <div className="grid grid-cols-4 sm:flex items-center gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer min-h-[44px] sm:min-h-0 flex items-center justify-center select-none active:scale-95 ${
                value === preset
                  ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
