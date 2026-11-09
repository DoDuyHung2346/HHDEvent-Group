"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ChatWindow from "@/components/chat/ChatWindow";
import HelpSidebar from "@/components/chat/HelpSidebar";
import { cancelRemoteBooking, fetchBookings } from "@/lib/booking/api";
import type { Booking } from "@/lib/schemas";
import { generateIcsFile } from "@/lib/calendar/generateIcs";
import { loadPricingConfig, type PackagePricingConfig } from "@/lib/services/packageStorage";
import type { SurchargeResponse } from "@/app/api/estimate-surcharge/route";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, isUserLoggedIn, logoutUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"chat" | "my_bookings" | "pricing">("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  // My Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchPhone, setSearchPhone] = useState(user?.phone || "");

  // Pricing State - Expanded Multi-dimensional
  const [pricingConfig, setPricingConfig] = useState<PackagePricingConfig>(() => loadPricingConfig());
  const [guestCount, setGuestCount] = useState(200);
  const [eventType, setEventType] = useState<"gala" | "conference" | "wedding" | "festival" | "private">("gala");
  const [venueTier, setVenueTier] = useState<"standard" | "5star" | "resort" | "bespoke">("5star");
  const [avTier, setAvTier] = useState<"jbl" | "lacoustics" | "db" | "stadium">("lacoustics");
  const [fbTier, setFbTier] = useState<"standard" | "fusion" | "michelin" | "seafood_buffet">("fusion");
  const [talentTier, setTalentTier] = useState<"mc" | "vtv_band" | "star" | "orchestra">("vtv_band");

  // Add-on Services Checkboxes
  const [addOns, setAddOns] = useState({
    photobooth: false,
    livestream: false,
    vipGifts: false,
    stageEffects: false,
  });

  // AI Surcharge Analyzer State
  const [specialNotes, setSpecialNotes] = useState("");
  const [isAnalyzingSurcharge, setIsAnalyzingSurcharge] = useState(false);
  const [aiSurchargeResult, setAiSurchargeResult] = useState<SurchargeResponse | null>(null);
  const [applyAiSurcharge, setApplyAiSurcharge] = useState(true);

  useEffect(() => {
    if (user?.phone) {
      fetchBookings({ phone: user.phone })
        .then(setBookings)
        .catch((error) => console.error("Lỗi tải lịch hẹn Supabase:", error));
    } else {
      setBookings([]);
    }
    setPricingConfig(loadPricingConfig());
    if (user?.phone) setSearchPhone(user.phone);

    const handleSync = () => setPricingConfig(loadPricingConfig());
    window.addEventListener("eventviet_pricing_changed", handleSync);
    return () => window.removeEventListener("eventviet_pricing_changed", handleSync);
  }, [user]);

  const handleSelectFaqPrompt = (prompt: string) => {
    setActiveTab("chat");
    setSelectedPrompt(prompt);
    setTimeout(() => setSelectedPrompt(null), 300);
  };

  const handleCancelBooking = async (id: string) => {
    if (confirm("Quý khách có chắc chắn muốn hủy lịch hẹn tư vấn này?")) {
      try {
        const cancelled = await cancelRemoteBooking(id);
        setBookings((current) => current.map((booking) => (booking.id === id ? cancelled : booking)));
      } catch (error) {
        alert(error instanceof Error ? error.message : "Không thể hủy lịch hẹn.");
      }
    }
  };

  const myFilteredBookings = bookings.filter((b) => {
    const filterPhone = searchPhone.replace(/\s+/g, "").trim();
    const userName = user?.name?.toLowerCase() || "";
    if (!filterPhone) {
      return userName ? b.name.toLowerCase().includes(userName) : true;
    }
    return (
      b.phone.replace(/\s+/g, "").includes(filterPhone) ||
      (userName && b.name.toLowerCase().includes(userName))
    );
  });

  // Dynamic pricing calculation formulas
  const venueRate =
    venueTier === "bespoke"
      ? 2400000
      : pricingConfig.venueRates[venueTier as "standard" | "5star" | "resort"] || 1200000;

  const fbRate =
    fbTier === "seafood_buffet"
      ? 1250000
      : pricingConfig.fbRates[fbTier as "standard" | "fusion" | "michelin"] || 850000;

  const venueTotal = venueRate * guestCount;
  const fbTotal = fbRate * guestCount;

  const avTotal =
    avTier === "stadium"
      ? 280000000
      : pricingConfig.avRates[avTier as "jbl" | "lacoustics" | "db"] || 75000000;

  const talentTotal =
    talentTier === "orchestra"
      ? 260000000
      : pricingConfig.talentRates[talentTier as "mc" | "vtv_band" | "star"] || 45000000;

  const addOnsTotal =
    (addOns.photobooth ? 18000000 : 0) +
    (addOns.livestream ? 22000000 : 0) +
    (addOns.vipGifts ? 120000 * guestCount : 0) +
    (addOns.stageEffects ? 8500000 : 0);

  const fixedSubtotal = venueTotal + fbTotal + avTotal + talentTotal + addOnsTotal;

  const aiSurchargeTotal =
    applyAiSurcharge && aiSurchargeResult ? aiSurchargeResult.totalSurcharge : 0;

  const subtotal = fixedSubtotal + aiSurchargeTotal;
  const vipDiscount = Math.round(subtotal * 0.05);
  const vat = Math.round((subtotal - vipDiscount) * 0.08);
  const grandTotal = subtotal - vipDiscount + vat;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num) + " VNĐ";
  };

  // Trigger AI Surcharge API
  const handleAnalyzeSurcharge = async () => {
    if (!specialNotes.trim()) {
      alert("Vui lòng nhập ghi chú hoặc yêu cầu đặc thù trước khi phân tích AI.");
      return;
    }
    setIsAnalyzingSurcharge(true);
    try {
      const res = await fetch("/api/estimate-surcharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: specialNotes,
          guestCount,
        }),
      });
      const data: SurchargeResponse = await res.json();
      setAiSurchargeResult(data);
      setApplyAiSurcharge(true);
    } catch (e) {
      console.error("Lỗi gọi AI Surcharge API:", e);
      alert("Không thể phân tích phụ phí AI lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsAnalyzingSurcharge(false);
    }
  };

  // Transfer budget estimate to Chatbot
  const handleSendEstimateToChat = () => {
    const eventNameMap: Record<string, string> = {
      gala: "Gala Dinner & Kỷ Niệm",
      conference: "Hội Nghị & Ra Mắt Sản Phẩm",
      wedding: "Tiệc Cưới Luxury",
      festival: "Festival Ngoài Trời",
      private: "Tiệc Private VIP",
    };

    const surchargeText =
      applyAiSurcharge && aiSurchargeResult && aiSurchargeResult.items.length > 0
        ? ` (Bao gồm ${aiSurchargeResult.items.length} phụ phí phát sinh AI bóc tách: ${aiSurchargeResult.items.map((i) => `${i.name} - ${formatVND(i.cost)}`).join("; ")})`
        : "";

    const prompt = `Tôi vừa hoàn tất bảng dự toán cho sự kiện ${eventNameMap[eventType] || "Sự kiện"} quy mô ${guestCount} khách với tổng ngân sách khoảng ${formatVND(grandTotal)}${surchargeText}. Cấu hình gồm: Địa điểm (${venueTier}), Âm thanh ánh sáng (${avTier}), Ẩm thực (${fbTier}), MC nghệ sĩ (${talentTier}). Nhờ AI Eve kiểm tra lịch trống và hỗ trợ xếp lịch tư vấn 1-1.`;

    setActiveTab("chat");
    setSelectedPrompt(prompt);
    setTimeout(() => setSelectedPrompt(null), 400);
  };

  // Export estimate as text file
  const handleExportEstimate = () => {
    const text = `=====================================================
BẢNG DỰ TOÁN NGÂN SÁCH SỰ KIỆN - EVENTHHD ENTERPRISE
Khách hàng: ${user?.name || "Khách Hàng Trải Nghiệm"} (${user?.phone || "0912345678"})
Ngày lập: ${new Date().toLocaleDateString("vi-VN")}
=====================================================
1. THÔNG SỐ CƠ BẢN:
- Loại hình sự kiện: ${eventType.toUpperCase()}
- Quy mô khách mời: ${guestCount} khách
- Tiêu chuẩn sảnh tiệc: ${venueTier} (${formatVND(venueRate)}/khách)
- Thực đơn ẩm thực: ${fbTier} (${formatVND(fbRate)}/khách)
- Âm thanh ánh sáng & LED: ${avTier.toUpperCase()}
- Nhân sự & Nghệ sĩ biểu diễn: ${talentTier.toUpperCase()}

2. CHI TIẾT CHI PHÍ CỐ ĐỊNH:
- Sảnh tiệc & Không gian (${guestCount} khách): ${formatVND(venueTotal)}
- Thực đơn Yến tiệc F&B (${guestCount} khách): ${formatVND(fbTotal)}
- Kỹ thuật AV & Sân khấu LED: ${formatVND(avTotal)}
- Nhân sự MC & Nghệ sĩ: ${formatVND(talentTotal)}
- Hạng mục Gia tăng (Add-ons): ${formatVND(addOnsTotal)}
-----------------------------------------------------
TỔNG CHI PHÍ ĐỊNH MỨC: ${formatVND(fixedSubtotal)}

3. PHỤ PHÍ PHÁT SINH ƯỚC TÍNH BỞI AI:
${
  applyAiSurcharge && aiSurchargeResult && aiSurchargeResult.items.length > 0
    ? aiSurchargeResult.items
        .map(
          (i, idx) =>
            `${idx + 1}. ${i.name} [${i.category}]: +${formatVND(i.cost)}\n   Lý do: ${i.reason}`
        )
        .join("\n") +
      `\nTổng phụ phí AI: +${formatVND(aiSurchargeTotal)}\nĐánh giá khả thi: ${aiSurchargeResult.feasibilityScore}/100\nLời khuyên AI: ${aiSurchargeResult.aiAdvice}`
    : "Không ghi nhận phụ phí phát sinh."
}

=====================================================
Ưu đãi VIP (-5%): -${formatVND(vipDiscount)}
Thuế VAT (8%): ${formatVND(vat)}
=====================================================
TỔNG DỰ TOÁN NGÂN SÁCH: ${formatVND(grandTotal)}
(Đã bao gồm chi phí điều phối on-site và bảo hiểm sự kiện)`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Du-toan-EventHHD-${guestCount}khach.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[100dvh] bg-[#f7f9fb] text-slate-900 flex flex-col font-sans overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* ── CUSTOMER WORKSPACE TOP NAVIGATION HEADER ──────────────────────── */}
      <header className="w-full z-40 bg-white border-b border-slate-200 shrink-0 shadow-xs">
        <div className="h-14 sm:h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-brand-500 group-hover:text-white transition-all">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24">
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight group-hover:text-brand-500 transition-colors">
                  EventHHD
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  Cổng Trải Nghiệm Khách Hàng
                </span>
              </div>
            </Link>
          </div>

          {/* In-Page Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-purple-50/70 p-1 rounded-xl border border-purple-100">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-brand-600 shadow-xs border border-purple-100"
                  : "text-slate-600 hover:text-brand-600"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">smart_toy</span>
              <span>Tư Vấn & Chatbot</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("my_bookings");
                if (user?.phone) fetchBookings({ phone: user.phone }).then(setBookings).catch(() => undefined);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "my_bookings"
                  ? "bg-white text-brand-600 shadow-xs border border-purple-100"
                  : "text-slate-600 hover:text-brand-600"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">calendar_month</span>
              <span>Lịch Hẹn Của Tôi</span>
              {myFilteredBookings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-500/10 text-brand-600 font-mono">
                  {myFilteredBookings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "pricing"
                  ? "bg-white text-brand-600 shadow-xs border border-purple-100"
                  : "text-slate-600 hover:text-brand-600"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">payments</span>
              <span>Dự Toán & Bảng Giá</span>
            </button>
          </nav>

          {/* Customer Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">
                {user?.name || "Khách Hàng Trải Nghiệm"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {user?.phone || "0912345678"}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(user?.name || "K").charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              onClick={() => {
                logoutUser();
                router.push("/");
              }}
              className="px-2.5 py-1 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Thoát về trang mở đầu"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden md:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ACCORDING TO ACTIVE TAB ────────────────────────────── */}
      <main className="w-full flex-1 min-h-0 flex flex-col overflow-hidden relative pb-16 md:pb-0">
        {/* TAB 1: CHATBOT TƯ VẤN & ĐẶT LỊCH */}
        {/* LUÔN mount ChatWindow, chỉ ẩn bằng CSS để giữ nguyên state hội thoại */}
        <div
          aria-hidden={activeTab !== "chat"}
          className={`relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex-1 min-h-0 flex-col overflow-hidden ${
            activeTab === "chat" ? "flex" : "hidden"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
            <div
              className={`flex flex-col h-full min-h-0 transition-all duration-300 ${
                sidebarOpen ? "lg:col-span-8" : "lg:col-span-12"
              }`}
            >
              <ChatWindow
                isActive={activeTab === "chat"}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                externalPrompt={selectedPrompt}
              />
            </div>

            {sidebarOpen && (
              <>
                {/* Desktop HelpSidebar */}
                <div className="hidden lg:flex lg:col-span-4 flex-col h-full min-h-0 overflow-hidden">
                  <HelpSidebar
                    onSelectQuestion={handleSelectFaqPrompt}
                    onToggleHide={() => setSidebarOpen(false)}
                  />
                </div>

                {/* Mobile HelpSidebar Drawer */}
                <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
                  <div className="w-[85%] max-w-sm h-full bg-white shadow-2xl flex flex-col overflow-hidden">
                    <HelpSidebar
                      onSelectQuestion={(q) => {
                        handleSelectFaqPrompt(q);
                        setSidebarOpen(false);
                      }}
                      onToggleHide={() => setSidebarOpen(false)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TAB 2: LỊCH HẸN CỦA TÔI */}
        {activeTab === "my_bookings" && (
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 overflow-y-auto space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-brand-600">calendar_month</span>
                  <span>Danh Sách Lịch Hẹn Tư Vấn Của Quý Khách</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi tiến độ xác nhận, tải lịch về điện thoại hoặc đổi giờ hẹn trực tiếp.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Lọc theo số điện thoại..."
                  className="px-3.5 py-2.5 sm:py-1.5 text-base sm:text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono min-h-[44px] sm:min-h-0"
                />
              </div>
            </div>

            {myFilteredBookings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <span className="material-symbols-outlined text-5xl text-slate-300">event_busy</span>
                <p className="text-sm font-semibold text-slate-700">Chưa có lịch hẹn tư vấn nào</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Quý khách có thể quay lại tab Chatbot để trò chuyện với Trợ lý AI và đăng ký lịch tư vấn trực tiếp 1-1 miễn phí.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Trò Chuyện Đặt Lịch Ngay</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myFilteredBookings.map((b) => {
                  const isProcessed = b.status === "processed";
                  const isCancelled = b.status === "cancelled";
                  return (
                    <div
                      key={b.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 transition-all shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-600 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-100">
                            #{b.id}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {b.eventType || "Tư vấn Tổ chức Sự kiện Tổng thể"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                            isProcessed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isCancelled
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {isProcessed ? "Đã xác nhận & xếp lịch" : isCancelled ? "Đã hủy" : "Chờ tiếp nhận"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Thời gian gặp mặt:</span>
                          <strong className="text-slate-900">{b.time}</strong> • Ngày {b.date}
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Thông tin liên hệ:</span>
                          <strong className="text-slate-900">{b.name}</strong> ({b.phone})
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Yêu cầu & Ghi chú:</span>
                          <span className="text-slate-700 line-clamp-1">{b.notes || "Không có ghi chú"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => generateIcsFile(b)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px] text-brand-600">download</span>
                            <span>Tải vé .ics</span>
                          </button>
                        </div>

                        {!isCancelled && <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>Hủy lịch hẹn</span>
                        </button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DỰ TOÁN ĐA CHIỀU & PHÂN TÍCH CHI PHÍ PHÁT SINH BẰNG AI */}
        {activeTab === "pricing" && (
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 overflow-y-auto space-y-6">
            {/* Header banner */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  <span>Hybrid Deterministic & AI Semantic Cost Matrix</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Hệ Thống Dự Toán Chi Phí Đa Chiều & Phân Tích AI</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Kết hợp giữa thuật toán định mức chuẩn mực và trí tuệ nhân tạo bóc tách phụ phí phát sinh theo kịch bản thực tế.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Đồng bộ Realtime từ Ban Điều Hành</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Rich Interactive Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-5 text-xs">
                {/* 1. Event Type Selector */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    1. Loại hình sự kiện mục tiêu:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "gala", label: "Gala Dinner & Kỷ Niệm", icon: "celebration" },
                      { id: "conference", label: "Hội Nghị & Ra Mắt", icon: "co_present" },
                      { id: "wedding", label: "Tiệc Cưới Luxury", icon: "favorite" },
                      { id: "festival", label: "Festival Ngoài Trời", icon: "theater_comedy" },
                      { id: "private", label: "Tiệc Private / VIP", icon: "diamond" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEventType(t.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          eventType === t.id
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-brand-600">
                          {t.icon}
                        </span>
                        <span className="truncate">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Guest Count Slider & Quick Chips */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span className="uppercase tracking-wider text-[11px]">
                      2. Quy mô số lượng khách tham dự:
                    </span>
                    <span className="text-brand-600 font-black text-sm font-mono">
                      {guestCount} Khách
                    </span>
                  </div>

                  <input
                    type="range"
                    min={50}
                    max={1200}
                    step={25}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />

                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Chọn nhanh:</span>
                    {[100, 200, 350, 500, 800, 1000].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestCount(num)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                          guestCount === num
                            ? "bg-indigo-600 text-white font-bold"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Venue Tier (4 tiers) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    3. Tiêu chuẩn Địa điểm & Sảnh tiệc (Venue):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "standard", label: "Sảnh 4 sao", price: 600000, desc: "Trung tâm TP" },
                      { id: "5star", label: "5 sao quốc tế", price: 1200000, desc: "Khách sạn 5 sao" },
                      { id: "resort", label: "Resort bãi biển", price: 1800000, desc: "Bờ biển / Outdoor" },
                      { id: "bespoke", label: "Bespoke VIP", price: 2400000, desc: "Dinh Độc Lập / GEM" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVenueTier(v.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          venueTier === v.id
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <p className="font-bold">{v.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{v.desc}</p>
                        <p className="text-[10px] text-brand-600 font-mono font-bold mt-1">
                          {formatVND(v.price)}/khách
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. AV & Stage Tech (4 tiers) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    4. Hệ thống Âm thanh, Ánh sáng & Sân khấu LED:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "jbl", label: "JBL Pro Basic", price: 35000000, spec: "LED P3.91 24m²" },
                      { id: "lacoustics", label: "L'Acoustics K2", price: 75000000, spec: "LED Kinetic 48m²" },
                      { id: "db", label: "d&b Audiotechnik", price: 160000000, spec: "3D Hologram" },
                      { id: "stadium", label: "Meyersound Arena", price: 280000000, spec: "Concert Touring" },
                    ].map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvTier(av.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          avTier === av.id
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <p className="font-bold">{av.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{av.spec}</p>
                        <p className="text-[10px] text-brand-600 font-mono font-bold mt-1">
                          {formatVND(av.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. F&B Catering Menu (4 tiers) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    5. Thực đơn & Ẩm thực Yến tiệc (F&B):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "standard", label: "Set Á 5 Món", price: 450000, desc: "Truyền thống cao cấp" },
                      { id: "fusion", label: "Asian Fusion", price: 850000, desc: "6 món + Vang Chile" },
                      { id: "seafood_buffet", label: "Buffet Hải Sản", price: 1250000, desc: "Hải sản & Cocktail Bar" },
                      { id: "michelin", label: "Michelin Western", price: 1600000, desc: "Fine Dining 7 món" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFbTier(f.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          fbTier === f.id
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <p className="font-bold">{f.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                        <p className="text-[10px] text-brand-600 font-mono font-bold mt-1">
                          {formatVND(f.price)}/khách
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Talent & MC (4 tiers) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    6. Nhân sự MC & Nghệ sĩ biểu diễn:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "mc", label: "MC Song Ngữ", price: 15000000, desc: "MC + Band Acoustic" },
                      { id: "vtv_band", label: "MC Đài VTV/HTV", price: 45000000, desc: "MC VTV + Vũ đoàn" },
                      { id: "star", label: "Ca sĩ Sao Hạng A", price: 180000000, desc: "Top V-Pop + Đạo diễn" },
                      { id: "orchestra", label: "Dàn Nhạc Giao Hưởng", price: 260000000, desc: "25 nhạc công + Diva" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTalentTier(t.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          talentTier === t.id
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <p className="font-bold">{t.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
                        <p className="text-[10px] text-brand-600 font-mono font-bold mt-1">
                          {formatVND(t.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Add-on Services Checkboxes */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    7. Hạng mục Gia tăng & Truyền thông (Tùy chọn):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={addOns.photobooth}
                        onChange={(e) => setAddOns({ ...addOns, photobooth: e.target.checked })}
                        className="mt-0.5 accent-indigo-600 rounded"
                      />
                      <div>
                        <p className="font-bold text-slate-800">Photobooth 3D Check-in Tương Tác</p>
                        <p className="text-[10px] text-slate-500">Backdrop 3D Matrix + Đèn chuyên dụng (+18.000.000 VNĐ)</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={addOns.livestream}
                        onChange={(e) => setAddOns({ ...addOns, livestream: e.target.checked })}
                        className="mt-0.5 accent-indigo-600 rounded"
                      />
                      <div>
                        <p className="font-bold text-slate-800">Livestream Đa Điểm Cầu 4K & Flycam</p>
                        <p className="text-[10px] text-slate-500">Đường truyền riêng + 3 máy quay 4K (+22.000.000 VNĐ)</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={addOns.vipGifts}
                        onChange={(e) => setAddOns({ ...addOns, vipGifts: e.target.checked })}
                        className="mt-0.5 accent-indigo-600 rounded"
                      />
                      <div>
                        <p className="font-bold text-slate-800">Bộ Quà Tặng VIP Cá Nhân Hóa</p>
                        <p className="text-[10px] text-slate-500">In khắc laser tên đại biểu (+120.000 VNĐ/khách)</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={addOns.stageEffects}
                        onChange={(e) => setAddOns({ ...addOns, stageEffects: e.target.checked })}
                        className="mt-0.5 accent-indigo-600 rounded"
                      />
                      <div>
                        <p className="font-bold text-slate-800">Hiệu Ứng Sân Khấu Đặc Biệt</p>
                        <p className="text-[10px] text-slate-500">Pháo điện lạnh, khói CO2 & Pháo hoa LED (+8.500.000 VNĐ)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* ── 8. AI SURCHARGE ANALYZER (PHÂN TÍCH CHI PHÍ PHÁT SINH BẰNG AI) ── */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/40 to-white border-2 border-purple-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#5b32e6] text-white flex items-center justify-center text-xs shadow-xs">
                        AI
                      </span>
                      <span>Ghi Chú Đặc Thù & Phân Tích Phụ Phí Phát Sinh Bằng AI</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Semantic AI Estimator
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Nhập bất kỳ điều kiện đặc biệt nào của sự kiện (ví dụ: bãi biển ngoài trời, đảo Phú Quốc, thi công gấp xuyên đêm trong 4 tiếng, yêu cầu suất ăn chay Halal riêng hoặc cần giấy phép Flycam...) để AI tự động bóc tách rủi ro và ước tính chi phí phát sinh chính xác.
                  </p>

                  <textarea
                    rows={3}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Ví dụ: Sự kiện tổ chức bãi biển ngoài trời tại Phú Quốc, thi công gấp ca đêm trong 4 tiếng (00:00 - 05:00), yêu cầu 30 suất ăn chay cao cấp Halal riêng và xin giấy phép flycam ban đêm..."
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base sm:text-xs placeholder:text-slate-400 shadow-inner"
                  ></textarea>

                  {/* Sample chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-slate-500 font-semibold">Gợi ý kịch bản mẫu:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSpecialNotes(
                          "Tổ chức ngoài trời tại bãi biển Phú Quốc, cần dựng nhà bạt nhôm và máy phát điện dự phòng"
                        )
                      }
                      className="px-2 py-1 rounded bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 font-medium transition-colors cursor-pointer"
                    >
                      Bãi biển ngoài trời & Nhà bạt
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSpecialNotes(
                          "Khách sạn 5 sao yêu cầu thi công gấp ca đêm trong 4 tiếng (00:00 - 05:00) sáng sớm"
                        )
                      }
                      className="px-2 py-1 rounded bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 font-medium transition-colors cursor-pointer"
                    >
                      Thi công gấp ban đêm
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSpecialNotes(
                          "Có 30 khách VIP cần suất ăn chay Halal riêng biệt và xin cấp phép bay Flycam ban đêm"
                        )
                      }
                      className="px-2 py-1 rounded bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 font-medium transition-colors cursor-pointer"
                    >
                      Suất chay Halal & Flycam
                    </button>
                  </div>

                  {/* Action button */}
                  <button
                    type="button"
                    onClick={handleAnalyzeSurcharge}
                    disabled={isAnalyzingSurcharge}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#5b32e6] hover:bg-[#4a24c2] text-white font-bold text-xs shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzingSurcharge ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>AI Đang Phân Tích Kịch Bản & Bóc Tách Phụ Phí...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[17px]">auto_fix_high</span>
                        <span>⚡ Phân Tích Chi Phí Phát Sinh Bằng AI</span>
                      </>
                    )}
                  </button>

                  {/* AI Surcharge Breakdown Display */}
                  {aiSurchargeResult && (
                    <div className="pt-3 border-t border-purple-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-purple-600 text-[18px]">
                            analytics
                          </span>
                          <span>Kết Quả Phân Tích Ngữ Nghĩa Kịch Bản:</span>
                        </span>
                        <span className="font-bold text-xs text-purple-700 font-mono">
                          +{formatVND(aiSurchargeResult.totalSurcharge)}
                        </span>
                      </div>

                      {aiSurchargeResult.items.length === 0 ? (
                        <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                          {aiSurchargeResult.aiAdvice}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {aiSurchargeResult.items.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-white rounded-xl border border-purple-100 shadow-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs">
                                  {item.name}
                                </span>
                                <span className="font-mono font-bold text-[#5b32e6]">
                                  +{formatVND(item.cost)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-snug">
                                {item.reason}
                              </p>
                            </div>
                          ))}

                          <div className="p-2.5 rounded-xl bg-purple-100/60 border border-purple-200 text-[11px] text-purple-900">
                            <strong>Lời khuyên tối ưu từ AI:</strong> {aiSurchargeResult.aiAdvice}
                          </div>

                          {/* Toggle to integrate AI surcharge */}
                          <label className="flex items-center gap-2 pt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={applyAiSurcharge}
                              onChange={(e) => setApplyAiSurcharge(e.target.checked)}
                              className="accent-[#5b32e6] rounded"
                            />
                            <span className="font-bold text-slate-800 text-xs">
                              Tích hợp phụ phí phát sinh này vào Tổng dự toán ngân sách
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Budget Summary Receipt (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#1e1346] via-[#2a1b5e] to-[#0f0a28] text-white shadow-xl space-y-5 sticky top-20 border border-purple-400/30">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400">receipt_long</span>
                      <span className="font-extrabold text-sm tracking-wide">
                        BẢNG DỰ TOÁN NGÂN SÁCH ĐỘNG
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-purple-200">
                      QUÝ IV/2026
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs py-4 divide-y divide-white/10">
                    <div className="flex justify-between pt-1">
                      <span className="text-purple-200">
                        Sảnh tiệc & Không gian ({guestCount} khách):
                      </span>
                      <strong className="font-mono">{formatVND(venueTotal)}</strong>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-purple-200">
                        Thực đơn Yến tiệc F&B ({guestCount} khách):
                      </span>
                      <strong className="font-mono">{formatVND(fbTotal)}</strong>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-purple-200">Kỹ thuật Âm thanh, Ánh sáng & LED:</span>
                      <strong className="font-mono">{formatVND(avTotal)}</strong>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-purple-200">Nhân sự MC & Nghệ sĩ biểu diễn:</span>
                      <strong className="font-mono">{formatVND(talentTotal)}</strong>
                    </div>

                    {addOnsTotal > 0 && (
                      <div className="flex justify-between pt-2">
                        <span className="text-purple-200">Hạng mục Gia tăng (Add-ons):</span>
                        <strong className="font-mono">{formatVND(addOnsTotal)}</strong>
                      </div>
                    )}

                    {/* AI Surcharge Line */}
                    {aiSurchargeTotal > 0 && applyAiSurcharge && (
                      <div className="flex justify-between pt-2 text-amber-300 font-bold bg-white/5 p-1.5 rounded-lg border border-amber-300/30">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                          <span>Phụ phí phát sinh (AI ước lượng):</span>
                        </span>
                        <strong className="font-mono">+{formatVND(aiSurchargeTotal)}</strong>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 text-emerald-400">
                      <span>Ưu đãi Hội viên VIP (-5%):</span>
                      <strong className="font-mono">-{formatVND(vipDiscount)}</strong>
                    </div>

                    <div className="flex justify-between pt-2 text-purple-200">
                      <span>Thuế VAT (8%):</span>
                      <strong className="font-mono">{formatVND(vat)}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-purple-200 uppercase font-bold tracking-wider">
                      TỔNG DỰ TOÁN NGÂN SÁCH:
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-300">
                      {formatVND(grandTotal)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleSendEstimateToChat}
                      className="w-full py-3 bg-[#5b32e6] hover:bg-[#4c25ce] text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                      <span>Chat Với AI Để Nhận Báo Giá Này</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportEstimate}
                      className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Xuất Báo Giá Chi Tiết (.txt)</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-purple-300/80 text-center leading-relaxed">
                    * Dự toán đã bao gồm bảo hiểm trách nhiệm sự kiện toàn diện và đội ngũ tổng đạo diễn điều phối on-site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "chat"
              ? "text-brand-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === "chat" ? "bg-indigo-50" : ""}`}>
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Tư Vấn Chat</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("my_bookings");
            setBookings(loadBookings().bookings);
          }}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "my_bookings"
              ? "text-brand-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className={`p-1 rounded-xl relative ${activeTab === "my_bookings" ? "bg-indigo-50" : ""}`}>
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            {myFilteredBookings.length > 0 && (
              <span className="absolute -top-0.5 -right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold font-mono">
                {myFilteredBookings.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Lịch Hẹn</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "pricing"
              ? "text-brand-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === "pricing" ? "bg-indigo-50" : ""}`}>
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Dự Toán Giá</span>
        </button>
      </nav>
    </div>
  );
}
