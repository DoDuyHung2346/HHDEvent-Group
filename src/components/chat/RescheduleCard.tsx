"use client";

import { useEffect, useState } from "react";
import { fetchBookings, rescheduleRemoteBooking } from "@/lib/booking/api";
import { getAvailableWorkDays, generateDaySlots, type TimeSlot } from "@/lib/booking/slots";
import { MAX_BOOKINGS_PER_SLOT } from "@/lib/constants";
import { validateDailyBookingLimit } from "@/lib/booking/validate";
import type { Booking } from "@/lib/schemas";

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
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const days = getAvailableWorkDays(14);
    return days.length > 0 ? days[0] : "";
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    fetchBookings({ date: selectedDate })
      .then((slotBookings) => {
        setAllBookings((current) => {
          const merged = [...current.filter((booking) => booking.phone), ...slotBookings];
          return Array.from(new Map(merged.map((booking) => [booking.id, booking])).values());
        });
      })
      .catch(() => undefined);
  }, [selectedDate]);

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
  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Vui lòng nhập số điện thoại đã dùng để đặt lịch.");
      return;
    }

    let bookings: Booking[];
    try {
      bookings = await fetchBookings({ phone: trimmed });
      const slotBookings = selectedDate ? await fetchBookings({ date: selectedDate }) : [];
      setAllBookings(Array.from(new Map([...bookings, ...slotBookings].map((booking) => [booking.id, booking])).values()));
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Không thể tra cứu lịch hẹn.");
      return;
    }

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
  const handleConfirm = async () => {
    if (!selectedBooking || !selectedDate || !selectedTime) {
      setError("Vui lòng chọn cả ngày và khung giờ mới.");
      return;
    }

    if (isSlotFull(selectedTime, selectedDate)) {
      setError("Khung giờ này vừa có người đặt và đã kín lịch. Vui lòng chọn khung giờ khác.");
      return;
    }
    const dailyLimitError = validateDailyBookingLimit(
      selectedBooking.phone,
      selectedDate,
      allBookings,
      selectedBooking.id
    );
    if (dailyLimitError) {
      setError(dailyLimitError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const updatedBooking = await rescheduleRemoteBooking(selectedBooking.id, selectedDate, selectedTime);
      const updatedList = allBookings.map((b) => (b.id === selectedBooking.id ? updatedBooking : b));
      setAllBookings(updatedList);
      setSelectedBooking(updatedBooking);

      setStep("confirmed");
      onRescheduled?.(updatedBooking);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Không thể cập nhật lịch hẹn. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-indigo-200/90 shadow-md space-y-4 text-slate-800 my-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
          </div>
          <div>
            <h3 className="font-title-md text-sm sm:text-base font-bold text-slate-900">
              Đổi Lịch Hẹn Tư Vấn 1-1
            </h3>
            <p className="text-[11px] text-slate-500">Hệ thống tiếp nhận và điều chỉnh lịch trực tuyến</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
          <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Tra cứu theo số điện thoại */}
      {step === "lookup" && (
        <form onSubmit={handleLookup} className="space-y-3">
          <p className="text-xs text-slate-600">
            Quý khách vui lòng nhập số điện thoại đã sử dụng khi đăng ký tư vấn để hệ thống tra cứu lịch hẹn:
          </p>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700">Số điện thoại:</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                required
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
                call
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">search</span>
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
              className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Đổi SĐT khác</span>
            </button>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {foundBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => handleSelectBooking(b)}
                className="p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-indigo-700">#{b.id}</span>
                  <span className="text-[11px] font-mono font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
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
          <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
            <div>
              <span className="font-semibold">Lịch hiện tại:</span> {selectedBooking.time} ngày {selectedBooking.date}
            </div>
            <button
              type="button"
              onClick={() => (foundBookings.length > 1 ? setStep("select_booking") : setStep("lookup"))}
              className="text-[11px] text-indigo-700 hover:underline font-medium cursor-pointer"
            >
              Quay lại
            </button>
          </div>

          {/* Chọn ngày mới */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 block">
              1. Chọn ngày hẹn mới:
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
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
                    className={`px-2.5 py-1.5 rounded-lg border text-center shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-[10px] opacity-80">{dayName}</div>
                    <div className="text-xs font-bold font-mono">{dateFormatted}</div>
                  </button>
                );
              })}
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-600">
              <span>Hoặc chọn ngày khác:</span>
              <input
                type="date"
                min={availableDays[0]}
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setError("");
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-800"
              />
            </label>
          </div>

          {/* Chọn giờ mới */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 block">
              2. Chọn khung giờ mới (8:00 - 17:00, 30 phút/phiên):
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
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
                    className={`py-1.5 px-1 rounded text-center text-xs font-mono transition-all cursor-pointer ${
                      full
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed line-through"
                        : isSelected
                        ? "bg-[#4f46e5] text-white font-bold shadow-xs"
                        : "bg-white text-slate-800 hover:bg-indigo-50 border border-slate-200"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nút xác nhận */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => (foundBookings.length > 1 ? setStep("select_booking") : setStep("lookup"))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!selectedDate || !selectedTime || isSubmitting}
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{isSubmitting ? "Đang cập nhật..." : "Xác nhận đổi lịch"}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Thành công */}
      {step === "confirmed" && selectedBooking && (
        <div className="space-y-3.5 py-1">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
              <span className="font-bold text-sm text-emerald-950">Đổi lịch hẹn thành công!</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Lịch hẹn của Quý khách đã được cập nhật lại trên hệ thống điều phối EventViet.
            </p>
            <div className="p-2.5 bg-white/90 rounded-lg border border-emerald-100 text-xs text-slate-800 space-y-1">
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
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
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
