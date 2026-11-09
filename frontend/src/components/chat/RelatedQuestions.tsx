"use client";

interface RelatedQuestionsProps {
  questions: [string, string, string];
  onSelect: (question: string) => void;
}

export default function RelatedQuestions({
  questions,
  onSelect,
}: RelatedQuestionsProps) {
  if (!questions) return null;

  return (
    <div className="mt-2.5 bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100/90 rounded-xl p-3 shadow-xs">
      <p className="text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[15px] text-amber-500">lightbulb</span>
        <span>Câu hỏi liên quan đề xuất</span>
      </p>
      <div className="flex flex-col gap-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            id={`related-q-${i}`}
            type="button"
            onClick={() => onSelect(q)}
            className="text-left text-xs text-slate-700 hover:text-indigo-900 bg-white hover:bg-indigo-50/50 rounded-lg px-3 py-2 transition-all duration-150 border border-slate-200/80 hover:border-indigo-300 flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <span className="line-clamp-1 font-medium">{q}</span>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-600 text-[15px] transition-colors">
              arrow_forward
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
