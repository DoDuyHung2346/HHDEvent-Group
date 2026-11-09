import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const RAG_BACKEND_URL = process.env.RAG_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * The document metadata lives in Supabase PostgreSQL in cloud mode.  This
 * read-only fallback lets the deployed Admin UI show the seeded knowledge base
 * during a temporary FastAPI outage; it does not pretend that vector retrieval
 * or ingestion can run without the RAG service.
 */
async function readCloudMetadata(path: string[]) {
  const supabase = createServerSupabaseClient();
  if (path.length === 2 && path[0] === "kb" && path[1] === "documents") {
    const { data, error } = await supabase
      .from("documents")
      .select("doc_id, filename, title, doc_type, version, status, size_bytes, uploaded_at, n_chunks, warnings_json, active")
      .eq("active", 1)
      .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json((data ?? []).map((document) => ({
      ...document,
      warnings: JSON.parse(document.warnings_json || "[]"),
    })));
  }

  if (path.length === 4 && path[0] === "kb" && path[1] === "documents" && path[3] === "chunks") {
    const { data, error } = await supabase
      .from("chunks")
      .select("chunk_id, doc_id, ordinal, parent_id, breadcrumb, text_display, tokens_vi")
      .eq("doc_id", path[2])
      .eq("active", 1)
      .order("ordinal", { ascending: true });
    if (error) throw error;
    return NextResponse.json((data ?? []).map((chunk) => ({
      chunk_id: chunk.chunk_id,
      doc_id: chunk.doc_id,
      chunk_index: chunk.ordinal,
      parent_id: chunk.parent_id || undefined,
      section_path: chunk.breadcrumb || undefined,
      text_display: chunk.text_display,
      token_count: String(chunk.tokens_vi || "").trim().split(/\s+/).filter(Boolean).length,
    })));
  }

  return null;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(`/api/${path.map(encodeURIComponent).join("/")}`, RAG_BACKEND_URL);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const token = process.env.ADMIN_TOKEN;
  if (token) headers.set("authorization", `Bearer ${token}`);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
    const responseHeaders = new Headers();
    const responseType = upstream.headers.get("content-type");
    if (responseType) responseHeaders.set("content-type", responseType);
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    if (request.method === "GET") {
      try {
        const metadata = await readCloudMetadata(path);
        if (metadata) return metadata;
      } catch {
        // The generic service-unavailable response below is intentionally
        // returned without database/provider details.
      }
    }
    return NextResponse.json({ detail: "Không thể kết nối RAG backend. Vui lòng kiểm tra dịch vụ backend." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
