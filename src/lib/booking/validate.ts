import type { Booking } from "@/lib/schemas";
import {
  WORK_HOUR_START,
  WORK_HOUR_END,
  MAX_BOOKINGS_PER_SLOT,
  MAX_BOOKINGS_PER_PHONE_PER_DAY,
} from "@/lib/constants";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate tên khách hàng (2-50 ký tự).
 */
export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Vui lòng nhập họ tên";
  if (trimmed.length < 2) return "Họ tên phải từ 2 ký tự trở lên";
  if (trimmed.length > 50) return "Họ tên tối đa 50 ký tự";
  return null;
}

/**
 * Validate số điện thoại Việt Nam.
 * Pattern: ^(0|\+84)(3|5|7|8|9)\d{8}$
 */
export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return "Vui lòng nhập số điện thoại";
  if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(trimmed)) {
    return "Số điện thoại không hợp lệ. Ví dụ: 0901234567 hoặc +84901234567";
  }
  return null;
}

/**
 * Validate ngày đặt lịch:
 * - Phải từ ngày mai trở đi
 * - Cho phép mọi ngày trong tương lai; nhân viên sẽ xác nhận ca làm việc.
 */
export function validateDate(dateStr: string): string | null {
  if (!dateStr) return "Vui lòng chọn ngày";

  // Validate format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "Ngày không hợp lệ";

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return "Ngày không hợp lệ";

  // So sánh bằng string để tránh timezone issues
  const today = new Date();
  const todayStr = today.toLocaleDateString("sv-SE"); // YYYY-MM-DD
  if (dateStr <= todayStr) {
    return "Ngày đặt lịch phải từ ngày mai trở đi";
  }

  // Kiểm tra ngày hợp lệ
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getDate() !== day) return "Ngày không hợp lệ";

  // Không nhận lịch tư vấn vào Chủ nhật
  if (dateObj.getDay() === 0) {
    return "EventHHD không nhận đặt lịch vào Chủ nhật";
  }
  
  return null;
}

/**
 * Validate giờ đặt lịch: 08:00–17:00, bước 30 phút.
 */
export function validateTime(timeStr: string): string | null {
  if (!timeStr) return "Vui lòng chọn giờ";

  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  if (isNaN(h) || isNaN(m)) return "Giờ không hợp lệ";
  if (h < WORK_HOUR_START || h >= WORK_HOUR_END) {
    return `Giờ làm việc từ ${WORK_HOUR_START}:00 đến ${WORK_HOUR_END}:00`;
  }
  if (m !== 0 && m !== 30) {
    return "Vui lòng chọn đúng khung giờ (bước 30 phút)";
  }

  return null;
}

/**
 * Kiểm tra slot có còn chỗ không (tối đa 4 lịch/khung giờ).
 */
export function validateSlotAvailability(
  date: string,
  time: string,
  existingBookings: Booking[]
): string | null {
  const count = existingBookings.filter(
    (b) => b.date === date && b.time === time
  ).length;

  if (count >= MAX_BOOKINGS_PER_SLOT) {
    return `Khung giờ ${time} ngày ${date} đã đầy (tối đa ${MAX_BOOKINGS_PER_SLOT} lịch). Vui lòng chọn giờ khác.`;
  }

  return null;
}

export function validateDailyBookingLimit(
  phone: string,
  date: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): string | null {
  const normalizedPhone = phone.replace(/\s+/g, "");
  const count = existingBookings.filter(
    (booking) =>
      booking.id !== excludeBookingId &&
      booking.status === "pending" &&
      booking.phone.replace(/\s+/g, "") === normalizedPhone
  ).length;

  if (count >= MAX_BOOKINGS_PER_PHONE_PER_DAY) {
    return `Số điện thoại này đã có tối đa ${MAX_BOOKINGS_PER_PHONE_PER_DAY} lịch hẹn đang chờ xử lý. Vui lòng hoàn tất hoặc hủy một lịch trước khi đặt thêm.`;
  }
  return null;
}

/**
 * Validate toàn bộ form đặt lịch.
 */
export function validateBookingForm(
  data: { name: string; phone: string; date: string; time: string },
  existingBookings: Booking[]
): ValidationResult {
  const errors: Record<string, string> = {};

  const nameErr = validateName(data.name);
  if (nameErr) errors.name = nameErr;

  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;

  const dateErr = validateDate(data.date);
  if (dateErr) errors.date = dateErr;

  const timeErr = validateTime(data.time);
  if (timeErr) errors.time = timeErr;

  if (!dateErr && !timeErr) {
    const slotErr = validateSlotAvailability(
      data.date,
      data.time,
      existingBookings
    );
    if (slotErr) errors.time = slotErr;
    const dailyLimitErr = validateDailyBookingLimit(data.phone, data.date, existingBookings);
    if (dailyLimitErr) errors.date = dailyLimitErr;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
