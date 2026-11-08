-- Run this once in Supabase SQL Editor after the initial schema.
-- It upgrades booking creation/rescheduling so database rules remain valid
-- even if several browser requests arrive at the same time.

alter table public.bookings add column if not exists assigned_staff_id text;
alter table public.bookings add column if not exists assigned_staff_name text;
alter table public.bookings add column if not exists assigned_staff_phone text;
alter table public.bookings add column if not exists shift text;

create or replace function public.create_booking(
  p_customer_id uuid,
  p_customer_name text,
  p_phone text,
  p_event_type text,
  p_guest_count integer,
  p_date date,
  p_time time,
  p_notes text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_count integer;
  slot_count integer;
  result public.bookings;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_phone, 0));
  perform pg_advisory_xact_lock(hashtextextended('slot:' || p_date::text || ':' || p_time::text, 0));

  select count(*) into booking_count
  from public.bookings
  where phone = p_phone and status = 'pending';

  if booking_count >= 2 then
    raise exception 'Số điện thoại này đã có tối đa 2 lịch hẹn đang chờ xử lý.';
  end if;

  if exists (
    select 1 from public.bookings
    where phone = p_phone and appointment_date = p_date and appointment_time = p_time and status = 'pending'
  ) then
    raise exception 'Số điện thoại này đã có lịch hẹn trùng ngày và giờ.';
  end if;

  select count(*) into slot_count
  from public.bookings
  where appointment_date = p_date and appointment_time = p_time and status = 'pending';

  if slot_count >= 4 then
    raise exception 'Khung giờ này đã đầy. Vui lòng chọn giờ khác.';
  end if;

  insert into public.bookings (
    customer_id, customer_name, phone, event_type, guest_count,
    appointment_date, appointment_time, notes
  ) values (
    p_customer_id, p_customer_name, p_phone, p_event_type, p_guest_count,
    p_date, p_time, p_notes
  ) returning * into result;

  return result;
end;
$$;

create or replace function public.reschedule_booking(
  p_booking_id uuid,
  p_date date,
  p_time time
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  current_booking public.bookings;
  booking_count integer;
  slot_count integer;
begin
  select * into current_booking from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Không tìm thấy lịch hẹn.';
  end if;
  if current_booking.status <> 'pending' then
    raise exception 'Chỉ có thể đổi lịch hẹn đang chờ xử lý.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_booking.phone, 0));
  perform pg_advisory_xact_lock(hashtextextended('slot:' || p_date::text || ':' || p_time::text, 0));

  select count(*) into booking_count
  from public.bookings
  where phone = current_booking.phone
    and status = 'pending'
    and id <> p_booking_id;

  if booking_count >= 2 then
    raise exception 'Số điện thoại này đã có tối đa 2 lịch hẹn đang chờ xử lý.';
  end if;

  if exists (
    select 1 from public.bookings
    where phone = current_booking.phone
      and appointment_date = p_date
      and appointment_time = p_time
      and status = 'pending'
      and id <> p_booking_id
  ) then
    raise exception 'Số điện thoại này đã có lịch hẹn trùng ngày và giờ.';
  end if;

  select count(*) into slot_count
  from public.bookings
  where appointment_date = p_date
    and appointment_time = p_time
    and status = 'pending'
    and id <> p_booking_id;

  if slot_count >= 4 then
    raise exception 'Khung giờ này đã đầy. Vui lòng chọn giờ khác.';
  end if;

  update public.bookings
  set appointment_date = p_date, appointment_time = p_time, updated_at = now()
  where id = p_booking_id
  returning * into current_booking;

  return current_booking;
end;
$$;
