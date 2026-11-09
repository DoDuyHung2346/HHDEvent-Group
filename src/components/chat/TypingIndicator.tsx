"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
    </div>
  );
}
