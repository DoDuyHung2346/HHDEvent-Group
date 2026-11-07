import type { ChatResponse } from "@/lib/schemas";

/**
 * Mock fallback response khi AI không khả dụng hoặc timeout.
 * Luôn trả về source: "mock".
 */
export function getMockResponse(
  query: string,
  matchedFaqIds: string[] = []
): ChatResponse {
  return {
    answer:
      "Cảm ơn bạn đã liên hệ EventViet Demo! Hiện tại hệ thống AI đang tạm thời gián đoạn. Vui lòng đặt lịch tư vấn trực tiếp để được hỗ trợ nhanh nhất.",
    options: [
      {
        id: "opt-req",
        label: "📝 Chọn yêu cầu & xem giá",
        action: "open_requirements",
        payload: "",
      },
      {
        id: "opt-booking",
        label: "📅 Đặt lịch tư vấn",
        action: "open_booking",
        payload: "",
      },
      {
        id: "opt-service",
        label: "📋 Xem dịch vụ",
        action: "ask",
        payload: "EventViet Demo cung cấp những dịch vụ gì?",
      },
    ],
    related_questions: [
      "EventViet Demo cung cấp những dịch vụ gì?",
      "Chi phí tổ chức sự kiện tại EventViet là bao nhiêu?",
      "Quy trình làm việc với EventViet như thế nào?",
    ],
    needs_booking: false,
    matched_faq_ids: matchedFaqIds,
    source: "mock",
  };
}

/**
 * Mock response khi câu hỏi nằm ngoài phạm vi FAQ.
 */
export function getOutOfScopeResponse(matchedFaqIds: string[] = []): ChatResponse {
  return {
    answer:
      "Câu hỏi này nằm ngoài phạm vi tư vấn của EventViet Demo. Chúng tôi chuyên tổ chức sự kiện doanh nghiệp, year-end party, team building và các sự kiện đặc biệt. Bạn có muốn đặt lịch tư vấn để được trao đổi trực tiếp không?",
    options: [
      {
        id: "opt-booking",
        label: "📅 Đặt lịch tư vấn ngay",
        action: "open_booking",
        payload: "",
      },
      {
        id: "opt-req",
        label: "📝 Chọn yêu cầu & xem giá",
        action: "open_requirements",
        payload: "",
      },
      {
        id: "opt-service",
        label: "🎪 Tìm hiểu dịch vụ",
        action: "ask",
        payload: "EventViet Demo cung cấp những dịch vụ gì?",
      },
    ],
    related_questions: [
      "EventViet Demo cung cấp những dịch vụ gì?",
      "EventViet Demo tổ chức những loại sự kiện nào?",
      "Chi phí tổ chức sự kiện tại EventViet là bao nhiêu?",
    ],
    needs_booking: true,
    matched_faq_ids: matchedFaqIds,
    source: "mock",
  };
}
