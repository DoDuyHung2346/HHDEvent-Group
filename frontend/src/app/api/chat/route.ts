import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";
import { ChatRequestWithContextSchema } from "@/lib/schemas";
import { retrieveWithContext } from "@/lib/kb/retrieve";
import { generateSuggestions, refineSuggestions } from "@/lib/suggestions";
import { getBookingFormResponse, getContactResponse, getGeneralPricingResponse, getGreetingResponse, getKnowledgeGapResponse, getSpecialistHandoffResponse, getUnrelatedResponse } from "@/lib/ai/mock";
import { callAIWithFallback } from "@/lib/ai/client";
import { RETRIEVAL_THRESHOLD, RESCHEDULE_KEYWORDS, URGENT_KEYWORDS } from "@/lib/constants";
import { getStageEstimate } from "@/lib/quote/stageEstimate";
import { getPreliminaryEventEstimate } from "@/lib/quote/preliminaryEstimate";
import { isContactRequest, isEventRelatedQuestion, isExplicitlyOutsideEventDomain, isGeneralEventCostQuestion, isGreeting, isSchedulingRequest, needsSpecialistConsultation } from "@/lib/ai/domain";

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL || "http://127.0.0.1:8000";
const PERSONAL_VN_PHONE_PATTERN = /(?:\+84|0)(?:3|5|7|8|9)\d{8}\b/;

// Nguồn vẫn được giữ trong metadata cho quản trị/RAG, nhưng khách hàng không
// cần thấy ký hiệu kỹ thuật như [1], [2] chen vào nội dung tư vấn.
function removeInlineCitations(answer: string): string {
  return answer.replace(/\s*\[(?:\d+\s*(?:,\s*\d+\s*)*)\]/g, "");
}

// Số trực tiếp của nhân viên có thể xuất hiện trong DOCX cũ. Không trả về
// cho khách: mọi nhu cầu gặp chuyên viên phải đi qua phiếu đặt lịch để hệ
// thống điều phối, lưu yêu cầu và bảo vệ thông tin cá nhân.
function getPrivateContactBookingResponse() {
  return {
    answer: "Để bảo vệ thông tin liên hệ cá nhân của chuyên viên, EventHHD sẽ không hiển thị số điện thoại trực tiếp. Em đã mở phiếu đặt lịch bên dưới để đội ngũ điều phối liên hệ và tư vấn đúng nhu cầu của anh/chị.",
    options: [
      { id: "private-contact-booking", label: "Đặt lịch với chuyên viên", action: "open_booking" as const, payload: "" },
      { id: "private-contact-services", label: "Xem hạng mục dịch vụ", action: "open_requirements" as const, payload: "" },
    ],
    related_questions: [
      "Tôi muốn đặt lịch tư vấn 1-1.",
      "Tôi cần chuẩn bị gì trước buổi tư vấn?",
      "Quy trình làm việc với EventHHD như thế nào?",
    ],
    needs_booking: true,
    needs_requirements: false,
    matched_faq_ids: ["private-staff-contact-booking"],
    source: "ai" as const,
    show_booking_form: true,
    intent: "normal" as const,
  };
}

