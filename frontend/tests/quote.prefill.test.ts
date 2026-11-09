import { describe, it, expect } from "vitest";
import { extractPrefillData } from "@/lib/quote/prefill";

describe("quote prefill extraction", () => {
  it("trích xuất đúng khoảng khách 50-100 khách (lấy trung điểm)", () => {
    const data = extractPrefillData("Tổ chức tiệc cưới 50-100 khách chi phí thế nào?");
    expect(data.guestCount).toBe(75);
  });

  it("trích xuất đúng số khách cụ thể", () => {
    const data = extractPrefillData("Tôi muốn làm sự kiện cho 80 khách");
    expect(data.guestCount).toBe(80);
  });

  it("trích xuất concept ma mị / cổ điển / tối giản từ tin nhắn", () => {
    const data1 = extractPrefillData("Tiệc Halloween concept ma mị cho 120 khách");
    expect(data1.guestCount).toBe(120);
    expect(data1.conceptId).toBe("concept-dark");

    const data2 = extractPrefillData("Đám cưới phong cách cổ điển sang trọng");
    expect(data2.conceptId).toBe("concept-classic");
  });

  it("câu không có số khách trả về undefined", () => {
    const data = extractPrefillData("EventViet có tổ chức tiệc tại Hà Nội không?");
    expect(data.guestCount).toBeUndefined();
    expect(data.conceptId).toBeUndefined();
  });
});

