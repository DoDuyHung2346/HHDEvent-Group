import type { Booking } from "@/lib/schemas";

/**
 * Tạo file chuẩn iCalendar (.ics) từ thông tin lịch hẹn Booking
 */
export function generateIcsFile(booking: Booking, companyName: string = "EventViet"): void {
  // Parse date & time: date: YYYY-MM-DD, time: "HH:mm" hoặc "HH:mm - HH:mm"
  const dateParts = booking.date.split("-");
  if (dateParts.length < 3) return;

  const year = dateParts[0];
  const month = dateParts[1].padStart(2, "0");
  const day = dateParts[2].padStart(2, "0");

  let startHour = "09";
  let startMinute = "00";
  let endHour = "10";
  let endMinute = "00";

  if (booking.time.includes("-")) {
    const [start, end] = booking.time.split("-").map((t) => t.trim());
    const [sh, sm] = start.split(":");
    const [eh, em] = end.split(":");
    if (sh && sm) {
      startHour = sh.padStart(2, "0");
      startMinute = sm.padStart(2, "0");
    }
    if (eh && em) {
      endHour = eh.padStart(2, "0");
      endMinute = em.padStart(2, "0");
    }
  } else if (booking.time.includes(":")) {
    const [sh, sm] = booking.time.split(":");
    startHour = sh.padStart(2, "0");
    startMinute = sm.padStart(2, "0");
    // default 45 mins
    endHour = startHour;
    endMinute = String(Number(startMinute) + 45).padStart(2, "0");
  }

  const dtStart = `${year}${month}${day}T${startHour}${startMinute}00`;
  const dtEnd = `${year}${month}${day}T${endHour}${endMinute}00`;
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventViet//Event Consultation Calendar//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:booking-${booking.id}@eventviet.vn`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:[EventViet] Tư vấn Tổ chức Sự kiện 1-1 (${booking.name})`,
    `DESCRIPTION:Buổi tư vấn chuyên sâu cùng Giám đốc Điều phối ${companyName}.\\nKhách hàng: ${booking.name} (${booking.phone})\\nNhu cầu: ${booking.eventType || "Tư vấn sự kiện"}\\nGhi chú: ${booking.notes || "Không có"}`,
    `LOCATION:Văn phòng EventViet - Bitexco Financial Tower, Quận 1 hoặc Trực tuyến qua Google Meet`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Nhắc nhở cuộc hẹn tư vấn sự kiện cùng EventViet trong 30 phút",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Lich-tu-van-EventViet-${booking.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
