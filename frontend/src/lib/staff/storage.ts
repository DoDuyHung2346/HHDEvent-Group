"use client";

import { StaffMember, StaffRole, StaffStatus, ShiftType } from "./types";
import { loadBookings, saveBookings } from "@/lib/booking/storage";
import type { Booking } from "@/lib/schemas";

const STAFF_STORAGE_KEY = "eventviet_staff_v1";

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: "EV-001",
    name: "Trần Minh Tuấn",
    phone: "0912345678",
    role: "director_event",
    roleLabel: "Giám đốc Điều phối Cấp cao",
    status: "active",
    shift: "all_day",
    maxDailySlots: 6,
    rating: 5.0,
    avatarBg: "bg-indigo-600",
  },
  {
    id: "EV-002",
    name: "Lê Thu Hà",
    phone: "0987654321",
    role: "consultant_wedding",
    roleLabel: "Chuyên viên Tiệc cưới & YEP",
    status: "active",
    shift: "all_day",
    maxDailySlots: 6,
    rating: 4.9,
    avatarBg: "bg-rose-500",
  },
  {
    id: "EV-003",
    name: "Phạm Đức Thắng",
    phone: "0903456789",
    role: "coordinator_gala",
    roleLabel: "Điều phối Hội nghị & Doanh nghiệp",
    status: "active",
    shift: "all_day",
    maxDailySlots: 6,
    rating: 4.8,
    avatarBg: "bg-emerald-600",
  },
  {
    id: "EV-004",
    name: "Hoàng Bích Ngọc",
    phone: "0934567890",
    role: "tech_lead_av",
    roleLabel: "Chuyên viên Thiết bị & Sân khấu",
    status: "active",
    shift: "all_day",
    maxDailySlots: 6,
    rating: 4.9,
    avatarBg: "bg-amber-600",
  },
];

export function determineShift(time: string): "morning" | "afternoon" {
  const hour = parseInt(time.split(":")[0], 10);
  return hour < 12 ? "morning" : "afternoon";
}

export function loadStaffList(): StaffMember[] {
  if (typeof window === "undefined") return INITIAL_STAFF_MEMBERS;
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) {
      saveStaffList(INITIAL_STAFF_MEMBERS);
      return INITIAL_STAFF_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as StaffMember[];
    }
    saveStaffList(INITIAL_STAFF_MEMBERS);
    return INITIAL_STAFF_MEMBERS;
  } catch {
    return INITIAL_STAFF_MEMBERS;
  }
}

export function saveStaffList(staff: StaffMember[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") window.dispatchEvent(new Event("eventviet_staff_changed"));
  } catch (e) {
    console.error("Lỗi lưu danh sách nhân viên:", e);
  }
}

export function addStaffMember(member: {
  id?: string;
  name: string;
  phone: string;
  role: StaffRole;
  shift?: ShiftType;
  maxDailySlots?: number;
  status?: StaffStatus;
  rating?: number;
}): StaffMember {
  const current = loadStaffList();
  const safeId = member.id?.trim() || `EV-${String(current.length + 1).padStart(3, "0")}`;

  const roleLabels: Record<StaffRole, string> = {
    director_event: "Giám đốc Điều phối Cấp cao",
    consultant_wedding: "Chuyên viên Tiệc cưới & YEP",
    consultant_corporate: "Chuyên viên Hội nghị & Doanh nghiệp",
    coordinator_gala: "Điều phối Dạ tiệc & Khai trương",
    tech_lead_av: "Chuyên viên Kỹ thuật & Sân khấu",
  };

  const avatarColors = [
    "bg-indigo-600",
    "bg-rose-500",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-purple-600",
    "bg-cyan-600",
  ];
  const avatarBg = avatarColors[current.length % avatarColors.length];

  const newStaff: StaffMember = {
    id: safeId,
    name: member.name.trim(),
    phone: member.phone.trim(),
    role: member.role,
    roleLabel: roleLabels[member.role] || "Chuyên viên Sự kiện",
    status: member.status || "active",
    shift: member.shift || "all_day",
    maxDailySlots: member.maxDailySlots || 4,
    rating: member.rating || 4.9,
    avatarBg,
  };

  const updated = [newStaff, ...current];
  saveStaffList(updated);
  return newStaff;
}

export function updateStaffMember(member: StaffMember): void {
  const current = loadStaffList();
  const updated = current.map((s) => (s.id === member.id ? member : s));
  saveStaffList(updated);
}

export function deleteStaffMember(staffId: string): boolean {
  const current = loadStaffList();
  if (current.length <= 1) return false; // Giữ ít nhất 1 nhân viên
  const updated = current.filter((s) => s.id !== staffId);
  saveStaffList(updated);
  return true;
}

export function setStaffStatus(staffId: string, status: StaffStatus): void {
  const current = loadStaffList();
  const updated = current.map((s) => (s.id === staffId ? { ...s, status } : s));
  saveStaffList(updated);
}

/**
 * Lấy danh sách lịch hẹn của một nhân viên cụ thể
 */
export function getStaffSchedule(staffId: string): Booking[] {
  const { bookings } = loadBookings();
  return bookings.filter((b) => b.assignedStaffId === staffId);
}

/**
 * Chuyển giao một lịch hẹn sang nhân viên khác khi có sự cố
 */
export function reassignBooking(
  bookingId: string,
  targetStaffId: string,
  incidentReason?: string
): Booking | null {
  const { bookings } = loadBookings();
  const staffList = loadStaffList();
  const targetStaff = staffList.find((s) => s.id === targetStaffId);
  if (!targetStaff) return null;

  let modifiedBooking: Booking | null = null;
  const updatedBookings = bookings.map((b) => {
    if (b.id === bookingId) {
      modifiedBooking = {
        ...b,
        assignedStaffId: targetStaff.id,
        assignedStaffName: targetStaff.name,
        assignedStaffPhone: targetStaff.phone,
        incidentNote: incidentReason
          ? `[Chuyển ca lúc ${new Date().toLocaleTimeString("vi-VN")}] Lý do: ${incidentReason}`
          : b.incidentNote,
      };
      return modifiedBooking;
    }
    return b;
  });

  if (modifiedBooking) {
    saveBookings(updatedBookings);
  }
  return modifiedBooking;
}

/**
 * Mode Điều chỉnh sự cố hàng loạt:
 * Chuyển giao tất cả các lịch chưa hoàn tất của nhân viên nguồn sang nhân viên đích
 */
export function bulkReassignIncident(
  sourceStaffId: string,
  targetStaffId: string,
  reason: string
): { successCount: number; targetStaffName: string } {
  const { bookings } = loadBookings();
  const staffList = loadStaffList();
  const targetStaff = staffList.find((s) => s.id === targetStaffId);
  if (!targetStaff) return { successCount: 0, targetStaffName: "" };

  let count = 0;
  const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const updatedBookings = bookings.map((b) => {
    if (b.assignedStaffId === sourceStaffId && b.status === "pending") {
      count++;
      return {
        ...b,
        assignedStaffId: targetStaff.id,
        assignedStaffName: targetStaff.name,
        assignedStaffPhone: targetStaff.phone,
        incidentNote: `[SỰ CỐ - Chuyển ca lúc ${nowTime}] Từ ${b.assignedStaffName || sourceStaffId} sang ${targetStaff.name}. Lý do: ${reason}`,
      };
    }
    return b;
  });

  saveBookings(updatedBookings);

  // Đổi trạng thái nhân sự nguồn thành "incident"
  setStaffStatus(sourceStaffId, "incident");

  return { successCount: count, targetStaffName: targetStaff.name };
}
