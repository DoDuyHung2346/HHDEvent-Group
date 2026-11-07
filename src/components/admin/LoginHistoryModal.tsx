"use client";

import { useState, useEffect } from "react";
import { loadLoginHistory, clearLoginHistory, type LoginHistoryEntry } from "@/lib/auth/loginHistory";

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginHistoryModal({ isOpen, onClose }: LoginHistoryModalProps) {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [filterRole, setFilterRole] = useState<"all" | "customer" | "admin">("all");

  const refreshHistory = () => {
    setHistory(loadLoginHistory());
  };

  useEffect(() => {
    if (isOpen) {
      refreshHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    if (filterRole === "all") return true;
    return item.role === filterRole;
  });

  const handleClear = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đăng nhập?")) {
      clearLoginHistory();
      setHistory([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">manage_history</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Nhật Ký & Lịch Sử Đăng Nhập Hệ Thống</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                  {history.length} lượt
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi phiên đăng nhập của Khách hàng và Ban Quản Trị
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Action & Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterRole("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterRole === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole("customer")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterRole === "customer" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Khách hàng ({history.filter((h) => h.role === "customer").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole("admin")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterRole === "admin" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Quản trị ({history.filter((h) => h.role === "admin").length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshHistory}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              <span>Làm mới</span>
            </button>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">history</span>
              Chưa có dữ liệu đăng nhập nào được ghi nhận.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Vai Trò</th>
                    <th className="py-3 px-4">Tài Khoản / Định Danh</th>
                    <th className="py-3 px-4">Thiết Bị</th>
                    <th className="py-3 px-4 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const isSuccess = item.status === "success";
                    const isCustomer = item.role === "customer";
                    const dateFormatted = new Date(item.timestamp).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {dateFormatted}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCustomer
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {isCustomer ? "person" : "shield_person"}
                            </span>
                            <span>{isCustomer ? "Khách Hàng" : "Quản Trị"}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="font-mono text-[11px] text-slate-500">{item.identifier}</p>
                          {item.reason && (
                            <p className="text-[10px] text-red-500 font-medium mt-0.5">{item.reason}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {item.device || "Máy tính"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isSuccess
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{isSuccess ? "Thành công" : "Thất bại"}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
