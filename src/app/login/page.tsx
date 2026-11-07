"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { recordLoginAttempt } from "@/lib/auth/loginHistory";

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
  const [adminEmail, setAdminEmail] = useState("admin@eventviet.vn");
  const [adminPassword, setAdminPassword] = useState("admin2026");
  const [adminError, setAdminError] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Luôn reset cờ loading và error khi component mount hoặc khi chuyển tab role
  // Giải quyết triệt để vấn đề nút bị mờ và kẹt trạng thái "Đang xử lý..." sau khi đăng xuất quay lại
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
      // Ghi nhận lịch sử đăng nhập thất bại
      recordLoginAttempt({
        role: "admin",
        name: "Quản trị viên",
        identifier: adminEmail,
        status: "failed",
        reason: res.error || "Mật khẩu quản trị chưa chính xác",
      });
      return;
    }

    // Ghi nhận lịch sử đăng nhập thành công
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
    <div className="min-h-screen bg-[#fbfaff] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Ambient Radial Dome Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] sm:w-[120%] lg:w-[100%] h-[460px] pointer-events-none -z-10">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/50 via-indigo-100/30 to-transparent blur-2xl"></div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[500px] rounded-full border border-purple-300/40 opacity-70"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-8 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5b32e6] via-[#6366f1] to-[#7c3aed] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              EV
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-xl tracking-tight text-slate-900 leading-tight">
                EventViet
              </span>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                Hệ Thống Đăng Nhập
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-500 pt-1">
            Chọn vai trò để truy cập cổng làm việc tương ứng
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/80 flex gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === "customer"
                ? "bg-[#5b32e6] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">person</span>
            <span>Khách Hàng</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === "admin"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">admin_panel_settings</span>
            <span>Ban Quản Trị</span>
          </button>
        </div>

        {/* Form: Khách Hàng */}
        {role === "customer" && (
          <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Họ và tên Quý khách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b32e6] transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b32e6] transition-all font-mono font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email nhận kịch bản & báo giá (Không bắt buộc)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b32e6] transition-all font-mono font-medium"
              />
            </div>

            {customerError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{customerError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isCustomerLoading}
              className="w-full py-3.5 bg-[#5b32e6] hover:bg-[#4a24c2] text-white font-extrabold rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>{isCustomerLoading ? "Đang truy cập..." : "Vào Trải Nghiệm Chatbot Tư Vấn Sự Kiện"}</span>
            </button>
          </form>
        )}

        {/* Form: Ban Quản Trị */}
        {role === "admin" && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Quản Trị Viên <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@eventviet.vn"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mật Khẩu Xác Thực Quản Trị <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono font-medium"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Mật khẩu mặc định hệ thống: <code className="text-purple-600 font-bold">admin2026</code></p>
            </div>

            {adminError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{adminError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAdminLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">security</span>
              <span>{isAdminLoading ? "Đang xác thực..." : "Đăng Nhập Cổng Điều Hành Quản Trị"}</span>
            </button>
          </form>
        )}

        {/* Back Link to First Page */}
        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-[#5b32e6] inline-flex items-center gap-1.5 font-bold transition-colors"
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
    <Suspense fallback={<div className="min-h-screen bg-[#fbfaff] flex items-center justify-center text-xs text-slate-400">Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  );
}
