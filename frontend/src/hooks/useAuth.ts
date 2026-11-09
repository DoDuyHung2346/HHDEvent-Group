"use client";

import { useState, useEffect, useCallback } from "react";
import { getClientUser, setClientUser, loginClientUser, logoutClientUser, type ClientUser } from "@/lib/auth/userAuth";
import { getAdminSession, setAdminSession, authenticateAdmin, logoutAdmin, type AdminAccount } from "@/lib/auth/adminAuth";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export function useAuth() {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setUser(getClientUser());
    setAdmin(getAdminSession());
    setIsLoaded(true);

    const handleUserChange = () => setUser(getClientUser());
    const handleAdminChange = () => setAdmin(getAdminSession());

    window.addEventListener("eventviet_user_auth_changed", handleUserChange);
    window.addEventListener("eventviet_admin_auth_changed", handleAdminChange);

    return () => {
      window.removeEventListener("eventviet_user_auth_changed", handleUserChange);
      window.removeEventListener("eventviet_admin_auth_changed", handleAdminChange);
    };
  }, []);

  // Client user functions
  const loginUser = useCallback((name: string, phone: string, email?: string) => {
    const u = loginClientUser(name, phone, email);
    setUser(u);
    return u;
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await getBrowserSupabaseClient().auth.signOut();
    } catch {
      // Vẫn xóa phiên giao diện nếu máy đang offline hoặc thiếu cấu hình Auth.
    } finally {
      logoutClientUser();
      setUser(null);
    }
  }, []);

  // Admin functions
  const loginAdmin = useCallback(async (email: string, pass: string): Promise<ReturnType<typeof authenticateAdmin>> => {
    const res = authenticateAdmin(email, pass);
    if (!res.success || !res.admin) return res;

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, error: typeof body.error === "string" ? body.error : "Không thể tạo phiên quản trị." };
      }
      setAdmin(res.admin);
      return res;
    } catch {
      return { success: false, error: "Không thể kết nối máy chủ để xác thực quản trị." };
    }
  }, []);

  const logoutAdminAccount = useCallback(() => {
    void fetch("/api/admin/session", { method: "DELETE" });
    logoutAdmin();
    setAdmin(null);
  }, []);

  return {
    user,
    isUserLoggedIn: !!user,
    loginUser,
    logoutUser,

    admin,
    isAdminLoggedIn: !!admin,
    loginAdmin,
    logoutAdminAccount,

    isLoaded,
  };
}