// Detect intent từ message
function detectIntent(
  message: string,
  history: Array<{ role: string; content: string }> = []
): "reschedule" | "urgent" | "normal" {
  const lower = message.toLowerCase();
  const requestsReschedule = RESCHEDULE_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  const discussesEventPolicy = /(chính sách|điều khoản|hủy\s*(?:sự kiện|hợp đồng)|hoàn\s*(?:cọc|tiền)|phí\s*đổi\s*lịch)/i.test(message);
  const namesAppointment = /(lịch\s*hẹn|lịch\s*tư\s*vấn|cuộc\s*hẹn|mã\s*lịch|khung\s*giờ|đổi\s*sang|chuyển\s*(?:sang|qua))/i.test(message);
  const makesPersonalRequest = /(?:tôi|mình|em|anh|chị)\s*(?:muốn|cần|xin|định)?\s*đổi\s*lịch/i.test(message);
  const recentAppointmentContext = history.slice(-4).some(
    (turn) => turn.role === "user" && /(đổi\s*lịch|lịch\s*hẹn|lịch\s*tư\s*vấn)/i.test(turn.content)
  );

  // "Chính sách hủy và đổi lịch sự kiện" là câu hỏi policy, không phải thao
  // tác đổi lịch hẹn. Chỉ mở luồng reschedule khi khách đang nói về lịch của họ.
  if (requestsReschedule && !discussesEventPolicy && (namesAppointment || makesPersonalRequest || recentAppointmentContext)) return "reschedule";
  if (URGENT_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) return "urgent";
  return "normal";
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
      { status: 429 }
    );
  }

  // Parse + validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const parseResult = ChatRequestWithContextSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError =
      parseResult.error.issues?.[0]?.message ??
      parseResult.error.message ??
      "Dữ liệu không hợp lệ";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { message, history, customerContext } = parseResult.data;
  // FastAPI requires a session id for tracing/history. The original payload
  // omitted it, causing every backend RAG call to return 422 and silently
  // fall back to the static FAQ path.
  const sessionId = customerContext?.phone
    ? `customer_${customerContext.phone.replace(/\D/g, "")}`
    : `anon_${ip.replace(/[^a-zA-Z0-9]/g, "_")}`;

  // Detect intent trước
  const intent = detectIntent(message, history);

  // Lời chào là conversational intent, không cần truy xuất FAQ.
  if (isGreeting(message)) {
    return NextResponse.json({ ...getGreetingResponse(), intent: "normal" as const });
  }

  // Liên hệ là intent độc lập, không để giá sân khấu ở history lấn át.
  if (isContactRequest(message)) {
    return NextResponse.json({ ...getContactResponse(), intent: "normal" as const });
  }

  // Báo giá diện tích là phép tính xác định từ bảng giá, không cần chờ LLM.
  const stageEstimate = getStageEstimate(message, history);
  if (stageEstimate) return NextResponse.json({ ...stageEstimate, intent: "normal" as const });

  // Chỉ những yêu cầu liên quan tổ chức sự kiện mới được đi tới luồng tư vấn.
  if (isExplicitlyOutsideEventDomain(message) || !isEventRelatedQuestion(message, history)) {
    return NextResponse.json({ ...getUnrelatedResponse(), intent: "out_of_scope" as const });
  }

  // Với yêu cầu mới có quy mô/ngân sách nhưng chưa có tài liệu khớp tuyệt đối,
  // dùng các mức giá đã công bố trong catalog để dự toán minh bạch trước khi
  // chuyển khách sang chuyên viên chốt báo giá.
  const preliminaryEstimate = getPreliminaryEventEstimate(message, history);
  if (preliminaryEstimate) {
    return NextResponse.json({
      ...preliminaryEstimate,
      show_booking_form: true,
      intent: "normal" as const,
    });
  }

  // Chỉ câu hỏi chi phí chung, chưa có dữ kiện đủ để dựng phương án, mới cần
  // hỏi thêm thông tin. Phải chạy SAU preliminaryEstimate: một yêu cầu đã nêu
  // rõ loại sự kiện và ngân sách là lead đủ điều kiện để mở phiếu đặt lịch.
  if (isGeneralEventCostQuestion(message)) {
    return NextResponse.json({ ...getGeneralPricingResponse(), intent: "normal" as const });
  }

  // Nếu là đổi lịch → trả special response
  if (intent === "reschedule") {
    return NextResponse.json({
      answer:
        "Tôi hiểu bạn muốn đổi lịch hẹn. Vui lòng cho tôi biết số điện thoại bạn đã dùng khi đặt lịch để tôi tra cứu và hỗ trợ bạn.",
      options: [
        {
          id: "provide-phone",
          label: "Nhập số điện thoại",
          action: "ask",
          payload: "reschedule_lookup",
        },
        {
          id: "call-hotline",
          label: "Gọi hotline 1900 6886",
          action: "link",
          payload: "tel:19006886",
        },
      ],
      related_questions: [
        "Chính sách đổi lịch như thế nào?",
        "Mất phí khi đổi lịch không?",
        "Tôi có thể hủy lịch không?",
      ],
      needs_booking: false,
      matched_faq_ids: [],
      source: "mock" as const,
      intent: "reschedule",
    });
  }

  // Yêu cầu hẹn có giờ/ngày luôn ưu tiên hơn yêu cầu xin thông tin liên hệ.
  // Reschedule must be handled first: “chuyển qua 14h chiều mai” is not a
  // request to create a second appointment.
  if (isSchedulingRequest(message)) {
    return NextResponse.json({ ...getBookingFormResponse(), intent: "normal" as const });
  }

  // Nếu là liên hệ gấp → trả urgent response
  if (intent === "urgent") {
    return NextResponse.json({
      answer:
        "Tôi hiểu đây là việc gấp. Để được hỗ trợ nhanh nhất, bạn có thể liên hệ trực tiếp qua các kênh sau:",
      options: [
        {
          id: "call-hotline",
          label: "Gọi ngay 1900 6886",
          action: "link",
          payload: "tel:19006886",
        },
        {
          id: "zalo",
          label: "Nhắn Zalo OA",
          action: "link",
          payload: "https://zalo.me/eventhhd",
        },
        {
          id: "book-urgent",
          label: "Đặt lịch gấp",
          action: "open_booking",
          payload: "",
        },
      ],
      related_questions: [
        "Giờ làm việc của EventHHD?",
        "Có hỗ trợ ngoài giờ không?",
        "Liên hệ chuyên viên qua kênh nào?",
      ],
      needs_booking: false,
      matched_faq_ids: [],
      source: "mock" as const,
      intent: "urgent",
    });
  }

  // 1. Thử gọi Backend RAG (Chứa toàn bộ tài liệu đã upload, Qdrant Vector + BM25s Index)
  try {
    const backendRes = await fetch(`${RAG_BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        history: history || [],
      }),
      // Gemini + local embedding có thể cần hơn 5 giây, nhất là ngay sau khi
      // container khởi động. Timeout cũ khiến frontend tự rơi về câu handoff
      // dù RAG đã có câu trả lời đúng trong database.
      signal: AbortSignal.timeout(25_000),
    });

    if (backendRes.ok) {
      const ragData = await backendRes.json();
      const isOutOfScope =
        ragData.status === "refusal" ||
        ragData.status === "out_of_scope" ||
        ragData.meta?.intent === "out_of_scope";
      const hasKnowledgeGap = ragData.status === "fallback" || ragData.status === "degraded";

      const answer = removeInlineCitations(
        ragData.answer ||
        (isOutOfScope
          ? "Dạ thưa Quý khách, nội dung này hiện nằm ngoài danh mục tài liệu và thông tin sự kiện hiện có của EventViet. Quý khách có thể liên hệ hotline 1900 6886 hoặc chọn đặt lịch tư vấn 1-1 bên dưới để được chuyên viên hỗ trợ trực tiếp."
          : "")
      );

      // Không phụ thuộc vào prompt: đây là hàng rào cuối cùng đối với cả tài
      // liệu RAG cũ lẫn một câu trả lời LLM bất thường có số cá nhân.
      if (PERSONAL_VN_PHONE_PATTERN.test(answer)) {
        return NextResponse.json(getPrivateContactBookingResponse());
      }

      // Không có chunk khớp không đồng nghĩa câu hỏi ngoài phạm vi. Chỉ những
      // yêu cầu cần khảo sát/đặc tả mới được mời đặt lịch ngay.
      if (isOutOfScope) {
        return NextResponse.json({ ...getUnrelatedResponse(), intent: "out_of_scope" as const });
      }

      // Backend RAG đã xác định cần chuyên viên (needs_human hoặc fallback)
      // và trả action=open_booking. Trước đây action này bị bỏ qua ở Next.js
      // nên chatbot nói "điều phối qua phiếu" nhưng giao diện không hề mở
      // phiếu. Giữ phần tư vấn và mở form ngay bên dưới câu trả lời.
      if (ragData.action?.type === "open_booking") {
        const followUps = refineSuggestions(ragData.follow_ups, { message, history });
        return NextResponse.json({
          answer,
          options: [
            { id: "rag-booking", label: "Đặt lịch với chuyên viên", action: "open_booking" as const, payload: message },
            { id: "rag-requirements", label: "Tự chọn hạng mục & xem giá", action: "open_requirements" as const, payload: "" },
          ],
          related_questions: followUps,
          needs_booking: true,
          needs_requirements: false,
          show_booking_form: true,
          matched_faq_ids: ragData.citations ? ragData.citations.map((c: { chunk_id: string }) => c.chunk_id) : [],
          source: "ai" as const,
          intent: "normal" as const,
        });
      }

      if (hasKnowledgeGap) {
        // RAG vector có thể bỏ sót một số câu FAQ ngắn do cách diễn đạt.
        // Trước khi nói "thiếu dữ liệu", tra lại kho FAQ chuẩn đã được kiểm
        // duyệt để các câu như quy trình/chính sách/dịch vụ vẫn có câu trả lời.
        const localFallback = retrieveWithContext(message, history);
        if (localFallback.score >= RETRIEVAL_THRESHOLD && localFallback.results[0]) {
          const faq = localFallback.results[0].faq;
          return NextResponse.json({
            answer: faq.answer,
            options: [
              { id: "faq-followup", label: "Tìm hiểu thêm", action: "ask" as const, payload: faq.followups[0] },
              { id: "faq-services", label: "Xem dịch vụ", action: "ask" as const, payload: "EventHHD cung cấp những dịch vụ gì?" },
            ],
            related_questions: faq.followups,
            needs_booking: false,
            matched_faq_ids: [faq.id],
            source: "ai" as const,
            intent: "normal" as const,
          });
        }
        return NextResponse.json({
          ...getKnowledgeGapResponse(message, needsSpecialistConsultation(message)),
          intent: "normal" as const,
        });
      }

      const defaultOptions = [
        { id: "opt-1", label: "Tìm hiểu thêm", action: "ask" as const, payload: "Bạn có thể cho tôi biết thêm chi tiết không?" },
        { id: "opt-2", label: "Xem dịch vụ", action: "ask" as const, payload: "EventHHD cung cấp những dịch vụ gì?" },
      ];

      // Follow-up từ RAG có thể chứa breadcrumb/tên heading thô của DOCX.
      // Luôn đi qua bộ lọc ngữ cảnh để loại "Q2", "Knowledge Base" và bù
      // các câu hỏi phù hợp với lượt hội thoại hiện tại.
      const followUps = refineSuggestions(ragData.follow_ups, { message, history });

      return NextResponse.json({
        answer,
        options: ragData.options?.length >= 2 ? ragData.options : defaultOptions,
        related_questions: followUps,
        needs_booking: isOutOfScope,
        matched_faq_ids: ragData.citations ? ragData.citations.map((c: { chunk_id: string }) => c.chunk_id) : [],
        source: "ai" as const,
        intent: isOutOfScope ? ("out_of_scope" as const) : ("normal" as const),
      });
    }
  } catch {
    // Backend offline hoặc timeout -> Chuyển tiếp mượt sang local Knowledge Base + Fallback
  }

  // 2. Fallback nội bộ: retrieve có ngữ cảnh từ kho FAQ tĩnh
  const { results: topFAQs, score: topScore } = retrieveWithContext(message, history);
  const matchedFaqIds = topFAQs.map((r) => r.faq.id);

  if (topScore < RETRIEVAL_THRESHOLD) {
    return NextResponse.json({
      ...getSpecialistHandoffResponse(),
      matched_faq_ids: matchedFaqIds,
      related_questions: generateSuggestions({ message, history }),
      intent: "out_of_scope" as const,
    });
  }

  const contextFAQs = topFAQs.map((r) => r.faq);
  const response = await callAIWithFallback(
    message,
    history,
    contextFAQs,
    matchedFaqIds,
    customerContext ?? null
  );

  return NextResponse.json({
    ...response,
    related_questions: refineSuggestions(response.related_questions, { message, history }),
    intent: "normal",
  });
}
