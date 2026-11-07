"use client";

export interface ClientUser {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const USER_SESSION_KEY = "eventviet_user_session";
const USER_LOGGED_OUT_KEY = "eventviet_user_logged_out";

export const SAMPLE_USER: ClientUser = {
  id: "usr-guest-01",
  name: "Nguyễn Thanh Tuấn",
  phone: "0912345678",
  email: "khachhang@gmail.com",
};

export function getClientUser(): ClientUser | null {
  if (typeof window === "undefined") return null;
  try {
    const isLoggedOut = localStorage.getItem(USER_LOGGED_OUT_KEY) === "true";
    if (isLoggedOut) return null;

    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) {
      // Lần đầu vào web thì khởi tạo demo user
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(SAMPLE_USER));
      return SAMPLE_USER;
    }
    return JSON.parse(raw) as ClientUser;
  } catch {
    return null;
  }
}

export function setClientUser(user: ClientUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      localStorage.removeItem(USER_LOGGED_OUT_KEY);
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.setItem(USER_LOGGED_OUT_KEY, "true");
    }
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") window.dispatchEvent(new Event("eventviet_user_auth_changed"));
  } catch (e) {
    console.error("Lỗi cập nhật user session:", e);
  }
}

export function loginClientUser(name: string, phone: string, email?: string): ClientUser {
  const newUser: ClientUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: (email || `${phone.trim()}@guest.eventviet.vn`).trim(),
  };
  setClientUser(newUser);
  return newUser;
}

export function logoutClientUser(): void {
  setClientUser(null);
}
