import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage cho môi trường Node
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
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

import { loadBookings, saveBookings, addBooking, updateBookingStatus, deleteProcessedBooking } from "@/lib/booking/storage";
import type { Booking } from "@/lib/schemas";

const makeBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: `bk-${Date.now()}-test`,
  name: "Test User",
  phone: "0901234567",
  date: "2027-01-05",
  time: "09:00",
  status: "pending",
  createdAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  localStorageMock.clear();
});

describe("loadBookings", () => {
  it("CA-1: localStorage rỗng → trả [] và wasReset=false", () => {
    const { bookings, wasReset } = loadBookings();
    expect(bookings).toHaveLength(0);
    expect(wasReset).toBe(false);
  });

  it("CA-2: JSON hỏng → reset an toàn, wasReset=true", () => {
    localStorageMock.setItem("eventviet_bookings", "{ invalid }");
    const { bookings, wasReset } = loadBookings();
    expect(bookings).toHaveLength(0);
    expect(wasReset).toBe(true);
  });

  it("CA-3: schemaVersion sai → reset, wasReset=true", () => {
    localStorageMock.setItem(
      "eventviet_bookings",
      JSON.stringify({ schemaVersion: 999, bookings: [] })
    );
    const { bookings, wasReset } = loadBookings();
    expect(bookings).toHaveLength(0);
    expect(wasReset).toBe(true);
  });

  it("migrate v1 -> v2 giữ nguyên booking cũ và cập nhật schemaVersion", () => {
    const oldBooking = makeBooking({ name: "Khách Cũ v1" });
    localStorageMock.setItem(
      "eventviet_bookings",
      JSON.stringify({ schemaVersion: 1, bookings: [oldBooking] })
    );
    const { bookings, wasReset } = loadBookings();
    expect(wasReset).toBe(false);
    expect(bookings).toHaveLength(1);
    expect(bookings[0].name).toBe("Khách Cũ v1");
  });
});

describe("saveBookings & loadBookings", () => {
  it("CA-4: Lưu và đọc lại thành công", () => {
    const booking = makeBooking();
    saveBookings([booking]);
    const { bookings } = loadBookings();
    expect(bookings).toHaveLength(1);
    expect(bookings[0].name).toBe("Test User");
  });
});

describe("addBooking", () => {
  it("CA-5: Thêm lịch → tổng tăng 1", () => {
    addBooking(makeBooking({ id: "bk-001" }));
    addBooking(makeBooking({ id: "bk-002" }));
    const { bookings } = loadBookings();
    expect(bookings).toHaveLength(2);
  });
});

describe("updateBookingStatus", () => {
  it("CA-6: Đánh dấu processed → status thay đổi", () => {
    const booking = makeBooking({ id: "bk-test" });
    saveBookings([booking]);
    updateBookingStatus("bk-test", "processed");
    const { bookings } = loadBookings();
    expect(bookings[0].status).toBe("processed");
  });
});

describe("deleteProcessedBooking", () => {
  it("CA-7 (Biên): Xóa lịch đã xử lý → thành công", () => {
    const booking = makeBooking({ id: "bk-del", status: "processed" });
    saveBookings([booking]);
    const result = deleteProcessedBooking("bk-del");
    expect(result).toBe(true);
    const { bookings } = loadBookings();
    expect(bookings).toHaveLength(0);
  });

  it("CA-8 (Sự cố): Xóa lịch chưa xử lý → thất bại", () => {
    const booking = makeBooking({ id: "bk-pending", status: "pending" });
    saveBookings([booking]);
    const result = deleteProcessedBooking("bk-pending");
    expect(result).toBe(false);
    const { bookings } = loadBookings();
    expect(bookings).toHaveLength(1);
  });
});
