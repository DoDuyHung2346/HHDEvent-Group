/** Lightweight, deterministic guard before RAG fallback. */
const EVENT_TERMS = [
  "sự kiện", "tổ chức", "tiệc", "sinh nhật", "đám cưới", "hôn lễ", "gala",
  "year end", "tất niên", "khai trương", "hội nghị", "hội thảo", "workshop",
  "team building", "sân khấu", "thảm", "backdrop", "âm thanh", "ánh sáng",
  "led", "mc", "ca sĩ", "nghệ sĩ", "catering", "tiệc teabreak", "venue",
  "địa điểm", "khách sạn", "resort", "khách", "người", "pax", "đặt cọc",
  "hợp đồng", "báo giá", "chi phí", "ngân sách", "lịch tư vấn",
];

const OUT_OF_DOMAIN_TERMS = [
  "ronaldo", "bóng đá", "cầu thủ", "giải đấu", "chứng khoán", "bitcoin",
  "tiền điện tử", "thời tiết", "bài thơ", "viết code", "lập trình", "điểm thi",
];

export function isEventRelatedQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  return EVENT_TERMS.some((term) => lower.includes(term));
}

export function isExplicitlyOutsideEventDomain(message: string): boolean {
  const lower = message.toLowerCase();
  return OUT_OF_DOMAIN_TERMS.some((term) => lower.includes(term));
}
