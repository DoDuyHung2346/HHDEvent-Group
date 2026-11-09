import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingFromRow, type BookingRow } from "@/lib/supabase/bookingMapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateDate, validateName, validatePhone, validateTime } from "@/lib/booking/validate";
import { hasAdminSession } from "@/lib/auth/adminSession.server";

const CreateBookingSchema = z.object({
  name: z.string().trim().min(2).max(50),
  phone: z.string().trim().max(20),
  date: z.string(),
  time: z.string(),
  eventType: z.string().trim().max(200).optional(),
  guestCount: z.number().int().min(1).max(2000).optional(),
  notes: z.string().trim().max(500).optional(),
  assignedStaffId: z.string().max(50).optional(),
  assignedStaffName: z.string().max(100).optional(),
  assignedStaffPhone: z.string().max(20).optional(),
  shift: z.enum(["morning", "afternoon"]).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone")?.replace(/\s+/g, "");
  const date = request.nextUrl.searchParams.get("date");
  const all = request.nextUrl.searchParams.get("all") === "1";
  if (!phone && !date && !all) return jsonError("Cần số điện thoại hoặc ngày cần tra cứu.");
  if (all && !(await hasAdminSession())) {
    return jsonError("Không có quyền xem toàn bộ lịch hẹn.", 403);
  }

  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("bookings")
    .select("id, customer_name, phone, event_type, guest_count, appointment_date, appointment_time, status, notes, assigned_staff_id, assigned_staff_name, assigned_staff_phone, shift, created_at")
    .order("created_at", { ascending: false });

  if (phone) query = query.eq("phone", phone);
  if (date) query = query.eq("appointment_date", date);

  const { data, error } = await query;
  if (error) return jsonError("Không thể tải lịch hẹn từ hệ thống.", 500);

  const bookings = (data as BookingRow[]).map(bookingFromRow);
  // Form chọn giờ chỉ cần biết slot nào còn chỗ; không trả SĐT/tên khách khác.
  if (date && !phone && !all) {
    return NextResponse.json({
      bookings: bookings.map((booking) => ({ ...booking, name: "", phone: "", eventType: undefined, notes: undefined })),
    });
  }
  return NextResponse.json({ bookings });
}

export async function POST(request: NextRequest) {
  const parsed = CreateBookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Dữ liệu đặt lịch không hợp lệ.");

  const input = parsed.data;
  const phone = input.phone.replace(/\s+/g, "");
  const validationError = validateName(input.name) || validatePhone(phone) || validateDate(input.date) || validateTime(input.time);
  if (validationError) return jsonError(validationError);

  const supabase = createServerSupabaseClient();
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert({ phone, name: input.name }, { onConflict: "phone" })
    .select("id")
    .single();

  if (customerError || !customer) return jsonError("Không thể lưu hồ sơ khách hàng.", 500);

  const { data, error } = await supabase.rpc("create_booking", {
    p_customer_id: customer.id,
    p_customer_name: input.name,
    p_phone: phone,
    p_event_type: input.eventType ?? null,
    p_guest_count: input.guestCount ?? null,
    p_date: input.date,
    p_time: input.time,
    p_notes: input.notes ?? null,
  });

  if (error || !data) {
    const message = error?.message || "Không thể tạo lịch hẹn.";
    return jsonError(message, error?.code === "P0001" ? 409 : 500);
  }

  const { data: assigned, error: assignmentError } = await supabase
    .from("bookings")
    .update({
      assigned_staff_id: input.assignedStaffId ?? null,
      assigned_staff_name: input.assignedStaffName ?? null,
      assigned_staff_phone: input.assignedStaffPhone ?? null,
      shift: input.shift ?? null,
    })
    .eq("id", (data as BookingRow).id)
    .select("id, customer_name, phone, event_type, guest_count, appointment_date, appointment_time, status, notes, assigned_staff_id, assigned_staff_name, assigned_staff_phone, shift, created_at")
    .single();
  if (assignmentError || !assigned) return jsonError("Đã tạo lịch nhưng chưa thể phân công chuyên viên.", 500);
  return NextResponse.json({ booking: bookingFromRow(assigned as BookingRow) }, { status: 201 });
}
