"use client";

import { useState } from "react";
import { UsersIcon } from "@/components/shared/FormIcons";

interface GuestCountInputProps {
  value: number;
  onChange: (count: number) => void;
}

export function GuestCountInput({ value, onChange }: GuestCountInputProps) {
  const presets = [30, 50, 100, 200];
  const [draft, setDraft] = useState(String(value));

  const handleDraftChange = (raw: string) => {
    setDraft(raw);
    const parsed = Number(raw);
    // Giữ nguyên giá trị đang gõ (ví dụ "1" khi sắp gõ "150") thay vì
    // ép về 10 ngay lập tức, vốn khiến người dùng không thể nhập tay.
    if (Number.isInteger(parsed) && parsed >= 10 && parsed <= 2000) {
      onChange(parsed);
    }
  };

  const commitDraft = () => {
    const parsed = Number(draft);
    const safe = Number.isInteger(parsed) ? Math.min(2000, Math.max(10, parsed)) : 10;
    setDraft(String(safe));
    onChange(safe);
  };

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

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={10}
          max={2000}
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onBlur={commitDraft}
          className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] bg-white shadow-2xs"
          placeholder="Nhập số khách (10 - 2000)"
        />

        <div className="grid grid-cols-4 sm:flex items-center gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setDraft(String(preset));
                onChange(preset);
              }}
              className={`px-2 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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
