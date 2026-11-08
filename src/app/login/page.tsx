"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { recordLoginAttempt } from "@/lib/auth/loginHistory";
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  LockIcon,
  AlertCircleIcon,
} from "@/components/shared/FormIcons";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "customer";
  const externalPrompt = searchParams.get("prompt");

  const { loginUser, loginAdmin } = useAuth();

  // Role toggle: "customer" | "admin"
  const [role, setRole] = useState<"customer" | "admin">(initialRole);

  // Customer form inputs
  const [customerName, setCustomerName] = useState("Nguyễn Thanh Tuấn");
  const [customerPhone, setCustomerPhone] = useState("0912345678");
  const [customerEmail, setCustomerEmail] = useState("khachhang@gmail.com");
  const [customerError, setCustomerError] = useState("");
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  // Admin form inputs
  const [adminEmail, setAdminEmail] = useState("admin@eventhhd.vn");
  const [adminPassword, setAdminPassword] = useState("admin2026");
  const [adminError, setAdminError] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Luôn reset cờ loading và error khi component mount hoặc khi chuyển tab role
  useEffect(() => {
    setIsCustomerLoading(false);
    setIsAdminLoading(false);
    setCustomerError("");
    setAdminError("");

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [role]);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError("");

    if (!customerName.trim()) {
      setCustomerError("Vui lòng nhập họ và tên của Quý khách.");
      return;
    }

    const cleanPhone = customerPhone.replace(/\s+/g, "");
    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(cleanPhone)) {
      setCustomerError("Số điện thoại không hợp lệ (10 số, đầu số Việt Nam).");
      return;
    }

    setIsCustomerLoading(true);
    loginUser(customerName.trim(), cleanPhone, customerEmail);

    // Ghi nhận lịch sử đăng nhập
    recordLoginAttempt({
      role: "customer",
      name: customerName.trim(),
      identifier: cleanPhone,
      status: "success",
    });

    timeoutRef.current = setTimeout(() => {
      setIsCustomerLoading(false);
      if (externalPrompt) {
        router.push(`/customer?prompt=${encodeURIComponent(externalPrompt)}`);
      } else {
        router.push("/customer");
      }
    }, 250);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    setIsAdminLoading(true);
    const res = loginAdmin(adminEmail, adminPassword);
    if (!res.success) {
      setIsAdminLoading(false);
      setAdminError(res.error || "Mật khẩu quản trị chưa chính xác (Mặc định: admin2026)");
      recordLoginAttempt({
        role: "admin",
        name: "Quản trị viên",
        identifier: adminEmail,
        status: "failed",
        reason: res.error || "Mật khẩu quản trị chưa chính xác",
      });
      return;
    }

    recordLoginAttempt({
      role: "admin",
      name: res.admin?.name || "Ban Quản Trị",
      identifier: adminEmail,
      status: "success",
    });

    timeoutRef.current = setTimeout(() => {
      setIsAdminLoading(false);
      router.push("/admin");
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ECE8FD] via-[#F4F1FD] to-[#FFFFFF] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Dot Pattern Overlay */}
      <div className="absolute inset-0 dot-grid-pattern opacity-60 pointer-events-none" />

      {/* Decorative 3D Spheres from the Stitch design */}
      <div className="absolute -top-12 -right-16 w-80 h-80 rounded-full sphere-gradient-lavender shadow-sphere-purple pointer-events-none opacity-85 z-0 transform translate-x-12 -translate-y-8" />
      <div className="absolute bottom-6 -left-12 w-72 h-72 rounded-full sphere-gradient-peach shadow-sphere-peach pointer-events-none opacity-90 z-0" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-chat border border-white/80 p-6 sm:p-8 space-y-6 relative z-10 transition-all">
        {/* Brand Header without "Hệ Thống Đăng Nhập" */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center transition-all group-hover:bg-brand-500 group-hover:text-white shadow-xs">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24">
                <path
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-2xl tracking-tight text-gray-900 group-hover:text-brand-500 transition-colors leading-tight">
                EventHHD
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-500 pt-1">
            Chọn vai trò để truy cập cổng làm việc tương ứng
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="p-1 rounded-2xl bg-purple-50/60 border border-purple-100/80 flex gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex-1 py-3 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] select-none active:scale-[0.98] ${
              role === "customer"
                ? "bg-brand-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserIcon size={16} />
            <span>Khách Hàng</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-3 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] select-none active:scale-[0.98] ${
              role === "admin"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LockIcon size={16} />
            <span>Ban Quản Trị</span>
          </button>
        </div>

        {/* Form: Khách Hàng */}
        {role === "customer" && (
          <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Họ và tên Quý khách <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium min-h-[48px] sm:min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <PhoneIcon size={18} />
                </div>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono font-medium min-h-[48px] sm:min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Email nhận kịch bản & báo giá (Không bắt buộc)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <MailIcon size={18} />
                </div>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono font-medium min-h-[48px] sm:min-h-[44px]"
                />
              </div>
            </div>

            {customerError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircleIcon size={16} className="shrink-0 text-red-600" />
                <span>{customerError}</span>
              </div>
            )}

            {/* Submit Button: Bắt đầu tư vấn (No Sparkles Icon, matching request) */}
            <button
              type="submit"
              disabled={isCustomerLoading}
              className="w-full min-h-[50px] sm:min-h-[46px] py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-extrabold rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm sm:text-base select-none mt-2"
            >
              {isCustomerLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Đang truy cập...</span>
                </>
              ) : (
                <span>Bắt đầu tư vấn</span>
              )}
            </button>
          </form>
        )}

        {/* Form: Ban Quản Trị */}
        {role === "admin" && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Email Quản Trị Viên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <MailIcon size={18} />
                </div>
                <input
                  type="email"
                  autoComplete="username"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@eventhhd.vn"
                  className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono font-medium min-h-[48px] sm:min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Mật Khẩu Xác Thực Quản Trị <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <LockIcon size={18} />
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono font-medium min-h-[48px] sm:min-h-[44px]"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Mật khẩu mặc định hệ thống: <code className="text-brand-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">admin2026</code>
              </p>
            </div>

            {adminError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircleIcon size={16} className="shrink-0 text-red-600" />
                <span>{adminError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAdminLoading}
              className="w-full min-h-[50px] sm:min-h-[46px] py-3.5 bg-slate-900 hover:bg-black active:scale-[0.99] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm sm:text-base select-none mt-2"
            >
              {isAdminLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Đăng Nhập Cổng Điều Hành Quản Trị</span>
              )}
            </button>
          </form>
        )}

        {/* Back Link to First Page */}
        <div className="text-center pt-2 border-t border-purple-100/60">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-brand-600 inline-flex items-center gap-1.5 font-bold transition-colors py-2"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBFBFE] flex items-center justify-center text-xs text-slate-400">Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  );
}
