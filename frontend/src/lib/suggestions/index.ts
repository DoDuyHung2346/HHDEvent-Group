import { faqs } from "@/lib/kb/faq.data";
import { retrieveTopFAQs } from "@/lib/kb/retrieve";
import type { HistoryMessage } from "@/types";
import { extractEntities, mergeEntities, type ConversationEntities } from "./entities";
import { isSimilarToAny, similarity } from "./similarity";

export type Suggestions = [string, string, string];

export interface SuggestionInput {
  message: string; // câu người dùng vừa gửi
  history?: readonly HistoryMessage[]; // lịch sử (không gồm `message`)
}

interface Candidate {
  text: string;
  score: number;
  source: string;
}

const RECENCY = [1, 0.6, 0.35, 0.2];
const MIN_LEN = 8;
const MAX_LEN = 80;
const EVERGREEN = [
  "EventHHD cung cấp những dịch vụ gì?",
  "Chi phí tổ chức sự kiện tại EventHHD là bao nhiêu?",
  "Quy trình làm việc với EventHHD như thế nào?",
];

function isDocumentHeadingSuggestion(text: string): boolean {
  const normalized = text.toLowerCase();
  return /\bknowledge\s*base\b|\bq\s*\d+\b|\|\s*(?:knowledge|q\s*\d+)/i.test(text)
    || /^chi\s*tiết\s*hơn\s*về\b/i.test(normalized);
}

/** Các câu user, MỚI NHẤT TRƯỚC (index 0 = câu hiện tại). */
function userTurns({ message, history = [] }: SuggestionInput): string[] {
  const prev = history
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .slice(-3)
    .reverse();
  return [message, ...prev];
}

function topicProfile(turns: readonly string[]): Map<string, number> {
  const profile = new Map<string, number>();
  turns.forEach((t, i) => {
    const hits = retrieveTopFAQs(t, 3);
    const top = hits[0]?.score ?? 0;
    if (!top) return;
    for (const h of hits) {
      const w = (RECENCY[i] ?? 0.1) * (h.score / top);
      profile.set(h.faq.id, (profile.get(h.faq.id) ?? 0) + w);
    }
  });
  return profile;
}

function entityCandidates(e: ConversationEntities, turnCount: number): Candidate[] {
  const out: Candidate[] = [];
  const ev = e.eventLabel;
  const add = (text: string, score: number, source = "entity") =>
    out.push({ text, score, source });

  if (ev && e.guests)
    add(`Chi phí tổ chức ${ev} cho ${e.guests} khách khoảng bao nhiêu?`, 1.1, "entity-cost");
  else if (ev) add(`Chi phí tổ chức ${ev} khoảng bao nhiêu?`, 0.9, "entity-cost");
  else if (e.guests)
    add(`Với ${e.guests} khách thì chi phí trọn gói khoảng bao nhiêu?`, 0.9, "entity-cost");

  if (e.budget)
    add(`Ngân sách ${e.budget} thì nên chọn những hạng mục nào?`, 1.0, "entity-budget");
  if (ev) add(`Cần chuẩn bị trước bao lâu cho ${ev}?`, 1.0, "entity-prep");
  if (ev && e.guests)
    add(`Địa điểm nào phù hợp ${ev} ${e.guests} khách?`, 1.0, "entity-venue");

  if (e.location) {
    if (e.outsideHcm)
      add(`Phí di chuyển đến ${e.location} được tính thế nào?`, 1.05, "entity-loc");
    else add(`EventHHD hỗ trợ tìm địa điểm ở ${e.location} không?`, 1.0, "entity-loc");
  }

  // CTA đặt lịch: lên điểm khi hội thoại đã "ấm". GIỮ cụm "tư vấn 1-1" (xem lưu ý mục 9)
  const warm = turnCount >= 2 || Object.keys(e).length >= 2;
  add(`Tôi muốn đặt lịch tư vấn 1-1 cho ${ev ?? "sự kiện của mình"}`, warm ? 0.9 : 0.5, "cta");

  return out;
}

function buildCandidates(turns: string[]): Candidate[] {
  const profile = topicProfile(turns);
  const entities = mergeEntities([...turns].reverse()); // cũ → mới
  const cands: Candidate[] = [];
  const topFaqs = [...profile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  for (const [id, w] of topFaqs) {
    const faq = faqs.find((f) => f.id === id);
    faq?.followups.forEach((f, i) => {
      // Followup tĩnh nhắc loại sự kiện KHÁC với loại khách đang nói → bỏ
      const mentioned = extractEntities(f).eventLabel;
      if (mentioned && entities.eventLabel && mentioned !== entities.eventLabel) return;
      cands.push({ text: f, score: 0.9 * w * (1 - i * 0.05), source: id });
    });
  }

  cands.push(...entityCandidates(entities, turns.length));
  return cands;
}

/** Chọn tối đa n câu: điểm cao, không trùng câu đã hỏi, không trùng nhau, đa dạng nguồn. */
function pick(cands: Candidate[], blocked: string[], chosen: string[], n: number): string[] {
  const picked = [...chosen];
  const usedSources = new Set<string>();
  const pool = cands
    .filter((c) => c.text.length >= MIN_LEN && c.text.length <= MAX_LEN)
    .sort((a, b) => b.score - a.score);

  while (picked.length < n) {
    let best: { c: Candidate; adj: number } | null = null;
    for (const c of pool) {
      if (isSimilarToAny(c.text, blocked) || isSimilarToAny(c.text, picked)) continue;
      const adj = c.score - (usedSources.has(c.source) ? 0.3 : 0);
      if (!best || adj > best.adj) best = { c, adj };
    }
    if (!best) break;
    picked.push(best.c.text);
    usedSources.add(best.c.source);
  }

  return picked;
}

function finalize(picked: string[], blocked: string[]): Suggestions {
  const out = [...picked];
  const faqPool: Candidate[] = faqs.map((f) => ({
    text: f.question,
    score: 0.1,
    source: f.id,
  }));
  const evergreen: Candidate[] = EVERGREEN.map((t) => ({
    text: t,
    score: 0.05,
    source: "evergreen",
  }));

  for (const pool of [faqPool, evergreen]) {
    if (out.length >= 3) break;
    out.push(...pick(pool, blocked, out, 3).slice(out.length));
  }

  for (const t of EVERGREEN) {
    // cuối cùng: cho phép lặp để luôn đủ 3
    if (out.length >= 3) break;
    if (!out.includes(t)) out.push(t);
  }

  return out.slice(0, 3) as Suggestions;
}

/** Gợi ý thuần deterministic (mock / ngoài phạm vi / AI lỗi). */
export function generateSuggestions(input: SuggestionInput): Suggestions {
  const turns = userTurns(input);
  return finalize(pick(buildCandidates(turns), turns, [], 3), turns);
}

/** Làm sạch gợi ý do LLM sinh; thiếu/trùng thì bù bằng engine. */
export function refineSuggestions(
  llm: readonly string[] | undefined,
  input: SuggestionInput
): Suggestions {
  const turns = userTurns(input);
  const cleaned: string[] = [];
  for (const raw of llm ?? []) {
    const t = raw.replace(/^[\s\d.\-)•*]+/, "").trim();
    if (t.length < MIN_LEN || t.length > MAX_LEN) continue;
    if (isDocumentHeadingSuggestion(t)) continue;
    if (isSimilarToAny(t, turns) || isSimilarToAny(t, cleaned)) continue;
    cleaned.push(t);
  }
  return finalize(pick(buildCandidates(turns), turns, cleaned.slice(0, 3), 3), turns);
}

