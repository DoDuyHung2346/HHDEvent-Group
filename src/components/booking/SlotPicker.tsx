"use client";

import type { Booking } from "@/lib/schemas";
import type { TimeSlot } from "@/lib/booking/slots";
import { MAX_BOOKINGS_PER_SLOT } from "@/lib/constants";
import { CalendarIcon, ClockIcon, AlertCircleIcon } from "@/components/shared/FormIcons";

interface SlotPickerProps {
  availableDays: string[];
  slots: TimeSlot[];
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  bookedSlots: string[];
  dateError?: string;
  timeError?: string;
  existingBookings: Booking[];
}

function formatDate(dateStr: string): { dayName: string; dateNum: string } {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
  const dayName = days[date.getDay()];
  const dateNum = `${date.getDate()}/${date.getMonth() + 1}`;
  return { dayName, dateNum };
}

export default function SlotPicker({
  availableDays,
  slots,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
  existingBookings,
}: SlotPickerProps) {
  const getSlotCount = (time: string): number => {
    if (!selectedDate) return 0;
    return existingBookings.filter(
      (b) => b.date === selectedDate && b.time === time
    ).length;
  };

  const isSlotFull = (time: string): boolean => {
    return getSlotCount(time) >= MAX_BOOKINGS_PER_SLOT;
  };

  return (
    <div className="space-y-4">
      {/* Chọn ngày */}
      <div>
        <label className="text-slate-300 text-xs font-semibold mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-amber-300/90 sm:text-slate-300">
            <CalendarIcon size={15} className="text-amber-400 shrink-0" />
            <span>Chọn ngày tư vấn *</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">(Mọi ngày tương lai)</span>
        </label>
        
        {/* Horizontal scrollable date pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none py-1 touch-pan-x -webkit-overflow-scrolling-touch">
          {availableDays.slice(0, 14).map((day) => {
            const { dayName, dateNum } = formatDate(day);
            const isSelected = selectedDate === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => onDateChange(day)}
                className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-center transition-all duration-150 border cursor-pointer min-w-[64px] sm:min-w-[72px] min-h-[52px] flex flex-col items-center justify-center select-none active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-400 to-amber-500 border-amber-300 text-slate-950 shadow-md shadow-amber-500/20 font-bold scale-[1.02]"
                    : "bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12]"
                }`}
              >
                <span className={`text-[11px] uppercase tracking-wider font-semibold ${isSelected ? "text-slate-900" : "text-slate-400"}`}>
                  {dayName}
                </span>
                <span className="text-sm font-bold mt-0.5">{dateNum}</span>
              </button>
            );
          })}
        </div>

        {/* Date manual input */}
        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-300">
          <span className="shrink-0 flex items-center gap-1 text-slate-400">
            <span>Ngày khác:</span>
          </span>
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="date"
              min={availableDays[0]}
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
              className="w-full sm:w-auto h-11 sm:h-9 rounded-xl border border-white/15 bg-[#0A0F1D] px-3 py-1.5 text-base sm:text-xs text-slate-100 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
            />
          </div>
        </div>

        {dateError && (
          <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1.5">
            <AlertCircleIcon size={14} className="shrink-0" />
            <span>{dateError}</span>
          </p>
        )}
      </div>

      {/* Chọn giờ */}
      {selectedDate && (
        <div className="animate-in fade-in duration-200">
          <label className="text-slate-300 text-xs font-semibold mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-300/90 sm:text-slate-300">
              <ClockIcon size={15} className="text-amber-400 shrink-0" />
              <span>Khung giờ tư vấn trực tuyến / qua điện thoại *</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Mỗi slot 30 phút)
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const full = isSlotFull(slot.time);
              const selected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={full}
                  onClick={() => !full && onTimeChange(slot.time)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all duration-150 border text-center cursor-pointer min-h-[48px] flex flex-col items-center justify-center select-none active:scale-95 ${
                    full
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400/50 cursor-not-allowed opacity-60 line-through"
                      : selected
                      ? "bg-gradient-to-b from-amber-400 to-amber-500 border-amber-300 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]"
                      : "bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08] hover:border-amber-500/30 active:bg-white/[0.12]"
                  }`}
                >
                  <span className="text-sm font-semibold">{slot.label}</span>
                  {full && (
                    <span className="text-[10px] text-rose-400 block font-normal mt-0.5">
                      Hết chỗ
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {timeError && (
            <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1.5">
              <AlertCircleIcon size={14} className="shrink-0" />
              <span>{timeError}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
