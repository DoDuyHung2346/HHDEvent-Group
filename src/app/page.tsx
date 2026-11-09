"use client";

import { useState, useEffect } from "react";
import { loadPricingConfig, type PackagePricingConfig } from "@/lib/services/packageStorage";
import Link from "next/link";
import Footer from "@/components/shared/Footer";
import HeroChatMockup from "@/components/chat/HeroChatMockup";

export default function EntryPortalPage() {
  // Filter Console State
  const [selectedEventType, setSelectedEventType] = useState("gala");
  const [selectedGuestScale, setSelectedGuestScale] = useState("100-300");

  // Dynamic Pricing Config synced with Admin
  const [pricingConfig, setPricingConfig] = useState<PackagePricingConfig>(() => loadPricingConfig());

  useEffect(() => {
    setPricingConfig(loadPricingConfig());
    const handleSync = () => setPricingConfig(loadPricingConfig());
    window.addEventListener("eventviet_pricing_changed", handleSync);
    return () => window.removeEventListener("eventviet_pricing_changed", handleSync);
  }, []);

  // Interactive Cost Calculator State
  const [guestCount, setGuestCount] = useState(200);
  const [venueTier, setVenueTier] = useState<"standard" | "5star" | "resort">("5star");
  const [avTier, setAvTier] = useState<"jbl" | "lacoustics" | "db">("lacoustics");
  const [fbTier, setFbTier] = useState<"standard" | "fusion" | "michelin">("fusion");
  const [talentTier, setTalentTier] = useState<"mc" | "vtv_band" | "star">("vtv_band");

  // Dynamic cost calculation logic
  const venueRates = pricingConfig.venueRates;
  const avRates = pricingConfig.avRates;
  const fbRates = pricingConfig.fbRates;
  const talentRates = pricingConfig.talentRates;

  const fbTotal = (venueRates[venueTier] + fbRates[fbTier]) * guestCount;
  const techTotal = avRates[avTier];
  const talentTotal = talentRates[talentTier];
  const subtotal = fbTotal + techTotal + talentTotal;
  const vipDiscount = Math.round(subtotal * 0.05); // 5% VIP member discount
  const vat = Math.round((subtotal - vipDiscount) * 0.08); // 8% VAT
  const grandTotal = subtotal - vipDiscount + vat;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num) + " VNĐ";
  };

  const handleExportEstimate = () => {
    const text = `DỰ TOÁN CHI PHÍ SỰ KIỆN - EVENTHHD
Ngày tính: ${new Date().toLocaleDateString("vi-VN")}
Quy mô: ${guestCount} khách
Địa điểm: ${venueTier === "standard" ? "Sảnh 4 sao" : venueTier === "5star" ? "Khách sạn 5 sao quốc tế" : "Resort bờ biển"}
Âm thanh & Ánh sáng: ${avTier.toUpperCase()}
Ẩm thực F&B: ${fbTier}
Nhân sự & Nghệ sĩ: ${talentTier}

--------------------------------------------------
Chi phí Sảnh & Yến tiệc: ${formatVND(fbTotal)}
Kỹ thuật & Sân khấu LED: ${formatVND(techTotal)}
Nhân sự & MC / Nghệ sĩ: ${formatVND(talentTotal)}
Chiết khấu VIP Hội viên (-5%): -${formatVND(vipDiscount)}
Thuế VAT (8%): ${formatVND(vat)}
==================================================
TỔNG NGÂN SÁCH DỰ KIẾN: ${formatVND(grandTotal)}
(Đã bao gồm chi phí điều phối và bảo hiểm sự kiện)`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Du-toan-su-kien-${guestCount}khach.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* ── STITCH NAVIGATION HEADER WITH EVENTHHD BRAND ─────────────────────────── */}
      <header className="w-full bg-white/85 backdrop-blur-md sticky top-0 z-50 border-b border-purple-100/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo with EventHHD */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-xs">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24">
                <path
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 group-hover:text-brand-500 transition-colors">
                EventHHD
              </span>
            </div>
          </Link>

          {/* Primary Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-600">
            <a href="#pricing-cards" className="text-brand-500 font-semibold transition-colors">
              Gói dịch vụ
            </a>
            <a href="#comparison-matrix" className="hover:text-gray-900 transition-colors">
              So sánh
            </a>
            <a href="#guarantees-section" className="hover:text-gray-900 transition-colors">
              Cam kết
            </a>
            <a href="#calculator-section" className="hover:text-brand-500 transition-colors">
              Dự toán chi phí
            </a>
          </nav>

          {/* Action Buttons & Badges */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            <a
              href="#calculator-section"
              className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 hover:border-brand-500 hover:text-brand-600 rounded-full text-sm font-semibold text-gray-700 bg-white transition shadow-xs hover:shadow"
            >
              Liên hệ tư vấn
            </a>
            <Link
              href="/login"
              className="inline-flex items-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs hover:shadow"
            >
              Đăng nhập
            </Link>
            <Link
              href="/login"
              aria-label="Tư vấn & Báo giá"
              className="relative p-1.5 sm:p-2 text-brand-500 hover:text-brand-600 transition ml-0.5"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute top-1 sm:top-1.5 right-0.5 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-brand-500 text-white rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center border-2 border-white">
                0
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION: MOBILE OPTIMIZED (THU NHỎ CHỮ + PHÙ HỢP MOBILE) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#ECE8FD] via-[#F4F1FD] to-[#FFFFFF] pt-6 sm:pt-10 pb-14 sm:pb-20 lg:py-16">
        {/* Background Dot Pattern Overlay */}
        <div className="absolute inset-0 dot-grid-pattern opacity-60 pointer-events-none" />

        {/* Decorative 3D Spheres (Adjusted for mobile to prevent overflow) */}
        {/* Top-Right Lavender Orb */}
        <div className="absolute -top-8 -right-12 sm:-top-12 sm:-right-16 w-56 h-56 sm:w-80 sm:h-80 rounded-full sphere-gradient-lavender shadow-sphere-purple pointer-events-none opacity-70 sm:opacity-85 z-0 transform translate-x-8 sm:translate-x-12 -translate-y-6 sm:-translate-y-8" />
        {/* Center-Bottom Peach Orb */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 md:translate-x-10 lg:translate-x-20 w-52 h-52 sm:w-72 sm:h-72 rounded-full sphere-gradient-peach shadow-sphere-peach pointer-events-none opacity-75 sm:opacity-90 z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Hero Content Column (Mobile font scaled down) */}
            <div className="lg:col-span-6 flex flex-col items-start pr-0 lg:pr-4">
              {/* Badge: AI-CHATBOT 24/7 */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-brand-500/10 text-brand-600 text-[10px] sm:text-xs font-semibold mb-3 sm:mb-6 uppercase tracking-wider">
                <span>AI-CHATBOT 24/7</span>
              </div>

              {/* Main Headline: Scaled down on mobile to prevent awkward line breaks */}
              <h1 className="text-[26px] xs:text-[28px] sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.2] sm:leading-tight mb-3.5 sm:mb-6 flex flex-col gap-1 sm:gap-2">
                <span className="font-sans text-gray-900 pb-0.5 inline-flex">
                  Hiện thực hóa ý tưởng
                </span>
                <span
                  className="font-serif italic font-normal text-purple-600 text-[1.04em] sm:text-[1.08em] leading-tight drop-shadow-xs pb-0.5"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Sự kiện chuyên nghiệp
                </span>
                <span className="font-sans text-[0.9em] sm:text-[0.88em] font-bold text-gray-900 leading-snug pb-1 inline-flex overflow-visible">
                  Dự toán ngân sách nhanh
                </span>
              </h1>

              {/* Badges & Description: Compact on mobile */}
              <div className="max-w-xl mb-6 sm:mb-8 space-y-2.5 sm:space-y-3.5">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-purple-100 text-brand-700 border border-purple-200/50">
                    Giải pháp sự kiện đẳng cấp
                  </span>
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/80 text-gray-700 border border-purple-100/60 shadow-xs">
                    Minh Bạch trong từng hạng mục
                  </span>
                </div>
                <p className="text-xs sm:text-base lg:text-lg text-gray-600 leading-relaxed font-normal">
                  Tối ưu hóa ngân sách theo tiêu chuẩn VEA. Khám phá các gói sự kiện trọn gói hoặc nhận phương án kịch bản và bảng dự toán chi tiết
                </p>
              </div>

              {/* Call to Action Buttons (Horizontal side-by-side on mobile) */}
              <div className="flex flex-row items-center gap-2.5 sm:gap-4 mb-6 sm:mb-10 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="flex-1 sm:flex-initial text-center px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-base font-semibold text-white bg-[#18181B] hover:bg-black transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  Bắt đầu
                </Link>
                <a
                  href="#calculator-section"
                  className="flex-1 sm:flex-initial text-center px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-base font-semibold text-gray-800 bg-white/70 hover:bg-white border border-gray-300 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Ước Tính Chi Phí
                </a>
              </div>

              {/* Quick Trust Metrics Strip (2x2 grid on mobile for clean symmetry) */}
              <div className="pt-4 sm:pt-6 border-t border-purple-200/50 grid grid-cols-2 sm:flex sm:flex-wrap items-center text-xs sm:text-sm font-medium text-gray-600 gap-2.5 sm:gap-6 w-full">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-800 whitespace-nowrap">Minh Bạch 100%</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-800 whitespace-nowrap">Chuẩn Quốc Tế</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-100 flex items-center justify-center text-brand-600 shrink-0">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">Trợ Lý AI 24/7</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-100 flex items-center justify-center text-brand-600 shrink-0">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">Báo Giá Trực Tiếp</span>
                </div>
              </div>
            </div>

            {/* Right Hero Chat Window Mockup */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
              <HeroChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER MATRIX CONSOLE ────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 rounded-2xl bg-white shadow-xs border border-purple-100/80 flex flex-col lg:flex-row gap-5 lg:items-center justify-between">
          {/* Event Type Pills */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-brand-500">celebration</span>
              Loại hình sự kiện mục tiêu
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "gala", label: "Gala Dinner & Kỷ Niệm" },
                { id: "conference", label: "Hội Nghị & Ra Mắt Sản Phẩm" },
                { id: "wedding", label: "Tiệc Cưới Luxury & Destination" },
                { id: "private", label: "Tiệc Private / Bespoke VIP" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedEventType(pill.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    selectedEventType === pill.id
                      ? "bg-brand-500 text-white border-brand-500 shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-600 border-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guest Scale Pills */}
          <div className="flex flex-col gap-2 lg:border-l lg:border-slate-200 lg:pl-6">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-brand-500">groups</span>
              Quy mô dự kiến
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "<100", label: "< 100 khách" },
                { id: "100-300", label: "100 - 300 khách" },
                { id: "300-600", label: "300 - 600 khách" },
                { id: ">600", label: "> 600 khách VIP" },
              ].map((scale) => (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() => setSelectedGuestScale(scale.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    selectedGuestScale === scale.id
                      ? "bg-purple-100 text-brand-700 border-purple-300 shadow-xs font-bold"
                      : "bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-600 border-slate-200"
                  }`}
                >
                  {scale.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 PRICING CARDS (EVENTHHD) ────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-8" id="pricing-cards">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
            {/* CARD 1: SILVER ESSENCE */}
            <div className="flex flex-col rounded-2xl bg-white p-6 sm:p-8 shadow-xs hover:shadow-md transition-all border border-purple-100 relative justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                    Khởi Tạo & Tối Ưu
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">PKG-SLV01</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  SILVER ESSENCE
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 min-h-[40px]">
                  Tối ưu ngân sách cho tiệc nội bộ, hội nghị tri ân thường niên hoặc khai trương văn phòng với trải nghiệm chỉn chu.
                </p>

                {/* Price */}
                <div className="my-5 pb-5 border-b border-slate-100 flex flex-col">
                  <span className="text-xs text-slate-400">Giá trọn gói khởi điểm</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      150.000.000
                    </span>
                    <span className="text-sm font-bold text-slate-500">VNĐ</span>
                  </div>
                  <span className="font-mono text-xs text-slate-500 mt-0.5">
                    ~ Quy mô 100 - 150 khách tham dự
                  </span>
                </div>

                {/* Features Checklist */}
                <div className="space-y-3 mb-6">
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-900">
                    Quyền lợi dịch vụ đầy đủ:
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Sân khấu & Màn LED:</strong> LED P3 phẳng 24m² kèm backdrop 2D Formex cao cấp</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Âm thanh & Ánh sáng:</strong> Hệ thống loa JBL SRX Series & Parled 54 chính hãng</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Kịch bản & MC:</strong> MC Song ngữ chuyên nghiệp + Kịch bản timeline chi tiết</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Ekip Media:</strong> 02 Nhiếp ảnh gia bắt khoảnh khắc toàn tiệc & trả ảnh trong 24h</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-brand-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Thực đơn & Phục vụ:</strong> Set menu 5 món Á truyền thống + Đồ uống tiêu chuẩn</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/login?prompt=Tôi muốn tư vấn gói sự kiện Silver Essence"
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-800 text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 border border-slate-200"
                >
                  <span>Tư Vấn Gói Silver</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* CARD 2: GOLD SIGNATURE (BEST SELLER) */}
            <div className="flex flex-col rounded-2xl p-6 sm:p-8 shadow-xl transition-all relative justify-between bg-gradient-to-b from-[#4E3EBE] via-[#5E4FD6] to-[#1E144A] border-2 border-purple-300 text-white lg:-mt-3 lg:mb-[-12px]">
              {/* Floating Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-300 text-slate-900 text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 shrink-0 border border-white whitespace-nowrap">
                <span className="material-symbols-outlined text-[15px] text-amber-900">stars</span>
                <span>Được 78% Doanh Nghiệp Lựa Chọn</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 pt-1">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                    Best Seller Signature
                  </span>
                  <span className="font-mono text-xs text-amber-300 font-bold">PKG-GLD02</span>
                </div>

                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  GOLD SIGNATURE
                  <span className="material-symbols-outlined text-amber-300 text-[20px]">verified</span>
                </h3>
                <p className="text-xs sm:text-sm text-purple-100 mt-2 min-h-[40px]">
                  Gala Kỷ niệm, tiệc tri ân quy mô lớn, ra mắt sản phẩm với thiết kế sân khấu công nghệ hiện đại bậc nhất.
                </p>

                {/* Price */}
                <div className="my-5 pb-5 border-b border-white/20 flex flex-col">
                  <span className="text-xs text-purple-200">Giá trọn gói khuyến nghị</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      380.000.000
                    </span>
                    <span className="text-sm font-bold text-purple-200">VNĐ</span>
                  </div>
                  <span className="font-mono text-xs text-amber-300 mt-0.5">
                    ~ Quy mô 250 - 350 khách tiêu chuẩn
                  </span>
                </div>

                {/* Features Checklist */}
                <div className="space-y-3 mb-6">
                  <div className="text-xs uppercase tracking-wider font-bold text-white flex items-center justify-between">
                    <span>Quyền lợi toàn diện Silver + Nâng cấp:</span>
                    <span className="font-mono text-amber-300 text-[10px] font-bold">CAO CẤP</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-white">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-300 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Sân khấu LED:</strong> LED Matrix P2.5 Kinetic trượt 48m² + Phối cảnh 3D Max độc quyền</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-300 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Âm thanh & Ánh sáng:</strong> Loa L-Acoustics Kiva II Pháp + Beam 450, Laser & Khói lạnh</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-300 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Kịch bản & MC:</strong> MC Đài truyền hình VTV/HTV + Ban nhạc Acoustic biểu diễn</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-300 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Ekip Media:</strong> 03 Máy quay 4K + Flycam Cinematic + Video Highlight trong 48h</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-300 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Thực đơn & Phục vụ:</strong> Bàn tiệc Fusion 6 món thượng hạng + Rượu vang Chile nhập khẩu</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/login?prompt=Tôi muốn đặt tư vấn gói Gold Signature"
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-purple-50 text-brand-700 text-xs sm:text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-brand-600">bolt</span>
                  <span>Đặt Gói Gold Signature Ngay</span>
                </Link>
              </div>
            </div>

            {/* CARD 3: PLATINUM BESPOKE */}
            <div className="flex flex-col rounded-2xl bg-white p-6 sm:p-8 shadow-xs hover:shadow-md transition-all border border-purple-100 relative justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    Thượng Hạng Độc Bản
                  </span>
                  <span className="font-mono text-xs text-amber-600 font-bold">PKG-ROYAL99</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  PLATINUM BESPOKE
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 min-h-[40px]">
                  Dành cho tiệc Hoàng gia, Đón tiếp chính khách, Hội nghị thượng đỉnh và Doanh nhân VIP đòi hỏi cá nhân hoá tuyệt đối.
                </p>

                {/* Price */}
                <div className="my-5 pb-5 border-b border-slate-100 flex flex-col">
                  <span className="text-xs text-slate-400">Chi phí thiết kế & thực thi</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      850.000.000
                    </span>
                    <span className="text-sm font-bold text-slate-500">VNĐ+</span>
                  </div>
                  <span className="font-mono text-xs text-amber-700 mt-0.5">
                    Không giới hạn quy mô & tùy biến 100%
                  </span>
                </div>

                {/* Features Checklist */}
                <div className="space-y-3 mb-6">
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-900">
                    Dịch vụ đặc quyền Bespoke:
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">diamond</span>
                      <span><strong>Sân khấu LED:</strong> Màn hình cong 3D LED P1.8 + Hiệu ứng Hologram + VR Tour</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">diamond</span>
                      <span><strong>Âm thanh chuẩn Quốc tế:</strong> Loa d&b audiotechnik Đức + Pháo sáng lạnh & Kinetic</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">diamond</span>
                      <span><strong>Kịch bản & Nghệ sĩ:</strong> Booking Ca sĩ Sao Hạng A độc quyền + Đạo diễn riêng</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">diamond</span>
                      <span><strong>Ekip Media Cinematic:</strong> Ekip 5 máy quay RED/Sony Cine + Livestream 4K</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">diamond</span>
                      <span><strong>Thực đơn Michelin:</strong> Fine Dining 7 món chuẩn Michelin + Sommelier phục vụ</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/login?prompt=Tôi muốn tư vấn gói đặc quyền Platinum Bespoke"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-400">diamond</span>
                  <span>Đăng Ký Tư Vấn Bespoke VIP</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE COST CALCULATOR (EVENTHHD) ─────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-purple-50/40 border-y border-purple-100" id="calculator-section">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">calculate</span>
              Interactive Cost Calculator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Công Cụ Mô Phỏng Dự Toán Chi Phí Trực Tuyến
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Điều chỉnh số lượng khách mời và các hạng mục kỹ thuật để nhận ngay bảng dự toán chi tiết theo định mức minh bạch của EventHHD.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-purple-100 space-y-5">
              {/* Slider Guest Count */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    1. Quy mô khách mời:
                  </label>
                  <span className="font-mono text-base font-bold text-brand-600">
                    {guestCount} khách
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="25"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-brand-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>50 khách</span>
                  <span>400 khách</span>
                  <span>800 khách</span>
                </div>
              </div>

              {/* Venue Tier */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  2. Tiêu chuẩn địa điểm & sảnh tiệc:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "standard", label: "Trung tâm 4 sao", price: "600k/khách" },
                    { id: "5star", label: "Khách sạn 5 sao", price: "1.2M/khách" },
                    { id: "resort", label: "Resort ngoài trời", price: "1.8M/khách" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVenueTier(v.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        venueTier === v.id
                          ? "bg-purple-50 border-brand-500 text-brand-700 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <p className="font-bold">{v.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{v.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound & Light Tier */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  3. Âm thanh, Ánh sáng & Sân khấu LED:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "jbl", label: "Tiêu chuẩn JBL", price: "35 triệu" },
                    { id: "lacoustics", label: "L-Acoustics Pháp", price: "75 triệu" },
                    { id: "db", label: "d&b audiotechnik Đức", price: "160 triệu" },
                  ].map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAvTier(a.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        avTier === a.id
                          ? "bg-purple-50 border-brand-500 text-brand-700 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <p className="font-bold">{a.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{a.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Catering F&B */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  4. Gói Thực đơn Yến tiệc:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "standard", label: "Set Á 5 Món", price: "450k/khách" },
                    { id: "fusion", label: "Fusion 6 Món + Vang", price: "850k/khách" },
                    { id: "michelin", label: "Fine Dining Michelin", price: "1.6M/khách" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFbTier(f.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        fbTier === f.id
                          ? "bg-purple-50 border-brand-500 text-brand-700 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <p className="font-bold">{f.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{f.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Talent Tier */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  5. Nhân sự MC & Nghệ sĩ biểu diễn:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "mc", label: "MC Song ngữ", price: "15 triệu" },
                    { id: "vtv_band", label: "MC VTV + Ban nhạc", price: "45 triệu" },
                    { id: "star", label: "Ca sĩ Sao Hạng A", price: "180 triệu" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTalentTier(t.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        talentTier === t.id
                          ? "bg-purple-50 border-brand-500 text-brand-700 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <p className="font-bold">{t.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{t.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Cost Summary Matrix (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl shadow-md border-2 border-purple-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Bảng Phân Bổ Chi Phí</span>
                <span className="font-mono text-xs text-brand-600 font-semibold">Cập nhật Realtime</span>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Chi phí Sảnh & Yến tiệc ({guestCount} suất):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatVND(fbTotal)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Hệ thống Sân khấu & Kỹ thuật:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatVND(techTotal)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Nhân sự MC & Nghệ sĩ biểu diễn:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatVND(talentTotal)}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-emerald-700 font-semibold">
                  <span>Ưu đãi Hội viên VIP (-5%):</span>
                  <span className="font-mono">-{formatVND(vipDiscount)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span>Thuế VAT (8%):</span>
                  <span className="font-mono">{formatVND(vat)}</span>
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t-2 border-slate-200 flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    Tổng ngân sách ước tính:
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">
                    {formatVND(grandTotal)}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    * Đã bao gồm bảo hiểm trách nhiệm sự kiện và phí điều phối on-site.
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleExportEstimate}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-brand-600">download</span>
                  <span>Xuất File Báo Giá Dự Toán (.txt)</span>
                </button>

                <Link
                  href={`/login?prompt=${encodeURIComponent(`Tôi đã tính dự toán cho ${guestCount} khách với tổng ngân sách khoảng ${formatVND(grandTotal)}, nhờ chuyên viên hỗ trợ giữ lịch`)}`}
                  className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                  <span>Gửi Dự Toán Đến AI Để Đặt Lịch</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION B: DETAILED FEATURE COMPARISON TABLE ───────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-14" id="comparison-matrix">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bảng So Sánh Quyền Lợi Chi Tiết
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Đối chiếu từng thông số kỹ thuật và dịch vụ đi kèm giữa 3 gói giải pháp.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-purple-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-purple-50/60 text-slate-700 font-bold border-b border-purple-100">
                    <th className="py-4 px-5">Hạng mục cấu thành</th>
                    <th className="py-4 px-5 text-slate-600">Silver Essence</th>
                    <th className="py-4 px-5 text-brand-600 bg-purple-100/50">Gold Signature (Khuyên dùng)</th>
                    <th className="py-4 px-5 text-amber-700">Platinum Bespoke</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Quy mô khách phù hợp</td>
                    <td className="py-3.5 px-5">100 - 150 khách</td>
                    <td className="py-3.5 px-5 bg-purple-50/30 font-semibold">250 - 350 khách</td>
                    <td className="py-3.5 px-5">Không giới hạn</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Màn hình LED Sân khấu</td>
                    <td className="py-3.5 px-5">LED P3 phẳng 24m²</td>
                    <td className="py-3.5 px-5 bg-purple-50/30 font-semibold">LED P2.5 Kinetic 48m²</td>
                    <td className="py-3.5 px-5">LED P1.8 Cong 3D + Hologram</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Thương hiệu Âm thanh</td>
                    <td className="py-3.5 px-5">JBL SRX Series</td>
                    <td className="py-3.5 px-5 bg-purple-50/30 font-semibold">L-Acoustics Kiva II (Pháp)</td>
                    <td className="py-3.5 px-5">d&b audiotechnik (Đức)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Ekip Media & Video</td>
                    <td className="py-3.5 px-5">2 Máy ảnh bàn giao 24h</td>
                    <td className="py-3.5 px-5 bg-purple-50/30 font-semibold">3 Máy 4K + Flycam + Recap 48h</td>
                    <td className="py-3.5 px-5">5 Máy Cine RED/Sony + Livestream 4K</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Tiêu chuẩn Yến tiệc F&B</td>
                    <td className="py-3.5 px-5">Set menu 5 món Á</td>
                    <td className="py-3.5 px-5 bg-purple-50/30 font-semibold">Fusion 6 món + Rượu vang</td>
                    <td className="py-3.5 px-5">Fine Dining Michelin 7 món</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Bảo hiểm Trách nhiệm</td>
                    <td className="py-3.5 px-5">Bảo hiểm tiêu chuẩn</td>
                    <td className="py-3.5 px-5 bg-purple-50/30 font-semibold">Mức bồi thường 3 tỷ VNĐ</td>
                    <td className="py-3.5 px-5">Mức bồi thường 10 tỷ VNĐ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION D: CAM KẾT VÀNG & TIÊU CHUẨN DỊCH VỤ ────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-white border-y border-purple-100" id="guarantees-section">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cam Kết Vàng & Tiêu Chuẩn Dịch Vụ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Bốn trụ cột cam kết pháp lý và tiêu chuẩn dịch vụ làm nên thương hiệu tổ chức sự kiện hàng đầu của EventHHD.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-brand-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">payments</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Không Chi Phí Ẩn Phát Sinh</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cam kết minh bạch 100% ngân sách. Mọi khoản mục chi phí đều được xác nhận văn bản trước. Báo giá đã chốt là con số thanh toán cuối cùng.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-brand-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">security</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Bảo Hiểm Sự Kiện 10 Tỷ VNĐ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hợp đồng bảo hiểm trách nhiệm sự kiện toàn diện ký với đối tác bảo hiểm hàng đầu, bảo vệ tối đa cho đại biểu, khách mời và tài sản.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-brand-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">spatial_audio_off</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Kỹ Sư Âm Thanh Chuẩn Quốc Tế</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đội ngũ Sound Engineer được đào tạo và cấp chứng chỉ trực tiếp từ các hãng L-Acoustics, d&b audiotechnik đảm bảo âm thanh không hú rít.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-brand-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">published_with_changes</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Hoàn Tiền 100% Nếu Trễ Tiến Độ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cam kết hoàn tiền 100% chi phí điều phối nếu quá trình bàn giao sân khấu hoặc timeline chương trình bị chậm trễ do lỗi đơn vị vận hành.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER (HOTLINE 1900 6886) ────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-purple-50/40">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-[#1E144A] via-[#4E3EBE] to-[#111827] text-white p-6 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 relative overflow-hidden">
            <div className="max-w-2xl space-y-2.5 sm:space-y-3 relative z-10">
              <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[15px]">call_quality</span>
                Concierge Direct Line 24/7
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Cần Tư Vấn Riêng Hoặc Khảo Sát Địa Điểm Miễn Phí?
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                Đội ngũ Giám đốc Sản xuất của EventHHD sẵn sàng đến tận nơi khảo sát mặt bằng và xây dựng Maket 3D sơ bộ hoàn toàn miễn phí trong vòng 24 giờ.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
              <a
                href="tel:19006886"
                className="px-5 py-3 rounded-xl bg-white text-slate-900 text-xs sm:text-sm shadow-md flex items-center justify-center gap-3 hover:bg-purple-50 transition-all font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-brand-600 text-[22px]">call</span>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Hotline Doanh Nghiệp VIP
                  </span>
                  <span className="font-extrabold text-base text-brand-600 font-mono leading-none">
                    1900 6886
                  </span>
                </div>
              </a>

              <Link
                href="/login?prompt=Tôi muốn đặt lịch tư vấn khảo sát mặt bằng 3D miễn phí"
                className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span>Tư vấn với AI Eve</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
