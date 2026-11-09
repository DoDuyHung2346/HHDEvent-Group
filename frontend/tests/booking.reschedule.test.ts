import { describe, expect, it } from "vitest";
import { isRescheduleRequest, parseRescheduleTarget } from "@/lib/booking/reschedule";

describe("natural-language rescheduling", () => {
  it("recognizes 'chuyển qua' as a reschedule action", () => {
    expect(isRescheduleRequest("tôi lại muốn chuyển qua 14h chiều mai được ko")).toBe(true);
  });

  it("resolves tomorrow and a Vietnamese hour into a complete target", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    expect(parseRescheduleTarget("tôi muốn chuyển qua 14h chiều mai")).toMatchObject({
      date: expectedDate,
      time: "14:00",
    });
  });
});
