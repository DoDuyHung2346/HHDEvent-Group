"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import MyBookingsModal from "../booking/MyBookingsModal";

interface HeaderProps {
  role?: string;
}

export default function Header({ role }: HeaderProps = {}) {
  const pathname = usePathname();
  const { user, isUserLoggedIn, logoutUser } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);

  const navLinks = [
    {
      href: "/",
      label: "Tư Vấn & Chatbot",
      active: pathname === "/",
      icon: "smart_toy",
    },
    {
      href: "/goi-dich-vu",
      label: "Gói Dịch Vụ & Báo Giá",
      active: pathname === "/goi-dich-vu",
      icon: "payments",
    },
  ];

  return (
    <>
      <header className="w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-purple-100/80 sticky top-0 shrink-0">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-sm sm:text-base shadow-xs group-hover:bg-brand-500 group-hover:text-white transition-all">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24">
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#191c1e] text-base sm:text-lg leading-tight font-headline-md tracking-tight group-hover:text-brand-500 transition-colors">
                  EventHHD
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Tổ Chức Sự Kiện & Hội Nghị Trọn Gói
                </span>
              </div>
            </Link>
          </div>

          {/* AI Live Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50/70 border border-purple-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span className="font-label-md text-label-md text-[#191c1e] text-xs">
              AI Trợ lý trực tuyến 24/7
            </span>
          </div>

          {/* Center Desktop Navigation for Clients */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#f2f4f6] p-1.5 rounded-xl border border-slate-200/70">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  link.active
                    ? "bg-white text-brand-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Lịch Hẹn Của Tôi */}
            <button
              type="button"
              onClick={() => setMyBookingsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-brand-600">calendar_month</span>
              <span>Lịch Hẹn Của Tôi</span>
            </button>

            {/* Notifications Dropdown Container */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
                aria-label="Thông báo hệ thống"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Thông báo EventHHD</span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] text-brand-600 hover:underline cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                      <p className="font-semibold text-slate-900">Hotline Doanh nghiệp 24/7</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Gọi ngay 1900 6886 để được kết nối chuyên viên trực tiếp.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Session State */}
            {isUserLoggedIn && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  type="button"
                  onClick={() => setMyBookingsOpen(true)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
                  title="Xem lịch hẹn đã đặt"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-purple-100">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-brand-600 font-semibold font-mono">
                      {user.phone}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={logoutUser}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Đăng xuất tài khoản khách hàng"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full shadow-xs transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Đăng Nhập</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#464555] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors ml-1 cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden relative z-50 border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
                    link.active
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              ))}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMyBookingsOpen(true);
                }}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-brand-700 bg-purple-50 hover:bg-purple-100 flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                <span>Lịch Hẹn Của Tôi</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              {isUserLoggedIn && user ? (
                <>
                  <span>Khách hàng: <strong>{user.name}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      logoutUser();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-600 font-semibold py-2 hover:underline cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-600 font-bold py-2 hover:underline inline-block"
                >
                  Đăng nhập tài khoản
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal Lịch Hẹn Của Tôi */}
      <MyBookingsModal isOpen={myBookingsOpen} onClose={() => setMyBookingsOpen(false)} />
    </>
  );
}
