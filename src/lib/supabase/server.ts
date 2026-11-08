import "server-only";

import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thiếu biến môi trường ${name}. Hãy thêm biến này vào .env.local.`);
  }
  return value;
}

function supabaseProjectUrl(): string {
  const rawUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  try {
    // Chỉ giữ origin. Nhờ đó URL copy nhầm kèm `/rest/v1` vẫn không tạo thành
    // đường dẫn lỗi `/rest/v1/rest/v1` khi supabase-js gọi Data API.
    return new URL(rawUrl).origin;
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL không phải URL Supabase hợp lệ.");
  }
}

/**
 * Client chỉ dùng trong Route Handler/server code. Service role bỏ qua RLS,
 * vì vậy không được import module này trong Client Component.
 */
export function createServerSupabaseClient() {
  return createClient(
    supabaseProjectUrl(),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
