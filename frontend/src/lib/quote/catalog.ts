export type PriceUnit = "fixed" | "per_guest";

export interface QuoteOption {
  id: string;
  label: string;
  description?: string;
  /** Giá thấp nhất/cao nhất trong tài liệu RAG đã được duyệt, tính bằng VNĐ. */
  minPrice: number;
  maxPrice: number;
  unit: PriceUnit;
}

export interface QuoteCategory {
  id: string;
  label: string;
  icon: string;
  mode: "single" | "multi";
  required: boolean;
  options: QuoteOption[];
}

/**
 * Catalog dự toán có thể tính được ngay trong form.
 * Nguồn: Bo_Du_Lieu_Gia_Va_FAQ_Su_Kien_Chatbot_AI_RAG_Standard và
 * 04_Pricing_Staff_Catering đã lập chỉ mục trong kho RAG.
 * Không đưa đơn giá venue vào tổng vì tài liệu không có đơn giá venue chuẩn.
 */
export const QUOTE_CATALOG: QuoteCategory[] = [
  {
    id: "concept", label: "Thiết kế & nội dung", icon: "palette", mode: "single", required: true,
    options: [
      { id: "concept-2d", label: "Thiết kế 2D", minPrice: 1_000_000, maxPrice: 5_000_000, unit: "fixed", description: "1–5 triệu/gói" },
      { id: "concept-3d", label: "Thiết kế 3D sân khấu", minPrice: 2_000_000, maxPrice: 7_000_000, unit: "fixed", description: "2–7 triệu/gói" },
      { id: "concept-visual", label: "Key visual / visual", minPrice: 1_000_000, maxPrice: 3_000_000, unit: "fixed", description: "1–3 triệu/gói" },
      { id: "concept-script", label: "Kịch bản & nội dung", minPrice: 1_000_000, maxPrice: 3_000_000, unit: "fixed", description: "1–3 triệu/gói" },
      { id: "concept-custom", label: "Ý tưởng riêng", minPrice: 0, maxPrice: 0, unit: "fixed", description: "Khảo sát để báo giá" },
    ],
  },
  {
    id: "decoration", label: "Backdrop / trang trí", icon: "celebration", mode: "single", required: true,
    options: [
      { id: "deco-hiflex", label: "Backdrop Hiflex", minPrice: 1_800_000, maxPrice: 2_400_000, unit: "fixed", description: "Mốc 15m² × 120–160k/m²" },
      { id: "deco-formex", label: "Backdrop Formex", minPrice: 5_250_000, maxPrice: 8_250_000, unit: "fixed", description: "Mốc 15m² × 350–550k/m²" },
      { id: "deco-custom", label: "Trang trí theo concept", minPrice: 0, maxPrice: 0, unit: "fixed", description: "Cần khảo sát mặt bằng" },
    ],
  },
  {
    id: "av", label: "Âm thanh & ánh sáng", icon: "speaker", mode: "single", required: true,
    options: [
      { id: "av-mini", label: "Âm thanh mini (<50 khách)", minPrice: 2_500_000, maxPrice: 3_500_000, unit: "fixed", description: "2,5–3,5 triệu/sự kiện" },
      { id: "av-standard", label: "Âm thanh tiêu chuẩn (100–250 khách)", minPrice: 6_000_000, maxPrice: 9_000_000, unit: "fixed", description: "6–9 triệu/sự kiện" },
      { id: "av-gala", label: "Gala / trình diễn", minPrice: 18_000_000, maxPrice: 35_000_000, unit: "fixed", description: "18–35 triệu/sự kiện" },
    ],
  },
  {
    id: "fb", label: "Tiệc / ẩm thực", icon: "restaurant", mode: "single", required: false,
    options: [
      { id: "fb-none", label: "Chưa gồm ẩm thực", minPrice: 0, maxPrice: 0, unit: "per_guest", description: "Khách tự chuẩn bị / báo giá sau" },
      { id: "fb-teabreak", label: "Teabreak", minPrice: 80_000, maxPrice: 150_000, unit: "per_guest", description: "80–150k/khách" },
      { id: "fb-buffet", label: "Buffet", minPrice: 250_000, maxPrice: 300_000, unit: "per_guest", description: "250–300k/khách" },
      { id: "fb-set-menu", label: "Tiệc mặn / set menu", minPrice: 300_000, maxPrice: 500_000, unit: "per_guest", description: "300–500k/khách" },
    ],
  },
  {
    id: "talent", label: "MC & biểu diễn", icon: "mic", mode: "single", required: false,
    options: [
      { id: "talent-none", label: "Chưa cần", minPrice: 0, maxPrice: 0, unit: "fixed", description: "Không tính hạng mục này" },
      { id: "talent-mc-vn", label: "MC tiếng Việt", minPrice: 3_500_000, maxPrice: 6_000_000, unit: "fixed", description: "3,5–6 triệu/show" },
      { id: "talent-mc-bilingual", label: "MC song ngữ", minPrice: 7_000_000, maxPrice: 15_000_000, unit: "fixed", description: "7–15 triệu/show" },
      { id: "talent-dance", label: "Nhóm nhảy", minPrice: 5_000_000, maxPrice: 12_000_000, unit: "fixed", description: "5–12 triệu/show" },
    ],
  },
  {
    id: "addons", label: "Dịch vụ thêm", icon: "add_circle", mode: "multi", required: false,
    options: [
      { id: "add-photo-video", label: "Chụp ảnh / quay video", minPrice: 5_000_000, maxPrice: 9_000_000, unit: "fixed", description: "5–9 triệu/show" },
      { id: "add-install", label: "Lắp đặt & tháo dỡ", minPrice: 1_000_000, maxPrice: 5_000_000, unit: "fixed", description: "1–5 triệu/gói" },
      { id: "add-transport", label: "Vận chuyển", minPrice: 1_000_000, maxPrice: 5_000_000, unit: "fixed", description: "1–5 triệu/gói" },
    ],
  },
];
