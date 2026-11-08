"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loadBookings, saveBookings } from "@/lib/booking/storage";
import type { Booking } from "@/lib/schemas";
import { generateIcsFile } from "@/lib/calendar/generateIcs";
import { CalendarIcon, CloseIcon, SearchIcon } from "@/components/shared/FormIcons";

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyBookingsModal({ isOpen, onClose }: MyBookingsModalProps) {
  const { user } = useAuth();
  const [searchPhone, setSearchPhone] = useState(user?.phone || "");
  const [refreshKey, setRefreshKey] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBookings(loadBookings().bookings);
    }
  }, [isOpen, refreshKey]);

  // Cập nhật SĐT tìm kiếm khi user thay đổi
  useEffect(() => {
    if (user?.phone) setSearchPhone(user.phone);
  }, [user]);

  // Lọc lịch hẹn của riêng user theo số điện thoại
  const myBookings = useMemo(() => {
    const filterPhone = searchPhone.replace(/\s+/g, "").trim();
    const userName = user?.name?.toLowerCase() || "";
    if (!filterPhone) {
      return userName ? bookings.filter((b) => b.name.toLowerCase() === userName) : [];
    }
    return bookings.filter(
      (b) =>
        b.phone.replace(/\s+/g, "").includes(filterPhone) ||
        (userName && b.name.toLowerCase().includes(userName))
    );
  }, [bookings, searchPhone, user?.name]);

  if (!isOpen) return null;

  const handleCancelBooking = (id: string) => {
    if (confirm("Quý khách có chắc chắn muốn hủy lịch hẹn này?")) {
      const updated = bookings.filter((b) => b.id !== id);
      saveBookings(updated);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Lịch Hẹn Của Tôi</h3>
              <p className="text-[11px] text-slate-500">Tra cứu và quản lý lịch tư vấn sự kiện của Quý khách</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            title="Đóng"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Filter / Search by Phone */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <SearchIcon size={16} />
            </div>
            <input
              type="tel"
              inputMode="tel"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Nhập số điện thoại đã đăng ký để tra cứu..."
              className="w-full pl-9 pr-3 py-2.5 sm:py-1.5 bg-white border border-slate-300 rounded-xl text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[44px] sm:min-h-0 transition-all"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Tìm thấy: <strong className="text-indigo-600 font-bold">{myBookings.length}</strong> lịch hẹn
          </span>
        </div>

        {/* Bookings List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 min-h-[160px]">
          {myBookings.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <CalendarIcon size={24} />
              </div>
              <p className="text-xs font-semibold text-slate-700">Quý khách chưa có lịch hẹn nào với số điện thoại này.</p>
              <p className="text-[11px] text-slate-400">
                Hãy trò chuyện với Trợ lý AI Eve để đặt lịch tư vấn 1-1 miễn phí!
              </p>
            </div>
          ) : (
            myBookings.map((b) => {
              const isProcessed = b.status === "processed";
              return (
                <div
                  key={b.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all bg-white shadow-xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        #{b.id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{b.eventType || "Tư vấn sự kiện"}</span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isProcessed
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {isProcessed ? "Đã xác nhận & xếp lịch" : "Chờ tiếp nhận"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Thời gian hẹn:</span>
                      <strong className="text-slate-800">{b.time}</strong> • {b.date}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Khách hàng:</span>
                      <strong className="text-slate-800">{b.name}</strong> ({b.phone})
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ghi chú:</span>
                      <span className="text-slate-700 line-clamp-1">{b.notes || "Không có ghi chú"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => generateIcsFile(b, "EventHHD")}
                        className="w-full sm:w-auto px-3 py-2 sm:py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200 min-h-[38px] sm:min-h-0 select-none active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[15px]">download</span>
                        <span>Tải Calendar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const title = encodeURIComponent("[EventHHD] Lịch tư vấn 1-1");
                          const details = encodeURIComponent(`Khách hàng: ${b.name}\nSĐT: ${b.phone}\nLoại: ${b.eventType}`);
                          const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
                          window.open(calUrl, "_blank");
                        }}
                        className="w-full sm:w-auto px-3 py-2 sm:py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] sm:min-h-0 select-none active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                        <span>Google Cal</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b.id)}
                      className="w-full sm:w-auto px-3 py-2 sm:py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-200 sm:border-transparent min-h-[38px] sm:min-h-0 select-none active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      <span>Hủy hẹn</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span className="text-center sm:text-left">Hotline hỗ trợ khẩn cấp: <strong className="text-slate-800">1900 8899</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer text-center min-h-[44px] sm:min-h-0 active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
