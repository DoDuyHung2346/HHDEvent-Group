import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validatePhone } from "@/lib/booking/validate";

const CustomerSchema = z.object({
  phone: z.string().trim().max(20),
  name: z.string().trim().min(1).max(50).optional(),
  memory: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = CustomerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu khách hàng không hợp lệ." }, { status: 400 });
  const phone = parsed.data.phone.replace(/\s+/g, "");
  const phoneError = validatePhone(phone);
  if (phoneError) return NextResponse.json({ error: phoneError }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const payload: Record<string, unknown> = { phone, updated_at: new Date().toISOString() };
  if (parsed.data.name) payload.name = parsed.data.name;
  if (parsed.data.memory) payload.memory = parsed.data.memory;

  const { data, error } = await supabase
    .from("customers")
    .upsert(payload, { onConflict: "phone" })
    .select("id, phone, name, memory, created_at, updated_at")
    .single();
  if (error || !data) return NextResponse.json({ error: "Không thể lưu hồ sơ khách hàng." }, { status: 500 });
  return NextResponse.json({ customer: data });
}
