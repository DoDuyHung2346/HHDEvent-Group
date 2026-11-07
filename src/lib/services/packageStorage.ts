"use client";

export interface PackagePricingConfig {
  venueRates: {
    standard: number; // Sảnh 4 sao
    "5star": number;  // Sảnh 5 sao
    resort: number;   // Resort biển
  };
  avRates: {
    jbl: number;        // Hệ thống âm thanh JBL
    lacoustics: number; // L'Acoustics K2 tiêu chuẩn quốc tế
    db: number;         // d&b audiotechnik Arena
  };
  fbRates: {
    standard: number; // Thực đơn truyền thống
    fusion: number;   // Ẩm thực Á Âu Fusion 5 sao
    michelin: number; // Yến tiệc chuẩn Michelin Star
  };
  talentRates: {
    mc: number;       // MC Chuyên nghiệp
    vtv_band: number; // MC Đài TH & Ban nhạc Acoustic
    star: number;     // Ca sĩ hạng A & Đạo diễn Quốc gia
  };
  packages: Array<{
    id: string;
    name: string;
    badge: string;
    subtitle: string;
    basePrice: number;
    priceUnit: string;
    features: string[];
    isPopular?: boolean;
  }>;
}

export const DEFAULT_PRICING: PackagePricingConfig = {
  venueRates: { standard: 600000, "5star": 1200000, resort: 1800000 },
  avRates: { jbl: 35000000, lacoustics: 75000000, db: 160000000 },
  fbRates: { standard: 450000, fusion: 850000, michelin: 1600000 },
  talentRates: { mc: 15000000, vtv_band: 45000000, star: 180000000 },
  packages: [
    {
      id: "pkg-essential",
      name: "Standard Essential",
      badge: "TIÊU CHUẨN",
      subtitle: "Phù hợp tiệc nội bộ, hội nghị, khai trương vừa và nhỏ",
      basePrice: 850000,
      priceUnit: "VNĐ / Khách",
      features: [
        "Sảnh tiệc 4 sao trung tâm TP",
        "Âm thanh ánh sáng JBL Pro đồng bộ",
        "Thực đơn Set menu 6 món cao cấp",
        "MC dẫn chương trình song ngữ",
        "Bộ nhận diện & Photo booth tiêu chuẩn",
      ],
    },
    {
      id: "pkg-prestige",
      name: "Prestige Executive",
      badge: "PHỔ BIẾN NHẤT",
      subtitle: "Lựa chọn hàng đầu cho Gala Dinner & Hội nghị thượng đỉnh 200–500 khách",
      basePrice: 1650000,
      priceUnit: "VNĐ / Khách",
      features: [
        "Khách sạn 5 sao quốc tế (Sheraton/InterContinental)",
        "Dàn âm thanh L'Acoustics K2 & Màn hình LED P2 4K",
        "Yến tiệc Fusion Á-Âu 7 món đặc sắc",
        "MC VTV & Ban nhạc Live biểu diễn",
        "Đạo diễn điều phối chuyên trách 1-1",
        "Quay phim 4K & Flycam không giới hạn",
      ],
      isPopular: true,
    },
    {
      id: "pkg-bespoke",
      name: "Imperial Bespoke VIP",
      badge: "THƯỢNG HẠNG",
      subtitle: "Dành riêng cho Lễ ra mắt xe điện, Đêm tiệc Tri ân thượng lưu & VIP Summit",
      basePrice: 3200000,
      priceUnit: "VNĐ / Khách",
      features: [
        "Resort bờ biển hoặc Sảnh tiệc Dinh Độc Lập / GEM Center",
        "Hệ thống kỹ xảo Holo-screen 3D & Laser mapping",
        "Yến tiệc Michelin Star thiết kế riêng theo chủ đề",
        "Nghệ sĩ hạng A & Đạo diễn Sân khấu Quốc gia",
        "Đặc quyền Concierge VIP (đưa đón xe sang/phi cơ riêng)",
        "Bảo hiểm sự kiện toàn diện trị giá 10 tỷ VNĐ",
      ],
    },
  ],
};

const PRICING_STORAGE_KEY = "eventviet_pricing_config";

export function loadPricingConfig(): PackagePricingConfig {
  if (typeof window === "undefined") return DEFAULT_PRICING;
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(DEFAULT_PRICING));
      return DEFAULT_PRICING;
    }
    return JSON.parse(raw) as PackagePricingConfig;
  } catch {
    return DEFAULT_PRICING;
  }
}

export function savePricingConfig(config: PackagePricingConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("eventviet_pricing_changed"));
  } catch (e) {
    console.error("Lỗi lưu cấu hình bảng giá:", e);
  }
}

export function resetPricingConfig(): PackagePricingConfig {
  savePricingConfig(DEFAULT_PRICING);
  return DEFAULT_PRICING;
}
