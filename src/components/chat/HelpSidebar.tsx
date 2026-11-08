"use client";

import { useState } from "react";

interface HelpSidebarProps {
  onSelectQuestion?: (question: string) => void;
  onToggleHide?: () => void;
}

export default function HelpSidebar({
  onSelectQuestion,
  onToggleHide,
}: HelpSidebarProps) {
  const [activeCategory, setActiveCategory] = useState<string>("pricing");

  const categories = [
    { id: "pricing", label: "Báo giá & Chi phí", icon: "payments" },
    { id: "contract", label: "Hợp đồng & Đặt cọc", icon: "receipt_long" },
    { id: "venue", label: "Địa điểm 5 sao", icon: "domain" },
    { id: "security", label: "An ninh & Bảo mật", icon: "shield_lock" },
  ];

  const quickFaqs: Record<string, string[]> = {
    pricing: [
      "Chi phí tổ chức tiệc cưới trọn gói?",
      "Bảng dự toán chi phí gala 200 khách?",
      "Ưu đãi cho khách hàng doanh nghiệp quý 4?",
    ],
    contract: [
      "Quy trình đặt cọc và thanh toán 3 đợt?",
      "Chính sách bảo hiểm & rủi ro thời tiết?",
      "Điều khoản bảo mật thông tin sự kiện?",
    ],
    venue: [
      "Danh sách sảnh tiệc 5 sao liên kết tại TP.HCM?",
      "Quy trình khảo sát mặt bằng và maket 3D?",
      "Tiêu chuẩn bãi đỗ xe và khu vực đón VIP?",
    ],
    security: [
      "Tiêu chuẩn an ninh và bảo mật VIP Summit?",
      "Phương án y tế và phòng cháy chữa cháy?",
      "Thủ tục cấp phép bay flycam và trực thăng?",
    ],
  };

  return (
    <aside className="h-full flex flex-col gap-3.5 overflow-y-auto pr-0.5">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white shadow-xs border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-500 text-[20px]">
            view_sidebar
          </span>
          <div className="flex flex-col">
            <span className="font-title-md text-xs text-slate-900 font-bold leading-none">
              Taskbar Trợ Giúp
            </span>
            <span className="text-[10px] text-slate-500 leading-none mt-1">
              FAQ • Cam kết AI • Hotline SOS
            </span>
          </div>
        </div>
        {onToggleHide && (
          <button
            type="button"
            onClick={onToggleHide}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f2f4f6] hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-xs border border-slate-200"
            title="Ẩn taskbar trợ giúp"
          >
            <span className="material-symbols-outlined text-[15px] text-brand-500">
              chevron_right
            </span>
            <span>Ẩn</span>
          </button>
        )}
      </div>

      {/* Block 1: Quick FAQ by Category */}
      <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-1 border-b border-slate-100">
          <span className="material-symbols-outlined text-brand-500 text-[18px]">
            quiz
          </span>
          <span>Tra cứu câu hỏi nhanh</span>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 text-left transition-all border ${
                activeCategory === c.id
                  ? "bg-indigo-50/80 text-brand-600 border-indigo-200 font-semibold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/60"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {c.icon}
              </span>
              <span className="truncate">{c.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ list for category */}
        <div className="space-y-1.5 pt-1">
          {quickFaqs[activeCategory]?.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion?.(q)}
              className="w-full text-left p-2 rounded-lg bg-[#f7f9fb] hover:bg-indigo-50/60 hover:text-brand-500 text-slate-700 text-xs transition-colors border border-slate-200/60 flex items-start gap-1.5 group cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-brand-500 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform">
                arrow_forward_ios
              </span>
              <span className="leading-snug">{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Block 2: 4 AI Standards & Commitments */}
      <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-1 border-b border-slate-100">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">
            verified_user
          </span>
          <span>Tiêu chuẩn Trợ lý AI Eve</span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">
              lock
            </span>
            <div>
              <p className="font-semibold text-slate-900 text-[11px]">Bảo mật dữ liệu tuyệt đối</p>
              <p className="text-[10px] text-slate-500">Mã hóa TLS 1.3, không chia sẻ dữ liệu với bên thứ ba.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">
              bolt
            </span>
            <div>
              <p className="font-semibold text-slate-900 text-[11px]">Phản hồi tức thì &lt; 0.5s</p>
              <p className="text-[10px] text-slate-500">Dự toán ngân sách tự động theo thời gian thực.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">
              supervisor_account
            </span>
            <div>
              <p className="font-semibold text-slate-900 text-[11px]">Kết nối Điều phối viên</p>
              <p className="text-[10px] text-slate-500">Chuyển tiếp trực tiếp cho chuyên gia 10+ năm kinh nghiệm.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">
              price_check
            </span>
            <div>
              <p className="font-semibold text-slate-900 text-[11px]">Chi phí chuẩn VEA</p>
              <p className="text-[10px] text-slate-500">Minh bạch không phát sinh theo chuẩn Hiệp hội Sự kiện.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Block 3: Hotline SOS & Trực ban 24/7 */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] text-white shadow-md space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[18px]">
              emergency
            </span>
            <span className="font-bold text-xs">Hotline Tiếp Nhận Khẩn 24/7</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <p className="text-[10px] text-slate-300">Tổng đài tiếp nhận VIP (Miễn cước):</p>
            <a
              href="tel:19006886"
              className="text-base font-extrabold text-amber-300 hover:underline flex items-center gap-1.5 font-mono mt-0.5"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              1900 6886
            </a>
          </div>

          <div className="pt-1 text-[11px] text-slate-300 space-y-1">
            <p className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-purple-300">location_on</span>
              <span>144 Xuân Thủy, Phường Cầu Giấy, Hà Nội</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-purple-300">mail</span>
              <span>vip-events@eventhhd.vn</span>
            </p>
          </div>
        </div>

        <a
          href="/goi-dich-vu"
          className="w-full py-2 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Xem Bảng Giá Trọn Gói</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>
    </aside>
  );
}

