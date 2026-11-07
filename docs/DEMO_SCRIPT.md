# Kịch bản Demo – EventViet Demo Chatbot (2 phút)

## Chuẩn bị

- Mở trình duyệt tại `http://localhost:3000`
- Mở DevTools → Network (để thấy API calls)
- Mở tab thứ 2 tại `http://localhost:3000/admin`

---

## Phần 1: Chat FAQ (0:00 – 0:45)

**[0:00]** Mở trang chủ → giới thiệu giao diện chatbot

**[0:10]** Bấm chip **"🎉 Year-end party"**
- → AI trả lời về giá, có badge "🤖 AI"
- → Hiển thị 3 câu hỏi liên quan, 2-4 options

**[0:20]** Bấm chip **"💰 Hỏi về giá"** trong related questions
- → AI diễn đạt lại từ FAQ-03 (không bịa số)

**[0:30]** Gõ thủ công: **"thời tiết hôm nay"**
- → Chatbot không gọi AI (score thấp)
- → Hiển thị "📋 Đặt lịch tư vấn" (needs_booking=true)
- → Badge "⚡ Mô phỏng" xuất hiện

---

## Phần 2: Đặt lịch (0:45 – 1:20)

**[0:45]** Bấm **"📅 Đặt lịch tư vấn"**
- → Modal booking mở

**[0:50]** Thử nhập SĐT sai: "12345"
- → Thông báo lỗi tiếng Việt ngay lập tức

**[0:55]** Điền form hợp lệ:
- Tên: "Nguyễn Văn A"
- SĐT: "0901234567"
- Chọn ngày (T2 tuần tới)
- Chọn giờ: 09:00
- Loại sự kiện: Year-end party

**[1:10]** Bấm **"✅ Xác nhận đặt lịch"**
- → Modal đóng, toast "✅ Đặt lịch thành công!"

---

## Phần 3: Admin (1:20 – 1:50)

**[1:20]** Chuyển sang tab `/admin`
- → Lịch vừa đặt xuất hiện trong danh sách
- → Badge "⏳ Chờ xử lý"

**[1:30]** Bấm **"Đánh dấu xử lý"**
- → Badge chuyển "✅ Đã xử lý"

**[1:40]** Bấm **"Xóa"** → Confirm dialog xuất hiện
- → Bấm "Xóa" trong dialog → lịch biến mất
- → Bấm "Hủy" → lịch vẫn còn (demo flow)

**[1:50]** Thử filter "⏳ Chờ xử lý" / "✅ Đã xử lý"

---

## Phần 4: Kỹ thuật (1:50 – 2:00)

**[1:50]** Mở DevTools → Application → localStorage
- → Thấy key `eventviet_bookings` với `schemaVersion: 1`

**[1:55]** Mở DevTools → Network → Request POST /api/chat
- → Header: không có API key
- → Response: JSON đúng schema

---

## Điểm nhấn cần highlight

1. ✅ AI badge vs Mô phỏng badge
2. ✅ Related questions bấm được  
3. ✅ Form validation tiếng Việt
4. ✅ Admin chỉ xóa lịch đã xử lý
5. ✅ API key an toàn (server-only)
