"use client";

import { useEffect, useMemo, useState } from "react";

type Message = { id: string; role: "user" | "assistant"; content: string; type: string; createdAt: string };
type Conversation = {
  id: string;
  title: string | null;
  startedAt: string;
  updatedAt: string;
  customer: { name: string; phone: string };
  messages: Message[];
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(new Date(value));
}

export default function ConversationInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/conversations", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Không thể tải hội thoại.");
      const items = (payload.conversations || []) as Conversation[];
      setConversations(items);
      setSelectedId((current) => current && items.some((item) => item.id === current) ? current : (items[0]?.id ?? null));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải hội thoại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((item) => item.customer.name.toLowerCase().includes(term) || item.customer.phone.includes(term));
  }, [conversations, query]);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  return (
    <section className="space-y-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div>
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Hộp thư AI</p>
          <h2 className="text-lg font-black text-slate-900 mt-1">Hội thoại khách hàng</h2>
          <p className="text-xs text-slate-500 mt-1">Xem lịch sử đã lưu trên hệ thống. Chỉ quản trị viên được truy cập.</p>
        </div>
        <button type="button" onClick={() => void load()} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[17px]">refresh</span>Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[310px_minmax(0,1fr)_250px] min-h-[580px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <aside className="border-r border-slate-200 bg-slate-50/70 flex flex-col">
          <div className="p-3 border-b border-slate-200">
            <label className="relative block">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[17px]">search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên khách hoặc số điện thoại" className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-purple-500" />
            </label>
            <p className="mt-2 text-[11px] text-slate-500">{filtered.length} hội thoại tìm thấy</p>
          </div>
          <div className="overflow-y-auto max-h-[500px] lg:max-h-none">
            {loading && <p className="p-5 text-xs text-slate-400">Đang tải hội thoại...</p>}
            {!loading && filtered.length === 0 && <p className="p-5 text-xs text-slate-400">Chưa có hội thoại phù hợp.</p>}
            {filtered.map((item) => {
              const last = item.messages.at(-1);
              const active = selected?.id === item.id;
              return <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full px-4 py-3 text-left border-b border-slate-100 transition-colors ${active ? "bg-purple-50 border-l-4 border-l-purple-600" : "hover:bg-white border-l-4 border-l-transparent"}`}>
                <div className="flex justify-between gap-2"><strong className="text-xs text-slate-900 truncate">{item.customer.name}</strong><time className="text-[10px] text-slate-400 shrink-0">{formatTime(item.updatedAt)}</time></div>
                <p className="mt-0.5 font-mono text-[10px] text-purple-700">{item.customer.phone || "Chưa có SĐT"}</p>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{last?.content || item.title || "Chưa có tin nhắn"}</p>
              </button>;
            })}
          </div>
        </aside>

        <div className="min-w-0 flex flex-col">
          {error ? <div className="m-5 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">{error}</div> : selected ? <>
            <header className="px-5 py-4 border-b border-slate-200 flex justify-between gap-3">
              <div><h3 className="font-bold text-slate-900">{selected.customer.name}</h3><p className="text-xs text-slate-500 mt-0.5">{selected.customer.phone || "Chưa cung cấp số điện thoại"}</p></div>
              <span className="self-start text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">AI đang lưu lịch sử</span>
            </header>
            <div className="flex-1 p-5 bg-slate-50/50 overflow-y-auto max-h-[510px] space-y-3">
              {selected.messages.length === 0 && <p className="text-xs text-slate-400 text-center mt-12">Phiên này chưa có nội dung tin nhắn.</p>}
              {selected.messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${message.role === "user" ? "bg-purple-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-xs"}`}>
                  <p>{message.content}</p><time className={`block mt-1.5 text-[10px] ${message.role === "user" ? "text-purple-200" : "text-slate-400"}`}>{message.role === "user" ? "Khách hàng" : "EventHHD AI"} · {formatTime(message.createdAt)}</time>
                </div>
              </div>)}
            </div>
          </> : <div className="m-auto text-center text-slate-400"><span className="material-symbols-outlined text-4xl">forum</span><p className="text-xs mt-2">Chọn một hội thoại để xem nội dung.</p></div>}
        </div>

        <aside className="border-l border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Thông tin khách hàng</h3>
          {selected ? <div className="space-y-3 text-xs"><div className="p-3 rounded-xl bg-white border border-slate-200"><p className="text-slate-400">Họ tên</p><p className="font-bold text-slate-800 mt-1">{selected.customer.name}</p></div><div className="p-3 rounded-xl bg-white border border-slate-200"><p className="text-slate-400">Số điện thoại</p><p className="font-mono font-bold text-purple-700 mt-1">{selected.customer.phone || "Chưa cập nhật"}</p></div><div className="p-3 rounded-xl bg-white border border-slate-200"><p className="text-slate-400">Tin nhắn đã lưu</p><p className="font-bold text-slate-800 mt-1">{selected.messages.length} tin nhắn</p></div><p className="text-[11px] leading-relaxed text-slate-500">Màn hình này chỉ để tra cứu và chăm sóc khách hàng; không tự gửi tin nhắn hoặc thay đổi hội thoại.</p></div> : <p className="text-xs text-slate-400">Chưa chọn hội thoại.</p>}
        </aside>
      </div>
    </section>
  );
}
