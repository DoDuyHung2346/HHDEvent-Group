"use client";

import { AuthUser, DEFAULT_USER, DEFAULT_ADMIN } from "./types";

const AUTH_STORAGE_KEY = "eventviet_current_user";

export function getCurrentUser(): AuthUser {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      // Mặc định ban đầu là vai trò User (khách hàng)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(raw) as AuthUser;
  } catch {
    return DEFAULT_USER;
  }
}

export function setCurrentUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("eventviet_auth_changed"));
  } catch (e) {
    console.error("Lỗi lưu thông tin user:", e);
  }
}

export function switchRole(role: "user" | "admin"): AuthUser {
  const newUser = role === "admin" ? DEFAULT_ADMIN : DEFAULT_USER;
  setCurrentUser(newUser);
  return newUser;
}

export function logoutUser(): void {
  setCurrentUser(DEFAULT_USER);
}
