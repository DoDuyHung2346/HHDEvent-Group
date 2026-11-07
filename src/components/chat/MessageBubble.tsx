"use client";

import type { Message } from "@/hooks/useChat";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const source = message.response?.source;

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 text-xs font-bold flex-shrink-0 shadow-md shadow-amber-500/20 ring-1 ring-white/10">
          EV
        </div>
      )}

      <div
        className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[78%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Bubble content */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
            isUser
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-xs shadow-amber-500/15"
              : "bg-[#111827] text-slate-100 border border-white/10 rounded-tl-xs shadow-md backdrop-blur-md"
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </div>

        {/* Source badge & Timestamp */}
        <div className="flex items-center gap-2 px-1">
          {!isUser && source && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                source === "ai"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}
            >
              {source === "ai" ? "🤖 AI Realtime" : "⚡ Tri thức chuẩn"}
            </span>
          )}

          <span className="text-slate-400 text-[10px]">
            {message.timestamp.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/20 flex items-center justify-center text-slate-200 text-xs font-bold flex-shrink-0 shadow-md">
          Bạn
        </div>
      )}
    </div>
  );
}
