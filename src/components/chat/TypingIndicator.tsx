"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* EventViet Gold Crest Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 text-xs font-bold flex-shrink-0 shadow-md shadow-amber-500/20">
        EV
      </div>
      <div className="bg-[#121A2C] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-amber-400 rounded-full dot-bounce-1" />
          <div className="w-2 h-2 bg-amber-400 rounded-full dot-bounce-2" />
          <div className="w-2 h-2 bg-amber-400 rounded-full dot-bounce-3" />
        </div>
      </div>
    </div>
  );
}
