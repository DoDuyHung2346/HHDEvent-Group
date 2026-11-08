"use client";

import { useState } from "react";

interface UrgentContactCardProps {
  onOpenBooking?: () => void;
  onClose?: () => void;
}

export function UrgentContactCard({ onOpenBooking, onClose }: UrgentContactCardProps) {
  const [isAvailable] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const now = new Date();
    const isWorkDay = [1, 2, 3, 4, 5, 6].includes(now.getDay());
    const hour = now.getHours();
    return isWorkDay && hour >= 8 && hour < 17;
  });

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white to-red-50/30 border border-red-200 shadow-md space-y-4 text-slate-800 my-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-red-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">emergency</span>
          </div>
          <div>
            <h3 className="font-title-md text-sm sm:text-base font-bold text-slate-900">
              Kênh Liên Hệ Khẩn Cấp & Hỗ Trợ 24/7
            </h3>
            <p className="text-[11px] text-slate-500">Ưu tiên xử lý sự kiện phát sinh gấp trong ngày</p>
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

      {/* Status banner */}
      {isAvailable ? (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span>
            <strong>Đang trong giờ làm việc (8:00 - 17:00, T2-T7)</strong> — Chuyên viên trực tổng đài sẵn sàng tiếp nhận cuộc gọi.
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">schedule</span>
          <div>
            <strong className="block">Hiện đang ngoài giờ làm việc tiêu chuẩn (8:00 - 17:00, T2-T7)</strong>
            <span>
              Yêu cầu gấp sẽ được hotline trực ban hoặc chuyên viên phản hồi trong vòng tối đa 2 giờ làm việc tiếp theo.
            </span>
          </div>
        </div>
      )}

      {/* Contact actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Hotline */}
        <a
          href="tel:19006886"
          className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-between shadow-xs transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] group-hover:animate-bounce">call</span>
            <div className="text-left">
              <div className="text-[10px] text-red-100 font-normal">Hotline Khẩn Cấp (Phí chuẩn)</div>
              <div className="text-base font-bold font-mono">1900 6886</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] opacity-80">arrow_forward</span>
        </a>

        {/* Zalo OA */}
        <a
          href="https://zalo.me/eventhhd"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-[#0068ff] hover:bg-[#0052cc] text-white font-semibold text-xs sm:text-sm flex items-center justify-between shadow-xs transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">chat</span>
            <div className="text-left">
              <div className="text-[10px] text-blue-100 font-normal">Chat trực tuyến qua Zalo OA</div>
              <div className="text-sm font-bold">Zalo: EventHHD Official</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] opacity-80">open_in_new</span>
        </a>
      </div>

      {/* Secondary Contacts & Urgent Booking Option */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
          <span>Email khẩn:</span>
          <a href="mailto:vip-events@eventhhd.vn" className="font-semibold text-indigo-600 hover:underline">
            vip-events@eventhhd.vn
          </a>
        </div>

        {onOpenBooking && (
          <button
            type="button"
            onClick={onOpenBooking}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200"
          >
            <span className="material-symbols-outlined text-[16px]">priority_high</span>
            <span>Để lại thông tin liên hệ gấp</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default UrgentContactCard;
