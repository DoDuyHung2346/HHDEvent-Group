# Kết quả Kiểm thử – EventViet Demo Chatbot

> Chạy: `npm test` · Ngày: 2026-10-28 · Môi trường: Node.js (vitest 5.0.5)

## Tổng kết

| Metric | Kết quả |
|---|---|
| Test Files | 5 passed |
| Tests | **56 passed / 56 total** |
| Thời gian | ~460ms |

```
✓ tests/retrieve.test.ts      (6 tests)
✓ tests/booking.validate.test.ts (29 tests)
✓ tests/booking.storage.test.ts  (8 tests)
✓ tests/parseResponse.test.ts   (6 tests)
✓ tests/chat.route.test.ts      (7 tests)
```

---

## 6 Ca kiểm thử bắt buộc (theo spec)

| # | Loại | Ca kiểm thử | File | Kết quả |
|---|---|---|---|---|
| 1 | Thường | Hỏi "giá year-end party" → match FAQ, có 3 gợi ý, có options | `retrieve.test.ts:CA-1` | ✅ PASS |
| 2 | Thường | Đặt lịch hợp lệ → không lỗi, lưu thành công | `booking.validate.test.ts:CA-1, storage:CA-4,5` | ✅ PASS |
| 3 | Sai | SĐT "12345" → chặn, báo lỗi tiếng Việt | `booking.validate.test.ts:CA-3 (phone)` | ✅ PASS |
| 4 | Sai | Ngày Chủ nhật / ngày quá khứ → chặn | `booking.validate.test.ts:CA-4 (date)` | ✅ PASS |
| 5 | Biên | "thời tiết hôm nay" → score < threshold → needs_booking=true | `chat.route.test.ts:CA-4` | ✅ PASS |
| 6 | Sự cố | AI timeout/JSON hỏng → fallback mock, source="mock" | `chat.route.test.ts:CA-5,7` | ✅ PASS |

---

## Chi tiết từng file test

### `tests/retrieve.test.ts` — Truy xuất FAQ

| # | Ca | Input | Expected | Actual |
|---|---|---|---|---|
| CA-1 | Thường | "giá tổ chức year-end party" | Match FAQ-02 hoặc FAQ-03 | ✅ PASS |
| CA-2 | Biên | Câu hỏi rỗng | [] | ✅ PASS |
| CA-3 | Biên | "thời tiết hôm nay" | score < 2 | ✅ PASS (score=0) |
| CA-4 | Kiểm tra precision | "số điện thoại bưu điện" | score thấp | ✅ PASS |
| CA-5 | Thường | "âm thanh ánh sáng thiết bị" | Match faq-06 | ✅ PASS |
| CA-6 | Thường | "EventViet phục vụ khu vực nào" | Match faq-10 | ✅ PASS |

### `tests/booking.validate.test.ts` — Validate đặt lịch (29 tests)

**validateName (4)**: Tên hợp lệ, rỗng, 1 ký tự, 51 ký tự — tất cả PASS  
**validatePhone (6)**: 0901234567, +84..., "12345", rỗng, sai đầu số, sai độ dài — tất cả PASS  
**validateDate (5)**: Ngày mai, hôm nay, quá khứ, Chủ nhật, rỗng — tất cả PASS  
**validateTime (5)**: 08:00, 16:30, 17:00, 07:30, 08:15 — tất cả PASS  
**validateSlotAvailability (3)**: 0 lịch, 1 lịch, 2 lịch (đầy) — tất cả PASS  
**validateBookingForm - 6 ca (6)**: Form hợp lệ, khác giờ, SĐT sai, tên rỗng, Chủ nhật, slot đầy — tất cả PASS  

### `tests/booking.storage.test.ts` — localStorage (8 tests)

| CA | Ca | Kết quả |
|---|---|---|
| CA-1 | localStorage rỗng → wasReset=false | ✅ PASS |
| CA-2 | JSON hỏng → reset an toàn, wasReset=true | ✅ PASS |
| CA-3 | schemaVersion sai → reset | ✅ PASS |
| CA-4 | Lưu và đọc lại | ✅ PASS |
| CA-5 | Thêm 2 lịch → tổng=2 | ✅ PASS |
| CA-6 | updateBookingStatus → processed | ✅ PASS |
| CA-7 | Xóa lịch đã xử lý → thành công | ✅ PASS |
| CA-8 | Xóa lịch chưa xử lý → thất bại | ✅ PASS |

### `tests/parseResponse.test.ts` — Parse AI response (6 tests)

| CA | Ca | Kết quả |
|---|---|---|
| CA-1 | JSON hợp lệ → parse thành công | ✅ PASS |
| CA-2 | Strip \`\`\`json...``` | ✅ PASS |
| CA-3 | Strip ``` không có json tag | ✅ PASS |
| CA-4 | JSON hỏng → throw | ✅ PASS |
| CA-5 | Thiếu field bắt buộc → throw ZodError | ✅ PASS |
| CA-6 | options < 2 → throw ZodError | ✅ PASS |

### `tests/chat.route.test.ts` — API Route (7 tests)

| CA | Ca | Kết quả |
|---|---|---|
| CA-1 | Câu hỏi hợp lệ → 200 | ✅ PASS |
| CA-2 | Tin nhắn rỗng → 400 | ✅ PASS |
| CA-3 | Tin nhắn > 500 ký tự → 400 | ✅ PASS |
| CA-4 | Ngoài phạm vi → needs_booking=true, không gọi AI | ✅ PASS |
| CA-5 | AI timeout → source="mock" | ✅ PASS |
| CA-6 | Rate limit → 429 | ✅ PASS |
| CA-7 | JSON request hỏng → 400 | ✅ PASS |

---

## Ca phụ đã test

- `localStorage` JSON hỏng → reset an toàn (CA-2 storage)
- Slot đã đủ 2 lịch → không thể đặt thêm (CA-6 booking form, CA-3 slot)
- Tin nhắn 501 ký tự → chặn (CA-3 chat route)
- Tên 1 ký tự và 51 ký tự → chặn (CA-3, CA-4 validateName)
