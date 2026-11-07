import { NextRequest, NextResponse } from "next/server";

export interface SurchargeItem {
  id: string;
  name: string;
  category: "Logistics" | "Shift" | "Structure" | "Dietary" | "Permit" | "Visual" | "Other";
  cost: number;
  reason: string;
  severity: "high" | "medium" | "low";
}

export interface SurchargeResponse {
  success: boolean;
  items: SurchargeItem[];
  totalSurcharge: number;
  aiAdvice: string;
  feasibilityScore: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notes: string = (body.notes || "").trim();
    const guestCount: number = Number(body.guestCount) || 200;

    if (!notes) {
      return NextResponse.json<SurchargeResponse>({
        success: true,
        items: [],
        totalSurcharge: 0,
        aiAdvice: "Chưa ghi nhận yêu cầu phát sinh đặc thù nào. Chi phí sự kiện áp dụng 100% theo định mức cố định chuẩn mực của EventViet.",
        feasibilityScore: 98,
      });
    }

    const lowerNotes = notes.toLowerCase();
    const items: SurchargeItem[] = [];

    // 1. Ngoại tỉnh / Đảo / Địa bàn xa
    if (
      lowerNotes.includes("đảo") ||
      lowerNotes.includes("phú quốc") ||
      lowerNotes.includes("cát bà") ||
      lowerNotes.includes("côn đảo") ||
      lowerNotes.includes("hạ long") ||
      lowerNotes.includes("nha trang") ||
      lowerNotes.includes("đà nẵng") ||
      lowerNotes.includes("ngoại tỉnh") ||
      lowerNotes.includes("vận chuyển xa") ||
      lowerNotes.includes("tỉnh khác")
    ) {
      const cost = lowerNotes.includes("đảo") || lowerNotes.includes("phú quốc") ? 28000000 : 16000000;
      items.push({
        id: "sur-logistics",
        name: "Phụ phí Vận chuyển Thiết bị & Công tác Ekip Ngoại thành/Đảo",
        category: "Logistics",
        cost,
        reason: "Yêu cầu điều động xe container chuyên dụng, vé phà/xà lan vận chuyển giàn truss, loa line-array và phụ cấp ăn ở cho 18 kỹ thuật viên.",
        severity: "high",
      });
    }

    // 2. Thi công gấp / Ca đêm
    if (
      lowerNotes.includes("đêm") ||
      lowerNotes.includes("xuyên đêm") ||
      lowerNotes.includes("ban đêm") ||
      lowerNotes.includes("0h") ||
      lowerNotes.includes("00:00") ||
      lowerNotes.includes("sáng sớm") ||
      lowerNotes.includes("gấp") ||
      lowerNotes.includes("khẩn cấp") ||
      lowerNotes.includes("tăng ca") ||
      lowerNotes.includes("setup gấp") ||
      lowerNotes.includes("3 tiếng") ||
      lowerNotes.includes("4 tiếng")
    ) {
      items.push({
        id: "sur-nightshift",
        name: "Phụ cấp Thi công Ban Đêm & Tăng ca Kỹ thuật khẩn cấp",
        category: "Shift",
        cost: 14000000,
        reason: "Ca dàn dựng đặc biệt (23:00 - 06:00) theo quy định khách sạn 5 sao, yêu cầu bồi dưỡng tăng ca 200% cho đội ngũ kỹ thuật ánh sáng & kết cấu.",
        severity: "medium",
      });
    }

    // 3. Ngoài trời / Bãi biển / Thời tiết
    if (
      lowerNotes.includes("ngoài trời") ||
      lowerNotes.includes("bãi biển") ||
      lowerNotes.includes("mưa") ||
      lowerNotes.includes("gió") ||
      lowerNotes.includes("nhà bạt") ||
      lowerNotes.includes("máy phát điện") ||
      lowerNotes.includes("sàn gỗ") ||
      lowerNotes.includes("cát") ||
      lowerNotes.includes("bờ hồ") ||
      lowerNotes.includes("sân vận động")
    ) {
      const tentCost = guestCount > 300 ? 32000000 : 22000000;
      items.push({
        id: "sur-weather",
        name: "Gia cố Nhà bạt Không gian & Máy phát điện Công nghiệp 3 pha",
        category: "Structure",
        cost: tentCost,
        reason: "Tổ chức không gian mở ngoài trời tiềm ẩn rủi ro gió biển/mưa; cần hệ thống khung nhôm bạt trắng chịu lực và nguồn điện dự phòng độc lập.",
        severity: "high",
      });
    }

