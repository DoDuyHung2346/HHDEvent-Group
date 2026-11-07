"use client";

import React from "react";

interface PricingComparisonCardProps {
  onSelectTier?: (tier: string) => void;
}

export default function PricingComparisonCard({ onSelectTier }: PricingComparisonCardProps) {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-4 my-2">
      <p className="font-body-md text-sm text-[#191c1e] leading-relaxed">
        Dạ thưa Quý khách, với quy mô <strong>200 khách cho dạ tiệc Tri ân Khách hàng (Customer Appreciation Gala)</strong>, EventHHD phân bổ 3 phân khúc chuẩn mực để doanh nghiệp dễ dàng cân đối ngân sách:
      </p>

      {/* 3 Tier Grid - Scroll ngang trên mobile (1 cột), 3 cột trên tablet/desktop */}
      <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {/* Tier 1: Essential */}
        <div className="w-[85%] sm:w-[280px] md:w-auto shrink-0 snap-start p-3.5 rounded-lg bg-[#f2f4f6] border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-xs text-[#464555] font-semibold">
                Gói Essential
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#464555] font-mono border border-slate-200">
                Chuẩn
              </span>
            </div>
            <p className="font-headline-sm text-lg text-[#3525cd] font-bold">
              180M - 260M
            </p>
            <p className="font-body-sm text-xs text-[#464555] mt-0.5">
              ~900.000đ - 1.300.000đ/khách
            </p>
          </div>
          <ul className="font-body-sm text-xs text-slate-700 space-y-1 mt-3 pt-3 bg-white/80 p-2.5 rounded border border-slate-100">
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4f46e5] text-[14px]">check</span>
              Sảnh tiệc 4 sao trung tâm
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4f46e5] text-[14px]">check</span>
              Hệ thống LED P3 & Âm thanh P.A
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4f46e5] text-[14px]">check</span>
              Key Visual & Backdrop chụp ảnh
            </li>
          </ul>
        </div>

        {/* Tier 2: Signature VIP (Recommended) */}
        <div className="w-[85%] sm:w-[280px] md:w-auto shrink-0 snap-start p-3.5 rounded-lg bg-indigo-50/70 border-2 border-[#4f46e5] shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#4f46e5] text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-bl">
            KHUYÊN DÙNG
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-xs text-[#3525cd] font-bold">
                Gói Signature VIP
              </span>
            </div>
            <p className="font-headline-sm text-lg text-[#3525cd] font-bold">
              320M - 480M
            </p>
            <p className="font-body-sm text-xs text-[#464555] mt-0.5">
              ~1.600.000đ - 2.400.000đ/khách
            </p>
          </div>
          <ul className="font-body-sm text-xs text-slate-800 space-y-1 mt-3 pt-3 bg-white p-2.5 rounded border border-indigo-100">
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4f46e5] text-[14px]">check</span>
              Sảnh khách sạn 5 sao quốc tế
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4f46e5] text-[14px]">check</span>
              Trình diễn ánh sáng & MC
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4f46e5] text-[14px]">check</span>
              Quay phim 3 máy + Flycam + Recap
            </li>
          </ul>
        </div>

        {/* Tier 3: Prestige Bespoke */}
        <div className="w-[85%] sm:w-[280px] md:w-auto shrink-0 snap-start p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-xs text-[#703a00] font-semibold">
                Gói Prestige Bespoke
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-[#703a00] font-mono font-medium">
                Đỉnh cao
              </span>
            </div>
            <p className="font-headline-sm text-lg text-[#934e00] font-bold">
              600M - 1.2B+
            </p>
            <p className="font-body-sm text-xs text-[#464555] mt-0.5">
              Trọn gói cá nhân hóa 100%
            </p>
          </div>
          <ul className="font-body-sm text-xs text-slate-800 space-y-1 mt-3 pt-3 bg-white p-2.5 rounded border border-amber-100">
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#934e00] text-[14px]">check</span>
              Đạo diễn sân khấu & Ca sĩ hạng A
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#934e00] text-[14px]">check</span>
              Fine Dining thực đơn thượng hạng
            </li>
            <li className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#934e00] text-[14px]">check</span>
              Hệ thống quà tặng chế tác riêng
            </li>
          </ul>
        </div>
      </div>

      {/* Swipe hint on mobile */}
      <div className="md:hidden text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 py-0.5">
        <span className="material-symbols-outlined text-[14px] text-indigo-500">swipe</span>
        <span>Vuốt ngang để xem 3 gói dịch vụ</span>
      </div>

      {/* Note & Discount banner */}
      <div className="p-3 rounded-lg bg-[#eceef0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-[#464555]">
        <span>* Chi phí trên đã bao gồm thuế VAT, phí quản lý nhân sự & bảo hiểm trách nhiệm sự kiện.</span>
        <span className="font-mono text-[#3525cd] font-bold shrink-0">
          Chiết khấu 10% trong Quý 4
        </span>
      </div>
    </div>
  );
}

