import type { ChatResponse } from "@/lib/schemas";

type ChatTurn = { role: "user" | "assistant"; content: string };

// Các mức này được tính từ catalog cấu hình hiện có: concept, trang trí,
// âm thanh/ánh sáng, F&B và một số hạng mục bổ sung. Đây không phải báo giá
// hợp đồng và cố ý không đưa vào các chi phí chưa biết như venue, vận chuyển.
const TIERS = [
  { label: "Tối giản", fixed: 16_000_000, perGuest: 450_000 },
  { label: "Tiêu chuẩn", fixed: 52_000_000, perGuest: 850_000 },
  { label: "Nâng cao", fixed: 136_000_000, perGuest: 850_000 },
] as const;

function getGuestCount(text: string): number | null {
  const match = /(\d{1,4})\s*(?:khách|người|pax)\b/i.exec(text);
  const count = match ? Number(match[1]) : NaN;
  return Number.isInteger(count) && count >= 10 && count <= 2_000 ? count : null;
}

function getBudget(text: string): number | null {
  const match = /(\d+(?:[.,]\d+)?)\s*(?:triệu|tr\b|trieu|tỷ|ty\b)/i.exec(text);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return null;
  return /tỷ|ty\b/i.test(match[0]) ? value * 1_000_000_000 : value * 1_000_000;
}

function getEventLabel(text: string): string {
  if (/year[ -]?end|\byep\b|tất niên/i.test(text)) return "Year-end party";
  if (/đám cưới|tiệc cưới|wedding/i.test(text)) return "tiệc cưới";
  if (/hội nghị|conference|hội thảo/i.test(text)) return "hội nghị";
  if (/khai trương|ra mắt/i.test(text)) return "sự kiện ra mắt/khai trương";
  if (/sinh nhật|birthday/i.test(text)) return "tiệc sinh nhật";
  return "sự kiện";
}

