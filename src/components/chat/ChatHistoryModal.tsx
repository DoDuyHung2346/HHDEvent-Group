"use client";

import { useState } from "react";
import { getCustomerSessions, getCustomer } from "@/lib/customer/storage";
import type { ChatSession } from "@/lib/schemas";

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSession?: (messages: ChatSession["messages"]) => void;
  initialPhone?: string | null;
}

export function ChatHistoryModal({
  isOpen,
  onClose,
  onRestoreSession,
  initialPhone,
}: ChatHistoryModalProps) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (initialPhone && initialPhone.trim()) {
      return getCustomerSessions(initialPhone.trim());
    }
    return [];
  });
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [step, setStep] = useState<"lookup" | "list" | "detail">(() => {
    if (initialPhone && initialPhone.trim()) {
      const found = getCustomerSessions(initialPhone.trim());
      if (found.length > 0) return "list";
    }
    return "lookup";
  });
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState(() => {
    if (initialPhone && initialPhone.trim()) {
      return getCustomer(initialPhone.trim())?.name ?? "";
    }
    return "";
  });

  if (!isOpen) return null;

  // Step 1: Tra cứu theo SĐT
  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Vui lòng nhập số điện thoại để tra cứu lịch sử trò chuyện.");
      return;
    }

    const cust = getCustomer(trimmed);
    if (cust?.name) setCustomerName(cust.name);

    const found = getCustomerSessions(trimmed);
    if (found.length === 0) {
      setError("Chưa tìm thấy phiên trò chuyện nào được lưu với số điện thoại này.");
      setSessions([]);
      return;
    }

    setSessions(found);
    setStep("list");
  };

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
    setStep("detail");
  };

  const handleRestore = () => {
    if (!selectedSession || !onRestoreSession) return;
    onRestoreSession(selectedSession.messages);
    onClose();
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </div>
            <div>
              <h2 className="font-title-md text-sm sm:text-base font-bold text-slate-900">
                Lịch Sử Cuộc Trò Chuyện
              </h2>
              <p className="text-[11px] text-slate-500">
                Tra cứu và khôi phục các phiên tư vấn đã thực hiện
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* STEP 1: Tra cứu theo SĐT */}
          {step === "lookup" && (
            <form onSubmit={handleLookup} className="space-y-4 max-w-md mx-auto py-4">
              <div className="text-center space-y-1">
                <span className="material-symbols-outlined text-indigo-500 text-[36px]">
                  manage_search
                </span>
                <h3 className="font-bold text-sm text-slate-800">
                  Nhập Số Điện Thoại Khách Hàng
                </h3>
                <p className="text-xs text-slate-500">
                  Hệ thống sẽ tra cứu các phiên tư vấn cùng AI Eve đã lưu trên trình duyệt của Quý khách.
                </p>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                  <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Số điện thoại:</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                    required
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[18px]">
                    phone
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Tìm kiếm phiên trò chuyện</span>
              </button>
            </form>
          )}

          {/* STEP 2: Danh sách phiên trò chuyện */}
          {step === "list" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="text-xs text-slate-600">
                  Khách hàng: <strong className="text-slate-900">{customerName || phone}</strong> ({phone})
                </div>
                <button
                  type="button"
                  onClick={() => setStep("lookup")}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                  <span>Tra cứu số khác</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {sessions.map((sess) => {
                  const firstUserMsg = sess.messages.find((m) => m.role === "user")?.content;
                  const lastMsg = sess.messages[sess.messages.length - 1]?.content;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-indigo-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
                          <span>Phiên #{sess.id.slice(-6)}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatDate(sess.startedAt)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 line-clamp-2">
                        {firstUserMsg ? (
                          <>
                            <span className="font-medium text-slate-900">Bắt đầu: </span>
                            {firstUserMsg}
                          </>
                        ) : lastMsg ? (
                          lastMsg
                        ) : (
                          <span className="text-slate-400 italic">Phiên trò chuyện trống</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>{sess.messages.length} tin nhắn trao đổi</span>
                        <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                          <span>Xem chi tiết</span>
                          <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Xem chi tiết phiên trò chuyện */}
          {step === "detail" && selectedSession && (
            <div className="space-y-3 flex flex-col h-full">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep("list")}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Quay lại danh sách</span>
                </button>
                <span className="text-xs text-slate-500 font-mono">
                  {formatDate(selectedSession.startedAt)}
                </span>
              </div>

              {/* Message scroll container */}
              <div className="space-y-3 max-h-[45vh] overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                {selectedSession.messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Không có tin nhắn nào trong phiên này.
                  </p>
                ) : (
                  selectedSession.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-xl text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                          m.role === "user"
                            ? "bg-[#4f46e5] text-white rounded-br-xs"
                            : "bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs"
                        }`}
                      >
                        <div className="text-[10px] opacity-70 mb-1 font-semibold">
                          {m.role === "user" ? "Khách hàng" : "Trợ lý AI Eve"}
                        </div>
                        <div>{m.content}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer action */}
              {onRestoreSession && (
                <div className="pt-2 flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={handleRestore}
                    className="px-4 py-2.5 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">restore</span>
                    <span>Tiếp tục cuộc trò chuyện này</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatHistoryModal;
