"use client";

interface BookingPromptProps {
  onBook: () => void;
}

export default function BookingPrompt({ onBook }: BookingPromptProps) {
  return (
    <div className="mt-2.5 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/90 rounded-xl p-3.5 shadow-xs">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-amber-900 font-bold text-xs tracking-wide">
            CẦN TƯ VẤN KỊCH BẢN & DỰ TOÁN CHI TIẾT?
          </h4>
          <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">
            Nội dung này cần sự tư vấn chuyên sâu riêng biệt. Chuyên viên EventHHD sẵn sàng hỗ trợ khảo sát địa điểm và lên kịch bản báo giá miễn phí 100%.
          </p>
          <button
            id="booking-prompt-btn"
            type="button"
            onClick={onBook}
            className="mt-2.5 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Đặt lịch tư vấn trực tiếp 1-1</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