function formatVnd(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`;
}

// Chỉ mượn dữ kiện của lượt trước khi khách thực sự hỏi tiếp câu đang dang dở.
// Không để một YEP/ngân sách cũ lấn át một câu hỏi mới hoàn toàn.
function isContextualFollowUp(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return /^(?:còn|vậy|thế|như vậy|gói đó|phương án đó|nó|cái đó|bên trên)\b/.test(normalized)
    || /^(?:bao nhiêu|giá thế nào|chi phí thế nào)\??$/.test(normalized);
}

/**
 * Dự toán cho yêu cầu có quy mô khách nhưng chưa có báo giá/RAG chuyên biệt.
 * Chỉ tính trên các cấu hình có giá sẵn, để AI không tự bịa giá theo cảm tính.
 */
export function getPreliminaryEventEstimate(message: string, history: ChatTurn[] = []): ChatResponse | null {
  const current = message.toLowerCase();
  // Sân khấu/thảm có công thức riêng, để stageEstimate xử lý trước.
  if (/(sân khấu|san khau|thảm đỏ|tham do)/i.test(current)) return null;

  const useHistory = isContextualFollowUp(message);
  const userContext = useHistory
    ? [message, ...history.filter((turn) => turn.role === "user").map((turn) => turn.content)].join(" ")
    : message;
  const guestCount = getGuestCount(userContext);
  const budget = getBudget(message) ?? (useHistory ? getBudget(userContext) : null);
  const asksForEstimate = /(giá|bao nhiêu|chi phí|báo giá|dự toán|ước tính|ngân sách|budget)/i.test(current) || (useHistory && budget !== null);
  const isEventRequest = /(sự kiện|year[ -]?end|\byep\b|tất niên|đám cưới|tiệc cưới|wedding|hội nghị|hội thảo|khai trương|ra mắt|sinh nhật|gala|team building)/i.test(userContext);

  if (!asksForEstimate || !isEventRequest) return null;

  const eventLabel = getEventLabel(userContext);
  // A named event plus a budget is a qualified sales lead, but estimating
  // without guest count/venue would invent a per-person scope. Escalate to a
  // specialist immediately and open the booking form instead of replying with
  // a generic request for more information.
  if (!guestCount && budget && eventLabel !== "sự kiện") {
    return {
      answer: `Em đã ghi nhận nhu cầu tổ chức ${eventLabel} với ngân sách dự kiến ${formatVnd(budget)}. Hiện chưa có đủ quy mô khách và địa điểm để đưa ra mức dự toán đáng tin cậy, nên em không muốn báo giá theo cảm tính. Em đã mở phiếu đặt lịch bên dưới để chuyên viên EventHHD trao đổi, đề xuất phương án phù hợp và báo giá chi tiết cho anh/chị.`,
      options: [
        { id: "brief-booking", label: "Đặt lịch với chuyên viên", action: "open_booking", payload: `Tư vấn ${eventLabel}, ngân sách ${formatVnd(budget)}` },
        { id: "brief-requirements", label: "Tự chọn hạng mục & xem giá", action: "open_requirements", payload: "" },
      ],
      related_questions: [
        "Tôi cần chuẩn bị gì trước buổi tư vấn?",
        "Quy trình làm việc với EventHHD như thế nào?",
        "Tôi muốn xem các hạng mục có thể tùy chỉnh.",
      ],
      needs_booking: true,
      needs_requirements: false,
      matched_faq_ids: ["event-brief-needs-consultation"],
      source: "ai",
    };
  }

  if (!guestCount) return null;

  const estimates = TIERS.map((tier) => ({ ...tier, total: tier.fixed + tier.perGuest * guestCount }));
  const budgetNote = budget
    ? `\n\nNgân sách bạn nêu là ${formatVnd(budget)} (${formatVnd(Math.round(budget / guestCount))}/khách). ${budget >= estimates[0].total && budget <= estimates[2].total ? "Mức này có thể cân đối được, nhưng cần chốt hạng mục ưu tiên với chuyên viên." : budget < estimates[0].total ? "Mức này đang thấp hơn phương án tối giản trong catalog; chuyên viên cần tối ưu lại phạm vi dịch vụ." : "Mức này cao hơn phương án nâng cao trong catalog; chuyên viên có thể tư vấn thêm hạng mục hoặc venue phù hợp."}`
    : "";

  return {
    answer: `Dựa trên quy mô ${guestCount} khách cho ${eventLabel}, em có thể đưa ra dự toán sơ bộ theo catalog cấu hình hiện tại:\n- ${estimates[0].label}: khoảng ${formatVnd(estimates[0].total)}.\n- ${estimates[1].label}: khoảng ${formatVnd(estimates[1].total)}.\n- ${estimates[2].label}: khoảng ${formatVnd(estimates[2].total)}.${budgetNote}\n\nĐây là mức tham khảo cho các hạng mục trong catalog, chưa phải báo giá chốt và chưa bao gồm các chi phí phụ thuộc địa điểm/thời điểm như thuê venue, vận chuyển hoặc yêu cầu kỹ thuật riêng. Em đã mở phiếu đặt lịch bên dưới để chuyên viên xác nhận phương án và báo giá chính xác.`,
    options: [
      { id: "preliminary-booking", label: "Đặt lịch chốt báo giá", action: "open_booking", payload: `Tư vấn dự toán ${eventLabel} ${guestCount} khách` },
      { id: "preliminary-requirements", label: "Tự chọn hạng mục & xem giá", action: "open_requirements", payload: `${guestCount} khách` },
    ],
    related_questions: [
      `Dự toán trên đã gồm những hạng mục nào?`,
      `Có thể tối ưu ngân sách cho ${guestCount} khách không?`,
      "Tôi muốn chuyên viên lập báo giá chi tiết?",
    ],
    needs_booking: true,
    needs_requirements: false,
    prefill: { guestCount },
    matched_faq_ids: ["quote-catalog-preliminary"],
    source: "ai",
  };
}
