import { NextResponse } from "next/server";
import { getAISafeStatus } from "@/lib/ai/config";

const backendUrl =
  process.env.NEXT_PUBLIC_RAG_BACKEND_URL || "http://127.0.0.1:8000";

/** Returns diagnostics only. API keys and tokens are never returned. */
export async function GET() {
  let backend: Record<string, unknown> = { reachable: false };

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

  return NextResponse.json({
    checked_at: new Date().toISOString(),
    backend_url: backendUrl,
    fallback: getAISafeStatus(),
    backend,
  });
}
