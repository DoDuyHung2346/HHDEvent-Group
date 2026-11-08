import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingFromRow, type BookingRow } from "@/lib/supabase/bookingMapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateDate, validateTime } from "@/lib/booking/validate";

const UpdateBookingSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional(),
  status: z.enum(["pending", "processed", "cancelled"]).optional(),
});

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = UpdateBookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error("Dữ liệu cập nhật không hợp lệ.");
  const input = parsed.data;
  const supabase = createServerSupabaseClient();

  if (input.date || input.time) {
    if (!input.date || !input.time) return error("Cần cung cấp đầy đủ ngày và giờ mới.");
    const validationError = validateDate(input.date) || validateTime(input.time);
    if (validationError) return error(validationError);
    const { data, error: rpcError } = await supabase.rpc("reschedule_booking", {
      p_booking_id: id,
      p_date: input.date,
      p_time: input.time,
    });
    if (rpcError || !data) return error(rpcError?.message || "Không thể đổi lịch.", rpcError?.code === "P0001" ? 409 : 500);
    return NextResponse.json({ booking: bookingFromRow(data as BookingRow) });
  }

  if (input.status) {
    const { data, error: updateError } = await supabase
      .from("bookings")
      .update({ status: input.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, customer_name, phone, event_type, guest_count, appointment_date, appointment_time, status, notes, assigned_staff_id, assigned_staff_name, assigned_staff_phone, shift, created_at")
      .single();
    if (updateError || !data) return error("Không thể cập nhật trạng thái lịch hẹn.", 500);
    return NextResponse.json({ booking: bookingFromRow(data as BookingRow) });
  }

  return error("Không có thay đổi nào.");
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = createServerSupabaseClient();
  const { data: current, error: findError } = await supabase.from("bookings").select("status").eq("id", id).single();
  if (findError || !current) return error("Không tìm thấy lịch hẹn.", 404);
  if (current.status !== "processed") return error("Chỉ có thể xóa lịch hẹn đã xử lý.", 409);
  const { error: deleteError } = await supabase.from("bookings").delete().eq("id", id);
  if (deleteError) return error("Không thể xóa lịch hẹn.", 500);
  return new NextResponse(null, { status: 204 });
}
