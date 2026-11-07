"use client";

import type { Booking } from "@/lib/schemas";
import { generateIcsFile } from "@/lib/calendar/generateIcs";
import { formatVnd } from "@/lib/quote/format";

interface BookingConfirmationTicketProps {
  booking: Booking;
  onReschedule?: () => void;
}

export default function BookingConfirmationTicket({
  booking,
  onReschedule,
}: BookingConfirmationTicketProps) {
  const staffName = booking.assignedStaffName || "Trần Minh Tuấn";
  const staffPhone = booking.assignedStaffPhone || "1900 6886";
  const staffId = booking.assignedStaffId || "EV-001";
  const shiftLabel = booking.shift === "morning" ? "Ca Sáng" : "Ca Chiều";

  const handleAddToGoogleCalendar = () => {
    const title = encodeURIComponent("[EventViet] Lịch tư vấn sự kiện 1-1");
    const details = encodeURIComponent(
      `Khách hàng: ${booking.name}\nSĐT: ${booking.phone}\nLoại hình: ${booking.eventType || "Tư vấn sự kiện"}\nGhi chú: ${booking.notes || "Không có"}\nChuyên viên điều phối: ${staffName} (${staffId}) - Hotline: ${staffPhone}`
    );
    const location = encodeURIComponent("Văn phòng EventViet - Cầu Giấy, Hà Nội / Online Meet");
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(calUrl, "_blank");
  };

  const handleDownloadIcs = () => {
    generateIcsFile(booking, "EventViet");
  };

  return (
    <div className="flex items-start gap-3.5 max-w-2xl my-3">
      {/* Avatar Icon */}
      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <span className="material-symbols-outlined text-[19px]">verified</span>
      </div>

      <div className="space-y-3 flex-1 min-w-0">
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-emerald-200/80 shadow-md space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 bg-emerald-50/60 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 px-4 sm:px-5 pt-4 rounded-t-xl border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-title-md text-sm sm:text-base text-slate-900 font-bold">
                Lịch Hẹn Tư Vấn Đã Được Xác Nhận
              </span>
            </div>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#dae2fd] text-[#131b2e] border border-indigo-200">
              Mã phiếu: #{booking.id}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <span className="font-body-sm text-[11px] text-slate-500 block mb-0.5">
                Thời gian gặp ({shiftLabel})
              </span>
              <span className="font-title-md text-xs sm:text-sm text-slate-900 font-bold block">
                {booking.time || "09:00"}
              </span>
              <span className="font-mono text-[11px] text-[#4f46e5] font-semibold">
                {booking.date || "2026-11-28"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <span className="font-body-sm text-[11px] text-slate-500 block mb-0.5">
                Chuyên viên điều phối
              </span>
              <span className="font-title-md text-xs sm:text-sm text-slate-900 font-bold block">
                {staffName}
              </span>
              <span className="font-body-sm text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
                <span>Mã: {staffId}</span>
                <span>•</span>
                <span>📞 {staffPhone}</span>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs">
              <span className="font-body-sm text-[11px] text-slate-500 block mb-0.5">
                Trạng thái hệ thống
              </span>
              <span className="inline-flex items-center gap-1 font-label-md text-xs text-emerald-700 font-semibold mt-0.5">
                <span className="material-symbols-outlined text-[15px]">cloud_done</span>
                Đã ghi nhận (CRM)
              </span>
              <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                Khách hàng: {booking.phone}
              </span>
            </div>
          </div>

          {/* Requirements Details if present */}
          {booking.requirements && (
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-150 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#4f46e5]">receipt_long</span>
                  <span>Yêu cầu chi tiết ({booking.requirements.selection.guestCount} khách)</span>
                </span>
                <span className="text-xs font-black text-[#3525cd]">
                  {formatVnd(booking.requirements.subtotal)}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToGoogleCalendar}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-600">event</span>
                <span>Thêm vào Google Calendar</span>
              </button>
              <button
                onClick={handleDownloadIcs}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-emerald-600">download</span>
                <span>Tải file .ics</span>
              </button>
            </div>

            {onReschedule && (
              <button
                onClick={onReschedule}
                className="px-3 py-1.5 rounded-lg text-indigo-700 hover:bg-indigo-50 text-xs font-semibold transition-colors"
              >
                Đổi lịch hẹn khác
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
