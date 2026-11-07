import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/constants";

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store (reset khi server restart)
const store = new Map<string, RateLimitEntry>();

/**
 * Kiểm tra rate limit theo IP.
 * Trả về true nếu đã vượt giới hạn.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * Lấy số request còn lại trong cửa sổ hiện tại.
 */
export function getRemainingRequests(ip: string): number {
  const entry = store.get(ip);
  if (!entry) return RATE_LIMIT_MAX;
  return Math.max(0, RATE_LIMIT_MAX - entry.count);
}
