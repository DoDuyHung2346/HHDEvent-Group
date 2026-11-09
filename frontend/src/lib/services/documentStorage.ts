"use client";

export interface CompanyDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  category: "proposal" | "policy" | "guideline" | "contract";
  uploadedAt: string;
  summary?: string;
}

export interface CompanyProfile {
  companyName: string;
  slogan: string;
  hotline: string;
  email: string;
  address: string;
  workingHours: string;
  taxCode: string;
  representative: string;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: "EventHHD Corporation",
  slogan: "Kiến tạo Sự kiện Đẳng cấp & Dấu ấn Độc bản",
  hotline: "1900 6886",
  email: "vip-events@eventhhd.vn",
  address: "144 Xuân Thủy, Phường Cầu Giấy, Hà Nội",
  workingHours: "Thứ Hai - Thứ Bảy: 08:00 - 17:30 (Chủ Nhật trực hotline VIP)",
  taxCode: "",
  representative: "Nguyễn Hoàng Duy - Giám đốc Điều hành",
};

export const INITIAL_DOCUMENTS: CompanyDocument[] = [
  {
    id: "doc-01",
    title: "Hồ Sơ Năng Lực Doanh Nghiệp (Company Profile 2026)",
    fileName: "EventHHD-Capability-Profile-2026.pdf",
    fileSize: "4.8 MB",
    category: "proposal",
    uploadedAt: "2026-10-15T09:00:00Z",
    summary: "Tổng hợp các dự án tiêu biểu 1000+ khách, hệ thống đối tác khách sạn 5 sao quốc tế và trang thiết bị hiện đại.",
  },
  {
    id: "doc-02",
    title: "Chính Sách Đặt Cọc, Bảo Hiểm & Hoàn Hủy Sự Kiện",
    fileName: "EventHHD-Cancellation-Policy-V4.pdf",
    fileSize: "1.2 MB",
    category: "policy",
    uploadedAt: "2026-10-20T14:30:00Z",
    summary: "Quy chuẩn hoàn trả 100% nếu đổi lịch trước 15 ngày, chính sách bảo hiểm thiên tai và bão lụt lên tới 10 tỷ.",
  },
  {
    id: "doc-03",
    title: "Mẫu Hợp Đồng Dịch Vụ Tổ Chức Sự Kiện Song Ngữ",
    fileName: "EventHHD-Standard-Contract-Template.docx",
    fileSize: "850 KB",
    category: "contract",
    uploadedAt: "2026-10-28T11:15:00Z",
    summary: "Mẫu hợp đồng pháp lý đạt chuẩn trọng tài thương mại quốc tế, bảo vệ quyền lợi hai bên và bảo mật NDA.",
  },
];

const COMPANY_PROFILE_KEY = "eventviet_company_profile";
const DOCUMENTS_STORAGE_KEY = "eventviet_company_docs";

export function loadCompanyProfile(): CompanyProfile {
  if (typeof window === "undefined") return DEFAULT_COMPANY_PROFILE;
  try {
    const raw = localStorage.getItem(COMPANY_PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(DEFAULT_COMPANY_PROFILE));
      return DEFAULT_COMPANY_PROFILE;
    }
    return JSON.parse(raw) as CompanyProfile;
  } catch {
    return DEFAULT_COMPANY_PROFILE;
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("eventviet_company_profile_changed"));
  } catch (e) {
    console.error("Lỗi lưu thông tin công ty:", e);
  }
}

export function loadDocuments(): CompanyDocument[] {
  if (typeof window === "undefined") return INITIAL_DOCUMENTS;
  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS;
    }
    return JSON.parse(raw) as CompanyDocument[];
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export function saveDocuments(docs: CompanyDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new Event("eventviet_docs_changed"));
  } catch (e) {
    console.error("Lỗi lưu danh sách tài liệu:", e);
  }
}

export function addDocument(doc: CompanyDocument): void {
  const docs = loadDocuments();
  saveDocuments([doc, ...docs]);
}

export function removeDocument(id: string): void {
  const docs = loadDocuments();
  saveDocuments(docs.filter((d) => d.id !== id));
}
