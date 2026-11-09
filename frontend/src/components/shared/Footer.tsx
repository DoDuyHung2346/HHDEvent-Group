"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-purple-100/80 shrink-0 text-[#191c1e] pt-12 pb-8 mt-auto" id="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-sm shadow-xs">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24">
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight font-headline-md">
                EventHHD
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#464555] max-w-sm leading-relaxed">
              Nền tảng công nghệ quản lý, tổ chức sự kiện thượng hạng và báo giá tự động chuẩn hóa hàng đầu tại Việt Nam.
            </p>
            <div className="space-y-1.5 text-xs text-[#464555]">
              <p>
                <strong className="text-slate-800">Pháp nhân:</strong> Công Ty Cổ Phần Công Nghệ & Sự Kiện EventHHD Việt Nam
              </p>
              <p>
                <strong className="text-slate-800">Địa chỉ:</strong> 144 Xuân Thủy, Phường Cầu Giấy, Hà Nội
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                <span className="material-symbols-outlined text-[14px]">verified</span> ISO/IEC 27001:2022
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-brand-700 text-[11px] font-semibold border border-purple-200">
                <span className="material-symbols-outlined text-[14px]">verified_user</span> VEA Member
              </span>
            </div>
          </div>

          {/* Col 2: Dịch Vụ Sự Kiện */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Dịch Vụ Sự Kiện
            </h4>
            <ul className="space-y-2 text-xs text-[#464555]">
              <li><a href="#pricing-cards" className="hover:text-brand-600 transition-colors">Gala Dinner & Kỷ Niệm</a></li>
              <li><a href="#pricing-cards" className="hover:text-brand-600 transition-colors">Hội Nghị & Ra Mắt Sản Phẩm</a></li>
              <li><a href="#pricing-cards" className="hover:text-brand-600 transition-colors">Tiệc Cưới Luxury Destination</a></li>
              <li><a href="#pricing-cards" className="hover:text-brand-600 transition-colors">Bespoke VIP Private Party</a></li>
              <li><a href="#calculator-section" className="hover:text-brand-600 transition-colors">Sân Khấu LED Kinetic</a></li>
              <li><a href="#calculator-section" className="hover:text-brand-600 transition-colors">Âm Thanh L-Acoustics</a></li>
            </ul>
          </div>

          {/* Col 3: Giải Pháp Số */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Giải Pháp Số
            </h4>
            <ul className="space-y-2 text-xs text-[#464555]">
              <li><a href="#calculator-section" className="hover:text-brand-600 transition-colors">Interactive Cost Calculator</a></li>
              <li><Link href="/" className="hover:text-brand-600 transition-colors">AI Trợ Lý Booking 24/7</Link></li>
              <li><Link href="/admin" className="hover:text-brand-600 transition-colors">Quản Trị Lịch Hẹn CRM</Link></li>
              <li><Link href="/admin" className="hover:text-brand-600 transition-colors">Bộ Dữ Liệu FAQ Thông Minh</Link></li>
              <li><a href="#comparison-matrix" className="hover:text-brand-600 transition-colors">So Sánh Báo Giá Minh Bạch</a></li>
            </ul>
          </div>

          {/* Col 4: Liên Hệ & Hỗ Trợ VIP */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Hỗ Trợ VIP
            </h4>
            <div className="space-y-2.5 text-xs text-[#464555]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-600 text-[18px]">headset_mic</span>
                <span>Hotline VIP: <strong className="text-brand-600 font-bold font-mono">1900 6886</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-600 text-[18px]">mail</span>
                <span>vip-events@eventhhd.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-600 text-[18px]">schedule</span>
                <span>Trực ban 24/7/365</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-800 mb-1.5">
                Thanh toán chấp nhận:
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-slate-600 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">Visa / Master</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">VietQR</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">JCB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 EventHHD Corporation. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/" className="hover:text-brand-600">Chính sách bảo mật</Link>
            <span>•</span>
            <Link href="/" className="hover:text-brand-600">Quy chuẩn dịch vụ</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-brand-600">Cổng quản trị</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
