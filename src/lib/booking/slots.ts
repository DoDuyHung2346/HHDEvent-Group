import {
  WORK_DAYS,
  WORK_HOUR_START,
  WORK_HOUR_END,
  SLOT_STEP_MINUTES,
} from "@/lib/constants";

export interface TimeSlot {
  time: string; // "HH:mm"
  label: string; // "08:00"
}

/**
 * Sinh danh sách các khung giờ làm việc trong một ngày.
 * T2-T7, 08:00-17:00, bước 30 phút.
 */
export function generateDaySlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const totalMinutes = (WORK_HOUR_END - WORK_HOUR_START) * 60;

  for (let m = 0; m < totalMinutes; m += SLOT_STEP_MINUTES) {
    const totalFromMidnight = WORK_HOUR_START * 60 + m;
    const h = Math.floor(totalFromMidnight / 60);
    const min = totalFromMidnight % 60;
    const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    slots.push({ time, label: time });
  }

  return slots;
}

/**
 * Kiểm tra một ngày có phải ngày làm việc không.
 * WORK_DAYS: 1=T2, ..., 6=T7; 0=CN
 */
export function isWorkDay(date: Date): boolean {
  return WORK_DAYS.includes(date.getDay());
}

/**
 * Lấy danh sách ngày làm việc từ ngày mai trong N ngày tới.
 */
export function getAvailableWorkDays(count: number = 30): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let d = new Date(today);
  d.setDate(d.getDate() + 1); // Từ ngày mai

  while (dates.length < count) {
    if (isWorkDay(d)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    d.setDate(d.getDate() + 1);
  }

  return dates;
}
