"use client";

import { useState, useEffect } from "react";
import { getRAGDocumentChunks, type RAGChunk } from "@/lib/rag/api";

interface DocumentChunksModalProps {
  isOpen: boolean;
  docId: string | null;
  filename: string;
  onClose: () => void;
}

export default function DocumentChunksModal({
  isOpen,
  docId,
  filename,
  onClose,
}: DocumentChunksModalProps) {
  const [chunks, setChunks] = useState<RAGChunk[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && docId) {
      setIsLoading(true);
      getRAGDocumentChunks(docId)
        .then((data) => setChunks(data))
        .catch((err) => {
          console.error("Lỗi lấy chunks:", err);
          setChunks([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, docId]);

  if (!isOpen || !docId) return null;

  const filtered = chunks.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.text_display.toLowerCase().includes(q) ||
      (c.section_path && c.section_path.toLowerCase().includes(q)) ||
      c.chunk_id.toLowerCase().includes(q)
    );
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">splitscreen</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Danh Sách Phân Mảnh (Chunks)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  {chunks.length} chunks
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate max-w-md">
                Tệp: {filename} • ID: {docId}
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

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nội dung chunk, tiêu đề section..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <span className="text-slate-500 text-[11px]">
            Hiển thị {filtered.length} / {chunks.length} chunks
          </span>
        </div>

        {/* Chunks List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <span className="material-symbols-outlined text-4xl animate-spin text-indigo-600 block mb-2">
                sync
              </span>
              Đang tải danh sách chunks từ SQLite & Qdrant...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Không tìm thấy chunk nào phù hợp.
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.chunk_id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 hover:border-indigo-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-100 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      #{c.chunk_index + 1}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{c.chunk_id}</span>
                    {c.section_path && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        📂 {c.section_path}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {c.token_count} tokens
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(c.chunk_id, c.text_display)}
                      className="px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Sao chép nội dung chunk"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedId === c.chunk_id ? "check" : "content_copy"}
                      </span>
                      <span>{copiedId === c.chunk_id ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans border border-slate-100">
                  {c.text_display}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Chỉ mục: 768-dim Vector (Qdrant) + Tokenizer compound words BM25s
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
