"use client";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "event_manager";
}

const ADMIN_SESSION_KEY = "eventviet_admin_session";

export function getAdminSession(): AdminAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminAccount;
  } catch {
    return null;
  }
}

export function setAdminSession(admin: AdminAccount | null): void {
  if (typeof window === "undefined") return;
  try {
    if (admin) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    window.dispatchEvent(new Event("eventviet_admin_auth_changed"));
  } catch (e) {
    console.error("Lỗi cập nhật admin session:", e);
  }
}

export function authenticateAdmin(email: string, password: string): { success: boolean; error?: string; admin?: AdminAccount } {
  const cleanEmail = email.trim().toLowerCase();
  // Giữ email cũ để các phiên demo trước vẫn dùng được, đồng thời đồng bộ
  // với giao diện EventHHD hiện tại.
  if (cleanEmail !== "admin@eventhhd.vn" && cleanEmail !== "admin@eventviet.vn" && cleanEmail !== "admin") {
    return { success: false, error: "Tài khoản quản trị không tồn tại trong hệ thống." };
  }

  if (password !== "admin2026" && password !== "admin123") {
    return { success: false, error: "Mật khẩu xác thực quản trị viên không chính xác." };
  }

  const adminAccount: AdminAccount = {
    id: "adm-01",
    name: "Ban Điều Hành EventHHD",
    email: "admin@eventhhd.vn",
    role: "superadmin",
  };

  setAdminSession(adminAccount);
  return { success: true, admin: adminAccount };
}

export function logoutAdmin(): void {
  setAdminSession(null);
}
