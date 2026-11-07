"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  loadBookings,
  saveBookings,
  updateBookingStatus,
  deleteProcessedBooking,
} from "@/lib/booking/storage";
import type { Booking } from "@/lib/schemas";
import {
  loadPricingConfig,
  savePricingConfig,
  resetPricingConfig,
  type PackagePricingConfig,
} from "@/lib/services/packageStorage";
import {
  loadDocuments,
  removeDocument,
  loadCompanyProfile,
  saveCompanyProfile,
  type CompanyDocument,
  type CompanyProfile,
} from "@/lib/services/documentStorage";
import { faqs as initialFaqs } from "@/lib/kb/faq.data";
import StaffManagement from "@/components/admin/StaffManagement";
import LoginHistoryModal from "@/components/admin/LoginHistoryModal";
import DocumentIngestModal from "@/components/admin/DocumentIngestModal";
import DocumentChunksModal from "@/components/admin/DocumentChunksModal";
import {
  checkRAGHealth,
  listRAGDocuments,
  deleteRAGDocument,
  type RAGDocument,
} from "@/lib/rag/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, isAdminLoggedIn, logoutAdminAccount, isLoaded } = useAuth();

  // Tab State: analytics | crm | documents | pricing | faq | company_info
  const [activeTab, setActiveTab] = useState<"analytics" | "crm" | "staff" | "documents" | "pricing" | "faq" | "company_info">("analytics");

  // CRM Bookings State
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "processed">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Confirm Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Pricing State
  const [pricingConfig, setPricingConfig] = useState<PackagePricingConfig>(() => loadPricingConfig());
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState("");

  // FAQ State
  const [faqsList, setFaqsList] = useState(initialFaqs);
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [newFaqTags, setNewFaqTags] = useState("");

  // Documents & Company Profile State
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => loadCompanyProfile());
  const [companyProfileSaved, setCompanyProfileSaved] = useState(false);

  // RAG Backend State & Modals
  const [ragDocs, setRagDocs] = useState<RAGDocument[]>([]);
  const [isRagOnline, setIsRagOnline] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [viewChunksDoc, setViewChunksDoc] = useState<{ docId: string; filename: string } | null>(null);
  const [isLoginHistoryOpen, setIsLoginHistoryOpen] = useState(false);

  // Mocked Real-time Chatbot Logs for Analytics
  const [recentBotLogs] = useState([
    { id: "log-1", query: "Chi phí tổ chức tiệc tri ân khách hàng 200 khách?", matchedFaq: "faq-03 (Báo giá)", score: 8, source: "ai", time: "14:22", result: "Thành công (Hiển thị Ma trận 3 gói)" },
    { id: "log-2", query: "Có cho thuê trực thăng và phi cơ riêng đón khách VIP?", matchedFaq: "None (< ngưỡng)", score: 0, source: "mock", time: "14:24", result: "Out-of-scope -> Kích hoạt Form Đặt Lịch" },
    { id: "log-3", query: "Thời gian chuẩn bị tối thiểu cho gala dinner?", matchedFaq: "faq-04 (Thời gian)", score: 9, source: "ai", time: "15:05", result: "Thành công (Tư vấn 2-4 tuần)" },
    { id: "log-4", query: "Bên bạn có hỗ trợ âm thanh ánh sáng L'Acoustics K2?", matchedFaq: "faq-06 (Thiết bị)", score: 10, source: "ai", time: "15:40", result: "Thành công (Đưa thông số kỹ thuật)" },
    { id: "log-5", query: "Chính sách đặt cọc và thanh toán hợp đồng ra sao?", matchedFaq: "faq-08 (Đặt cọc)", score: 7, source: "ai", time: "16:12", result: "Thành công (Tư vấn 3 đợt cọc)" },
  ]);

  const refreshRAGDocs = () => {
    checkRAGHealth().then((res) => {
      setIsRagOnline(res.ok);
      if (res.ok) {
        listRAGDocuments()
          .then((docs) => setRagDocs(docs))
          .catch((e) => console.error("Lỗi tải danh sách RAG docs:", e));
      }
    });
  };

  useEffect(() => {
    setBookingsList(loadBookings().bookings);
    setPricingConfig(loadPricingConfig());
    setDocuments(loadDocuments());
    setCompanyProfile(loadCompanyProfile());
    refreshRAGDocs();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── CRM Handlers ───────────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    return bookingsList.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        b.name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.eventType && b.eventType.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ? true : b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [bookingsList, searchQuery, statusFilter]);

  const handleMarkProcessed = (id: string) => {
    updateBookingStatus(id, "processed");
    const { bookings } = loadBookings();
    setBookingsList(bookings);
    showToast(`Đã duyệt lịch hẹn #${id}`);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const ok = deleteProcessedBooking(deleteConfirmId);
    if (ok) {
      const { bookings } = loadBookings();
      setBookingsList(bookings);
      showToast(`Đã xóa lịch hẹn #${deleteConfirmId}`);
    } else {
      showToast("Chỉ xóa được lịch hẹn đã xử lý xong!");
    }
    setDeleteConfirmId(null);
  };

  const handleExportCSV = () => {
    const headers = "Mã,Họ Tên,Số Điện Thoại,Ngày Hẹn,Khung Giờ,Loại Sự Kiện,Trạng Thái,Ghi Chú\n";
    const rows = bookingsList
      .map(
        (b) =>
          `"${b.id}","${b.name}","${b.phone}","${b.date}","${b.time}","${b.eventType || ""}","${b.status}","${b.notes || ""}"`
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lich-hen-EventViet-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã xuất danh sách lịch hẹn sang file CSV!");
  };

  // ── Pricing Handlers ───────────────────────────────────────────────────────
  const handleSavePricing = () => {
    savePricingConfig(pricingConfig);
    setPricingSuccessMsg("Đã đồng bộ biểu phí mới sang website và Chatbot!");
    setTimeout(() => setPricingSuccessMsg(""), 3500);
  };

  const handleResetPricing = () => {
    if (confirm("Khôi phục toàn bộ biểu phí về mặc định ban đầu?")) {
      const reset = resetPricingConfig();
      setPricingConfig(reset);
      showToast("Đã khôi phục biểu phí mặc định thành công");
    }
  };

  // ── FAQ Handlers ───────────────────────────────────────────────────────────
  const handleAddNewFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;

    const newFaq = {
      id: `faq-${Date.now()}`,
      question: newFaqQ.trim(),
      answer: newFaqA.trim(),
      tags: newFaqTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      followups: [
        "Xem bảng giá chi tiết?",
        "Thời gian chuẩn bị sự kiện?",
        "Đặt lịch tư vấn trực tiếp?",
      ],
    };

    setFaqsList((prev) => [newFaq, ...prev]);
    setIsAddFaqOpen(false);
    setNewFaqQ("");
    setNewFaqA("");
    setNewFaqTags("");
    showToast("Đã thêm FAQ mới vào kho tri thức thành công!");
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm("Xóa câu hỏi này khỏi kho kiến thức của Chatbot?")) {
      setFaqsList((prev) => prev.filter((f) => f.id !== id));
      showToast("Đã xóa câu hỏi khỏi kho tri thức");
    }
  };

  // ── Documents Handlers ─────────────────────────────────────────────────────
  const handleUploadNewDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mở modal tiến trình Ingestion RAG (Chunking, Embedding, Qdrant & SQLite)
    setSelectedUploadFile(file);
    setIsIngestModalOpen(true);

    // Do not create a local “success” record here. The document is shown as
    // ready only after the backend verifies chunks, embeddings, Qdrant and
    // BM25, then returns job.status === "ready".
    e.target.value = "";
  };

  const handleDeleteRAGDoc = async (docId: string, filename: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài liệu "${filename}" khỏi kho tri thức RAG (xóa cả SQLite, Qdrant và BM25s)?`)) {
      try {
        const ok = await deleteRAGDocument(docId);
        if (ok) {
          showToast(`Đã xóa tài liệu "${filename}" thành công.`);
          refreshRAGDocs();
        } else {
          showToast("Không thể xóa tài liệu từ Backend.");
        }
      } catch (err: any) {
        showToast(`Lỗi xóa tài liệu: ${err.message}`);
      }
    }
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm("Xóa tài liệu này khỏi hệ thống?")) {
      removeDocument(id);
      setDocuments(loadDocuments());
      showToast("Đã xóa tài liệu thành công");
    }
  };

  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyProfile(companyProfile);
    setCompanyProfileSaved(true);
    setTimeout(() => setCompanyProfileSaved(false), 3000);
    showToast("Đã lưu cập nhật thông tin doanh nghiệp!");
  };

  const handleLogout = () => {
    logoutAdminAccount();
    router.push("/");
  };

  // ── BẢO VỆ CHẶN TRUY CẬP ADMIN ─────────────────────────────────────────────
  if (isLoaded && !isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Yêu Cầu Quyền Quản Trị Viên</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Bạn chưa đăng nhập Cổng Quản Trị Hệ Thống. Vui lòng quay lại trang mở đầu để xác thực quyền quản trị.
            </p>
          </div>
          <Link
            href="/login?role=admin"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Về Cổng Đăng Nhập Quản Trị</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── GIAO DIỆN QUẢN TRỊ ADMIN CHÍNH THỨC ────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      {/* ── ADMIN DEDICATED TOP HEADER ────────────────────────────────────── */}
      <header className="w-full z-50 bg-slate-950 text-white shadow-md border-b border-slate-800 sticky top-0 shrink-0">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              EV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  EventViet
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                  PORTAL QUẢN TRỊ NỘI BỘ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Giám Sát Chatbot, CRM Lịch Hẹn & Tài Liệu Doanh Nghiệp</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Nút Xem Lịch Sử Đăng Nhập */}
            <button
              type="button"
              onClick={() => setIsLoginHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs font-semibold border border-purple-800 transition-colors cursor-pointer"
              title="Xem nhật ký lịch sử các lần đăng nhập hệ thống"
            >
              <span className="material-symbols-outlined text-[16px] text-purple-400">manage_history</span>
              <span className="hidden sm:inline">Nhật Ký Đăng Nhập</span>
            </button>

            <Link
              href="/customer"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              title="Mở giao diện khách hàng trong tab mới để kiểm tra"
            >
              <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              <span>Xem Web Khách Hàng</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{admin?.name || "Ban Quản Trị"}</span>
                <span className="text-[10px] text-slate-400 font-mono">{admin?.email}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Đăng xuất khỏi bảng điều khiển"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="hidden sm:inline">Đăng Xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── ADMIN NAVIGATION TABS (5 PHÂN HỆ RÕ RÀNG) ────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5">
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">monitoring</span>
              <span>Thông Số & Tỉ Lệ Chatbot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("crm")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "crm"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">support_agent</span>
              <span>Giám Sát Lịch Hẹn CRM</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                {bookingsList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "staff"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">groups</span>
              <span>Đội Ngũ & Lịch Trực</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("documents")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "documents"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">upload_file</span>
              <span>Tài Liệu & Upload Thông Tin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pricing")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "pricing"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">payments</span>
              <span>Gói Dịch Vụ & Giá</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "faq"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">quiz</span>
              <span>Kho Tri Thức FAQ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("company_info")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "company_info"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">corporate_fare</span>
              <span>Thông Tin Doanh Nghiệp</span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">Hệ thống Quản trị sẵn sàng</span>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTENT ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom duration-200 border border-slate-700">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── PHÂN HỆ 1: THÔNG SỐ & TỈ LỆ CỦA CHATBOT ─────────────────────── */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Tổng Lượt Hỏi Đáp</span>
                  <span className="material-symbols-outlined text-indigo-600 text-[18px]">chat</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">1,248</div>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>+18.4% so với tuần trước</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Tỉ Lệ Khớp FAQ (RAG Hit Rate)</span>
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono">94.6%</div>
                <p className="text-[11px] text-slate-500">
                  Truy xuất chính xác từ 10 bộ tri thức chuẩn
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Tỉ Lệ Chuyển Đổi Đặt Lịch</span>
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">event_available</span>
                </div>
                <div className="text-2xl font-black text-amber-700 font-mono">68.2%</div>
                <p className="text-[11px] text-slate-500">
                  Câu hỏi out-of-scope chuyển thành lịch hẹn
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Độ Trễ Phản Hồi TB (Latency)</span>
                  <span className="material-symbols-outlined text-purple-600 text-[18px]">speed</span>
                </div>
                <div className="text-2xl font-black text-purple-700 font-mono">1.1s</div>
                <p className="text-[11px] text-emerald-600 font-medium">
                  Đạt chuẩn trải nghiệm thời gian thực
                </p>
              </div>
            </div>

            {/* Distribution Analysis & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Category Distribution */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">Phân Bổ Chủ Đề Khách Hàng Quan Tâm</h3>
                  <span className="text-[11px] font-mono text-slate-400">7 ngày qua</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">1. Dự toán chi phí & Bảng giá trọn gói</span>
                      <span className="font-mono text-indigo-600">42% (524 lượt)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: "42%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">2. Địa điểm sảnh tiệc 5 sao & Resort</span>
                      <span className="font-mono text-purple-600">26% (324 lượt)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: "26%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">3. Kỹ thuật âm thanh, ánh sáng & LED</span>
                      <span className="font-mono text-amber-600">18% (225 lượt)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">4. Chính sách đặt cọc, hợp đồng & hủy tiệc</span>
                      <span className="font-mono text-emerald-600">14% (175 lượt)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "14%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Real-time Inquiry Audit Logs */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Nhật Ký Tương Tác Của Chatbot (Live Audit Logs)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Tự động ghi nhận</span>
                </div>

                <div className="space-y-2.5 overflow-x-auto">
                  {recentBotLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs space-y-1.5 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">"{log.query}"</span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">{log.time}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                          FAQ: {log.matchedFaq}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                          Điểm match: {log.score}
                        </span>
                        <span className="text-emerald-700 font-medium">
                          {log.result}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PHÂN HỆ QUẢN LÝ NHÂN VIÊN & LỊCH TRỰC ────────────────────────── */}
        {activeTab === "staff" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <StaffManagement onShowToast={showToast} />
          </div>
        )}

        {/* ── PHÂN HỆ 2: GIÁM SÁT LỊCH HẸN CRM ─────────────────────────────── */}
        {activeTab === "crm" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo mã lịch, họ tên, số điện thoại, loại tiệc..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Tất cả ({bookingsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("pending")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === "pending" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Chờ xử lý ({bookingsList.filter((b) => b.status === "pending").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("processed")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === "processed" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Đã xử lý ({bookingsList.filter((b) => b.status === "processed").length})
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">table_view</span>
                <span>Xuất File CSV</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Mã Phiếu</th>
                      <th className="py-3 px-4">Khách Hàng</th>
                      <th className="py-3 px-4">Thời Gian Hẹn</th>
                      <th className="py-3 px-4">Nhân Viên Đảm Nhận</th>
                      <th className="py-3 px-4">Loại Sự Kiện & Ghi Chú</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400">
                          Không tìm thấy lịch hẹn nào phù hợp bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const isProcessed = b.status === "processed";
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-purple-700">
                              #{b.id}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{b.name}</p>
                              <p className="text-slate-500 font-mono text-[11px]">{b.phone}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{b.time}</p>
                              <p className="text-slate-500 text-[11px]">{b.date}</p>
                            </td>
                            <td className="py-3 px-4">
                              {b.assignedStaffName ? (
                                <div>
                                  <p className="font-bold text-slate-800 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] text-purple-600">person</span>
                                    {b.assignedStaffName}
                                  </p>
                                  <p className="text-slate-500 font-mono text-[11px]">
                                    {b.assignedStaffId || ""} {b.shift === "morning" ? "• Ca Sáng" : b.shift === "afternoon" ? "• Ca Chiều" : ""}
                                  </p>
                                  {b.incidentNote && (
                                    <span className="inline-block mt-0.5 text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded font-medium">
                                      ⚠️ {b.incidentNote}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Tự động điều phối</span>
                              )}
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="font-semibold text-slate-800 line-clamp-1">{b.eventType || "Tư vấn tổng thể"}</p>
                              <p className="text-slate-500 line-clamp-1 text-[11px]">{b.notes || "Không ghi chú"}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isProcessed
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {isProcessed ? "Đã xử lý" : "Chờ tiếp nhận"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isProcessed ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkProcessed(b.id)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">check</span>
                                    <span>Đã Xử Lý</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(b.id)}
                                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[11px] transition-all flex items-center gap-1 border border-red-200 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                    <span>Xóa</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PHÂN HỆ 3: TÀI LIỆU & UPLOAD THÔNG TIN ───────────────────────── */}
                {activeTab === "documents" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* RAG Backend Connectivity Banner */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isRagOnline ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-100" : "bg-amber-500 ring-4 ring-amber-100"}`}></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <span>Hệ Thống Pipeline RAG Tri Thức</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${isRagOnline ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                      {isRagOnline ? "Backend RAG: Sẵn sàng (Port 8000)" : "Backend RAG: Ngoại tuyến"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isRagOnline
                      ? "Chỉ mục Qdrant Vector + BM25s tokenizer Tiếng Việt + SQLite DB đang hoạt động ổn định."
                      : "Khuyến nghị: Chạy `uvicorn app.main:app --port 8000` tại thư mục backend để bật trọn vẹn pipeline."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshRAGDocs}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  <span>Đồng bộ RAG</span>
                </button>

                <label className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                  <span className="material-symbols-outlined text-[17px]">upload_file</span>
                  <span>Tải Lên Tài Liệu Mới</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.xlsx,.md,.txt,.html"
                    onChange={handleUploadNewDoc}
                  />
                </label>
              </div>
            </div>

            {/* RAG Documents Table */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tài Liệu Đã Lập Chỉ Mục (Knowledge Base)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tất cả tài liệu được bóc tách văn bản, chunking, nhúng vector và lập chỉ mục tìm kiếm kết hợp (Hybrid Search).
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                  {ragDocs.length > 0 ? `${ragDocs.length} tài liệu RAG` : `${documents.length} tài liệu tổng hợp`}
                </span>
              </div>

              {ragDocs.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Tên Tệp / Tiêu Đề</th>
                          <th className="py-3 px-4">Phân Loại (Type)</th>
                          <th className="py-3 px-4">Số Chunks</th>
                          <th className="py-3 px-4">Dung Lượng</th>
                          <th className="py-3 px-4">Trạng Thái</th>
                          <th className="py-3 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ragDocs.map((doc) => (
                          <tr key={doc.doc_id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[17px] text-purple-600">article</span>
                                <span>{doc.filename}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {doc.doc_id}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {doc.doc_type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                                {doc.n_chunks} chunks
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {(doc.size_bytes / 1024).toFixed(1)} KB
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                doc.status === "ready"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : doc.status === "failed"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200 animate-pulse"
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                <span>{doc.status === "ready" ? "Sẵn sàng" : doc.status === "failed" ? "Thất bại" : "Đang xử lý"}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setViewChunksDoc({ docId: doc.doc_id, filename: doc.filename })}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors border border-indigo-200 flex items-center gap-1 cursor-pointer"
                                  title="Xem danh sách chunks văn bản"
                                >
                                  <span className="material-symbols-outlined text-[14px]">splitscreen</span>
                                  <span>Xem Chunks</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteRAGDoc(doc.doc_id, doc.filename)}
                                  className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[11px] transition-colors border border-red-200 flex items-center gap-1 cursor-pointer"
                                  title="Xóa tài liệu khỏi RAG"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-200 transition-all space-y-2 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">article</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Xóa tài liệu"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                        <h4 className="font-bold text-slate-900 mt-2 line-clamp-1">{doc.title}</h4>
                        <p className="text-slate-500 text-[11px] font-mono mt-0.5">{doc.fileName} ({doc.fileSize})</p>
                        <p className="text-slate-600 text-[11px] line-clamp-2 mt-1">{doc.summary}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span>Đã nạp</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

                {/* ── PHÂN HỆ 4: GÓI DỊCH VỤ & GIÁ ─────────────────────────────────── */}
        {activeTab === "pricing" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Điều Chỉnh Biểu Phí & Gói Dịch Vụ Sự Kiện</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các thay đổi giá tại đây sẽ tự động đồng bộ ngay vào trang Gói Dịch Vụ và Chatbot AI của khách hàng.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPricing}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
                >
                  Khôi Phục Mặc Định
                </button>
                <button
                  type="button"
                  onClick={handleSavePricing}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu Biểu Phí Toàn Hệ Thống</span>
                </button>
              </div>
            </div>

            {pricingSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{pricingSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category 1: Sảnh Tiệc & F&B */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900 text-sm">
                  <span className="material-symbols-outlined text-purple-700 text-[20px]">domain</span>
                  <span>Định Mức Sảnh Tiệc & Thực Đơn (VNĐ / Khách)</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Sảnh tiêu chuẩn (4 sao)</label>
                    <input
                      type="number"
                      step={50000}
                      value={pricingConfig.venueRates.standard}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          venueRates: { ...pricingConfig.venueRates, standard: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Khách sạn 5 sao quốc tế (Sheraton, InterCon)</label>
                    <input
                      type="number"
                      step={50000}
                      value={pricingConfig.venueRates["5star"]}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          venueRates: { ...pricingConfig.venueRates, "5star": Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Resort bờ biển / Sảnh Dinh Độc Lập</label>
                    <input
                      type="number"
                      step={50000}
                      value={pricingConfig.venueRates.resort}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          venueRates: { ...pricingConfig.venueRates, resort: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-slate-600 font-medium mb-1">Thực đơn Yến tiệc Fusion 5 sao (VNĐ/khách)</label>
                    <input
                      type="number"
                      step={50000}
                      value={pricingConfig.fbRates.fusion}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          fbRates: { ...pricingConfig.fbRates, fusion: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Category 2: Âm thanh ánh sáng & Nghệ sĩ */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900 text-sm">
                  <span className="material-symbols-outlined text-purple-700 text-[20px]">speaker_group</span>
                  <span>Âm Thanh, Ánh Sáng & Nghệ Sĩ Trọn Gói (VNĐ / Show)</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Âm thanh JBL Pro tiêu chuẩn</label>
                    <input
                      type="number"
                      step={1000000}
                      value={pricingConfig.avRates.jbl}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          avRates: { ...pricingConfig.avRates, jbl: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Dàn L'Acoustics K2 & LED P2 4K</label>
                    <input
                      type="number"
                      step={1000000}
                      value={pricingConfig.avRates.lacoustics}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          avRates: { ...pricingConfig.avRates, lacoustics: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">MC Đài Truyền Hình & Ban nhạc Live</label>
                    <input
                      type="number"
                      step={1000000}
                      value={pricingConfig.talentRates.vtv_band}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          talentRates: { ...pricingConfig.talentRates, vtv_band: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ca sĩ Ngôi sao hạng A & Đạo diễn Sân khấu</label>
                    <input
                      type="number"
                      step={5000000}
                      value={pricingConfig.talentRates.star}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          talentRates: { ...pricingConfig.talentRates, star: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PHÂN HỆ 5: KHO TRI THỨC FAQ ─────────────────────────────────── */}
        {activeTab === "faq" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Kho Kiến Thức Nghiệp Vụ FAQ & RAG</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI Chatbot dựa vào các câu hỏi dưới đây để trả lời chính xác, tránh bịa đặt thông tin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddFaqOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">add</span>
                <span>Thêm Câu Hỏi Mới</span>
              </button>
            </div>

            {isAddFaqOpen && (
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3.5 text-xs animate-in fade-in duration-150">
                <h4 className="font-bold text-purple-900 text-sm">Thêm Câu Hỏi FAQ Mới</h4>
                <form onSubmit={handleAddNewFaq} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Câu hỏi của khách hàng</label>
                    <input
                      type="text"
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                      placeholder="Ví dụ: EventViet có nhận tổ chức sự kiện tại Hà Nội và Đà Nẵng không?"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Câu trả lời tiêu chuẩn</label>
                    <textarea
                      rows={3}
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      placeholder="Nhập nội dung trả lời chính xác để AI căn cứ phản hồi..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tags cách nhau dấu phẩy</label>
                    <input
                      type="text"
                      value={newFaqTags}
                      onChange={(e) => setNewFaqTags(e.target.value)}
                      placeholder="dia diem, ha noi, da nang"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddFaqOpen(false)}
                      className="px-3.5 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-xs"
                    >
                      Lưu FAQ Mới
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {faqsList.map((faq, idx) => (
                <div
                  key={faq.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-200 transition-all space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        #{idx + 1} • {faq.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{faq.question}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa câu hỏi này"
                    >
                      <span className="material-symbols-outlined text-[17px]">delete</span>
                    </button>
                  </div>

                  <p className="text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                    {faq.answer}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">Tags truy xuất:</span>
                    {faq.tags.map((t, ti) => (
                      <span
                        key={ti}
                        className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHÂN HỆ 6: THÔNG TIN DOANH NGHIỆP ───────────────────────────── */}
        {activeTab === "company_info" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Thông Tin Doanh Nghiệp EventViet</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thông tin này xuất hiện trên footer, biên bản xuất ra và tiêu đề hợp đồng tư vấn.
                </p>
              </div>

              {companyProfileSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Đã lưu cập nhật thông tin doanh nghiệp thành công!</span>
                </div>
              )}

              <form onSubmit={handleSaveCompanyProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tên Công Ty</label>
                    <input
                      type="text"
                      value={companyProfile.companyName}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Slogan Thương Hiệu</label>
                    <input
                      type="text"
                      value={companyProfile.slogan}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, slogan: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hotline CSKH / Đón tiếp VIP</label>
                    <input
                      type="text"
                      value={companyProfile.hotline}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, hotline: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Tư Vấn</label>
                    <input
                      type="email"
                      value={companyProfile.email}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Địa Chỉ Trụ Sở</label>
                    <input
                      type="text"
                      value={companyProfile.address}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Giờ Làm Việc Tiếp Khách</label>
                    <input
                      type="text"
                      value={companyProfile.workingHours}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, workingHours: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Người Đại Diện Pháp Luật</label>
                    <input
                      type="text"
                      value={companyProfile.representative}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, representative: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">save</span>
                    <span>Lưu Cập Nhật Thông Tin Doanh Nghiệp</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal to Delete Processed Booking */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">delete_forever</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Lịch Hẹn</h3>
              <p className="text-xs text-slate-500 mt-1">
                Lịch hẹn #{deleteConfirmId} đã xử lý xong. Bạn có chắc chắn muốn xóa vĩnh viễn khỏi hệ thống không?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Xem Lịch Sử Đăng Nhập */}
      <LoginHistoryModal
        isOpen={isLoginHistoryOpen}
        onClose={() => setIsLoginHistoryOpen(false)}
      />

      {/* Modal Tiến Trình Ingestion Pipeline (Chunking, Embedding, Qdrant & DB) */}
      <DocumentIngestModal
        isOpen={isIngestModalOpen}
        file={selectedUploadFile}
        onClose={() => {
          setIsIngestModalOpen(false);
          setSelectedUploadFile(null);
        }}
        onComplete={() => {
          refreshRAGDocs();
          showToast("Tài liệu đã được phân mảnh và nạp vào Vector Store thành công!");
        }}
        onViewChunks={(docId, filename) => {
          setIsIngestModalOpen(false);
          setViewChunksDoc({ docId, filename });
        }}
      />

      {/* Modal Xem Danh Sách Chunks của Tài Liệu */}
      <DocumentChunksModal
        isOpen={!!viewChunksDoc}
        docId={viewChunksDoc?.docId || null}
        filename={viewChunksDoc?.filename || ""}
        onClose={() => setViewChunksDoc(null)}
      />
    </div>
  );
}
