"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 shrink-0 text-[#191c1e] pt-12 pb-8 mt-auto" id="site-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-10">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3525cd] to-[#4f46e5] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                HHD
              </div>
              <span className="font-bold text-lg text-slate-900 font-headline-md tracking-tight">
                EventHHD Việt Nam
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
                <strong className="text-slate-800">Mã số doanh nghiệp:</strong> 0316889988 - Cấp bởi Sở KH&ĐT TP.HCM
              </p>
              <p>
                <strong className="text-slate-800">Trụ sở chính:</strong> Tầng 28, Pearl Plaza, 561A Điện Biên Phủ, Phường 25, Bình Thạnh, TP.HCM
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                <span className="material-symbols-outlined text-[14px]">verified</span> ISO/IEC 27001:2022
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-[11px] font-semibold border border-indigo-200">
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
              <li><Link href="/goi-dich-vu#pricing-cards" className="hover:text-[#4f46e5] transition-colors">Gala Dinner & Kỷ Niệm</Link></li>
              <li><Link href="/goi-dich-vu#pricing-cards" className="hover:text-[#4f46e5] transition-colors">Hội Nghị & Ra Mắt Sản Phẩm</Link></li>
              <li><Link href="/goi-dich-vu#pricing-cards" className="hover:text-[#4f46e5] transition-colors">Tiệc Cưới Luxury Destination</Link></li>
              <li><Link href="/goi-dich-vu#pricing-cards" className="hover:text-[#4f46e5] transition-colors">Bespoke VIP Private Party</Link></li>
              <li><Link href="/goi-dich-vu#calculator-section" className="hover:text-[#4f46e5] transition-colors">Sân Khấu LED Kinetic</Link></li>
              <li><Link href="/goi-dich-vu#calculator-section" className="hover:text-[#4f46e5] transition-colors">Âm Thanh L-Acoustics</Link></li>
            </ul>
          </div>

          {/* Col 3: Giải Pháp Số */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Giải Pháp Số
            </h4>
            <ul className="space-y-2 text-xs text-[#464555]">
              <li><Link href="/goi-dich-vu#calculator-section" className="hover:text-[#4f46e5] transition-colors">Interactive Cost Calculator</Link></li>
              <li><Link href="/" className="hover:text-[#4f46e5] transition-colors">AI Trợ Lý Booking 24/7</Link></li>
              <li><Link href="/admin" className="hover:text-[#4f46e5] transition-colors">Quản Trị Lịch Hẹn CRM</Link></li>
              <li><Link href="/admin" className="hover:text-[#4f46e5] transition-colors">Bộ Dữ Liệu FAQ Thông Minh</Link></li>
              <li><Link href="/goi-dich-vu" className="hover:text-[#4f46e5] transition-colors">So Sánh Báo Giá Minh Bạch</Link></li>
            </ul>
          </div>

          {/* Col 4: Liên Hệ & Hỗ Trợ VIP */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Hỗ Trợ VIP
            </h4>
            <div className="space-y-2.5 text-xs text-[#464555]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4f46e5] text-[18px]">headset_mic</span>
                <span>Hotline VIP: <strong className="text-[#4f46e5] font-bold">1800 6868</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4f46e5] text-[18px]">mail</span>
                <span>vip-events@eventhhd.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4f46e5] text-[18px]">schedule</span>
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
            <Link href="/" className="hover:text-[#4f46e5]">Chính sách bảo mật</Link>
            <span>•</span>
            <Link href="/" className="hover:text-[#4f46e5]">Quy chuẩn dịch vụ</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-[#4f46e5]">Cổng quản trị</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

