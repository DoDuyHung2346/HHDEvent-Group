import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/estimate-surcharge/route";
import { NextRequest } from "next/server";

function createMockRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/estimate-surcharge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/estimate-surcharge API Route", () => {
  it("trả về 0 phụ phí khi không có ghi chú", async () => {
    const req = createMockRequest({ notes: "", guestCount: 200 });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.items).toHaveLength(0);
    expect(data.totalSurcharge).toBe(0);
    expect(data.feasibilityScore).toBe(98);
  });

  it("phát hiện phụ phí địa bàn khi nhắc đến đảo Phú Quốc", async () => {
    const req = createMockRequest({
      notes: "Sự kiện tổ chức tại bãi biển resort ở đảo Phú Quốc",
      guestCount: 250,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.items.some((i: any) => i.id === "sur-logistics")).toBe(true);
    expect(data.items.some((i: any) => i.id === "sur-weather")).toBe(true);
    expect(data.totalSurcharge).toBeGreaterThan(0);
  });

  it("phát hiện phụ phí thi công đêm và tăng ca", async () => {
    const req = createMockRequest({
      notes: "Khách sạn yêu cầu thi công xuyên đêm trong 4 tiếng (00:00 - 05:00)",
      guestCount: 150,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.items.some((i: any) => i.id === "sur-nightshift")).toBe(true);
  });

  it("phát hiện phụ phí ẩm thực Halal / Chay riêng biệt", async () => {
    const req = createMockRequest({
      notes: "Yêu cầu line bếp chay và thực đơn Halal riêng cho 20 đại biểu nước ngoài",
      guestCount: 200,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.items.some((i: any) => i.id === "sur-dietary")).toBe(true);
  });

  it("phát hiện phụ phí giấy phép bay Flycam và tác quyền", async () => {
    const req = createMockRequest({
      notes: "Cần bay flycam ban đêm ghi hình và xin giấy phép biểu diễn",
      guestCount: 300,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.items.some((i: any) => i.id === "sur-permit")).toBe(true);
  });
});
