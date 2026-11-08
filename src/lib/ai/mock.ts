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
      "Cảm ơn bạn đã liên hệ EventHHD! Hiện tại hệ thống AI đang tạm thời gián đoạn. Vui lòng đặt lịch tư vấn trực tiếp để được hỗ trợ nhanh nhất.",
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
        payload: "EventHHD cung cấp những dịch vụ gì?",
      },
    ],
    related_questions: [
      "EventHHD cung cấp những dịch vụ gì?",
      "Chi phí tổ chức sự kiện tại EventHHD là bao nhiêu?",
      "Quy trình làm việc với EventHHD như thế nào?",
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
      "Câu hỏi này nằm ngoài phạm vi tư vấn của EventHHD. Chúng tôi chuyên tổ chức sự kiện doanh nghiệp, year-end party, team building và các sự kiện đặc biệt. Bạn có muốn đặt lịch tư vấn để được trao đổi trực tiếp không?",
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
        payload: "EventHHD cung cấp những dịch vụ gì?",
      },
    ],
    related_questions: [
      "EventHHD cung cấp những dịch vụ gì?",
      "EventHHD tổ chức những loại sự kiện nào?",
      "Chi phí tổ chức sự kiện tại EventHHD là bao nhiêu?",
    ],
    needs_booking: true,
    matched_faq_ids: matchedFaqIds,
    source: "mock",
  };
}

/** Câu hỏi hoàn toàn ngoài lĩnh vực tổ chức sự kiện: không mời đặt lịch. */
export function getUnrelatedResponse(): ChatResponse {
  return {
    answer: "Câu hỏi này không thuộc lĩnh vực tổ chức sự kiện mà EventHHD hỗ trợ. Tôi có thể tư vấn về kế hoạch sự kiện, sân khấu, thiết bị, địa điểm, chi phí hoặc quy trình triển khai.",
    options: [
      { id: "event-services", label: "EventHHD có những dịch vụ gì?", action: "ask", payload: "EventHHD cung cấp những dịch vụ gì?" },
      { id: "event-pricing", label: "Hỏi về chi phí sự kiện", action: "ask", payload: "Chi phí tổ chức sự kiện được tính như thế nào?" },
    ],
    related_questions: [
      "EventHHD tổ chức những loại sự kiện nào?",
      "Chi phí tổ chức sự kiện được tính như thế nào?",
      "Thời gian chuẩn bị tối thiểu bao lâu?",
    ],
    needs_booking: false,
    matched_faq_ids: [],
    source: "mock",
  };
}

/** Dịch vụ sự kiện hợp lệ nhưng cần chuyên viên chốt phương án. */
export function getSpecialistHandoffResponse(): ChatResponse {
  return {
    answer: "Yêu cầu này thuộc phạm vi tổ chức sự kiện, nhưng cần chuyên viên xác nhận thông số kỹ thuật, địa điểm và phạm vi triển khai trước khi cam kết phương án. Bạn có thể đặt lịch để đội ngũ tư vấn cụ thể theo nhu cầu của mình.",
    options: [
      { id: "specialist-booking", label: "Đặt lịch tư vấn chuyên viên", action: "open_booking", payload: "Tư vấn yêu cầu sự kiện chuyên sâu" },
      { id: "specialist-services", label: "Xem dịch vụ tiêu chuẩn", action: "ask", payload: "EventHHD cung cấp những dịch vụ gì?" },
    ],
    related_questions: [
      "Tôi cần chuẩn bị những thông tin gì trước buổi tư vấn?",
      "Quy trình làm việc với EventHHD như thế nào?",
      "Thời gian chuẩn bị tối thiểu cho sự kiện là bao lâu?",
    ],
    needs_booking: true,
    matched_faq_ids: [],
    source: "mock",
  };
}
