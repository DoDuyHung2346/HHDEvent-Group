"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0E1526] border border-white/15 rounded-3xl shadow-2xl p-6 text-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg mb-4">
          ⚠️
        </div>
        <h3 className="text-white font-bold text-base mb-1.5">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-6">{message}</p>
        <div className="flex gap-2.5 justify-end">
          <button
            id="confirm-dialog-cancel"
            onClick={onCancel}
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/10 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-dialog-confirm"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
