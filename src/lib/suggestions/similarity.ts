import { normalizeText, tokenize } from "@/lib/kb/normalize";
import { STOP_WORDS } from "@/lib/kb/stopwords";
import { ENTITY_TOKENS } from "./entities";

const SYNONYMS: Array<[RegExp, string]> = [
  [/\b(bao gia|gia ca|gia)\b/g, "chi phi"],
  [/\b(ngan sach|kinh phi)\b/g, "chi phi"],
  [/\b(dia diem|noi to chuc|san tiec)\b/g, "venue"],
  [/\b(hen|dat lich|book)\b/g, "datlich"],
];

export function canonicalize(text: string): string {
  let n = normalizeText(text);
  for (const [re, to] of SYNONYMS) n = n.replace(re, to);
  return n;
}

export function contentTokens(text: string): Set<string> {
  return new Set(
    tokenize(canonicalize(text)).filter(
      (t) => t.length >= 3 && !/^\d+$/.test(t) && !STOP_WORDS.has(t) && !ENTITY_TOKENS.has(t)
    )
  );
}

/** Jaccard trên token có nghĩa. 0..1 */
export function similarity(a: string, b: string): number {
  const A = contentTokens(a);
  const B = contentTokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

export const SIMILAR_THRESHOLD = 0.5;

export function isSimilarToAny(text: string, others: readonly string[]): boolean {
  return others.some((o) => similarity(text, o) >= SIMILAR_THRESHOLD);
}