    // 4. Ẩm thực riêng / Halal / Chay / Kosher
    if (
      lowerNotes.includes("chay") ||
      lowerNotes.includes("halal") ||
      lowerNotes.includes("kosher") ||
      lowerNotes.includes("dị ứng") ||
      lowerNotes.includes("ăn kiêng") ||
      lowerNotes.includes("suất riêng")
    ) {
      items.push({
        id: "sur-dietary",
        name: "Quy chuẩn Bếp riêng & Chứng chỉ Ẩm thực Đặc biệt (Halal / Chay cao cấp)",
        category: "Dietary",
        cost: 6500000,
        reason: "Thiết lập phân khu sơ chế riêng biệt, chứng chỉ Halal/Vegan quốc tế và thực đơn dinh dưỡng cá nhân hóa cho bàn VIP.",
        severity: "low",
      });
    }

    // 5. Giấy phép & Flycam
    if (
      lowerNotes.includes("flycam") ||
      lowerNotes.includes("drone") ||
      lowerNotes.includes("giấy phép") ||
      lowerNotes.includes("an ninh") ||
      lowerNotes.includes("tác quyền") ||
      lowerNotes.includes("bản quyền") ||
      lowerNotes.includes("vcpmc") ||
      lowerNotes.includes("sở văn hóa")
    ) {
      items.push({
        id: "sur-permit",
        name: "Hồ sơ Cấp phép Thiết bị Bay Drone & Tác quyền Biểu diễn VCPMC",
        category: "Permit",
        cost: 8500000,
        reason: "Thủ tục xin cấp phép bay flycam ban đêm với Cục Tác chiến (Bộ Quốc phòng) và bản quyền ca khúc biểu diễn theo quy định pháp luật.",
        severity: "medium",
      });
    }

    // 6. Kỹ xảo Visual / Hologram / Màn cong
    if (
      lowerNotes.includes("hologram") ||
      lowerNotes.includes("kinetic") ||
      lowerNotes.includes("3d visual") ||
      lowerNotes.includes("visual 3d") ||
      lowerNotes.includes("led cong") ||
      lowerNotes.includes("khói lạnh") ||
      lowerNotes.includes("pháo điện") ||
      lowerNotes.includes("laser")
    ) {
      items.push({
        id: "sur-visual",
        name: "Lập trình Kỹ xảo 3D Visual & Hiệu ứng Sân khấu Đặc biệt",
        category: "Visual",
        cost: 16500000,
        reason: "Đội ngũ Visual Artist dựng motion graphics 3D riêng biệt theo nhận diện thương hiệu và điều khiển DMX Laser / Pháo điện an toàn.",
        severity: "medium",
      });
    }

    // Nếu không khớp từ khóa cụ thể nhưng có ghi chú dài (> 15 ký tự)
    if (items.length === 0 && notes.length > 15) {
      items.push({
        id: "sur-custom",
        name: "Dự phòng Khảo sát Hiện trường & Điều phối Yêu cầu Riêng",
        category: "Other",
        cost: 7500000,
        reason: "Chi phí cử chuyên viên khảo sát mặt bằng thực tế và điều chỉnh biện pháp thi công theo mô tả đặc thù của Quý khách.",
        severity: "low",
      });
    }

    const totalSurcharge = items.reduce((sum, it) => sum + it.cost, 0);

    // AI Advice tổng kết
    let aiAdvice = "Kịch bản sự kiện có tính khả thi cao.";
    if (items.length > 0) {
      aiAdvice = `AI đã bóc tách ${items.length} hạng mục phát sinh tiềm ẩn từ mô tả (${items.map((i) => i.name).join(", ")}). Khuyến nghị Quý khách chốt phương án sớm trước 72h để EventViet tối ưu chi phí vận chuyển & nhân sự lên đến 15%.`;
    }

    return NextResponse.json<SurchargeResponse>({
      success: true,
      items,
      totalSurcharge,
      aiAdvice,
      feasibilityScore: items.length > 2 ? 88 : 96,
    });
  } catch (error) {
    console.error("Lỗi phân tích phụ phí AI:", error);
    return NextResponse.json(
      { error: "Không thể phân tích phụ phí lúc này" },
      { status: 500 }
    );
  }
}
