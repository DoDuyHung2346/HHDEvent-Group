"use client";

import { useState } from "react";

interface RelatedQuestionsProps {
  questions: [string, string, string];
  onSelect: (question: string) => void;
}

export default function RelatedQuestions({
  questions,
  onSelect,
}: RelatedQuestionsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!questions) return null;

  const copyQuestion = async (question: string, index: number) => {
    try {
      await navigator.clipboard.writeText(question);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1600);
    } catch {
      // Clipboard API có thể bị chặn trên HTTP; người dùng vẫn có thể bôi đen
      // trực tiếp nội dung câu hỏi để sao chép thủ công.
    }
  };

  return (
    <div className="mt-2.5 bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100/90 rounded-xl p-3 shadow-xs">
      <p className="text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[15px] text-amber-500">lightbulb</span>
        <span>Câu hỏi liên quan đề xuất</span>
      </p>
      <div className="flex flex-col gap-1.5">
        {questions.map((q, i) => (
          <div
            key={i}
            className="text-xs text-slate-700 bg-white hover:bg-indigo-50/50 rounded-lg border border-slate-200/80 hover:border-indigo-300 flex items-center group shadow-xs"
          >
            <button
              id={`related-q-${i}`}
              type="button"
              onClick={() => {
                // Kéo bôi đen văn bản rồi thả chuột không được coi là gửi câu hỏi.
                if (window.getSelection()?.toString()) return;
                onSelect(q);
              }}
              className="min-w-0 flex-1 text-left px-3 py-2 cursor-pointer"
              title="Bấm để gửi câu hỏi"
            >
              <span className="line-clamp-1 font-medium select-text">{q}</span>
            </button>
            <button
              type="button"
              aria-label={`Sao chép câu hỏi: ${q}`}
              title="Sao chép câu hỏi"
              onClick={() => copyQuestion(q, i)}
              className="shrink-0 px-2.5 py-2 text-slate-400 hover:text-indigo-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedIndex === i ? "check" : "content_copy"}
              </span>
            </button>
            <span className="material-symbols-outlined pr-2 text-slate-400 group-hover:text-indigo-600 text-[15px] transition-colors">
              arrow_forward
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
