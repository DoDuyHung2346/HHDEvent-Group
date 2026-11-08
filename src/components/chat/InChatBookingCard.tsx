"use client";

import { useState, useEffect } from "react";
import type { Booking, QuoteSnapshot } from "@/lib/schemas";
import { addBooking, loadBookings } from "@/lib/booking/storage";
import { getAvailableWorkDays, generateDaySlots, type TimeSlot } from "@/lib/booking/slots";
import { validatePhone, validateName } from "@/lib/booking/validate";
import { MAX_BOOKINGS_PER_SLOT } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { formatVnd } from "@/lib/quote/format";
import { getBestStaffForBooking } from "@/lib/staff/recommendation";
import { determineShift } from "@/lib/staff/storage";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  TagIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
} from "@/components/shared/FormIcons";

interface InChatBookingCardProps {
  onSuccess: (booking: Booking) => void;
  defaultEventType?: string;
  defaultNote?: string;
  requirements?: QuoteSnapshot;
}

export default function InChatBookingCard({
  onSuccess,
  defaultEventType = "Tư vấn Tổ chức Sự kiện Tổng thể",
  defaultNote = "Tư vấn gói tiệc VIP và phương án tổ chức sự kiện trọn gói.",
  requirements,
}: InChatBookingCardProps) {
  const { user } = useAuth();
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Concept name nếu có trong requirements
  const conceptName = requirements?.lines.find((l) =>
    l.categoryLabel.toLowerCase().includes("concept")
  )?.optionLabel;

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("09:00");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [eventType, setEventType] = useState(
    conceptName
      ? `Sự kiện Concept ${conceptName} (${requirements?.selection.guestCount} khách)`
      : defaultEventType
  );
  const [notes, setNotes] = useState(
    requirements?.selection.note || defaultNote
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const days = getAvailableWorkDays(7);
    setAvailableDays(days);
    if (days.length > 0) {
      setSelectedDate(days[0]);
    }
    setAllSlots(generateDaySlots());
    setBookings(loadBookings().bookings);
  }, []);

  // Cập nhật tên/SĐT nếu user đăng nhập thay đổi
  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  // Định dạng ngày hiển thị tiếng Việt
  const formatDayDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const dayNames = ["CN", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const dayName = dayNames[date.getDay()];
      return {
        dayName,
        displayDate: `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`,
      };
    } catch {
      return { dayName: "Ngày", displayDate: dateStr };
    }
  };

  // Tính số lượng booking đã có trong slot đã chọn
  const getSlotCount = (date: string, time: string) => {
    return bookings.filter(
      (b) => b.date === date && b.time.startsWith(time) && b.status !== "processed"
    ).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const nameErr = validateName(name);
    if (nameErr) {
      setErrorMessage(nameErr);
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneErr = validatePhone(cleanPhone);
    if (phoneErr) {
      setErrorMessage(phoneErr);
      return;
    }

    if (!selectedDate) {
      setErrorMessage("Vui lòng chọn ngày gặp mặt.");
      return;
    }

    if (!selectedSlot) {
      setErrorMessage("Vui lòng chọn khung giờ hẹn.");
      return;
    }

    // Kiểm tra trùng slot tối đa
    if (getSlotCount(selectedDate, selectedSlot) >= MAX_BOOKINGS_PER_SLOT) {
      setErrorMessage(`Khung giờ ${selectedSlot} ngày ${selectedDate} đã kín lịch (tối đa ${MAX_BOOKINGS_PER_SLOT} lịch). Quý khách vui lòng chọn khung giờ khác.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const safeId = `EV-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
      
      // Tự động phân công chuyên viên tối ưu nhất
      const bestStaff = getBestStaffForBooking({
        date: selectedDate,
        time: selectedSlot,
        eventType: eventType.trim(),
      });
      const shift = determineShift(selectedSlot);

      const newBooking: Booking = {
        id: safeId,
        name: name.trim(),
        phone: cleanPhone,
        date: selectedDate,
        time: selectedSlot,
        eventType: eventType.trim(),
        notes: notes.trim(),
        requirements,
        status: "pending",
        assignedStaffId: bestStaff?.id,
        assignedStaffName: bestStaff?.name,
        assignedStaffPhone: bestStaff?.phone,
        shift,
        createdAt: new Date().toISOString(),
      };

      addBooking(newBooking);
      onSuccess(newBooking);
    } catch (err) {
      console.error(err);
      setErrorMessage("Có lỗi xảy ra khi lưu lịch hẹn. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-indigo-200/90 shadow-md space-y-4 my-2 text-slate-900 max-w-2xl animate-in fade-in duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 bg-gradient-to-r from-indigo-50/80 to-slate-50 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 px-4 sm:px-5 pt-4 rounded-t-2xl border-b border-indigo-100">
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdcc3] text-[#2f1500] uppercase font-mono tracking-wider">
            <SparklesIcon size={11} className="text-[#a44200]" />
            <span>EventHHD Concierge</span>
          </span>
          <h3 className="text-sm sm:text-base text-slate-900 font-bold mt-1">
            Phiếu Đặt Lịch Tư Vấn Trực Tiếp 1-1
          </h3>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Đặt lịch miễn phí cùng chuyên viên tổ chức sự kiện chuyên nghiệp
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
          <CalendarIcon size={20} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Requirements Summary if present */}
        {requirements && (
          <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-150 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <FileTextIcon size={14} className="text-[#4f46e5] shrink-0" />
                <span>Yêu cầu đã chọn ({requirements.selection.guestCount} khách):</span>
              </span>
              <span className="text-xs font-black text-[#3525cd]">
                {formatVnd(requirements.subtotal)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {requirements.lines.map((l, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-indigo-100">
                  {l.categoryLabel}: <strong>{l.optionLabel}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div>
          <label className="font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-950">
              <CalendarIcon size={14} className="text-indigo-600 shrink-0" />
              <span>1. Chọn ngày tư vấn (từ ngày mai) *</span>
            </span>
            <span className="text-[11px] text-indigo-600 font-normal">Tối đa 2 lịch / slot</span>
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none py-1 touch-pan-x -webkit-overflow-scrolling-touch">
            {availableDays.length === 0 ? (
              <div className="text-center py-2 text-slate-400 text-xs">Đang tải lịch...</div>
            ) : (
              availableDays.slice(0, 7).map((d) => {
                const { dayName, displayDate } = formatDayDisplay(d);
                const isSelected = selectedDate === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`shrink-0 min-w-[62px] sm:min-w-[68px] min-h-[50px] px-2.5 py-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center select-none active:scale-95 ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold scale-[1.02]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                    }`}
                  >
                    <span className="font-bold text-xs">{dayName}</span>
                    <span className={`text-[11px] mt-0.5 ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>{displayDate}</span>
                  </button>
                );
              })
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
            <span className="shrink-0">Hoặc chọn ngày khác:</span>
            <input
              type="date"
              min={availableDays[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 sm:h-8 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-base sm:text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Time Slot Selector */}
        <div>
          <label className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <ClockIcon size={14} className="text-indigo-600 shrink-0" />
            <span>2. Khung giờ thuận tiện *</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-44 sm:max-h-40 overflow-y-auto p-1.5 bg-slate-50/80 rounded-xl border border-slate-200">
            {allSlots.map((s) => {
              const count = getSlotCount(selectedDate, s.time);
              const isFull = count >= MAX_BOOKINGS_PER_SLOT;
              const isSelected = selectedSlot === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={isFull}
                  onClick={() => setSelectedSlot(s.time)}
                  className={`p-2.5 rounded-lg text-center text-xs font-medium border transition-all min-h-[46px] flex flex-col items-center justify-center select-none active:scale-95 ${
                    isFull
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-60"
                      : isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs cursor-pointer font-bold scale-[1.02]"
                      : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 cursor-pointer"
                  }`}
                >
                  <span className="font-semibold">{s.label}</span>
                  {isFull && <span className="text-[9px] text-red-500 font-normal">Kín lịch</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 w-full">
          <div className="w-full">
            <label className="block font-medium text-slate-700 mb-1">
              Họ và tên Quý khách <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <UserIcon size={17} />
              </div>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[46px] transition-all"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block font-medium text-slate-700 mb-1">
              Số điện thoại liên hệ <span className="text-red-500">*</span>
            </label>
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
                placeholder="0912 345 678"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[46px] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Event Type & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <div className="w-full">
            <label className="block font-medium text-slate-700 mb-1">Loại hình sự kiện</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <TagIcon size={17} />
              </div>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="Gala Dinner, Hội nghị, Ra mắt..."
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[46px] transition-all"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block font-medium text-slate-700 mb-1">Ghi chú yêu cầu đặc biệt</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <FileTextIcon size={17} />
              </div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Số lượng khách, yêu cầu riêng..."
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[46px] transition-all"
              />
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircleIcon size={16} className="shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:ml-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px] text-sm"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Đang ghi nhận...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon size={18} className="shrink-0" />
                <span>Xác Nhận Đặt Lịch Tư Vấn 1-1</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
