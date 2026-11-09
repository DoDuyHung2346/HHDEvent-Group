"use client";

export interface RAGDocument {
  doc_id: string;
  filename: string;
  title: string;
  doc_type: string;
  version: number;
  status: "queued" | "running" | "ready" | "failed";
  size_bytes: number;
  uploaded_at: string;
  n_chunks: number;
  warnings?: string[];
  active: number;
}

export interface IngestJob {
  job_id: string;
  doc_id: string;
  filename: string;
  status: "queued" | "running" | "ready" | "failed";
  stage: "validate" | "parse" | "quality" | "chunk" | "embed" | "index" | "done";
  progress: number; // 0.0 -> 1.0
  error?: string | null;
  warnings?: string[];
  n_chunks: number;
  chunks_embedded: number;
  chunks_indexed: number;
}

export interface RAGChunk {
  chunk_id: string;
  doc_id: string;
  chunk_index: number;
  section_path?: string;
  text_display: string;
  token_count: number;
  parent_id?: string;
}

// Tất cả request từ trình duyệt đi qua Next.js proxy. Nhờ vậy browser không
// cần biết địa chỉ nội bộ hoặc token quản trị của RAG backend.
const BACKEND_URL = "/api/rag";

export class RAGRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly existingDocId?: string,
  ) {
    super(message);
    this.name = "RAGRequestError";
  }
}

function getErrorDetail(errorData: unknown, fallback: string): { message: string; code?: string; existingDocId?: string } {
  if (!errorData || typeof errorData !== "object") return { message: fallback };
  const detail = "detail" in errorData ? errorData.detail : errorData;
  if (typeof detail === "string") return { message: detail };
  if (detail && typeof detail === "object") {
    const value = detail as { message?: unknown; code?: unknown; doc_id?: unknown };
    return {
      message: typeof value.message === "string" ? value.message : fallback,
      code: typeof value.code === "string" ? value.code : undefined,
      existingDocId: typeof value.doc_id === "string" ? value.doc_id : undefined,
    };
  }
  return { message: fallback };
}

/**
 * Kiểm tra tình trạng kết nối tới Backend RAG
 */
export async function checkRAGHealth(): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: data.status || "healthy" };
    }
    return { ok: false, message: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, message: "Không thể kết nối Backend RAG (cần bật uvicorn)" };
  }
}

/**
 * Tải tài liệu lên Backend RAG để chạy pipeline Ingestion
 */
export async function uploadDocumentToRAG(
  file: File,
  docType?: string,
  title?: string,
  force = false,
): Promise<{ job_id: string; doc_id: string; status: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (docType) formData.append("doc_type", docType);
  if (title) formData.append("title", title);
  if (force) formData.append("force", "true");

  const res = await fetch(`${BACKEND_URL}/kb/documents`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const detail = getErrorDetail(errorData, `Lỗi tải lên tài liệu (${res.status})`);
    throw new RAGRequestError(detail.message, res.status, detail.code, detail.existingDocId);
  }

  return res.json();
}

/**
 * Lấy trạng thái tiến trình Ingestion Job (Validation -> Parse -> Quality -> Chunk -> Embed -> Index -> Ready)
 */
export async function getIngestJobStatus(jobId: string): Promise<IngestJob> {
  const res = await fetch(`${BACKEND_URL}/kb/jobs/${jobId}`, {
    method: "GET",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Không tìm thấy tiến trình job ${jobId}`);
  }

  return res.json();
}

/**
 * Lấy danh sách tài liệu đã index trong Backend RAG
 */
export async function listRAGDocuments(): Promise<RAGDocument[]> {
  const res = await fetch(`${BACKEND_URL}/kb/documents`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Lỗi lấy danh sách tài liệu từ RAG Backend (${res.status})`);
  }

  return res.json();
}

/**
 * Lấy danh sách các chunks của tài liệu cụ thể
 */
export async function getRAGDocumentChunks(docId: string): Promise<RAGChunk[]> {
  const res = await fetch(`${BACKEND_URL}/kb/documents/${docId}/chunks`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Lỗi lấy chunks của tài liệu ${docId}`);
  }

  return res.json();
}

/**
 * Xóa tài liệu khỏi Backend RAG (xóa SQLite, Qdrant Vector và BM25 Index)
 */
export async function deleteRAGDocument(docId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_URL}/kb/documents/${docId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Không thể xóa tài liệu (${res.status})`);
  }
  return true;
}
