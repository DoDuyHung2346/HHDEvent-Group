import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "eventhhd_admin_session";

function configuredAdminEmail() {
  return (process.env.ADMIN_LOGIN_EMAIL || "admin@eventhhd.vn").trim().toLowerCase();
}

function configuredAdminPassword() {
  return process.env.ADMIN_LOGIN_PASSWORD || "admin2026";
}

function sameSecret(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidAdminCredential(email: string, password: string) {
  return email.trim().toLowerCase() === configuredAdminEmail()
    && sameSecret(password, configuredAdminPassword());
}

export async function hasAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const secret = process.env.ADMIN_TOKEN;
  return Boolean(token && secret && sameSecret(token, secret));
}

export async function createAdminSession() {
  const secret = process.env.ADMIN_TOKEN;
  if (!secret) throw new Error("Thiếu ADMIN_TOKEN trên server.");
  (await cookies()).set(ADMIN_SESSION_COOKIE, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  (await cookies()).set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
