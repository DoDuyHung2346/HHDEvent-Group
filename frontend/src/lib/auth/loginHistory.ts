"use client";

export interface LoginHistoryEntry {
  id: string;
  role: "customer" | "admin";
  name: string;
  identifier: string; // Số điện thoại khách hoặc Email quản trị
  timestamp: string;
  status: "success" | "failed";
  reason?: string;
  device?: string;
}

const LOGIN_HISTORY_STORAGE_KEY = "eventviet_login_history";
const MAX_HISTORY_ENTRIES = 50;

/**
 * Đọc toàn bộ danh sách nhật ký đăng nhập từ localStorage
 */
export function loadLoginHistory(): LoginHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOGIN_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LoginHistoryEntry[];
  } catch {
    return [];
  }
}

/**
 * Ghi lại một lần đăng nhập (thành công hoặc thất bại)
 */
export function recordLoginAttempt(
  entry: Omit<LoginHistoryEntry, "id" | "timestamp" | "device">
): void {
  if (typeof window === "undefined") return;
  try {
    const history = loadLoginHistory();
    const newEntry: LoginHistoryEntry = {
      ...entry,
      id: `login-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      device: typeof navigator !== "undefined" ? (navigator.userAgent.includes("Mobile") ? "Di động" : "Máy tính (Desktop)") : "Không xác định",
    };
    const updated = [newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(LOGIN_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") window.dispatchEvent(new Event("eventviet_login_history_changed"));
  } catch (e) {
    console.error("Lỗi ghi nhận lịch sử đăng nhập:", e);
  }
}

/**
 * Xóa sạch lịch sử đăng nhập (chỉ dành cho SuperAdmin)
 */
export function clearLoginHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOGIN_HISTORY_STORAGE_KEY);
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") window.dispatchEvent(new Event("eventviet_login_history_changed"));
  } catch (e) {
    console.error("Lỗi xóa lịch sử đăng nhập:", e);
  }
}
