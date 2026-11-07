import type { ChatResponse } from "@/lib/schemas";

// Giá tham khảo trong bảng giá hạ tầng sân khấu, áp dụng theo m².
const STAGE_FLOOR_MIN = 120_000;
const STAGE_FLOOR_MAX = 150_000;
const STAGE_CARPET_PER_M2 = 30_000;

type ChatTurn = { role: "user" | "assistant"; content: string };

function getAreaAfterLabel(text: string, label: string): number | null {
  const after = new RegExp(`${label}[^\\d]{0,30}(\\d+(?:\\.\\d+)?)\\s*(?:m²|m2|m\\s*vuông)`, "i").exec(text);
  const before = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:m²|m2|m\\s*vuông)\\s*${label}`, "i").exec(text);
  const value = after?.[1] ?? before?.[1];
  return value ? Number(value) : null;
}

export function getStageEstimate(message: string, history: ChatTurn[] = []): ChatResponse | null {
  const normalized = message.toLowerCase().replace(",", ".");
  const priorUserText = history.filter((turn) => turn.role === "user").map((turn) => turn.content).reverse().join(" ").toLowerCase();
  const stageArea = getAreaAfterLabel(normalized, "(?:sân khấu|san khau)") ?? getAreaAfterLabel(priorUserText, "(?:sân khấu|san khau)");
  const carpetArea = getAreaAfterLabel(normalized, "(?:thảm đỏ|tham do)") ?? stageArea;
  if (!stageArea && !carpetArea) return null;
  const carpetM2 = carpetArea ?? stageArea;
  if (!carpetM2) return null;

  if ((stageArea && (!Number.isFinite(stageArea) || stageArea <= 0 || stageArea > 2_000)) || !Number.isFinite(carpetM2) || carpetM2 <= 0 || carpetM2 > 2_000) return null;
  const floorMin = (stageArea ?? 0) * STAGE_FLOOR_MIN;
  const floorMax = (stageArea ?? 0) * STAGE_FLOOR_MAX;
  const carpet = carpetM2 * STAGE_CARPET_PER_M2;
  const format = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";
  const stageLine = stageArea ? `- Mặt sàn sân khấu ${stageArea} m²: ${format(floorMin)} – ${format(floorMax)} (${format(STAGE_FLOOR_MIN)} – ${format(STAGE_FLOOR_MAX)}/m²).\n` : "";

  return {
    answer: `Chi phí hạ tầng tham khảo:\n${stageLine}- Thảm đỏ ${carpetM2} m²: ${format(carpet)} (${format(STAGE_CARPET_PER_M2)}/m²).\n\nTổng phần sàn và thảm: ${format(floorMin + carpet)} – ${format(floorMax + carpet)}. Mức này chưa bao gồm âm thanh, ánh sáng, LED, nhân công và vận chuyển; các hạng mục đó phụ thuộc thiết kế thực tế.`,
    options: [
      { id: "stage-av", label: "Tư vấn âm thanh, ánh sáng", action: "ask", payload: `Báo giá âm thanh ánh sáng cho sân khấu ${stageArea ?? carpetM2}m2` },
      { id: "stage-quote", label: "Lập báo giá đầy đủ", action: "open_requirements", payload: `Sân khấu ${stageArea ?? carpetM2}m2` },
    ],
    related_questions: [
      `Sân khấu ${stageArea ?? carpetM2}m² phù hợp bao nhiêu khách?`,
      `Chi phí màn hình LED cho sân khấu ${stageArea ?? carpetM2}m² là bao nhiêu?`,
      "Tôi muốn nhận báo giá đầy đủ theo địa điểm tổ chức?",
    ],
    needs_booking: false,
    needs_requirements: false,
    matched_faq_ids: ["stage-price-catalog"],
    source: "ai",
  };
}
