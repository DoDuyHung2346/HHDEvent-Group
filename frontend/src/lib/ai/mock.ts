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

export function getGreetingResponse(): ChatResponse {
  return {
    answer: "Xin chào! Em là trợ lý AI của EventViet. Em có thể tư vấn tổ chức sự kiện, lựa chọn dịch vụ và dự toán chi phí. Anh/chị đang quan tâm đến loại sự kiện nào ạ?",
    options: [
      { id: "greeting-service", label: "Xem dịch vụ EventViet", action: "ask", payload: "EventViet cung cấp những dịch vụ gì?" },
      { id: "greeting-price", label: "Hỏi về chi phí", action: "ask", payload: "Chi phí tổ chức sự kiện được tính như thế nào?" },
    ],
    related_questions: [
      "EventViet tổ chức những loại sự kiện nào?",
      "Chi phí tổ chức sự kiện được tính như thế nào?",
      "Tôi muốn tổ chức một sự kiện riêng?",
    ],
    needs_booking: false,
    matched_faq_ids: [],
    source: "ai",
  };
}

/** Trả lời mức tổng quan khi khách hỏi chi phí nhưng chưa nêu nhu cầu cụ thể. */
export function getGeneralPricingResponse(): ChatResponse {
  return {
    answer:
      "Chi phí tổ chức sự kiện không có một mức cố định vì phụ thuộc vào loại sự kiện, số khách, địa điểm, thời lượng và các hạng mục như concept/trang trí, sân khấu, âm thanh ánh sáng, tiệc, nhân sự và nghệ sĩ.\n\nĐể em dự toán sơ bộ đúng trọng tâm, anh/chị cho em biết: (1) loại sự kiện, (2) số khách dự kiến, (3) địa điểm hoặc tỉnh/thành, và (4) ngân sách mong muốn. Sau đó em sẽ đưa phương án tham khảo trước; chỉ khi cần báo giá chốt hoặc yêu cầu đặc thù mới cần đặt lịch với chuyên viên.",
    options: [
      { id: "pricing-estimate", label: "Tôi muốn dự toán chi phí", action: "open_requirements", payload: "" },
      { id: "pricing-services", label: "Xem hạng mục dịch vụ", action: "ask", payload: "EventHHD cung cấp những dịch vụ gì?" },
    ],
    related_questions: [
      "Tôi tổ chức YEP 150 khách, ngân sách 150 triệu.",
      "Chi phí sân khấu và thảm đỏ được tính thế nào?",
      "Tôi muốn đặt lịch để nhận báo giá chi tiết.",
    ],
    needs_booking: false,
    matched_faq_ids: [],
    source: "ai",
  };
}

/**
 * Không có tài liệu khớp không có nghĩa là câu hỏi ngoài phạm vi. Phản hồi này
 * giữ tính trung thực, vẫn dẫn dắt hội thoại và không tự bật form đặt lịch.
 */
