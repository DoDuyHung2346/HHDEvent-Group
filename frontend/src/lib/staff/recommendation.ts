import { StaffMember } from "./types";
import { loadStaffList, determineShift } from "./storage";
import { loadBookings } from "@/lib/booking/storage";

export interface StaffRecommendation {
  staff: StaffMember;
  score: number;
  reason: string;
  isAvailable: boolean;
  assignedCountOnDate: number;
}

/**
 * Đề xuất nhân viên phù hợp nhất cho lịch hẹn của khách hàng
 * Đảm bảo:
 * 1. Chỉ chọn từ danh sách nhân viên hiện có trong hệ thống
 * 2. Phù hợp lịch rảnh (không trùng slot)
 * 3. Phù hợp ca làm việc (ca sáng / ca chiều / cả ngày)
 * 4. Trạng thái active (không gặp sự cố)
 * 5. Khớp chuyên môn sự kiện & cân bằng tải
 */
export function recommendStaffForBooking(params: {
  date: string;
  time: string;
  eventType?: string;
  excludeStaffId?: string;
}): StaffRecommendation[] {
  const staffList = loadStaffList();
  const { bookings } = loadBookings();
  const eventLower = (params.eventType || "").toLowerCase();
  const requestedShift = determineShift(params.time);

  const results: StaffRecommendation[] = staffList
    .filter((s) => s.id !== params.excludeStaffId)
    .map((staff) => {
      // 1. Kiểm tra lịch trùng vào đúng ngày + giờ
      const isSlotConflict = bookings.some(
        (b) =>
          b.assignedStaffId === staff.id &&
          b.date === params.date &&
          b.time === params.time &&
          b.status !== "processed"
      );

      // 2. Kiểm tra ca làm việc của nhân viên (mặc định all_day nếu chưa chỉ định)
      const staffShift = staff.shift || "all_day";
      const isShiftMatch = staffShift === "all_day" || staffShift === requestedShift;

      // 3. Đếm số lịch của nhân viên trong ngày đó (để cân bằng tải)
      const assignedCountOnDate = bookings.filter(
        (b) => b.assignedStaffId === staff.id && b.date === params.date
      ).length;

      // 4. Kiểm tra tính khả dụng tổng thể
      const isAvailable =
        !isSlotConflict &&
        isShiftMatch &&
        staff.status === "active" &&
        assignedCountOnDate < staff.maxDailySlots;

      // 5. Tính điểm chuyên môn phù hợp (Match Score)
      let score = 50;
      let reasons: string[] = [];

      if (!isAvailable) {
        if (isSlotConflict) reasons.push("Đã có lịch trùng giờ");
        else if (!isShiftMatch) reasons.push(staffShift === "morning" ? "Chỉ nhận ca sáng" : "Chỉ nhận ca chiều");
        else if (staff.status !== "active") reasons.push(staff.status === "incident" ? "Đang xử lý sự cố" : "Tạm nghỉ");
        else reasons.push("Đã đạt giới hạn ca trong ngày");
        score = 0;
      } else {
        // Điểm chuyên môn
        if (eventLower.includes("cưới") || eventLower.includes("hôn") || eventLower.includes("sinh nhật")) {
          if (staff.role === "consultant_wedding") {
            score += 35;
            reasons.push("Chuyên gia tiệc cưới hàng đầu");
          }
        } else if (
          eventLower.includes("hội nghị") ||
          eventLower.includes("hội thảo") ||
          eventLower.includes("doanh nghiệp") ||
          eventLower.includes("khai trương")
        ) {
          if (staff.role === "consultant_corporate" || staff.role === "coordinator_gala") {
            score += 35;
            reasons.push("Kinh nghiệm hội nghị doanh nghiệp");
          }
        } else if (
          eventLower.includes("gala") ||
          eventLower.includes("tri ân") ||
          eventLower.includes("tất niên") ||
          eventLower.includes("year-end")
        ) {
          if (staff.role === "coordinator_gala" || staff.role === "director_event") {
            score += 35;
            reasons.push("Chuyên gia dạ tiệc Gala & YEP");
          }
        } else if (
          eventLower.includes("vip") ||
          eventLower.includes("trực thăng") ||
          eventLower.includes("phi cơ") ||
          eventLower.includes("cao cấp")
        ) {
          if (staff.role === "director_event") {
            score += 45;
            reasons.push("Giám đốc điều phối sự kiện VIP");
          }
        } else if (eventLower.includes("âm thanh") || eventLower.includes("ánh sáng") || eventLower.includes("thiết bị")) {
          if (staff.role === "tech_lead_av") {
            score += 40;
            reasons.push("Kỹ sư âm thanh ánh sáng chuyên nghiệp");
          }
        }

        // Cân bằng tải: ít lịch hơn trong ngày -> điểm cao hơn
        const slotRemaining = staff.maxDailySlots - assignedCountOnDate;
        score += slotRemaining * 3;
        reasons.push(`Còn ${slotRemaining} slot trống trong ngày`);

        // Điểm đánh giá (rating)
        score += (staff.rating - 4.5) * 10;
      }

      return {
        staff,
        score: Math.max(0, Math.round(score)),
        reason: reasons.join(" • ") || "Nhân viên sẵn sàng nhận lịch",
        isAvailable,
        assignedCountOnDate,
      };
    });

  // Xếp theo điểm giảm dần (khả dụng lên trước)
  return results.sort((a, b) => {
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    return b.score - a.score;
  });
}

/**
 * Tự động tìm nhân viên tối ưu nhất để gán cho booking mới
 */
export function getBestStaffForBooking(params: {
  date: string;
  time: string;
  eventType?: string;
}): StaffMember | null {
  const recommendations = recommendStaffForBooking(params);
  const best = recommendations.find((r) => r.isAvailable);
  return best ? best.staff : null;
}
