import type { FAQ, KBDocument } from "@/types";
import { faqs } from "./faq.data";
import { DOCUMENTS } from "./documents.data";
import { tokenize, normalizeText } from "./normalize";
import { TOP_K_FAQS, DOCUMENT_SEARCH_THRESHOLD, RETRIEVAL_THRESHOLD } from "@/lib/constants";
import { STOP_WORDS } from "./stopwords";

export interface RetrievedFAQ {
  faq: FAQ;
  score: number;
}

/**
 * Tính điểm match giữa query tokens và FAQ.
 * Chỉ dùng exact match với token có nghĩa (không phải stop word).
 */
function scoreFAQ(queryTokens: string[], faq: FAQ): number {
  // Build token set từ tags + question (nguồn quan trọng nhất)
  const tagAndQuestionText = [...faq.tags, faq.question].join(" ");
  const faqKeyTokens = new Set(tokenize(tagAndQuestionText));
  const answerTokens = tokenize(faq.answer);

  let score = 0;
  for (const qToken of queryTokens) {
    // Bỏ qua stop words và token quá ngắn
    if (STOP_WORDS.has(qToken) || qToken.length < 3) continue;

    // Exact match trong tags/question
    if (faqKeyTokens.has(qToken)) {
      score += 2;
    }

    // Extra bonus: exact match trong tags riêng
    for (const tag of faq.tags) {
      if (tokenize(tag).includes(qToken)) {
        score += 3;
      }
    }

    // Partial match chỉ với token dài ≥ 5 ký tự, trong answer
    if (qToken.length >= 5) {
      for (const aToken of answerTokens) {
        if (aToken !== qToken && aToken.length >= 5 &&
          (aToken.includes(qToken) || qToken.includes(aToken))) {
          score += 1;
        }
      }
    }
  }
  return score;
}

/**
 * Truy xuất top-K FAQ phù hợp nhất với câu hỏi.
 */
export function retrieveTopFAQs(
  query: string,
  k: number = TOP_K_FAQS
): RetrievedFAQ[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = faqs.map((faq) => ({
    faq,
    score: scoreFAQ(queryTokens, faq),
  }));

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/**
 * Trả về score cao nhất.
 */
export function getTopScore(query: string): number {
  const results = retrieveTopFAQs(query, 1);
  return results.length > 0 ? results[0].score : 0;
}

export interface RetrievedDocument {
  document: KBDocument;
  score: number;
}

/**
 * Tính điểm match giữa query tokens và KBDocument.
 * Ưu tiên cao hơn nếu match trong title và tags.
 */
function scoreDocument(queryTokens: string[], doc: KBDocument): number {
  const titleAndTagsText = [...doc.tags, doc.title].join(" ");
  const docKeyTokens = new Set(tokenize(titleAndTagsText));
  const contentTokens = tokenize(doc.content);

  let score = 0;
  for (const qToken of queryTokens) {
    if (STOP_WORDS.has(qToken) || qToken.length < 3) continue;

    // Exact match trong title hoặc tags
    if (docKeyTokens.has(qToken)) {
      score += 2;
    }

    // Extra bonus: exact match trong từng tag
    for (const tag of doc.tags) {
      if (tokenize(tag).includes(qToken)) {
        score += 3;
      }
    }

    // Match trong title riêng (thêm điểm trọng số)
    if (tokenize(doc.title).includes(qToken)) {
      score += 2;
    }

    // Content match: exact match trong nội dung
    if (contentTokens.includes(qToken)) {
      score += 1;
    }

    // Partial match với token dài >= 5 ký tự trong nội dung
    if (qToken.length >= 5) {
      for (const cToken of contentTokens) {
        if (
          cToken !== qToken &&
          cToken.length >= 5 &&
          (cToken.includes(qToken) || qToken.includes(cToken))
        ) {
          score += 1;
          break; // Giới hạn 1 partial match bonus mỗi query token
        }
      }
    }
  }

  return score;
}

/**
 * Truy xuất top-K tài liệu kiến thức (documents) phù hợp với query.
 * Chỉ trả về tài liệu có score >= DOCUMENT_SEARCH_THRESHOLD (hoặc > 0).
 */
export function retrieveFromDocuments(
  query: string,
  k: number = 3
): KBDocument[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = DOCUMENTS.map((doc) => ({
    doc,
    score: scoreDocument(queryTokens, doc),
  }));

  const minScore = DOCUMENT_SEARCH_THRESHOLD ?? 1;

  return scored
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.doc);
}

/**
 * Tìm kiếm tổng hợp từ cả 2 nguồn: FAQ và Document Knowledge Base.
 */
export function searchKnowledge(query: string): {
  faqs: FAQ[];
  documents: KBDocument[];
} {
  const retrievedFaqs = retrieveTopFAQs(query).map((r) => r.faq);
  const retrievedDocs = retrieveFromDocuments(query);

  return {
    faqs: retrievedFaqs,
    documents: retrievedDocs,
  };
}

const FOLLOW_UP_START = /^(con|vay|the|nhung|ok|oke|vang|uh|nua|tiep|so voi)\b/;
const FOLLOW_UP_PHRASES = [
  "goi do", "cai do", "cai nay", "nhu tren", "nhu vay",
  "re hon", "dat hon", "thi sao", "nua khong", "chi tiet hon",
];

/** Câu hỏi "cụt" phụ thuộc ngữ cảnh: "Vậy thì sao?", "Rẻ hơn được không?"...
Bảo thủ có chủ đích. */
export function isContextDependent(message: string): boolean {
  const n = normalizeText(message);
  if (FOLLOW_UP_START.test(n)) return true;
  if (FOLLOW_UP_PHRASES.some((p) => n.includes(p))) return true;
  return tokenize(n).length <= 3;
}

export interface ContextualRetrieval {
  results: RetrievedFAQ[];
  score: number;
  usedContext: boolean;
}

/**
 * - Câu hiện tại tự đủ điểm → dùng nguyên câu hiện tại (hành vi cũ, không đổi).
 * - Chỉ khi điểm < ngưỡng VÀ câu phụ thuộc ngữ cảnh VÀ có history → ghép với câu user trước.
 */
export function retrieveWithContext(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  k: number = TOP_K_FAQS
): ContextualRetrieval {
  const direct = retrieveTopFAQs(message, k);
  const directScore = direct[0]?.score ?? 0;
  if (directScore >= RETRIEVAL_THRESHOLD || !isContextDependent(message)) {
    return { results: direct, score: directScore, usedContext: false };
  }
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (!lastUser) return { results: direct, score: directScore, usedContext: false };

  const merged = retrieveTopFAQs(`${lastUser.content} ${message}`, k);
  const mergedScore = merged[0]?.score ?? 0;
  return mergedScore > directScore
    ? { results: merged, score: mergedScore, usedContext: true }
    : { results: direct, score: directScore, usedContext: false };
}

