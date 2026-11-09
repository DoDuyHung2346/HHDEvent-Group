/** Lightweight, deterministic guard before RAG fallback. */
const EVENT_TERMS = [
  "sự kiện", "tổ chức", "tiệc", "sinh nhật", "đám cưới", "hôn lễ", "gala",
  "year end", "yep", "tất niên", "khai trương", "hội nghị", "hội thảo", "workshop",
  "team building", "sân khấu", "thảm", "backdrop", "âm thanh", "ánh sáng",
  "led", "mc", "ca sĩ", "nghệ sĩ", "catering", "tiệc teabreak", "venue",
  "địa điểm", "khách sạn", "resort", "khách", "người", "pax", "đặt cọc",
  "hợp đồng", "báo giá", "chi phí", "ngân sách", "tư vấn", "lịch tư vấn",
  // Thông tin doanh nghiệp cũng thuộc phạm vi RAG, dù không có từ "sự kiện".
  "eventhhd", "eventviet", "công ty", "trụ sở", "địa chỉ", "chi nhánh",
  "hotline", "email", "văn phòng", "hồ sơ năng lực", "portfolio",
];

const OUT_OF_DOMAIN_TERMS = [
  "ronaldo", "bóng đá", "cầu thủ", "giải đấu", "chứng khoán", "bitcoin",
  "tiền điện tử", "thời tiết", "bài thơ", "viết code", "lập trình", "điểm thi",
];

function hasEventSignal(text: string): boolean {
  const lower = text.toLowerCase();
  return EVENT_TERMS.some((term) => lower.includes(term));
}

export function isGreeting(message: string): boolean {
  const trimmed = message.trim();
  const greeting = /^(?:xin\s*chào|chào|hello|hi|alo|hey)\b[\s,!?.]*/i.exec(trimmed);
  if (!greeting) return false;

  // Dựa trên nội dung, không dựa trên độ dài: chỉ khi phần sau lời chào không
  // có tín hiệu nghiệp vụ sự kiện thì mới là small-talk.
  const remainder = trimmed.slice(greeting[0].length).trim();
  return !hasEventSignal(remainder) && !/\d/.test(remainder);
}

export function isContactRequest(message: string): boolean {
  return /(hotline|số\s*điện\s*thoại|sđt|sdt|zalo|nhắn\s*(tin|trực tiếp)|liên\s*hệ\s*trực tiếp|chuyên viên tư vấn)/i.test(message);
}

/**
 * Câu hỏi về chi phí ở mức tổng quan vẫn có thể trả lời hữu ích mà không cần
 * ép khách đặt lịch. Chỉ dùng cho câu hỏi chưa nêu hạng mục/sự kiện cụ thể;
 * báo giá sân khấu, gói hoặc yêu cầu có số khách vẫn đi vào luồng chuyên biệt.
 */
export function isGeneralEventCostQuestion(message: string): boolean {
  const asksAboutCost = /(chi\s*phí|báo\s*giá|giá\s*(cả|bao nhiêu|thế nào)?|ngân\s*sách)/i.test(message);
  const isGeneralScope = /(tổ\s*chức\s*(?:sự kiện|tiệc)|dịch\s*vụ|công\s*ty|bên\s*(?:mình|bạn|em|anh))/i.test(message);
  const hasSpecificScope = /(sân\s*khấu|thảm\s*đỏ|backdrop|âm\s*thanh|ánh\s*sáng|led|mc|ca\s*sĩ|catering|teabreak|đám\s*cưới|hôn\s*lễ|year\s*end|yep|gala|hội\s*nghị|hội\s*thảo|team\s*building)/i.test(message);
  return asksAboutCost && isGeneralScope && !hasSpecificScope;
}

/** Những yêu cầu cần khảo sát/đặc tả mới có lý do để mời đặt lịch ngay. */
export function needsSpecialistConsultation(message: string): boolean {
  return /(báo\s*giá\s*(?:chốt|chi tiết)|khảo\s*sát|thiết\s*kế\s*(?:riêng|3d)|thi\s*công|bản\s*vẽ|kỹ\s*thuật|đấu\s*thầu|hợp\s*đồng\s*(?:riêng|mẫu)|yêu\s*cầu\s*(?:đặc biệt|riêng)|sự\s*kiện\s*gấp)/i.test(message);
}

export function isBookingStatusRequest(message: string): boolean {
  return /(lịch hẹn.*(thế nào|ra sao|trạng thái|còn|hôm trước)|trạng thái.*lịch hẹn|kiểm tra.*lịch hẹn|lịch của tôi)/i.test(message);
}

export function isSchedulingRequest(message: string): boolean {
  return /(đặt\s*lịch|hẹn\s*(gặp|lịch|tư vấn)|gọi\s*(cho\s*)?(tôi|mình|em|anh|chị).*(lúc|vào)|(?:lúc|vào)\s*\d{1,2}\s*(?::|h|giờ))/i.test(message);
}

export function isEventRelatedQuestion(message: string, history: Array<{ role: string; content: string }> = []): boolean {
  return hasEventSignal([message, ...history.slice(-6).map((turn) => turn.content)].join(" "));
}

export function isExplicitlyOutsideEventDomain(message: string): boolean {
  const lower = message.toLowerCase();
  return OUT_OF_DOMAIN_TERMS.some((term) => lower.includes(term));
}
