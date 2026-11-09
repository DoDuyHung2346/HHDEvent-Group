import { NextResponse } from "next/server";
import { getAISafeStatus } from "@/lib/ai/config";

const backendUrl =
  process.env.RAG_BACKEND_URL || "http://127.0.0.1:8000";

/** Returns diagnostics only. API keys and tokens are never returned. */
export async function GET() {
  let backend: Record<string, unknown> = { reachable: false };
  let usage: Record<string, unknown> = {
    available: false,
    error: "Chưa kiểm tra thống kê token.",
  };

  try {
    const response = await fetch(`${backendUrl}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    const health = await response.json().catch(() => null);
    backend = {
      reachable: response.ok,
      http_status: response.status,
      status: health?.status ?? null,
      llm: health?.llm ?? null,
      embedder: health?.embedder ?? null,
      embedding_config_error: health?.embedding_config_error ?? null,
    };
  } catch {
    backend = {
      reachable: false,
      error: "Không thể kết nối RAG backend tại " + backendUrl,
    };
  }

  // Token được backend ghi theo từng trace. Gọi qua server-side route để token
  // quản trị không bao giờ được gửi xuống trình duyệt.
  if (backend.reachable) {
    try {
      const adminToken = process.env.ADMIN_TOKEN;
      const metricsResponse = await fetch(`${backendUrl}/api/admin/metrics?days=30`, {
        cache: "no-store",
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
        signal: AbortSignal.timeout(3_000),
      });
      if (metricsResponse.ok) {
        const metrics = await metricsResponse.json();
        usage = {
          available: true,
          ...(metrics.llm_usage ?? {}),
          kb_health: metrics.kb_health ?? {},
          cost: metrics.cost ?? {},
        };
      } else {
        usage = { available: false, error: `Không tải được thống kê token (HTTP ${metricsResponse.status}).` };
      }
    } catch {
      usage = { available: false, error: "Không thể kết nối endpoint thống kê token." };
    }
  }

  return NextResponse.json({
    checked_at: new Date().toISOString(),
    backend_url: backendUrl,
    fallback: getAISafeStatus(),
    backend,
    usage,
  });
}
