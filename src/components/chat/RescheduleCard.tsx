"use client";

import { useState } from "react";
import { loadBookings, saveBookings } from "@/lib/booking/storage";
import { getAvailableWorkDays, generateDaySlots, type TimeSlot } from "@/lib/booking/slots";
import { MAX_BOOKINGS_PER_SLOT } from "@/lib/constants";
import type { Booking } from "@/lib/schemas";
import {
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CloseIcon,
} from "@/components/shared/FormIcons";

interface RescheduleCardProps {
  onRescheduled?: (booking: Booking) => void;
  onClose?: () => void;
  initialPhone?: string;
}

export function RescheduleCard({ onRescheduled, onClose, initialPhone = "" }: RescheduleCardProps) {
  const [step, setStep] = useState<"lookup" | "select_booking" | "select_slot" | "confirmed">("lookup");
  const [phone, setPhone] = useState(initialPhone);
  const [foundBookings, setFoundBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [availableDays] = useState<string[]>(() => getAvailableWorkDays(14));
  const [daySlots] = useState<TimeSlot[]>(() => generateDaySlots());
  const [allBookings, setAllBookings] = useState<Booking[]>(() => {
    if (typeof window === "undefined") return [];
    return loadBookings().bookings;
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const days = getAvailableWorkDays(14);
    return days.length > 0 ? days[0] : "";
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date display helper
  const formatDayDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      return {
        dayName: dayNames[date.getDay()],
        dateFormatted: `${d < 10 ? "0" + d : d}/${m < 10 ? "0" + m : m}`,
      };
    } catch {
      return { dayName: "", dateFormatted: dateStr };
    }
  };

  // Step 1: Tra cứu lịch hẹn theo SĐT
  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Vui lòng nhập số điện thoại đã dùng để đặt lịch.");
      return;
    }

    const { bookings } = loadBookings();
    setAllBookings(bookings);

    const pending = bookings.filter((b) => b.phone === trimmed && b.status === "pending");

    if (pending.length === 0) {
      setError("Không tìm thấy lịch hẹn nào đang chờ xử lý với số điện thoại này.");
      return;
    }

    setFoundBookings(pending);
    if (pending.length === 1) {
      setSelectedBooking(pending[0]);
      setStep("select_slot");
    } else {
      setStep("select_booking");
    }
  };

  // Step 2: Chọn lịch hẹn muốn đổi
  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setStep("select_slot");
  };

  // Kiểm tra slot đã đầy chưa
  const isSlotFull = (time: string, date: string) => {
    const count = allBookings.filter(
      (b) => b.date === date && b.time === time && b.status === "pending" && b.id !== selectedBooking?.id
    ).length;
    return count >= MAX_BOOKINGS_PER_SLOT;
  };

  // Step 3: Xác nhận đổi lịch
  const handleConfirm = () => {
    if (!selectedBooking || !selectedDate || !selectedTime) {
      setError("Vui lòng chọn cả ngày và khung giờ mới.");
      return;
    }

    if (isSlotFull(selectedTime, selectedDate)) {
      setError(`Khung giờ ${selectedTime} ngày ${selectedDate} đã đầy lịch.`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const { bookings } = loadBookings();
      const updatedList = bookings.map((b) => {
        if (b.id === selectedBooking.id) {
          return {
            ...b,
            date: selectedDate,
            time: selectedTime,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      });

      saveBookings(updatedList);
      setAllBookings(updatedList);

      const updatedBooking = {
        ...selectedBooking,
        date: selectedDate,
        time: selectedTime,
        updatedAt: new Date().toISOString(),
      };

      setSelectedBooking(updatedBooking);
      setStep("confirmed");

      if (onRescheduled) {
        onRescheduled(updatedBooking);
      }
    } catch {
      setError("Có lỗi xảy ra khi cập nhật lịch hẹn. Quý khách vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-200/90 shadow-md p-4 sm:p-5 space-y-4 my-2 max-w-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>EventHHD Concierge</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600">Đổi Lịch Hẹn Tư Vấn</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Tra cứu theo số điện thoại và chọn thời gian hẹn mới phù hợp
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            title="Đóng"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200 animate-in fade-in">
          <AlertCircleIcon size={16} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Tra cứu theo số điện thoại */}
      {step === "lookup" && (
        <form onSubmit={handleLookup} className="space-y-3.5">
          <p className="text-xs text-slate-600">
            Quý khách vui lòng nhập số điện thoại đã sử dụng khi đăng ký tư vấn để hệ thống tra cứu lịch hẹn:
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Số điện thoại:</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <PhoneIcon size={17} />
              </div>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] min-h-[46px] transition-all"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#4f46e5] hover:bg-[#3525cd] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[46px]"
          >
            <SearchIcon size={17} />
            <span>Tra cứu lịch hẹn</span>
          </button>
        </form>
      )}

      {/* STEP 2: Chọn lịch hẹn (nếu có nhiều lịch pending) */}
      {step === "select_booking" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-700">
              Tìm thấy {foundBookings.length} lịch hẹn đang chờ xử lý:
            </p>
            <button
              type="button"
              onClick={() => setStep("lookup")}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>← Đổi SĐT khác</span>
            </button>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {foundBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => handleSelectBooking(b)}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer space-y-1 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-indigo-700">#{b.id}</span>
                  <span className="text-[11px] font-mono font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {b.time} • {b.date}
                  </span>
                </div>
                <div className="text-xs text-slate-800">
                  <span className="font-medium">{b.name}</span> — {b.eventType || "Tư vấn sự kiện"}
                </div>
                {b.notes && <p className="text-[11px] text-slate-500 italic truncate">{b.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Chọn ngày và khung giờ mới */}
      {step === "select_slot" && selectedBooking && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-150 text-xs text-indigo-900 flex items-center justify-between">
            <div>
              <span className="font-semibold">Lịch hiện tại:</span> {selectedBooking.time} ngày {selectedBooking.date}
            </div>
            <button
              type="button"
              onClick={() => (foundBookings.length > 1 ? setStep("select_booking") : setStep("lookup"))}
              className="text-[11px] text-indigo-700 hover:underline font-semibold cursor-pointer"
            >
              Quay lại
            </button>
          </div>

          {/* Chọn ngày mới */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <CalendarIcon size={14} className="text-indigo-600 shrink-0" />
              <span>1. Chọn ngày làm việc mới:</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none py-1 touch-pan-x -webkit-overflow-scrolling-touch">
              {availableDays.slice(0, 7).map((day) => {
                const { dayName, dateFormatted } = formatDayDisplay(day);
                const isSelected = selectedDate === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day);
                      setError("");
                    }}
                    className={`px-3 py-2 rounded-xl border text-center shrink-0 min-w-[62px] min-h-[50px] flex flex-col items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs font-bold scale-[1.02]"
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-[10px] opacity-80 uppercase">{dayName}</span>
                    <span className="text-xs font-bold font-mono mt-0.5">{dateFormatted}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn giờ mới */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ClockIcon size={14} className="text-indigo-600 shrink-0" />
              <span>2. Chọn khung giờ mới (30 phút/phiên):</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-44 sm:max-h-40 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
              {daySlots.map((slot) => {
                const full = isSlotFull(slot.time, selectedDate);
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={full}
                    onClick={() => {
                      setSelectedTime(slot.time);
                      setError("");
                    }}
                    className={`py-2 px-1 rounded-lg text-center text-xs font-mono transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center select-none active:scale-95 ${
                      full
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60"
                        : isSelected
                        ? "bg-[#4f46e5] text-white font-bold shadow-xs scale-[1.02]"
                        : "bg-white text-slate-800 hover:bg-indigo-50 border border-slate-200"
                    }`}
                  >
                    <span>{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nút xác nhận */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => (foundBookings.length > 1 ? setStep("select_booking") : setStep("lookup"))}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] sm:min-h-0 order-2 sm:order-1"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!selectedDate || !selectedTime || isSubmitting}
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#3525cd] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer min-h-[46px] sm:min-h-0 order-1 sm:order-2"
            >
              {isSubmitting ? (
                <span>Đang cập nhật...</span>
              ) : (
                <>
                  <CheckCircleIcon size={16} />
                  <span>Xác nhận đổi lịch</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Thành công */}
      {step === "confirmed" && selectedBooking && (
        <div className="space-y-3.5 py-1">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircleIcon size={22} className="text-emerald-600 shrink-0" />
              <span className="font-bold text-sm text-emerald-950">Đổi lịch hẹn thành công!</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Lịch hẹn của Quý khách đã được cập nhật lại trên hệ thống điều phối EventHHD.
            </p>
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 text-xs text-slate-800 space-y-1">
              <div>
                <span className="font-semibold text-slate-600">Khách hàng:</span> {selectedBooking.name} ({selectedBooking.phone})
              </div>
              <div>
                <span className="font-semibold text-slate-600">Thời gian hẹn mới:</span>{" "}
                <strong className="text-[#4f46e5] font-mono">{selectedBooking.time}</strong> ngày{" "}
                <strong className="text-slate-900 font-mono">{selectedBooking.date}</strong>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Mã lịch hẹn:</span> #{selectedBooking.id}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RescheduleCard;
