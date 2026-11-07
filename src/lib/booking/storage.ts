"use client";

import type { Booking, BookingStorage } from "@/lib/schemas";
import { BookingStorageSchema } from "@/lib/schemas";
import { BOOKING_SCHEMA_VERSION, BOOKING_STORAGE_KEY } from "@/lib/constants";

/**
 * Đọc danh sách lịch hẹn từ localStorage.
 * Nếu JSON hỏng hoặc schemaVersion sai → reset an toàn.
 */
export function loadBookings(): {
  bookings: Booking[];
  wasReset: boolean;
} {
  if (typeof window === "undefined") {
    return { bookings: [], wasReset: false };
  }

  try {
    const raw = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (!raw) return { bookings: [], wasReset: false };

    const parsed = JSON.parse(raw);
    const result = BookingStorageSchema.safeParse(parsed);

    if (!result.success) {
      // Dữ liệu hỏng → reset
      localStorage.removeItem(BOOKING_STORAGE_KEY);
      return { bookings: [], wasReset: true };
    }

    // Migrate v1 -> v2: giữ nguyên booking cũ, cập nhật schemaVersion
    if (result.data.schemaVersion === 1 && BOOKING_SCHEMA_VERSION === 2) {
      const migrated = result.data.bookings;
      saveBookings(migrated);
      return { bookings: migrated, wasReset: false };
    }

    if (result.data.schemaVersion !== BOOKING_SCHEMA_VERSION) {
      // Version không khớp → reset
      localStorage.removeItem(BOOKING_STORAGE_KEY);
      return { bookings: [], wasReset: true };
    }

    return { bookings: result.data.bookings, wasReset: false };
  } catch {
    // JSON hỏng
    try {
      localStorage.removeItem(BOOKING_STORAGE_KEY);
    } catch {
      // ignore
    }
    return { bookings: [], wasReset: true };
  }
}

/**
 * Lưu danh sách lịch hẹn vào localStorage.
 */
export function saveBookings(bookings: Booking[]): void {
  if (typeof window === "undefined") return;

  try {
    const storage: BookingStorage = {
      schemaVersion: BOOKING_SCHEMA_VERSION,
      bookings,
    };
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(storage));
  } catch {
    console.error("Không thể lưu lịch hẹn vào localStorage");
  }
}

/**
 * Thêm một lịch hẹn mới.
 */
export function addBooking(booking: Booking): void {
  const { bookings } = loadBookings();
  saveBookings([...bookings, booking]);
}

/**
 * Cập nhật trạng thái lịch hẹn (pending → processed).
 */
export function updateBookingStatus(
  id: string,
  status: "pending" | "processed"
): void {
  const { bookings } = loadBookings();
  const updated = bookings.map((b) =>
    b.id === id ? { ...b, status } : b
  );
  saveBookings(updated);
}

/**
 * Xóa lịch hẹn đã xử lý (chỉ xóa được status="processed").
 */
export function deleteProcessedBooking(id: string): boolean {
  const { bookings } = loadBookings();
  const booking = bookings.find((b) => b.id === id);

  if (!booking || booking.status !== "processed") {
    return false; // Không thể xóa lịch chưa xử lý
  }

  saveBookings(bookings.filter((b) => b.id !== id));
  return true;
}
