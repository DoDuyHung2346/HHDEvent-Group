"use client";

import { useState, useEffect, useRef } from "react";
import {
  uploadDocumentToRAG,
  getIngestJobStatus,
  RAGRequestError,
  type IngestJob,
} from "@/lib/rag/api";

interface DocumentIngestModalProps {
  isOpen: boolean;
  file: File | null;
  docType?: string;
  onClose: () => void;
  onComplete: () => void;
  onViewChunks?: (docId: string, filename: string) => void;
}

interface PipelineStageInfo {
  key: "validate" | "parse" | "chunk" | "embed" | "index";
  label: string;
  desc: string;
  icon: string;
}

const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    key: "validate",
    label: "1. Xác Thực & Kiểm Tra Tệp",
    desc: "Kiểm tra kích thước (<20MB), định dạng tệp, cấu trúc SHA-256",
    icon: "verified_user",
  },
  {
    key: "parse",
    label: "2. Bóc Tách Văn Bản (Parsing)",
    desc: "Trích xuất văn bản thô, bảng biểu, metadata từ PDF/DOCX/XLSX/MD",
    icon: "document_scanner",
  },
  {
    key: "chunk",
    label: "3. Phân Đoạn & Chunking",
    desc: "Chiến lược phân mảnh (FAQ/Package/Policy), MinHash lọc trùng & Parent-Child",
    icon: "splitscreen",
  },
  {
    key: "embed",
    label: "4. Vector Embedding",
    desc: "Tạo vector ngữ nghĩa theo cấu hình embedding cho từng chunk theo lô (batch)",
    icon: "hub",
  },
  {
    key: "index",
    label: "5. Lưu Trữ DB & Chỉ Mục Vector",
    desc: "Lưu SQLite, đồng bộ Qdrant Vector Collection và cập nhật BM25s",
    icon: "database",
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DocumentIngestModal({
  isOpen,
  file,
  docType,
  onClose,
  onComplete,
  onViewChunks,
}: DocumentIngestModalProps) {
  const [job, setJob] = useState<IngestJob | null>(null);
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: "info" | "warn" | "error" | "success" }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canCreateNewVersion, setCanCreateNewVersion] = useState(false);
  const lastProgressRef = useRef<string>("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isStartedRef = useRef(false);

  const addLog = (text: string, type: "info" | "warn" | "error" | "success" = "info") => {
    const time = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [...prev, { time, text, type }]);
  };

  const startPipeline = async (force = false) => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);
    setCanCreateNewVersion(false);
    setLogs([]);
    lastProgressRef.current = "";
    if (file.size === 0) {
      setIsUploading(false);
      setErrorMessage("Tệp đang có kích thước 0 byte. Vui lòng chọn lại tệp gốc.");
      return;
    }
    addLog(`Bắt đầu tải lên tệp "${file.name}" (${formatFileSize(file.size)})...`);

    try {
      const uploadRes = await uploadDocumentToRAG(file, docType, undefined, force);
      addLog(`Tệp đã tải lên thành công. Job ID: #${uploadRes.job_id}. Đang phân phối vào hàng đợi xử lý...`, "info");

      setJob({
        job_id: uploadRes.job_id,
        doc_id: uploadRes.doc_id,
        filename: file.name,
        status: "running",
        stage: "validate",
        progress: 0.1,
        n_chunks: 0,
        chunks_embedded: 0,
        chunks_indexed: 0,
      });

      // Bắt đầu poll tiến trình Ingestion từ backend
      let attempts = 0;
      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        try {
          const currentJob = await getIngestJobStatus(uploadRes.job_id);
          setJob(currentJob);

          const progressKey = `${currentJob.stage}:${currentJob.chunks_embedded}:${currentJob.chunks_indexed}`;
          if (progressKey !== lastProgressRef.current) {
            lastProgressRef.current = progressKey;
            if (currentJob.stage === "chunk" && currentJob.n_chunks > 0) {
              addLog(`Đã tạo ${currentJob.n_chunks} chunk hợp lệ từ tài liệu.`, "info");
            } else if (currentJob.stage === "embed" && currentJob.n_chunks > 0) {
              addLog(`Đã embedding ${currentJob.chunks_embedded}/${currentJob.n_chunks} chunk...`, "info");
            } else if (currentJob.stage === "index" && currentJob.n_chunks > 0) {
              addLog(`Đã ghi ${currentJob.chunks_indexed}/${currentJob.n_chunks} vector vào Qdrant, đang xác thực SQLite/BM25...`, "info");
            }
          }

          if (currentJob.stage === "parse") {
            addLog("Đang bóc tách nội dung văn bản và làm sạch ký tự thừa...", "info");
          } else if (currentJob.stage === "quality") {
            addLog("Kiểm tra chất lượng văn bản, lọc nhiễu & phát hiện trùng lặp...", "info");
          } else if (currentJob.stage === "chunk") {
            addLog("Đang áp dụng thuật toán Chunking thông minh theo cấu trúc tài liệu...", "info");
          } else if (currentJob.stage === "embed") {
            addLog("Đang chạy mô hình Embedding để tạo vector ngữ nghĩa cho từng chunk...", "info");
          } else if (currentJob.stage === "index") {
            addLog("Đang lưu trữ vào SQLite Database, chỉ mục Qdrant Vector và BM25...", "info");
          }

          if (currentJob.status === "ready") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsUploading(false);
            addLog(`🎉 Hoàn tất: ${currentJob.n_chunks} chunks, ${currentJob.chunks_embedded} embeddings và ${currentJob.chunks_indexed} vectors đã sẵn sàng cho Chatbot.`, "success");
            onComplete();
          } else if (currentJob.status === "failed") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsUploading(false);
            const err = currentJob.error || "Xử lý tài liệu thất bại tại backend";
            setErrorMessage(err);
            addLog(`❌ Thất bại: ${err}`, "error");
          }

          // Timeout an toàn 60 giây
          if (attempts > 120) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsUploading(false);
            setErrorMessage("Quá thời gian chờ xử lý tài liệu (Timeout > 60s).");
            addLog("⚠️ Tiến trình bị quá thời gian chờ.", "warn");
          }
        } catch (err: any) {
          console.error("Lỗi polling job:", err);
        }
      }, 600);
    } catch (err: unknown) {
      setIsUploading(false);
      const message = err instanceof Error ? err.message : "Không thể kết nối Backend RAG";
      const canReplace = err instanceof RAGRequestError && err.status === 409;
      setCanCreateNewVersion(canReplace);
      setErrorMessage(message);
      addLog(`Lỗi tải lên: ${message}`, "error");
    }
  };

  useEffect(() => {
    if (isOpen && file && !isStartedRef.current) {
      isStartedRef.current = true;
      startPipeline();
    }
    if (!isOpen) {
      isStartedRef.current = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setJob(null);
      setLogs([]);
      setErrorMessage(null);
      setCanCreateNewVersion(false);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  // Tính trạng thái của từng stage
  const getStageStatus = (stageKey: PipelineStageInfo["key"]) => {
    if (!job) return "pending";
    if (job.status === "failed") {
      if (job.stage === stageKey) return "failed";
      return "pending";
    }
    if (job.status === "ready") return "completed";

    const order: Array<PipelineStageInfo["key"]> = ["validate", "parse", "chunk", "embed", "index"];
    const currentIdx = order.indexOf(
      job.stage === "quality" ? "chunk" : (job.stage as any)
    );
    const targetIdx = order.indexOf(stageKey);

    if (currentIdx > targetIdx) return "completed";
    if (currentIdx === targetIdx) return "active";
    return "pending";
  };

  const progressPercent = job
    ? job.status === "ready"
      ? 100
      : Math.round(job.progress * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">auto_stories</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Tiến Trình Xử Lý Tài Liệu RAG</span>
                {job?.status === "ready" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Thành công 100%
                  </span>
                )}
                {job?.status === "failed" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                    Thất bại
                  </span>
                )}
                {isUploading && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
                    Đang xử lý
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {file.name} ({formatFileSize(file.size)})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Overall Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-purple-600">hourglass_top</span>
                <span>Tiến trình hoàn thiện pipeline:</span>
              </span>
              <span className="font-mono text-purple-700 text-sm">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  job?.status === "failed"
                    ? "bg-red-500"
                    : job?.status === "ready"
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse"
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {job && job.n_chunks > 0 && (
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><b>{job.n_chunks}</b><br />Chunks</div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-2"><b>{job.chunks_embedded}/{job.n_chunks}</b><br />Embedded</div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-2"><b>{job.chunks_indexed}/{job.n_chunks}</b><br />Indexed</div>
            </div>
          )}

          {/* Pipeline Stages Stepper */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-[11px] text-slate-500">
              Các giai đoạn Ingestion & Lưu trữ
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {PIPELINE_STAGES.map((stg) => {
                const status = getStageStatus(stg.key);
                const isCompleted = status === "completed";
                const isActive = status === "active";
                const isFailed = status === "failed";

                return (
                  <div
                    key={stg.key}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isCompleted
                        ? "bg-emerald-50/50 border-emerald-200 text-slate-800"
                        : isActive
                        ? "bg-purple-50/60 border-purple-300 ring-1 ring-purple-400 text-slate-900 shadow-xs"
                        : isFailed
                        ? "bg-red-50 border-red-200 text-red-900"
                        : "bg-slate-50/60 border-slate-200 text-slate-400 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isActive
                          ? "bg-purple-600 text-white animate-spin"
                          : isFailed
                          ? "bg-red-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isCompleted ? "check" : isActive ? "sync" : isFailed ? "priority_high" : stg.icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{stg.label}</span>
                        <span className="text-[10px] font-mono uppercase font-semibold">
                          {isCompleted
                            ? "✓ Đã xong"
                            : isActive
                            ? "Đang chạy..."
                            : isFailed
                            ? "Thất bại"
                            : "Chờ"}
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5 leading-relaxed text-slate-500">
                        {stg.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] shrink-0 text-red-600">error</span>
              <div>
                <p className="font-bold">Lỗi xử lý tài liệu</p>
                <p className="text-[11px] mt-0.5">{errorMessage}</p>
                {canCreateNewVersion ? (
                  <button
                    type="button"
                    onClick={() => startPipeline(true)}
                    className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Tải lại thành phiên bản mới
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startPipeline()}
                    className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Thử lại quy trình
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Live Ingestion Log Console */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
              <span>Nhật ký xử lý chi tiết (Live Logs)</span>
              <span className="font-mono text-[10px]">{logs.length} sự kiện</span>
            </div>
            <div className="p-3 bg-slate-950 text-slate-200 font-mono rounded-xl max-h-40 overflow-y-auto space-y-1 text-[11px]">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span
                    className={
                      log.type === "success"
                        ? "text-emerald-400 font-bold"
                        : log.type === "error"
                        ? "text-red-400 font-bold"
                        : log.type === "warn"
                        ? "text-amber-300"
                        : "text-slate-200"
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Qdrant Vector Store & SQLite Database</span>
          </div>

          <div className="flex items-center gap-2">
            {job?.status === "ready" && job.doc_id && onViewChunks && (
              <button
                type="button"
                onClick={() => onViewChunks(job.doc_id, file.name)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Xem danh sách Chunks đã tạo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer text-xs"
            >
              {job?.status === "ready" ? "Hoàn tất & Đóng" : "Đóng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
