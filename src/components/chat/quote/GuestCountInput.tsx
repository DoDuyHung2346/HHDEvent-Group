"use client";

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
          <span className="material-symbols-outlined text-[16px] text-[#4f46e5]">group</span>
          <span>Số lượng khách mời tham dự:</span>
        </label>
        <span className="text-xs font-extrabold text-[#3525cd] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          {value} khách
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={10}
          max={2000}
          value={value || ""}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            onChange(isNaN(v) ? 10 : Math.min(2000, Math.max(10, v)));
          }}
          className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] bg-white shadow-2xs"
          placeholder="Nhập số khách (10 - 2000)"
        />

        <div className="flex items-center gap-1">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-2 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                value === preset
                  ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs"
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

