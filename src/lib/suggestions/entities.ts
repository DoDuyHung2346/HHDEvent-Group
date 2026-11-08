import { normalizeText } from "@/lib/kb/normalize";

export interface ConversationEntities {
  guests?: number;
  eventLabel?: string; // nhãn ngắn, dùng trực tiếp trong câu gợi ý
  location?: string;
  outsideHcm?: boolean;
  budget?: string; // vd "300 triệu"
}

const EVENT_TYPES: Array<{ label: string; patterns: string[] }> = [
  { label: "year-end party", patterns: ["year end", "year-end", "yep", "tat nien", "tong ket"] },
  { label: "gala dinner", patterns: ["gala", "tri an", "dem tiec"] },
  { label: "tiệc cưới", patterns: ["tiec cuoi", "dam cuoi", "wedding"] },
  { label: "team building", patterns: ["team building", "teambuilding"] },
  { label: "hội nghị", patterns: ["hoi nghi", "hoi thao", "seminar", "conference"] },
  { label: "lễ khai trương", patterns: ["khai truong"] },
  { label: "lễ ra mắt sản phẩm", patterns: ["ra mat"] },
  { label: "workshop", patterns: ["workshop", "dao tao"] },
  { label: "sinh nhật công ty", patterns: ["sinh nhat"] },
  { label: "triển lãm", patterns: ["trien lam", "xuc tien"] },
];

const LOCATIONS: Array<{ label: string; outsideHcm: boolean; patterns: string[] }> = [
  { label: "TP.HCM", outsideHcm: false, patterns: ["ho chi minh", "hcm", "sai gon", "tphcm"] },
  { label: "Hà Nội", outsideHcm: true, patterns: ["ha noi", "hanoi"] },
  { label: "Đà Nẵng", outsideHcm: true, patterns: ["da nang"] },
  { label: "Phú Quốc", outsideHcm: true, patterns: ["phu quoc"] },
  { label: "Nha Trang", outsideHcm: true, patterns: ["nha trang"] },
  { label: "Vũng Tàu", outsideHcm: false, patterns: ["vung tau"] },
];

/**
 * Token "thực thể" + token chung chung. Khi so sánh "câu này có hỏi lại ý cũ không"
 * ta bỏ chúng đi, vì chúng LUÔN trùng giữa câu hỏi và gợi ý cá nhân hoá.
 */
export const ENTITY_TOKENS: ReadonlySet<string> = new Set([
  ...EVENT_TYPES.flatMap((e) => e.patterns),
  ...LOCATIONS.flatMap((l) => l.patterns),
  "khach", "nguoi", "pax", "eventviet", "eventhhd", "demo", "chuc", "kien", "event",
].flatMap((p) => p.split(/[\s-]+/)));

const has = (n: string, patterns: string[]) => patterns.some((p) => n.includes(p));

/** Trích thông tin từ MỘT câu người dùng. */
export function extractEntities(text: string): ConversationEntities {
  const n = normalizeText(text);
  const out: ConversationEntities = {};
  const g = n.match(/(\d{2,4})\s*(khach|nguoi|pax|nhan vien)/);
  if (g) out.guests = Number(g[1]);
  const ev = EVENT_TYPES.find((e) => has(n, e.patterns));
  if (ev) out.eventLabel = ev.label;
  const loc = LOCATIONS.find((l) => has(n, l.patterns));
  if (loc) { out.location = loc.label; out.outsideHcm = loc.outsideHcm; }
  const b = n.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr|ty)\b/);
  if (b) out.budget = `${b[1]} ${b[2] === "ty" ? "tỷ" : "triệu"}`;
  return out;
}

/** Gộp nhiều câu (cũ → mới). Thông tin mới ghi đè cũ. */
export function mergeEntities(turnsOldestFirst: readonly string[]): ConversationEntities {
  return turnsOldestFirst.reduce<ConversationEntities>(
    (acc, t) => ({ ...acc, ...extractEntities(t) }),
    {}
  );
}

