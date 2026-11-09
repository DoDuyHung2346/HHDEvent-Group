"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  isConfirmation?: boolean;
}

export default function HeroChatMockup() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      text: "Chào bạn, mình muốn tư vấn gói tiệc cưới trọn gói cho khoảng 350 khách thì chi phí thế nào?",
    },
    {
      id: "2",
      sender: "bot",
      text: "Dạ chào bạn! Với quy mô 350 khách (khoảng 35 bàn), EventHHD có các gói từ tiêu chuẩn đến cao cấp dao động 4.5tr - 8.5tr/bàn kèm đầy đủ sảnh tiệc, trang trí hoa tươi và âm thanh ánh sáng.",
    },
    {
      id: "3",
      sender: "user",
      text: "Mình muốn lên kịch bản concept tiệc cưới ngoài trời riêng và cần chuyên viên tư vấn chi tiết được không?",
    },
  ]);

  const [selectedSlot, setSelectedSlot] = useState("Hôm nay 15:30");
  const [isBooked, setIsBooked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [callNotice, setCallNotice] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBooked]);

  const handleSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = () => {
    if (isBooked) return;
    setIsBooked(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `book-${Date.now()}`,
          sender: "bot",
          text: `🎉 Lịch hẹn tư vấn 1-1 đã được xác nhận vào lúc ${selectedSlot} cùng chuyên viên Nguyễn Tiến Hoan! EventHHD sẽ gửi lời mời kèm tài liệu concept sơ bộ đến bạn.`,
          isConfirmation: true,
        },
      ]);
    }, 400);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    const newMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = "Dạ EventHHD đã ghi nhận câu hỏi của bạn. Đội ngũ chuyên gia sẽ lập tức chuẩn bị giải pháp và gửi bảng dự toán chi tiết.";
      const lower = query.toLowerCase();

      if (lower.includes("giá") || lower.includes("chi phí") || lower.includes("bao nhiêu")) {
        reply = "EventHHD áp dụng định mức minh bạch chuẩn VEA: Gói Silver từ 150tr, Gold Signature từ 380tr và Platinum Bespoke tuỳ biến. Bạn có thể kéo xuống công cụ dự toán bên dưới để tính ngân sách chính xác theo số khách!";
      } else if (lower.includes("sảnh") || lower.includes("địa điểm") || lower.includes("resort") || lower.includes("khách sạn")) {
        reply = "EventHHD liên kết mạng lưới hơn 50+ khách sạn 5 sao quốc tế và resort bờ biển khắp Hà Nội, TP.HCM, Đà Nẵng, Phú Quốc với mức ưu đãi tốt nhất cho quý khách.";
      } else if (lower.includes("thực đơn") || lower.includes("món") || lower.includes("ăn")) {
        reply = "Thực đơn gồm các set Á 5 món, Fusion 6 món kèm rượu vang hoặc Fine Dining 7 món chuẩn Michelin phục vụ theo yêu cầu.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: reply,
        },
      ]);
    }, 700);
  };

  const triggerCallNotice = (type: "video" | "voice") => {
    setCallNotice(
      type === "video"
        ? "Đang khởi tạo phòng video call trực tiếp với chuyên viên..."
        : "Đang kết nối hotline chuyên gia: 1900 6886..."
    );
    setTimeout(() => setCallNotice(null), 3000);
  };

  return (
    <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-chat border border-white/80 overflow-hidden flex flex-col relative z-20 transition-all hover:shadow-2xl">
      {/* ── Chat Window Header ── */}
      <div className="bg-brand-50/70 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-purple-100 flex items-center justify-between backdrop-blur-sm relative">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-brand-600 to-purple-400 p-[2px]">
              <div className="w-full h-full bg-slate-900 rounded-full overflow-hidden flex items-center justify-center text-white">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Trợ lý AI EventHHD</h3>
            <p className="text-[11px] sm:text-xs text-brand-600 font-medium flex items-center gap-1">
              {isTyping ? "Đang soạn câu trả lời" : "Đang nhập"}
              <span className="inline-flex tracking-tighter animate-pulse">.....</span>
            </p>
          </div>
        </div>

        {/* Action Icons on Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-brand-600">
          <button
            onClick={() => triggerCallNotice("video")}
            className="p-1.5 hover:bg-brand-100/80 rounded-full transition cursor-pointer"
            title="Bắt đầu video call"
            type="button"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
              <path
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => triggerCallNotice("voice")}
            className="p-1.5 hover:bg-brand-100/80 rounded-full transition cursor-pointer"
            title="Gọi thoại trực tiếp: 1900 6886"
            type="button"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
              <path
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link
            href="/login"
            className="p-1.5 hover:bg-brand-100/80 rounded-full transition"
            title="Đăng nhập để lưu lịch sử chat"
          >
            <svg className="w-4 h-4 text-brand-600 fill-current" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="12" cy="19" r="1.75" />
            </svg>
          </Link>
        </div>

        {/* Notice alert toast */}
        {callNotice && (
          <div className="absolute top-full left-0 right-0 bg-slate-900 text-white text-[11px] px-4 py-2 shadow-lg z-30 flex items-center justify-between animate-fadeIn">
            <span>{callNotice}</span>
            <button
              onClick={() => setCallNotice(null)}
              className="text-slate-400 hover:text-white text-xs font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ── Chat Scrollable Body ── */}
      <div
        ref={chatContainerRef}
        className="p-3.5 sm:p-5 h-[370px] sm:h-[410px] overflow-y-auto space-y-3.5 sm:space-y-4 custom-chat-scroll bg-[#FBFBFE]"
      >
        {/* Render dynamic messages */}
        {messages.map((msg) => {
          if (msg.sender === "user") {
            return (
              <div key={msg.id} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-300 shrink-0 flex items-center justify-center text-xs font-bold text-gray-700">
                  U
                </div>
                <div className="space-y-1.5 max-w-[85%] sm:max-w-[82%]">
                  <div className="bg-brand-500 text-white rounded-2xl rounded-tl-sm px-3.5 sm:px-4 py-2 text-xs font-medium leading-relaxed shadow-xs">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          }

          if (msg.isConfirmation) {
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1">
                <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl rounded-tr-sm px-3.5 sm:px-4 py-2 text-xs font-semibold max-w-[90%] sm:max-w-[88%] shadow-xs leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col items-end space-y-1.5">
              <div className="bg-slate-100 text-gray-800 rounded-2xl rounded-tr-sm px-3.5 sm:px-4 py-2 text-xs font-medium leading-relaxed max-w-[90%] sm:max-w-[85%] border border-slate-200/60 shadow-xs">
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Embedded Interactive Meeting Booking Card (matches Photo 2) */}
        <div className="flex flex-col items-end space-y-2">
          <div className="bg-slate-100 text-gray-800 rounded-2xl rounded-tr-sm px-3.5 sm:px-4 py-2 text-xs font-medium leading-relaxed max-w-[95%] sm:max-w-[90%] border border-slate-200/60">
            Dạ hoàn toàn được ạ! Hệ thống đã ghi nhận yêu cầu concept tiệc cưới ngoài trời riêng. Bạn có thể chọn lịch hẹn trao đổi trực tiếp cùng chuyên viên tổ chức tiệc cưới bên dưới:
          </div>

          <div className="w-full max-w-[98%] sm:max-w-[95%] bg-white rounded-2xl p-3 sm:p-3.5 border border-purple-100 shadow-md transition hover:border-purple-200">
            {/* Specialist info */}
            <div className="flex items-center gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-slate-100">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-100 flex items-center justify-center text-brand-600 font-bold text-xs ring-2 ring-brand-500/20 shrink-0">
                TH
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Nguyễn Tiến Hoan</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-500">Chuyên viên tư vấn tiệc cưới • 15 phút</p>
              </div>
            </div>

            {/* Available times interactive chips */}
            <div className="mt-2.5 sm:mt-3">
              <p className="text-[10px] sm:text-[11px] font-semibold text-gray-600 mb-1.5 sm:mb-2">Chọn thời gian tư vấn trực tiếp 1-1:</p>
              <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                {[
                  { id: "slot1", time: "Hôm nay 15:30" },
                  { id: "slot2", time: "Ngày mai 10:00" },
                  { id: "slot3", time: "Ngày mai 14:00" },
                ].map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleSelectSlot(slot.time)}
                      className={`text-[10px] sm:text-[11px] font-medium py-1.5 px-0.5 sm:px-1 rounded-lg text-center transition border active:scale-95 cursor-pointer leading-tight ${
                        isSelected
                          ? "bg-brand-500 text-white border-brand-500 shadow-xs font-bold"
                          : "bg-purple-50 text-brand-700 border-purple-100 hover:bg-brand-500 hover:text-white"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirmation Action */}
            <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] text-brand-600 font-medium italic">
                Lịch hẹn: {selectedSlot}
              </span>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isBooked}
                className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition shadow-xs cursor-pointer ${
                  isBooked
                    ? "bg-emerald-600 text-white cursor-default"
                    : "bg-brand-500 hover:bg-brand-600 text-white active:scale-95"
                }`}
              >
                {isBooked ? "✓ Đã xác nhận" : "Xác nhận hẹn"}
              </button>
            </div>
          </div>
        </div>

        {/* Live typing indicator */}
        {isTyping && (
          <div className="flex flex-col items-end space-y-1">
            <div className="bg-slate-100 text-gray-500 rounded-2xl rounded-tr-sm px-3.5 py-1.5 text-xs flex items-center gap-1.5 border border-slate-200/60 shadow-xs">
              <span>Trợ lý AI đang soạn câu trả lời</span>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Chat Footer Input Area ── */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 sm:p-3 bg-purple-50/70 border-t border-purple-100 flex items-center gap-1.5 sm:gap-2"
      >
        <button
          type="button"
          className="text-gray-400 hover:text-brand-500 p-1.5 transition cursor-pointer shrink-0"
          title="Đính kèm tài liệu concept"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
            <path
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Hỏi thêm về gói tiệc cưới..."
          className="flex-1 bg-transparent border-none text-xs text-gray-800 placeholder-gray-400 focus:ring-0 px-1 sm:px-2 py-1 outline-none min-w-0"
        />
        <button
          type="button"
          className="text-gray-400 hover:text-brand-500 p-1.5 transition cursor-pointer shrink-0"
          title="Nhập giọng nói"
        >
          <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
            <path
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="submit"
          className="text-brand-500 hover:text-brand-700 p-1.5 transition hover:scale-110 active:scale-95 cursor-pointer shrink-0"
          title="Gửi tin nhắn"
        >
          <svg className="w-4 h-4 fill-current rotate-90" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
