# AI Log – EventViet Demo Chatbot

> Ghi lại quá trình phát triển với sự hỗ trợ của AI (Vibe Coding)  
> Yêu cầu: ≤1 trang, ≤5 ảnh/hội thoại

---

## Lần 1 – Khởi tạo Schema Zod & FAQ data

**Prompt gốc:**
> "Tạo Zod schema cho ChatResponse với fields: answer, options (2-4 chip), related_questions (đúng 3), needs_booking, matched_faq_ids, source. Dùng z.tuple cho related_questions."

**Vấn đề:** AI ban đầu dùng `z.array(z.string()).length(3)` thay vì `z.tuple([z.string(), z.string(), z.string()])`. Array.length(3) không enforce exact 3 elements ở TypeScript level.

**Cách sửa prompt:**
> "Dùng z.tuple([z.string(), z.string(), z.string()]) để enforce chính xác 3 phần tử và có kiểu TypeScript [string, string, string]"

**Kết quả:** Schema đúng, TypeScript infer ra tuple type.

---

## Lần 2 – Regex SĐT Việt Nam

**Prompt gốc:**
> "Viết regex validate SĐT Việt Nam, chấp nhận 0 hoặc +84, đầu số 3,5,7,8,9, 8 chữ số tiếp theo"

**Vấn đề:** AI tạo regex `/(0|\+84)\d{9}/` – thiếu anchor `^$`, không giới hạn đầu số, sẽ match "00901234567" hoặc "123456789012".

**Cách sửa:**
> "Thêm anchor ^ và $. Sau prefix (0 hoặc +84) phải là đúng một trong (3|5|7|8|9) rồi mới đến 8 chữ số. Như vậy tổng là 10 chữ số (với 0) hoặc 11 ký tự (với +84)."

**Regex cuối:** `^(0|\+84)(3|5|7|8|9)\d{8}$` ✅

---

## Lần 3 – Phát hiện slot trùng

**Prompt gốc:**
> "Viết hàm kiểm tra slot booking, tối đa 2 lịch/khung giờ"

**Vấn đề:** AI so sánh cả `status !== 'processed'` — lịch đã xử lý vẫn chiếm slot.

**Cách sửa:**
> "Đếm TẤT CẢ lịch (kể cả đã processed) trong cùng date+time. Slot bị coi là đầy nếu tổng số lịch ≥ 2, bất kể trạng thái."

**Kết quả:** `existingBookings.filter(b => b.date === date && b.time === time).length >= MAX` ✅

---

## Lần 4 – Timezone Bug trong test

**Vấn đề phát hiện khi test:** `tomorrowWorkday()` dùng `.toISOString().split('T')[0]` trả về UTC date. Lúc 00:08 giờ VN (UTC+7), UTC vẫn là ngày hôm trước, nên "ngày mai" theo UTC lại là "hôm nay" theo VN → test fail.

**Cách sửa:**
> "Dùng `.toLocaleDateString('sv-SE')` thay `.toISOString()` để lấy ngày theo local timezone (format YYYY-MM-DD)"

**Bài học:** Luôn cẩn thận với timezone khi so sánh ngày trong Node.js. `toISOString()` luôn là UTC.

---

## Lần 5 – Stop Words cho Retrieval

**Vấn đề:** Query "thời tiết hôm nay" cho score = 9 (cao hơn threshold 2), mặc dù hoàn toàn không liên quan đến sự kiện. Nguyên nhân: token "thoi" (từ "thời") match "thoi" trong "thời gian" của FAQ.

**Cách sửa:**
> "Thêm Vietnamese stop words list: loại bỏ 'thoi', 'tiet', 'hom', 'nay', 'noi', và các từ phổ biến khác trước khi chấm điểm. Chỉ dùng exact match thay vì partial match rộng."

**Kết quả:** Score "thời tiết hôm nay" = 0, nằm dưới threshold → đúng hành vi out-of-scope ✅

---

## Tổng kết

| Phase | Thời gian | Kết quả |
|---|---|---|
| P1: Schema + FAQ + Retrieve | ~30 phút | ✅ 14 tests pass |
| P2: API Route + AI Client | ~20 phút | ✅ 7 tests pass |
| P3: UI Components | ~30 phút | ✅ Build clean |
| P4: Booking Form + Validate | ~20 phút | ✅ 29 tests pass |
| P5: Admin Page | ~15 phút | ✅ Build clean |
| P6: Fix bugs + Docs | ~30 phút | ✅ 56/56 pass |
