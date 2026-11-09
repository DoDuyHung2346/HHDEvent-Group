"use client";

import type { Booking } from "@/lib/schemas";
import { formatVnd } from "@/lib/quote/format";

interface BookingTableProps {
  bookings: Booking[];
  onMarkProcessed: (id: string) => void;
  onDeleteProcessed: (id: string) => void;
}

function formatDateTime(date: string, time: string): string {
  const d = new Date(date + "T00:00:00");
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dayStr = days[d.getDay()];
  const dateFormatted = `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
  return `${dayStr}, ${dateFormatted} lúc ${time}`;
}

export default function BookingTable({
  bookings,
  onMarkProcessed,
  onDeleteProcessed,
}: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-20 px-4 text-slate-400">
        <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
          📅
        </div>
        <h3 className="text-white font-bold text-base">Chưa có lịch hẹn nào</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Các yêu cầu tư vấn đặt qua Chatbot hoặc form sẽ được tự động đồng bộ và hiển thị tại đây.
        </p>
      </div>
    );
  }

  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      {/* ============================================================ */}
      {/* 🖥️ DESKTOP VIEW: Bảng dữ liệu chuyên nghiệp (Màn hình >= 768px) */}
      {/* ============================================================ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#0A0F1D]/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3.5 px-5">Khách hàng</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4">Lịch hẹn tư vấn</th>
              <th className="py-3.5 px-4">Loại sự kiện</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {sorted.map((booking) => {
              const isProcessed = booking.status === "processed";
              return (
                <tr
                  key={booking.id}
                  className={`transition-colors duration-150 hover:bg-white/[0.03] ${
                    isProcessed ? "opacity-75 bg-[#080C14]/40" : "bg-transparent"
                  }`}
                >
                  {/* Name & Notes */}
                  <td className="py-4 px-5">
                    <div className="font-semibold text-white text-sm">
                      {booking.name}
                    </div>
                    {booking.notes && (
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                        "{booking.notes}"
                      </div>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4">
                    <a
                      href={`tel:${booking.phone}`}
                      className="font-mono text-xs text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1.5"
                    >
                      <span>📞</span>
                      <span>{booking.phone}</span>
                    </a>
                  </td>

                  {/* Date & Time */}
                  <td className="py-4 px-4 text-slate-300 text-xs whitespace-nowrap">
                    <span className="font-medium text-white">
                      {formatDateTime(booking.date, booking.time)}
                    </span>
                  </td>

                  {/* Event Type */}
                  <td className="py-4 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 text-xs font-medium">
                      {booking.eventType ?? "Tư vấn chung"}
                    </span>
                    {booking.requirements && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-300">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-mono">
                          ★ Có yêu cầu chi tiết ({formatVnd(booking.requirements.subtotal)})
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isProcessed
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isProcessed ? "Đã xử lý" : "Chờ xử lý"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      {!isProcessed && (
                        <button
                          id={`mark-processed-${booking.id}`}
                          onClick={() => onMarkProcessed(booking.id)}
                          className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold transition-all border border-amber-500/30 hover:border-amber-400 cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <span>✓</span>
                          <span>Đánh dấu xử lý</span>
                        </button>
                      )}
                      {isProcessed && (
                        <button
                          id={`delete-booking-${booking.id}`}
                          onClick={() => onDeleteProcessed(booking.id)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 rounded-xl text-xs font-medium transition-all border border-rose-500/25 cursor-pointer flex items-center gap-1"
                        >
                          <span>🗑️</span>
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ============================================================ */}
      {/* 📱 MOBILE VIEW: Danh sách thẻ trực quan, chạm nhanh (Màn hình < 768px) */}
      {/* ============================================================ */}
      <div className="block md:hidden divide-y divide-white/[0.08]">
        {sorted.map((booking) => {
          const isProcessed = booking.status === "processed";
          return (
            <div
              key={booking.id}
              className={`p-4 transition-colors ${
                isProcessed ? "opacity-75 bg-black/20" : "bg-transparent"
              }`}
            >
              {/* Header card: Name + Status */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div>
                  <h4 className="text-white font-bold text-base leading-snug">
                    {booking.name}
                  </h4>
                  <a
                    href={`tel:${booking.phone}`}
                    className="inline-flex items-center gap-1.5 text-amber-300 font-mono text-xs font-medium mt-1 hover:underline"
                  >
                    <span>📞</span>
                    <span>{booking.phone}</span>
                  </a>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isProcessed
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isProcessed ? "✅ Đã xong" : "⏳ Chờ duyệt"}
                </span>
              </div>

              {/* Card Meta: Time & Event */}
              <div className="space-y-1.5 mb-3 text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">📅</span>
                  <span className="font-medium text-white">
                    {formatDateTime(booking.date, booking.time)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">🎉</span>
                  <span className="text-amber-200 font-medium">
                    {booking.eventType ?? "Tư vấn chung"}
                  </span>
                </div>
                {booking.notes && (
                  <div className="text-[11px] text-slate-400 italic pt-1 border-t border-white/[0.04]">
                    Ghi chú: "{booking.notes}"
                  </div>
                )}
              </div>

              {/* Mobile Actions (Touch Target >= 44px) */}
              <div>
                {!isProcessed && (
                  <button
                    id={`mark-processed-${booking.id}`}
                    onClick={() => onMarkProcessed(booking.id)}
                    className="w-full min-h-[44px] py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 active:from-amber-600 active:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>✓</span>
                    <span>Xác nhận đã xử lý lịch hẹn</span>
                  </button>
                )}
                {isProcessed && (
                  <button
                    id={`delete-booking-${booking.id}`}
                    onClick={() => onDeleteProcessed(booking.id)}
                    className="w-full min-h-[44px] py-2.5 bg-rose-500/15 active:bg-rose-500/30 text-rose-300 font-semibold rounded-xl text-xs transition-all border border-rose-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🗑️</span>
                    <span>Xóa lịch hẹn này</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
