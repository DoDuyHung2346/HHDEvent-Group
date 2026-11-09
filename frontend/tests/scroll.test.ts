import { describe, it, expect } from "vitest";
import { getAiMessageScrollTop } from "@/lib/chat/scroll";

describe("getAiMessageScrollTop", () => {
  it("tin ngắn hơn hoặc bằng viewport thì cuộn xuống đáy", () => {
    const top = getAiMessageScrollTop({
      elTop: 500,
      elHeight: 200,
      viewportHeight: 600,
      scrollHeight: 1000,
    });
    // maxTop = 1000 - 600 = 400
    expect(top).toBe(400);
  });

  it("tin dài hơn viewport thì neo đầu tin nhắn (elTop - pad)", () => {
    const top = getAiMessageScrollTop({
      elTop: 300,
      elHeight: 800,
      viewportHeight: 500,
      scrollHeight: 1500,
      topPadding: 12,
    });
    // elHeight + 12 (812) > 500 -> neo đầu = elTop - 12 = 288
    expect(top).toBe(288);
  });

  it("không trả về số âm nếu elTop quá gần đỉnh", () => {
    const top = getAiMessageScrollTop({
      elTop: 5,
      elHeight: 800,
      viewportHeight: 500,
      scrollHeight: 1500,
      topPadding: 12,
    });
    expect(top).toBe(0);
  });

  it("không vượt quá maxTop khi neo đầu", () => {
    const top = getAiMessageScrollTop({
      elTop: 1400,
      elHeight: 700,
      viewportHeight: 500,
      scrollHeight: 1500,
      topPadding: 12,
    });
    // maxTop = 1500 - 500 = 1000
    // elTop - pad = 1388 > 1000 -> lấy maxTop = 1000
    expect(top).toBe(1000);
  });
});

