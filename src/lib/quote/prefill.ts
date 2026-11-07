export interface PrefillQuoteData {
  guestCount?: number;
  conceptId?: string;
}

/**
 * Trích xuất số lượng khách và concept gợi ý từ văn bản câu hỏi của người dùng
 */
export function extractPrefillData(text: string): PrefillQuoteData {
  const result: PrefillQuoteData = {};

  // Regex trích xuất khoảng hoặc số khách: "50-100 khách", "khoảng 80 khách", "150 người"
  const rangeMatch = text.match(
    /(\d{2,4})\s*(?:-|–|đến)\s*(\d{2,4})\s*(?:khách|người|pax)/i
  );
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    result.guestCount = Math.round((min + max) / 2);
  } else {
    const singleMatch = text.match(/(\d{2,4})\s*(?:khách|người|pax)/i);
    if (singleMatch) {
      result.guestCount = parseInt(singleMatch[1], 10);
    }
  }

  // Concept matching
  const lower = text.toLowerCase();
  if (lower.includes("ma mị") || lower.includes("gothic") || lower.includes("dark")) {
    result.conceptId = "concept-dark";
  } else if (lower.includes("cổ điển") || lower.includes("classic") || lower.includes("vintage")) {
    result.conceptId = "concept-classic";
  } else if (lower.includes("tối giản") || lower.includes("minimal")) {
    result.conceptId = "concept-minimal";
  } else if (lower.includes("hiện đại") || lower.includes("modern")) {
    result.conceptId = "concept-modern";
  }

  return result;
}

