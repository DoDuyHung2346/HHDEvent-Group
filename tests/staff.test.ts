import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage cho môi trường Node của Vitest
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(globalThis, "window", {
  value: { localStorage: localStorageMock },
  writable: true,
});

import {
  loadStaffList,
  addStaffMember,
  setStaffStatus,
  bulkReassignIncident,
  determineShift,
} from "@/lib/staff/storage";
import {
  recommendStaffForBooking,
  getBestStaffForBooking,
} from "@/lib/staff/recommendation";
import { saveBookings, loadBookings } from "@/lib/booking/storage";
import type { Booking } from "@/lib/schemas";

describe("Staff Management & Smart Dispatch Unit Tests", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should initialize default staff list and allow adding a new staff member", () => {
    const initialStaff = loadStaffList();
    expect(initialStaff.length).toBeGreaterThanOrEqual(4);

    const newStaff = {
      id: "NV-TEST-99",
      name: "Nguyễn Văn Test",
      phone: "0987654321",
      role: "consultant_wedding" as const,
      shift: "all_day" as const,
      status: "active" as const,
      maxDailySlots: 4,
      rating: 4.8,
    };

    const added = addStaffMember(newStaff);
    expect(added.id).toBe("NV-TEST-99");

    const reloaded = loadStaffList();
    expect(reloaded.some((s) => s.id === "NV-TEST-99")).toBe(true);
  });

  it("should determine shift correctly from time slot", () => {
    expect(determineShift("09:00")).toBe("morning");
    expect(determineShift("11:30")).toBe("morning");
    expect(determineShift("13:30")).toBe("afternoon");
    expect(determineShift("16:00")).toBe("afternoon");
  });

  it("should toggle staff status (active / incident / off)", () => {
    const list = loadStaffList();
    const firstId = list[0].id;

    setStaffStatus(firstId, "incident");
    const updatedList = loadStaffList();
    const target = updatedList.find((s) => s.id === firstId);
    expect(target?.status).toBe("incident");
  });

  it("should recommend best available staff based on event type", () => {
    const staff = getBestStaffForBooking({
      date: "2026-11-20",
      time: "09:30",
      eventType: "Tiệc cưới Hoàng Gia Luxury",
    });

    expect(staff).not.toBeNull();
    // Chuyên viên tiệc cưới nên được ưu tiên
    expect(staff?.role).toBe("consultant_wedding");
  });

  it("should detect slot conflict and avoid assigning busy staff", () => {
    const weddingStaff = loadStaffList().find((s) => s.role === "consultant_wedding")!;

    // Tạo booking chiếm slot của weddingStaff kèm createdAt hợp lệ
    const existingBooking: Booking = {
      id: "bk-conflict-1",
      name: "Khách test",
      phone: "0901234567",
      date: "2026-11-20",
      time: "10:00",
      eventType: "Tiệc cưới",
      assignedStaffId: weddingStaff.id,
      assignedStaffName: weddingStaff.name,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveBookings([existingBooking]);

    const recs = recommendStaffForBooking({
      date: "2026-11-20",
      time: "10:00",
      eventType: "Tiệc cưới",
    });

    const targetRec = recs.find((r) => r.staff.id === weddingStaff.id);
    expect(targetRec?.isAvailable).toBe(false);
    expect(targetRec?.score).toBe(0);
  });

  it("should handle incident mode and bulk reassign all active bookings to replacement staff", () => {
    const staffList = loadStaffList();
    const primary = staffList[0];
    const replacement = staffList[1];

    const bookings: Booking[] = [
      {
        id: "bk-inc-1",
        name: "Khách A",
        phone: "0911111111",
        date: "2026-11-25",
        time: "09:00",
        assignedStaffId: primary.id,
        assignedStaffName: primary.name,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "bk-inc-2",
        name: "Khách B",
        phone: "0922222222",
        date: "2026-11-25",
        time: "14:00",
        assignedStaffId: primary.id,
        assignedStaffName: primary.name,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ];
    saveBookings(bookings);

    // Kích hoạt chế độ sự cố: chuyển giao sang replacement
    const { successCount, targetStaffName } = bulkReassignIncident(
      primary.id,
      replacement.id,
      "Sự cố sức khỏe đột xuất, chuyển giao công tác"
    );

    expect(successCount).toBe(2);
    expect(targetStaffName).toBe(replacement.name);

    // Primary bị đổi status sang incident
    const reloadedStaff = loadStaffList();
    expect(reloadedStaff.find((s) => s.id === primary.id)?.status).toBe("incident");

    // Lịch hẹn được gán cho replacement kèm ghi chú sự cố
    const { bookings: reloadedBookings } = loadBookings();
    expect(reloadedBookings.length).toBe(2);
    expect(reloadedBookings[0].assignedStaffId).toBe(replacement.id);
    expect(reloadedBookings[0].assignedStaffName).toBe(replacement.name);
    expect(reloadedBookings[0].incidentNote).toContain("Sự cố sức khỏe đột xuất");
  });
});