export function getKnowledgeGapResponse(query: string, showBookingOption = false): ChatResponse {
  const asksAboutTrust = /(uy\s*tín|tin\s*cậy|kinh\s*nghiệm|năng\s*lực|portfolio|hồ\s*sơ\s*năng\s*lực|khách\s*hàng\s*(?:đã|từng))/i.test(query);

  if (asksAboutTrust) {
    return {
      answer:
        "Uy tín của một đơn vị tổ chức sự kiện nên được đánh giá bằng hồ sơ năng lực, case study/portfolio, khách hàng tham chiếu, phạm vi cam kết trong hợp đồng và năng lực triển khai đúng loại sự kiện bạn cần. Hiện kho tri thức của em chưa có tài liệu đã xác thực để khẳng định về một dự án hoặc khách hàng cụ thể của EventHHD, nên em không muốn trả lời quá mức.\n\nEm có thể giới thiệu dịch vụ, quy trình làm việc và các tiêu chí để anh/chị đối chiếu; nếu cần xem hồ sơ năng lực hoặc trao đổi dự án thực tế, anh/chị có thể chọn lịch làm việc với chuyên viên.",
      options: [
        { id: "trust-services", label: "EventHHD cung cấp dịch vụ gì?", action: "ask", payload: "EventHHD cung cấp những dịch vụ gì?" },
        { id: "trust-process", label: "Xem quy trình làm việc", action: "ask", payload: "Quy trình làm việc với EventHHD như thế nào?" },
        ...(showBookingOption ? [{ id: "trust-booking", label: "Trao đổi hồ sơ năng lực", action: "open_booking" as const, payload: "Trao đổi hồ sơ năng lực và dự án tham chiếu" }] : []),
      ],
      related_questions: [
        "EventHHD có thể tổ chức những loại sự kiện nào?",
        "Quy trình làm việc với EventHHD như thế nào?",
        "Tôi muốn trao đổi hồ sơ năng lực với chuyên viên.",
      ],
      needs_booking: false,
      matched_faq_ids: [],
      source: "ai",
    };
  }

  return {
    answer:
      "Câu hỏi của anh/chị vẫn thuộc phạm vi tư vấn sự kiện. Tuy nhiên, kho tri thức hiện chưa có thông tin đã xác thực đủ để trả lời chính xác phần này, nên em không muốn suy đoán. Anh/chị cho em biết thêm loại sự kiện, quy mô khách, địa điểm hoặc hạng mục đang quan tâm; em sẽ tư vấn hoặc dự toán theo dữ liệu phù hợp.",
    options: [
      { id: "gap-services", label: "Xem dịch vụ EventHHD", action: "ask", payload: "EventHHD cung cấp những dịch vụ gì?" },
      { id: "gap-pricing", label: "Tôi muốn dự toán chi phí", action: "open_requirements", payload: "" },
      ...(showBookingOption ? [{ id: "gap-booking", label: "Đặt lịch tư vấn chi tiết", action: "open_booking" as const, payload: "Tư vấn yêu cầu sự kiện chuyên sâu" }] : []),
    ],
    related_questions: [
      "EventHHD tổ chức những loại sự kiện nào?",
      "Chi phí tổ chức sự kiện được tính như thế nào?",
      "Tôi muốn trao đổi yêu cầu chi tiết với chuyên viên.",
    ],
    needs_booking: false,
    matched_faq_ids: [],
    source: "ai",
  };
}

export function getContactResponse(): ChatResponse {
  return {
    answer: "Bạn có thể gọi trực tiếp hotline EventViet 1900 6886 trong giờ làm việc để gặp bộ phận tư vấn. Hiện hệ thống chưa có Zalo OA hoặc số cá nhân chuyên viên đã được xác thực để cung cấp, nên mình không hiển thị thông tin liên hệ không chắc chắn.",
    options: [
      { id: "contact-hotline", label: "Gọi hotline 1900 6886", action: "link", payload: "tel:19006886" },
      { id: "contact-book", label: "Đặt lịch chuyên viên gọi lại", action: "open_booking", payload: "Tư vấn trực tiếp với chuyên viên" },
    ],
    related_questions: [
      "Giờ làm việc của EventViet là khi nào?",
      "Tôi cần chuẩn bị gì trước khi tư vấn?",
      "Quy trình làm việc với EventViet như thế nào?",
    ],
    needs_booking: false,
    matched_faq_ids: [],
    source: "ai",
  };
}

export function getBookingFormResponse(): ChatResponse {
  return {
    answer: "Mình đã nhận được yêu cầu hẹn tư vấn. Bạn vui lòng xác nhận thông tin trong phiếu bên dưới để EventViet ghi nhận đúng ngày, giờ và số điện thoại liên hệ.",
    options: [
      { id: "booking-confirm", label: "Xác nhận lịch tư vấn", action: "open_booking", payload: "Tư vấn sự kiện" },
      { id: "booking-change", label: "Chọn thời gian khác", action: "open_booking", payload: "Tư vấn sự kiện" },
    ],
    related_questions: [
      "Giờ làm việc của EventViet là khi nào?",
      "Tôi cần chuẩn bị gì trước buổi tư vấn?",
      "Quy trình làm việc với EventViet như thế nào?",
    ],
    needs_booking: true,
    matched_faq_ids: [],
    source: "ai",
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
