import { z } from "zod";

export type StaffRole =
  | "consultant_wedding"      // Chuyên viên Tiệc cưới
  | "consultant_corporate"    // Chuyên viên Hội nghị & Doanh nghiệp
  | "coordinator_gala"        // Điều phối Gala & Year-end Party
  | "tech_lead_av"            // Kỹ thuật Âm thanh - Ánh sáng
  | "director_event";         // Giám đốc Điều phối Cấp cao

export type StaffStatus = "active" | "busy" | "incident" | "on_leave";

export type ShiftType = "morning" | "afternoon" | "all_day";

export interface StaffMember {
  id: string;               // Mã nhân viên: EV-001, EV-002...
  name: string;             // Họ và tên
  phone: string;            // Số điện thoại
  role: StaffRole;          // Vai trò / Chuyên môn
  roleLabel: string;        // Nhãn hiển thị chuyên môn
  status: StaffStatus;      // Trạng thái hoạt động
  shift?: ShiftType;        // Ca trực làm việc (ca sáng / ca chiều / cả ngày)
  maxDailySlots: number;    // Giới hạn số ca tiếp khách/ngày (mặc định 6 ca)
  rating: number;           // Đánh giá chuyên môn (4.8, 4.9, 5.0)
  avatarBg?: string;        // Màu avatar
}

export interface StaffScheduleSlot {
  id: string;
  bookingId: string;
  staffId: string;
  customerName: string;
  customerPhone: string;
  date: string;             // YYYY-MM-DD
  time: string;             // HH:mm (08:00, 08:30...)
  shift: ShiftType;         // Ca sáng hay ca chiều
  eventType: string;
  notes?: string;
  status: "confirmed" | "completed" | "reassigned" | "cancelled";
}

export interface IncidentReassignPayload {
  sourceStaffId: string;
  targetStaffId: string;
  bookingId: string;
  reason: string;
}
