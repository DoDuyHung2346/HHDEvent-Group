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

const BACKEND_URL = process.env.NEXT_PUBLIC_RAG_BACKEND_URL || "http://127.0.0.1:8000";
// Local development token. For production, replace the browser upload path
// with a server-side proxy so this value is never exposed to the client.
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_RAG_ADMIN_TOKEN || "eventviet-local-admin-token";

/**
 * Kiểm tra tình trạng kết nối tới Backend RAG
 */
export async function checkRAGHealth(): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
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
  title?: string
): Promise<{ job_id: string; doc_id: string; status: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (docType) formData.append("doc_type", docType);
  if (title) formData.append("title", title);

  const res = await fetch(`${BACKEND_URL}/api/kb/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Lỗi tải lên tài liệu (${res.status})`);
  }

  return res.json();
}

/**
 * Lấy trạng thái tiến trình Ingestion Job (Validation -> Parse -> Quality -> Chunk -> Embed -> Index -> Ready)
 */
export async function getIngestJobStatus(jobId: string): Promise<IngestJob> {
  const res = await fetch(`${BACKEND_URL}/api/kb/jobs/${jobId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
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
  const res = await fetch(`${BACKEND_URL}/api/kb/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
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
  const res = await fetch(`${BACKEND_URL}/api/kb/documents/${docId}/chunks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
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
  const res = await fetch(`${BACKEND_URL}/api/kb/documents/${docId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Không thể xóa tài liệu (${res.status})`);
  }
  return true;
}
