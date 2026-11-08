import type { Booking } from "@/lib/schemas";

export type BookingRow = {
  id: string;
  customer_name: string;
  phone: string;
  event_type: string | null;
  guest_count: number | null;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "processed" | "cancelled";
  notes: string | null;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  assigned_staff_phone?: string | null;
  shift?: "morning" | "afternoon" | null;
  created_at: string;
};

export function bookingFromRow(row: BookingRow): Booking {
  return {
    id: row.id,
    name: row.customer_name,
    phone: row.phone,
    date: row.appointment_date,
    time: row.appointment_time.slice(0, 5),
    eventType: row.event_type ?? undefined,
    notes: row.notes ?? undefined,
    assignedStaffId: row.assigned_staff_id ?? undefined,
    assignedStaffName: row.assigned_staff_name ?? undefined,
    assignedStaffPhone: row.assigned_staff_phone ?? undefined,
    shift: row.shift ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}
