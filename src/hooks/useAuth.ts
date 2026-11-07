"use client";

import { useState, useEffect, useCallback } from "react";
import { getClientUser, setClientUser, loginClientUser, logoutClientUser, type ClientUser } from "@/lib/auth/userAuth";
import { getAdminSession, setAdminSession, authenticateAdmin, logoutAdmin, type AdminAccount } from "@/lib/auth/adminAuth";

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

  const logoutUser = useCallback(() => {
    logoutClientUser();
    setUser(null);
  }, []);

  // Admin functions
  const loginAdmin = useCallback((email: string, pass: string) => {
    const res = authenticateAdmin(email, pass);
    if (res.success && res.admin) {
      setAdmin(res.admin);
    }
    return res;
  }, []);

  const logoutAdminAccount = useCallback(() => {
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
