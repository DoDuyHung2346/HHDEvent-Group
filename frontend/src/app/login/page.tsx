"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { recordLoginAttempt } from "@/lib/auth/loginHistory";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { AlertCircleIcon, LockIcon, UserIcon } from "@/components/shared/FormIcons";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "customer";
  const externalPrompt = searchParams.get("prompt");

  const { loginUser, loginAdmin } = useAuth();

  // Role toggle: "customer" | "admin"
  const [role, setRole] = useState<"customer" | "admin">(initialRole);

  // Customer form inputs
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerAuthMode, setCustomerAuthMode] = useState<"login" | "signup">("login");
  const [customerError, setCustomerError] = useState("");
  const [customerNotice, setCustomerNotice] = useState("");
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
    setCustomerNotice("");
    setAdminError("");

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [role]);

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError("");
    setCustomerNotice("");

    if (customerAuthMode === "signup" && !customerName.trim()) {
      setCustomerError("Vui lòng nhập họ và tên của Quý khách.");
      return;
    }

    const cleanPhone = customerPhone.replace(/\s+/g, "");
    if (customerAuthMode === "signup" && !/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(cleanPhone)) {
      setCustomerError("Số điện thoại không hợp lệ (10 số, đầu số Việt Nam).");
      return;
    }
    if (!customerEmail.trim()) {
      setCustomerError("Vui lòng nhập email để đăng ký hoặc đăng nhập.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
      setCustomerError("Email chưa đúng định dạng.");
      return;
    }
    if (customerPassword.length < 6) {
      setCustomerError("Mật khẩu cần có ít nhất 6 ký tự.");
      return;
    }

    setIsCustomerLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const email = customerEmail.trim().toLowerCase();
      const authResult = customerAuthMode === "signup"
        ? await supabase.auth.signUp({
            email,
            password: customerPassword,
            options: { data: { name: customerName.trim(), phone: cleanPhone }, emailRedirectTo: `${window.location.origin}/login` },
          })
        : await supabase.auth.signInWithPassword({ email, password: customerPassword });

      if (authResult.error) {
        const isEmailRateLimited = /email rate limit exceeded|over_email_send_rate_limit/i.test(authResult.error.message);
        setCustomerError(
          isEmailRateLimited
            ? "Supabase đang tạm giới hạn số email xác nhận đã gửi cho địa chỉ này. Tài khoản có thể đã được tạo ở lần bấm trước: hãy kiểm tra Inbox/Spam để bấm liên kết xác nhận, rồi chọn Đăng nhập. Không bấm Đăng ký thêm; nếu chưa nhận được email, chờ hết thời gian giới hạn hoặc dùng một email khác để thử."
            : authResult.error.message
        );
        recordLoginAttempt({ role: "customer", name: customerName.trim(), identifier: email, status: "failed", reason: authResult.error.message });
        return;
      }

      // Nếu Supabase bật xác nhận email, chưa có session cho đến khi khách bấm link.
      if (!authResult.data.session || !authResult.data.user) {
        setCustomerNotice(`Đăng ký thành công. Vui lòng kiểm tra email ${email} và xác nhận tài khoản, sau đó quay lại đăng nhập.`);
        return;
      }

      const metadata = authResult.data.user.user_metadata ?? {};
      const resolvedName = typeof metadata.name === "string" ? metadata.name : customerName.trim();
      const resolvedPhone = typeof metadata.phone === "string" ? metadata.phone : cleanPhone;
      if (!resolvedName || !/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(resolvedPhone)) {
        setCustomerError("Tài khoản này thiếu họ tên hoặc số điện thoại hợp lệ. Vui lòng liên hệ hỗ trợ để cập nhật hồ sơ.");
        return;
      }
      loginUser(resolvedName, resolvedPhone, email);

      recordLoginAttempt({ role: "customer", name: resolvedName, identifier: email, status: "success" });

      if (externalPrompt) {
        router.push(`/customer?prompt=${encodeURIComponent(externalPrompt)}`);
      } else {
        router.push("/customer");
      }
    } catch (error) {
      setCustomerError(error instanceof Error ? error.message : "Không thể kết nối hệ thống đăng nhập.");
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");

    if (!/^\S+@\S+\.\S+$/.test(adminEmail.trim()) || !adminPassword) {
      setAdminError("Vui lòng nhập email và mật khẩu quản trị hợp lệ.");
      return;
    }

    setIsAdminLoading(true);
    const res = await loginAdmin(adminEmail, adminPassword);
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
          <form noValidate onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
            <div className="flex rounded-xl bg-slate-100 p-1 font-bold">
              <button type="button" onClick={() => { setCustomerAuthMode("login"); setCustomerError(""); setCustomerNotice(""); }} className={`flex-1 rounded-lg py-2 ${customerAuthMode === "login" ? "bg-white text-[#5b32e6] shadow-sm" : "text-slate-500"}`}>Đăng nhập</button>
              <button type="button" onClick={() => { setCustomerAuthMode("signup"); setCustomerError(""); setCustomerNotice(""); }} className={`flex-1 rounded-lg py-2 ${customerAuthMode === "signup" ? "bg-white text-[#5b32e6] shadow-sm" : "text-slate-500"}`}>Đăng ký</button>
            </div>
            {customerAuthMode === "signup" && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Họ và tên Quý khách <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b32e6] transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0912 345 678"
                    autoComplete="tel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b32e6] transition-all font-mono font-medium"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b32e6] transition-all font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5b32e6] transition-all font-mono font-medium"
              />
            </div>

            {customerError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircleIcon size={16} className="shrink-0 text-red-600" />
                <span>{customerError}</span>
              </div>
            )}
            {customerNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{customerNotice}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isCustomerLoading}
              className="w-full min-h-[50px] sm:min-h-[46px] py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-extrabold rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm sm:text-base select-none mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>{isCustomerLoading ? "Đang xử lý..." : customerAuthMode === "signup" ? "Tạo Tài Khoản Khách Hàng" : "Đăng Nhập Chatbot Tư Vấn"}</span>
            </button>
          </form>
        )}

        {/* Form: Ban Quản Trị */}
        {role === "admin" && (
          <form noValidate onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Email Quản Trị Viên <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@eventhhd.vn"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Mật Khẩu Xác Thực Quản Trị <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">Mật khẩu mặc định hệ thống: <code className="text-purple-600 font-bold">admin2026</code></p>
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
