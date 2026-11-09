import type { Booking } from "@/lib/schemas";
import { fetchBookings, rescheduleRemoteBooking } from "@/lib/booking/api";
import { validateDailyBookingLimit, validateDate, validateSlotAvailability, validateTime } from "@/lib/booking/validate";

export type RescheduleResult =
  | { status: "updated"; booking: Booking }
  | { status: "needs_form"; reason: string };

export function isRescheduleRequest(message: string): boolean {
  return /(?:đổi\s*(?:lịch|sang)|dời\s*(?:lịch|sang)|thay\s*(?:lịch|đổi)|chuyển\s*(?:lịch|sang|qua)|reschedule)/i.test(message);
}

export function parseRescheduleTarget(message: string): { date?: string; time?: string; displayDate?: string } {
  const timeMatch = message.match(/\b(\d{1,2})\s*(?::|h|giờ)\s*(\d{2})?\b/i);
  const dateMatch = message.match(/(?:ngày\s*)?(\d{1,2})\s*[\/-]\s*(\d{1,2})(?:\s*[\/-]\s*(\d{4}))?/i);
  const time = timeMatch
    ? `${String(Number(timeMatch[1])).padStart(2, "0")}:${String(Number(timeMatch[2] ?? "0")).padStart(2, "0")}`
    : undefined;
  const now = new Date();
  if (!dateMatch) {
    // “14h chiều mai” is a complete, unambiguous reschedule target. Resolve
    // it in the user's local timezone rather than sending them to a form.
    if (/(?:ngày\s*)?mai\b/i.test(message)) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = tomorrow.getMonth() + 1;
      const day = tomorrow.getDate();
      return {
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        displayDate: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
        time,
      };
    }
    return { time };
  }

  const year = dateMatch[3] ? Number(dateMatch[3]) : now.getFullYear();
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[1]);
  return {
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    displayDate: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
    time,
  };
}

export async function rescheduleLatestBooking(phone: string | null | undefined, message: string): Promise<RescheduleResult> {
  if (!phone) return { status: "needs_form", reason: "Cần số điện thoại để tra cứu lịch hẹn." };
  const target = parseRescheduleTarget(message);
  if (!target.date || !target.time) return { status: "needs_form", reason: "Cần đủ ngày và giờ mới để đổi lịch." };
  const [year, month, day] = target.date.split("-").map(Number);
  const calendarDate = new Date(year, month - 1, day);
  if (month < 1 || month > 12 || calendarDate.getFullYear() !== year || calendarDate.getMonth() !== month - 1 || calendarDate.getDate() !== day) {
    return { status: "needs_form", reason: `Ngày ${target.displayDate} không tồn tại. Vui lòng kiểm tra lại ngày/tháng.` };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (calendarDate <= today) {
    return { status: "needs_form", reason: `Ngày ${target.displayDate} đã qua. Vui lòng chọn một ngày trong tương lai hoặc ghi rõ năm cần đổi.` };
  }
  const dateError = validateDate(target.date);
  const timeError = validateTime(target.time);
  if (dateError || timeError) return { status: "needs_form", reason: dateError || timeError || "Thời gian không hợp lệ." };

  let bookings: Booking[];
  try {
    bookings = await fetchBookings({ phone });
  } catch {
    return { status: "needs_form", reason: "Không thể kết nối hệ thống lịch hẹn. Vui lòng thử lại hoặc dùng biểu mẫu." };
  }
  const candidates = bookings
    .filter((booking) => booking.phone === phone && booking.status === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (candidates.length !== 1) {
    return { status: "needs_form", reason: candidates.length ? "Có nhiều lịch hẹn cần chọn." : "Không tìm thấy lịch hẹn đang chờ xử lý." };
  }

  const current = candidates[0];
  const availabilityError = validateSlotAvailability(target.date, target.time, bookings.filter((booking) => booking.id !== current.id));
  if (availabilityError) return { status: "needs_form", reason: availabilityError };
  const dailyLimitError = validateDailyBookingLimit(phone, target.date, bookings, current.id);
  if (dailyLimitError) return { status: "needs_form", reason: dailyLimitError };

  try {
    const booking = await rescheduleRemoteBooking(current.id, target.date, target.time);
    return { status: "updated", booking };
  } catch (error) {
    return { status: "needs_form", reason: error instanceof Error ? error.message : "Không thể đổi lịch hẹn." };
  }
}
