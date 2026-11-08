"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { recordLoginAttempt } from "@/lib/auth/loginHistory";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useAuth();

  const [email, setEmail] = useState("admin@eventhhd.vn");
  const [password, setPassword] = useState("admin2026");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsLoading(false);
    setError("");

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = loginAdmin(email, password);
    if (!res.success) {
      setError(res.error || "Mật khẩu xác thực chưa chính xác.");
      setIsLoading(false);
      recordLoginAttempt({
        role: "admin",
        name: "Quản trị viên",
        identifier: email,
        status: "failed",
        reason: res.error || "Mật khẩu xác thực chưa chính xác",
      });
      return;
    }

    recordLoginAttempt({
      role: "admin",
      name: res.admin?.name || "Ban Quản Trị",
      identifier: email,
      status: "success",
    });

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      router.push("/admin");
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between font-sans text-slate-100">
      {/* Top Header of Admin Portal */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            EV
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>EventHHD Enterprise Portal</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                ADMIN CONSOLE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Cổng Quản Trị Hệ Thống Nội Bộ</p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Về trang chủ khách hàng</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-slate-900/90 rounded-2xl max-w-md w-full shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
              <span className="material-symbols-outlined text-[28px]">shield_person</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Xác Thực Ban Quản Trị
            </h2>
            <p className="text-xs text-slate-400">
              Vui lòng đăng nhập bằng tài khoản quản trị viên được cấp quyền để truy cập hệ thống.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Tài khoản Email Quản Trị
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eventhhd.vn"
                className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Mật Khẩu Xác Thực
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập admin2026"
                className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Mật khẩu mặc định: <code className="text-purple-400 font-bold">admin2026</code>
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">security</span>
              <span>{isLoading ? "Đang xác thực..." : "Xác Thực & Vào Quản Trị"}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <Link
              href="/login"
              className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Đăng nhập với vai trò Khách hàng</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        © 2026 EventHHD Internal Portal. All rights reserved.
      </footer>
    </div>
  );
}
