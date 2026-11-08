import type { Booking } from "@/lib/schemas";

type BookingInput = Pick<Booking, "name" | "phone" | "date" | "time" | "eventType" | "notes" | "assignedStaffId" | "assignedStaffName" | "assignedStaffPhone" | "shift"> & {
  guestCount?: number;
};

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "Không thể kết nối hệ thống lịch hẹn.");
  }
  return body as T;
}

export async function fetchBookings(params: { phone?: string; date?: string } = {}): Promise<Booking[]> {
  const query = new URLSearchParams();
  if (params.phone) query.set("phone", params.phone.replace(/\s+/g, ""));
  if (params.date) query.set("date", params.date);
  const response = await fetch(`/api/bookings?${query.toString()}`, { cache: "no-store" });
  const data = await readJson<{ bookings: Booking[] }>(response);
  return data.bookings;
}

export async function fetchAllRemoteBookings(): Promise<Booking[]> {
  const response = await fetch("/api/bookings?all=1", {
    cache: "no-store",
    headers: { "x-admin-token": process.env.NEXT_PUBLIC_RAG_ADMIN_TOKEN ?? "" },
  });
  const data = await readJson<{ bookings: Booking[] }>(response);
  return data.bookings;
}

export async function createRemoteBooking(input: BookingInput): Promise<Booking> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readJson<{ booking: Booking }>(response);
  return data.booking;
}

export async function rescheduleRemoteBooking(id: string, date: string, time: string): Promise<Booking> {
  const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, time }),
  });
  const data = await readJson<{ booking: Booking }>(response);
  return data.booking;
}

export async function updateRemoteBookingStatus(id: string, status: "pending" | "processed" | "cancelled"): Promise<Booking> {
  const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await readJson<{ booking: Booking }>(response);
  return data.booking;
}

export function cancelRemoteBooking(id: string): Promise<Booking> {
  return updateRemoteBookingStatus(id, "cancelled");
}

export async function deleteRemoteProcessedBooking(id: string): Promise<void> {
  const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.error === "string" ? body.error : "Không thể xóa lịch hẹn.");
  }
}
