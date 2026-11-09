export type PriceUnit = "fixed" | "per_guest";

export interface QuoteOption {
  id: string; // ổn định, dùng để lưu: "deco-mid"
  label: string; // "Trung bình"
  description?: string; // 1 dòng mô tả ngắn
  price: number; // VNĐ; 0 = không phát sinh
  unit: PriceUnit;
}

export interface QuoteCategory {
  id: string; // "concept" | "decoration" | ...
  label: string; // "Trang trí"
  icon: string; // material symbol name
  mode: "single" | "multi"; // radio hay checkbox
  required: boolean;
  options: QuoteOption[];
}

export const QUOTE_CATALOG: QuoteCategory[] = [
  {
    id: "concept",
    label: "Concept",
    icon: "palette",
    mode: "single",
    required: true,
    options: [
      { id: "concept-modern", label: "Hiện đại", price: 5_000_000, unit: "fixed", description: "Phong cách tinh tế, LED neon, tối ưu ánh sáng" },
      { id: "concept-classic", label: "Cổ điển", price: 8_000_000, unit: "fixed", description: "Sang trọng hoàng gia, hoa văn quý phái" },
      { id: "concept-dark", label: "Ma mị", price: 12_000_000, unit: "fixed", description: "Huyền bí, gothic/cinematic, hiệu ứng khói sáng" },
      { id: "concept-minimal", label: "Tối giản", price: 3_000_000, unit: "fixed", description: "Thanh lịch, hiện đại, không gian mở" },
      { id: "concept-custom", label: "Ý tưởng riêng (tư vấn sau)", price: 0, unit: "fixed", description: "Thiết kế đo ni đóng giày theo câu chuyện của bạn" },
    ],
  },
  {
    id: "decoration",
    label: "Trang trí",
    icon: "celebration",
    mode: "single",
    required: true,
    options: [
      { id: "deco-basic", label: "Cơ bản", price: 5_000_000, unit: "fixed", description: "Backdrop check-in + hoa lụa bàn tiệc" },
      { id: "deco-mid", label: "Trung bình", price: 10_000_000, unit: "fixed", description: "Backdrop 3D + hoa tươi nhập khẩu 50%" },
      { id: "deco-premium", label: "Cao cấp", price: 25_000_000, unit: "fixed", description: "Full concept nghệ thuật + 100% hoa tươi cao cấp" },
    ],
  },
  {
    id: "av",
    label: "Âm thanh & ánh sáng",
    icon: "speaker",
    mode: "single",
    required: true,
    options: [
      { id: "av-basic", label: "Cơ bản (loa JBL)", price: 8_000_000, unit: "fixed", description: "Hệ thống âm thanh phòng hội thảo 100 khách" },
      { id: "av-plus", label: "Nâng cao + đèn màu", price: 18_000_000, unit: "fixed", description: "Line array + moving head + par led đa sắc" },
      { id: "av-stage", label: "Sân khấu đầy đủ", price: 35_000_000, unit: "fixed", description: "Hệ thống chuyên nghiệp trình diễn biểu diễn lớn" },
    ],
  },
  {
    id: "fb",
    label: "Tiệc / Ẩm thực",
    icon: "restaurant",
    mode: "single",
    required: false,
    options: [
      { id: "fb-none", label: "Tự lo ẩm thực", price: 0, unit: "per_guest", description: "Không bao gồm F&B trong gói dịch vụ" },
      { id: "fb-standard", label: "Thực đơn tiêu chuẩn", price: 450_000, unit: "per_guest", description: "Set menu 6 món truyền thống cao cấp" },
      { id: "fb-fusion", label: "Á Âu Fusion", price: 850_000, unit: "per_guest", description: "Set menu 7 món chuẩn nhà hàng 5 sao" },
    ],
  },
  {
    id: "talent",
    label: "MC & biểu diễn",
    icon: "mic",
    mode: "single",
    required: false,
    options: [
      { id: "talent-none", label: "Không cần", price: 0, unit: "fixed", description: "Không thuê nhân sự biểu diễn" },
      { id: "talent-mc", label: "MC chuyên nghiệp", price: 15_000_000, unit: "fixed", description: "MC đài truyền hình / song ngữ dẫn dắt chương trình" },
      { id: "talent-band", label: "MC + ban nhạc acoustic", price: 45_000_000, unit: "fixed", description: "MC cùng ban nhạc biểu diễn 3 tiết mục mở màn" },
    ],
  },
  {
    id: "addons",
    label: "Dịch vụ thêm",
    icon: "add_circle",
    mode: "multi",
    required: false,
    options: [
      { id: "add-photo", label: "Chụp ảnh / quay video", price: 6_000_000, unit: "fixed", description: "Thợ ảnh & máy quay chuyên nghiệp suốt sự kiện" },
      { id: "add-booth", label: "Photobooth backdrop", price: 4_000_000, unit: "fixed", description: "Khu vực chụp ảnh in ảnh lấy liền cho khách" },
      { id: "add-flower", label: "Hoa tươi", price: 5_000_000, unit: "fixed", description: "Bổ sung hoa tươi trang trí lối đi và bàn tiệc" },
      { id: "add-game", label: "Trò chơi tương tác", price: 4_000_000, unit: "fixed", description: "Kịch bản và đạo cụ minigame gắn kết tập thể" },
    ],
  },
];

