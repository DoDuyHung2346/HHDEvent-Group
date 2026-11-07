import { describe, it, expect } from "vitest";
import {
  validateName,
  validatePhone,
  validateDate,
  validateTime,
  validateSlotAvailability,
  validateBookingForm,
} from "@/lib/booking/validate";
import type { Booking } from "@/lib/schemas";

const makeBooking = (date: string, time: string): Booking => ({
  id: "test-id",
  name: "Test User",
  phone: "0901234567",
  date,
  time,
  status: "pending",
  createdAt: new Date().toISOString(),
});

// Ngày mai T2-T7 (dùng local timezone)
function tomorrowWorkday(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  // Tìm ngày làm việc
  while (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return d.toLocaleDateString("sv-SE"); // YYYY-MM-DD local timezone
}

describe("validateName", () => {
  it("CA-1: Tên hợp lệ → null", () => {
    expect(validateName("Nguyễn Văn A")).toBeNull();
  });

  it("CA-2: Tên rỗng → lỗi", () => {
    expect(validateName("")).not.toBeNull();
  });

  it("CA-3: Tên 1 ký tự → lỗi", () => {
    expect(validateName("A")).not.toBeNull();
  });

  it("CA-4: Tên 51 ký tự → lỗi", () => {
    expect(validateName("A".repeat(51))).not.toBeNull();
  });
});

describe("validatePhone", () => {
  it("CA-1 (Thường): SĐT hợp lệ 0901234567 → null", () => {
    expect(validatePhone("0901234567")).toBeNull();
  });

  it("CA-2 (Thường): SĐT +84901234567 → null", () => {
    expect(validatePhone("+84901234567")).toBeNull();
  });

  it("CA-3 (Sai): '12345' → lỗi", () => {
    expect(validatePhone("12345")).not.toBeNull();
  });

  it("CA-4 (Sai): SĐT rỗng → lỗi", () => {
    expect(validatePhone("")).not.toBeNull();
  });

  it("CA-5 (Sai): SĐT sai đầu số → lỗi", () => {
    expect(validatePhone("0101234567")).not.toBeNull();
  });

  it("CA-6 (Biên): 9 chữ số sau đầu số → lỗi (cần đúng 8)", () => {
    expect(validatePhone("09012345678")).not.toBeNull();
  });
});

describe("validateDate", () => {
  it("CA-1 (Thường): Ngày mai hợp lệ → null", () => {
    expect(validateDate(tomorrowWorkday())).toBeNull();
  });

  it("CA-2 (Sai): Ngày hôm nay → lỗi", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(validateDate(today)).not.toBeNull();
  });

  it("CA-3 (Sai): Ngày trong quá khứ → lỗi", () => {
    expect(validateDate("2020-01-01")).not.toBeNull();
  });

  it("CA-4 (Sai): Chủ nhật → lỗi", () => {
    // Tìm Chủ nhật tiếp theo (dùng local timezone)
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (d.getDay() !== 0) {
      d.setDate(d.getDate() + 1);
    }
    const sundayStr = d.toLocaleDateString("sv-SE"); // YYYY-MM-DD local
    expect(validateDate(sundayStr)).not.toBeNull();
  });

  it("CA-5: Ngày rỗng → lỗi", () => {
    expect(validateDate("")).not.toBeNull();
  });
});

describe("validateTime", () => {
  it("CA-1 (Thường): 08:00 → null", () => {
    expect(validateTime("08:00")).toBeNull();
  });

  it("CA-2 (Thường): 16:30 → null", () => {
    expect(validateTime("16:30")).toBeNull();
  });

  it("CA-3 (Sai): 17:00 → lỗi (ngoài giờ làm)", () => {
    expect(validateTime("17:00")).not.toBeNull();
  });

  it("CA-4 (Sai): 07:30 → lỗi (trước giờ làm)", () => {
    expect(validateTime("07:30")).not.toBeNull();
  });

  it("CA-5 (Sai): 08:15 → lỗi (không đúng bước 30 phút)", () => {
    expect(validateTime("08:15")).not.toBeNull();
  });
});

describe("validateSlotAvailability", () => {
  it("CA-1 (Thường): Slot trống → null", () => {
    expect(validateSlotAvailability("2027-01-05", "09:00", [])).toBeNull();
  });

  it("CA-2: 1 lịch đã có → vẫn còn chỗ → null", () => {
    const bookings = [makeBooking("2027-01-05", "09:00")];
    expect(validateSlotAvailability("2027-01-05", "09:00", bookings)).toBeNull();
  });

  it("CA-3 (Biên): 2 lịch đã có → slot đầy → lỗi", () => {
    const bookings = [
      makeBooking("2027-01-05", "09:00"),
      makeBooking("2027-01-05", "09:00"),
    ];
    expect(validateSlotAvailability("2027-01-05", "09:00", bookings)).not.toBeNull();
  });
});

describe("validateBookingForm - 6 ca bắt buộc", () => {
  const validDate = tomorrowWorkday();

  it("CA-1 (Thường): Form hợp lệ → valid=true", () => {
    const result = validateBookingForm(
      { name: "Nguyễn Văn A", phone: "0901234567", date: validDate, time: "09:00" },
      []
    );
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("CA-2 (Thường): Đặt lịch hợp lệ khác giờ → không lỗi", () => {
    const existing = [makeBooking(validDate, "09:00")];
    const result = validateBookingForm(
      { name: "Trần Thị B", phone: "0981234567", date: validDate, time: "10:00" },
      existing
    );
    expect(result.valid).toBe(true);
  });

  it("CA-3 (Sai): SĐT '12345' → lỗi phone", () => {
    const result = validateBookingForm(
      { name: "Test", phone: "12345", date: validDate, time: "09:00" },
      []
    );
    expect(result.valid).toBe(false);
    expect(result.errors.phone).toBeDefined();
  });

  it("CA-4 (Sai): Tên rỗng → lỗi name", () => {
    const result = validateBookingForm(
      { name: "", phone: "0901234567", date: validDate, time: "09:00" },
      []
    );
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("CA-5 (Sai): Ngày Chủ nhật → lỗi date", () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
    const sunday = d.toLocaleDateString("sv-SE"); // YYYY-MM-DD local

    const result = validateBookingForm(
      { name: "Test", phone: "0901234567", date: sunday, time: "09:00" },
      []
    );
    expect(result.valid).toBe(false);
    expect(result.errors.date).toBeDefined();
  });

  it("CA-6 (Biên): Slot đã đầy 2 lịch → lỗi time", () => {
    const bookings = [
      makeBooking(validDate, "09:00"),
      makeBooking(validDate, "09:00"),
    ];
    const result = validateBookingForm(
      { name: "Test", phone: "0901234567", date: validDate, time: "09:00" },
      bookings
    );
    expect(result.valid).toBe(false);
    expect(result.errors.time).toBeDefined();
  });
});
