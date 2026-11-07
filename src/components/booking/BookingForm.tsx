"use client";

import { useState } from "react";
import { useBookings } from "@/hooks/useBookings";
import { validateBookingForm } from "@/lib/booking/validate";
import { getAvailableWorkDays, generateDaySlots } from "@/lib/booking/slots";
import SlotPicker from "./SlotPicker";
import { getBestStaffForBooking } from "@/lib/staff/recommendation";
import { determineShift } from "@/lib/staff/storage";

interface BookingFormProps {
  defaultEventType?: string;
  onSuccess: () => void;
  onClose: () => void;
}

const EVENT_TYPES = [
  "Year-end Party / Gala Dinner",
  "Hội nghị / Hội thảo Doanh nghiệp",
  "Team Building / Retreat Ngoài trời",
  "Lễ Khai trương / Khánh thành",
  "Kỷ niệm Thành lập Công ty",
  "Triển lãm / Ra mắt Sản phẩm",
  "Khác",
];

export default function BookingForm({
  defaultEventType = "",
  onSuccess,
  onClose,
}: BookingFormProps) {
  const { bookings, add } = useBookings();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    eventType: defaultEventType,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDays = getAvailableWorkDays(30);
  const slots = generateDaySlots();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = validateBookingForm(
      { name: form.name, phone: form.phone, date: form.date, time: form.time },
      bookings
    );

    if (!result.valid) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    const assignedStaff = getBestStaffForBooking({
      date: form.date,
      time: form.time,
      eventType: form.eventType || defaultEventType,
    });
    const shift = determineShift(form.time);

    const booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      date: form.date,
      time: form.time,
      eventType: form.eventType || undefined,
      notes: form.notes || undefined,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      assignedStaffId: assignedStaff?.id,
      assignedStaffName: assignedStaff?.name,
      assignedStaffPhone: assignedStaff?.phone,
      shift,
    };

    add(booking);
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 text-slate-100">
      {/* Mobile handle indicator */}
      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold mb-1">
            <span>✨</span>
            <span>Tư vấn miễn phí 100%</span>
          </div>
          <h2 className="text-white font-bold text-lg sm:text-xl tracking-tight">
            Đặt lịch tư vấn sự kiện
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            EventViet sẽ liên hệ xác nhận trong vòng 15 phút làm việc
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-all cursor-pointer border border-white/10"
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {/* Tên */}
        <div className="flex flex-col gap-1.5 w-full">
          <label
            className="block text-slate-300 text-xs font-semibold"
            htmlFor="booking-name"
          >
            Họ tên người liên hệ *
          </label>
          <input
            id="booking-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Ví dụ: Nguyễn Hoàng Nam"
            maxLength={50}
            className={`w-full h-12 bg-[#0A0F1D] text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm border ${
              errors.name
                ? "border-rose-500 ring-1 ring-rose-500/30"
                : "border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
            } outline-none transition-all`}
          />
          {errors.name && (
            <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
              <span>⚠️</span>
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Số điện thoại */}
        <div className="flex flex-col gap-1.5 w-full">
          <label
            className="block text-slate-300 text-xs font-semibold"
            htmlFor="booking-phone"
          >
            Số điện thoại nhận tư vấn *
          </label>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Ví dụ: 0912345678"
            className={`w-full h-12 bg-[#0A0F1D] text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm border ${
              errors.phone
                ? "border-rose-500 ring-1 ring-rose-500/30"
                : "border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
            } outline-none transition-all`}
          />
          {errors.phone && (
            <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
              <span>⚠️</span>
              <span>{errors.phone}</span>
            </p>
          )}
        </div>

        {/* Loại sự kiện */}
        <div className="flex flex-col gap-1.5 w-full">
          <label
            className="block text-slate-300 text-xs font-semibold"
            htmlFor="booking-event-type"
          >
            Loại hình sự kiện quan tâm
          </label>
          <div className="relative w-full">
            <select
              id="booking-event-type"
              name="eventType"
              value={form.eventType}
              onChange={handleChange}
              className="w-full h-12 bg-[#0A0F1D] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all appearance-none cursor-pointer [&>option]:bg-[#0E1424]"
            >
              <option value="">-- Chọn loại hình sự kiện --</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Ngày và giờ */}
        <SlotPicker
          availableDays={availableDays}
          slots={slots}
          selectedDate={form.date}
          selectedTime={form.time}
          onDateChange={(date) => {
            setForm((prev) => ({ ...prev, date, time: "" }));
            if (errors.date)
              setErrors((prev) => {
                const n = { ...prev };
                delete n.date;
                return n;
              });
          }}
          onTimeChange={(time) => {
            setForm((prev) => ({ ...prev, time }));
            if (errors.time)
              setErrors((prev) => {
                const n = { ...prev };
                delete n.time;
                return n;
              });
          }}
          bookedSlots={bookings
            .filter((b) => b.date === form.date)
            .map((b) => b.time)}
          dateError={errors.date}
          timeError={errors.time}
          existingBookings={bookings}
        />

        {/* Ghi chú */}
        <div className="flex flex-col gap-1.5 w-full">
          <label
            className="block text-slate-300 text-xs font-semibold"
            htmlFor="booking-notes"
          >
            Yêu cầu thêm (quy mô khách, ngân sách dự kiến, địa điểm...)
          </label>
          <textarea
            id="booking-notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Ví dụ: Tiệc 200 khách tại Quận 1, ngân sách khoảng 80-100 triệu..."
            rows={2}
            maxLength={500}
            className="w-full bg-[#0A0F1D] text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all resize-none"
          />
        </div>

        {/* Submit button */}
        <button
          id="booking-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isSubmitting ? (
            <span>Đang ghi nhận lịch...</span>
          ) : (
            <>
              <span>✨</span>
              <span>Xác nhận đặt lịch tư vấn</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
