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
      <header className="w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 shrink-0">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#3525cd] to-[#4f46e5] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                EV
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#191c1e] text-base sm:text-lg leading-tight font-headline-md tracking-tight">
                  EventViet
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Tổ Chức Sự Kiện & Hội Nghị Trọn Gói
                </span>
              </div>
            </Link>
          </div>

          {/* AI Live Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f2f4f6] border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4f46e5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4f46e5]"></span>
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
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  link.active
                    ? "bg-[#4f46e5] text-white shadow-sm"
                    : "text-[#464555] hover:text-[#191c1e] hover:bg-white/80"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setMyBookingsOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg text-[#464555] hover:text-[#191c1e] hover:bg-white/80 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-indigo-600">
                calendar_month
              </span>
              <span>Lịch Hẹn Của Tôi</span>
            </button>
          </nav>

          {/* Right Actions: Notifications & User Account */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Thông báo"
                className="relative p-2 rounded-lg text-[#464555] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                    <span>Thông báo EventViet</span>
                    <span
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[10px] text-[#4f46e5] cursor-pointer hover:underline"
                    >
                      Đã xem
                    </span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="p-2 bg-indigo-50/60 rounded-lg text-slate-700">
                      <p className="font-semibold text-[#4f46e5]">Ưu đãi đặt lịch sớm</p>
                      <p className="text-[11px] text-slate-500">Giảm 5% cho sự kiện doanh nghiệp đặt trước 30 ngày.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Client User Profile or Login Link */}
            {isUserLoggedIn && user ? (
              <div className="flex items-center gap-2 pl-1 sm:pl-2">
                <button
                  type="button"
                  onClick={() => setMyBookingsOpen(true)}
                  className="hidden sm:flex flex-col text-right cursor-pointer group"
                  title="Bấm để xem lịch hẹn đã đặt"
                >
                  <span className="text-xs text-slate-900 font-bold group-hover:text-indigo-600 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {user.phone}
                  </span>
                </button>

                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-indigo-100">
                  {user.name.charAt(0).toUpperCase()}
                </div>

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
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1"
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
                  className={`px-4 py-4 rounded-xl text-base font-semibold flex items-center gap-3 transition-colors ${
                    link.active
                      ? "bg-[#4f46e5] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">
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
                className="px-4 py-4 rounded-xl text-base font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">calendar_month</span>
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
                  className="text-indigo-600 font-bold py-2 hover:underline inline-block"
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
