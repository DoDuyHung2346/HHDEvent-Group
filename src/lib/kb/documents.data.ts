import type { KBDocument } from "@/types";

export type { KBDocument };

export const DOCUMENTS: KBDocument[] = [
  // ── VENUE (5 tài liệu) ─────────────────────────────────────────────────────
  {
    id: "doc-venue-hcm",
    title: "Danh sách và thông tin chi tiết các venue hạng sang tại TP. Hồ Chí Minh",
    category: "venue",
    tags: [
      "venue",
      "địa điểm",
      "hồ chí minh",
      "tphcm",
      "sài gòn",
      "new world",
      "caravelle",
      "rex",
      "gem center",
      "white palace",
      "khách sạn 5 sao",
      "trung tâm hội nghị",
      "sức chứa",
      "giá thuê",
    ],
    content: `Tổng hợp các trung tâm hội nghị và khách sạn 5 sao hàng đầu tại TP. Hồ Chí Minh do EventViet trực tiếp liên kết và điều phối:

1. GEM Center:
- Địa chỉ: Số 8 Nguyễn Bỉnh Khiêm, Phường Đa Kao, Quận 1, TP.HCM.
- Sức chứa: Lên đến 2.000 khách (setup tiệc bàn banquet 1.400 khách, rạp hát theater 2.000 khách).
- Giá thuê hội trường: 100.000.000 - 200.000.000 VNĐ / buổi (chưa bao gồm F&B).
- Đặc điểm: Không gian nghệ thuật đỉnh cao, trần nhà cao 9m chịu tải trọng treo móc (rigging) nặng, hệ thống thang nâng ô tô trực tiếp lên sảnh tầng 3 thích hợp cho lễ ra mắt xe hơi và công nghệ cao.

2. White Palace (Hoàng Văn Thụ & Võ Văn Kiệt/Phạm Văn Đồng):
- Địa chỉ: 194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận & 108 Phạm Văn Đồng, TP. Thủ Đức.
- Sức chứa: Đại sảnh lớn có thể phục vụ lên tới 3.000 khách.
- Giá thuê: 150.000.000 - 300.000.000 VNĐ / sảnh lớn.
- Ưu điểm: Kiến trúc vòm trắng sang trọng phong cách châu Âu, bãi giữ xe ô tô sức chứa hơn 500 xe, trang bị màn hình LED P3 khổ lớn, hệ thống âm thanh vòm acoustic đồng bộ.

3. Khách sạn New World Saigon:
- Địa chỉ: 76 Lê Lai, Phường Bến Thành, Quận 1, TP.HCM.
- Sức chứa: Phòng Grand Ballroom chứa tối đa 1.200 khách theater hoặc 700 khách tiệc tròn.
- Giá thuê sảnh: 80.000.000 - 150.000.000 VNĐ / buổi.
- Ưu điểm: Vị trí ngay lõi trung tâm Quận 1, tiêu chuẩn dịch vụ 5 sao quốc tế, ẩm thực Á - Âu chuẩn mực, phù hợp hội nghị ngoại giao, tiệc tri ân khách hàng VIP và dạ tiệc cuối năm.

4. Khách sạn Caravelle Saigon:
- Địa chỉ: 19-23 Lam Sơn Square, Bến Nghé, Quận 1, TP.HCM.
- Sức chứa: Khoảng 800 khách hội thảo hoặc 450 khách tiệc tối gala.
- Giá thuê sảnh: 60.000.000 - 120.000.000 VNĐ / buổi.
- Ưu điểm: Nằm đối diện Nhà hát Thành phố, phong cách lịch lãm mang đậm dấu ấn lịch sử Sài Gòn, dịch vụ tiệc chuẩn mực cho các phái đoàn doanh nghiệp và hội nghị cấp cao.

5. Khách sạn Rex Hotel Saigon:
- Địa chỉ: 141 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM.
- Sức chứa: Tối đa 600 khách (Sảnh Lotus & Sunflower).
- Giá thuê: 50.000.000 - 100.000.000 VNĐ / buổi.
- Ưu điểm: Tọa lạc ngay trên phố đi bộ Nguyễn Huệ, có khu vực vườn Thượng Uyển Rooftop ngắm toàn cảnh trung tâm thành phố, thuận tiện đón tiếp quan khách và tổ chức tiệc cocktail ngoài trời.`,
  },
  {
    id: "doc-venue-hanoi",
    title: "Danh sách và thông tin các địa điểm tổ chức sự kiện cao cấp tại Hà Nội",
    category: "venue",
    tags: [
      "venue",
      "địa điểm",
      "hà nội",
      "metropole",
      "jw marriott",
      "melia",
      "intercontinental westlake",
      "khách sạn 5 sao",
      "hội nghị quốc tế",
      "sức chứa",
    ],
    content: `Danh sách các khách sạn 5 sao và trung tâm sự kiện hàng đầu tại Thủ đô Hà Nội:

1. JW Marriott Hotel Hanoi:
- Địa chỉ: Số 8 Đỗ Đức Dục, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội (cạnh Trung tâm Hội nghị Quốc gia).
- Sức chứa: Grand Ballroom rộng 1.000m² không cột, phục vụ tối đa 2.500 khách hội nghị hoặc 1.200 khách tiệc tròn.
- Mức giá thuê sảnh: 120.000.000 - 250.000.000 VNĐ / buổi.
- Ưu thế: Địa điểm từng tiếp đón các nguyên thủ quốc gia (Tổng thống Mỹ, Chủ tịch nước Trung Quốc), sân đỗ trực thăng, khuôn viên hồ nước nhân tạo tuyệt đẹp, dịch vụ yến tiệc đẳng cấp toàn cầu.

2. Sofitel Legend Metropole Hanoi:
- Địa chỉ: 15 Ngô Quyền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội.
- Sức chứa: Tối đa 500 khách cho các không gian Thăng Long Hall, La Veranda và sân vườn lãng mạn.
- Giá thuê sảnh: 70.000.000 - 130.000.000 VNĐ / sự kiện.
- Điểm nhấn: Khách sạn cổ kính lịch sử lâu đời bậc nhất Việt Nam phong cách Pháp cổ điển, phù hợp cho tiệc cưới xa hoa tinh tế, hội nghị lãnh đạo cao cấp, tiệc rượu vang và sự kiện nghệ thuật sang trọng.

3. Melia Hanoi Hotel:
- Địa chỉ: 44 Lý Thường Kiệt, Phường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội.
- Sức chứa: Grand Ballroom tiếp đón tối đa 1.000 khách.
- Giá thuê: 60.000.000 - 120.000.000 VNĐ / buổi.
- Ưu điểm: Nằm ở trung tâm khu tài chính ngoại giao Hà Nội, trần cao thoáng đãng, hệ thống vách ngăn cách âm linh hoạt có thể chia thành nhiều phòng hội thảo song song.

4. InterContinental Hanoi Westlake:
- Địa chỉ: Số 5 Từ Hoa, Phường Quảng An, Quận Tây Hồ, Hà Nội.
- Sức chứa: Grand Ballroom và Sunset Bar đón tiếp 800 khách hội thảo hoặc 400 khách tiệc cưới.
- Mức giá: 80.000.000 - 150.000.000 VNĐ.
- Điểm nổi bật: Tòa nhà xây dựng nổi hoàn toàn trên mặt nước Hồ Tây, không gian mở view hoàng hôn tuyệt mỹ, rất phù hợp cho tiệc cocktail ngoài trời, tiệc cưới riêng tư và hội nghị khách hàng cao cấp.`,
  },
  {
    id: "doc-venue-danang",
    title: "Địa điểm sự kiện bãi biển, khách sạn và resort hội nghị tại Đà Nẵng & Miền Trung",
    category: "venue",
    tags: [
      "venue",
      "địa điểm",
      "đà nẵng",
      "resort",
      "vinpearl",
      "fusion maia",
      "intercontinental danang",
      "novotel danang",
      "bãi biển",
      "team building",
      "gala dinner",
    ],
    content: `Hệ sinh thái địa điểm sự kiện kết hợp nghỉ dưỡng cao cấp tại Đà Nẵng và ven biển miền Trung:

1. Vinpearl Resort & Spa Đà Nẵng:
- Địa chỉ: Đường Trường Sa, Phường Hòa Hải, Quận Ngũ Hành Sơn, Đà Nẵng.
- Sức chứa: Trung tâm hội nghị Grand Ballroom 2.000 khách và bãi cỏ biển riêng biệt phục vụ 1.500 khách.
- Giá thuê: 100.000.000 - 220.000.000 VNĐ.
- Lợi thế: Hạ tầng tổ chức đại sự kiện trọn gói từ lưu trú, hội nghị khách hàng, team building bãi biển đến dạ tiệc gala dinner quy mô lớn của các doanh nghiệp và tập đoàn đa quốc gia.

2. InterContinental Danang Sun Peninsula Resort:
- Địa chỉ: Bãi Bắc, Bán đảo Sơn Trà, TP. Đà Nẵng.
- Sức chứa: Đại sảnh The Great Hall 1.200 khách cùng các nhà hàng cao cấp La Maison 1888.
- Mức giá thuê: 150.000.000 - 300.000.000 VNĐ.
- Ưu thế: Khu nghỉ dưỡng nhiều năm liền đạt giải sang trọng nhất thế giới do kiến trúc sư Bill Bensley thiết kế, bảo mật tuyệt đối, khung cảnh thiên nhiên núi biển hoang sơ, chuẩn mực tổ chức sự kiện yếu nhân và tiệc cưới siêu tỷ phú.

3. Novotel Danang Premier Han River:
- Địa chỉ: 36 Bạch Đằng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng.
- Sức chứa: Phòng hội nghị Thư Phù đón 800 khách, kèm theo Sky36 Rooftop Bar.
- Mức giá thuê: 60.000.000 - 120.000.000 VNĐ.
- Ưu thế: Nằm bên bờ tây sông Hàn thơ mộng ngắm cầu Rồng và cầu quay, giao thông thuận tiện từ sân bay quốc tế Đà Nẵng chỉ mất 10 phút di chuyển.

4. TIA Wellness Resort (tiền thân là Fusion Maia Da Nang):
- Địa chỉ: Đường Võ Nguyên Giáp, Phường Khuê Mỹ, Quận Ngũ Hành Sơn, Đà Nẵng.
- Sức chứa: Không gian tiệc bãi biển và khu vườn nhiệt đới thân mật 300 khách.
- Giá thuê: 50.000.000 - 100.000.000 VNĐ.
- Điểm nhấn: Phong cách tiệc cưới bãi biển lãng mạn, sự kiện chăm sóc sức khỏe (wellness retreat) của lãnh đạo doanh nghiệp, không gian riêng tư và tĩnh lặng.`,
  },
  {
    id: "doc-venue-outdoor",
    title: "Cẩm nang và địa điểm tổ chức sự kiện ngoài trời, bãi biển và biệt thự sân vườn",
    category: "venue",
    tags: [
      "venue",
      "ngoài trời",
      "outdoor",
      "bãi biển",
      "sân vườn",
      "rooftop",
      "biệt thự",
      "thời tiết",
      "mưa",
      "phương án dự phòng",
      "kỹ thuật outdoor",
    ],
    content: `Hướng dẫn tổ chức và danh mục địa điểm ngoài trời do EventViet khảo sát và vận hành:

1. Các hình thức không gian ngoài trời tiêu biểu:
- Biệt thự ven sông Thảo Điền & An Phú (Quận 2, TP.HCM): Sân cỏ sức chứa 100 - 350 khách, không gian mở riêng tư, bến du thuyền đón khách. Giá thuê địa điểm: 40.000.000 - 90.000.000 VNĐ / ngày.
- Bãi biển nghỉ dưỡng (Vũng Tàu, Phan Thiết, Đà Nẵng, Phú Quốc): Sức chứa không giới hạn (từ 200 đến 3.000 khách), lý tưởng cho Team Building bùng nổ và tiệc lửa trại Gala Dinner. Giá thuê bãi: 30.000.000 - 80.000.000 VNĐ / buổi.
- Vườn thực vật, khu dã ngoại sinh thái: Không gian xanh mát, nhiều cây cổ thụ, thích hợp ngày hội gia đình công ty (Family Day).
- Rooftop quán bar cao tầng: Ngắm pháo hoa và toàn cảnh thành phố về đêm, thích hợp tiệc countdown, networking doanh nhân, tiệc kỷ niệm độc đáo.

2. Đánh giá ưu điểm và hạn chế:
- Ưu điểm: Cảm giác phóng khoáng, gần gũi với thiên nhiên, không giới hạn ý tưởng thiết kế phối cảnh, ánh sáng hoàng hôn và ban đêm tạo hiệu ứng hình ảnh lung linh.
- Thách thức: Phụ thuộc 100% vào điều kiện thời tiết (mưa rào bất chợt, nắng gắt, gió lớn ảnh hưởng âm thanh), côn trùng, âm thanh dễ bị loãng, yêu cầu bảo vệ an ninh và cấp điện ngoài trời phức tạp.

3. Quy định bắt buộc về Kế hoạch Dự phòng (Plan B):
- EventViet luôn thiết lập phương án mái che bạt căng không gian hoặc nhà bạt trong suốt (Transparent Tent) khi tổ chức mùa mưa từ tháng 5 đến tháng 11.
- Dự phòng sảnh tiệc trong nhà tại cùng địa điểm có thể chuyển đổi trong vòng 30 phút.
- Hệ thống tủ điện tổng ngoài trời trang bị aptomat chống giật chống nước IP67 tiêu chuẩn an toàn lao động.
- Xin cấp phép âm thanh và quy định giới hạn độ ồn khu dân cư sau 22h00 theo luật định.`,
  },
  {
    id: "doc-venue-checklist",
    title: "Checklist 20 tiêu chí vàng khi khảo sát và nghiệm thu địa điểm tổ chức sự kiện",
    category: "venue",
    tags: [
      "checklist",
      "tiêu chí",
      "khảo sát",
      "chọn venue",
      "kinh nghiệm chọn địa điểm",
      "sức chứa",
      "bãi xe",
      "âm thanh",
      "overtime",
      "hợp đồng venue",
    ],
    content: `Checklist 20 tiêu chí kỹ thuật do Project Manager EventViet trực tiếp sử dụng khi khảo sát bất kỳ sảnh tiệc hay địa điểm sự kiện nào:

1. Sức chứa thực tế theo layout: Đánh giá sức chứa chính xác theo kiểu Theater (rạp hát), Classroom (lớp học) hoặc Banquet (bàn tiệc tròn 10 người), tránh tình trạng chật chội lối đi phục vụ.
2. Chiều cao trần (Ceiling Height): Trần sảnh tối thiểu phải từ 4.5m trở lên để dựng màn hình LED lớn và treo đèn sân khấu; kiểm tra kỹ các góc khuất do cột trụ lớn che chắn tầm nhìn khách.
3. Bãi đỗ xe & Luồng giao thông: Sức chứa bãi xe máy và ô tô, vị trí đưa đón khách VIP, chính sách vé xe miễn phí hay thu phí của khách tham dự.
4. Hệ thống âm thanh, ánh sáng sẵn có: Kiểm tra công suất dàn loa, micro không dây, bàn mixer của sảnh và quy định tính phí nếu công ty sự kiện mang dàn AV riêng vào.
5. Nguồn điện tổng & Máy phát dự phòng: Vị trí tủ điện 3 pha (380V), công suất chịu tải (kW), có máy phát điện tự động chuyển nguồn (ATS) khi xảy ra sự cố mất điện lưới hay không.
6. Hệ thống điều hòa nhiệt độ: Số lượng máy lạnh trung tâm, tốc độ làm mát khi phòng chứa đủ số lượng khách tối đa.
7. Chính sách F&B & Bếp phục vụ: Venue có độc quyền ẩm thực hay cho phép đơn vị catering ngoài vào; phí mang đồ ăn đồ uống vào (corkage fee) tính theo chai hay theo bàn tiệc.
8. Khung giờ Setup & Teardown miễn phí: Venue cho phép đội ngũ kỹ thuật thi công trước bao nhiêu tiếng (chuẩn là 6-8 tiếng trước giờ đón khách) mà không tính thêm phụ phí.
9. Biểu phí làm ngoài giờ (Overtime charge): Đơn giá phạt hoặc phí thuê thêm sau 22h00 đêm hoặc sau 24h00 tính theo giờ (thường từ 2.000.000 - 8.000.000 VNĐ/giờ).
10. Lối vào hậu cần (Loading Dock & Freight Elevator): Kích thước cửa tải hàng, tải trọng thang máy chở hàng, lối đi riêng cho xe tải chở thiết bị không làm ảnh hưởng sảnh chính.
11. Phòng chuẩn bị VIP / Green Room: Có phòng riêng biệt máy lạnh, gương đèn trang điểm cho cô dâu, diễn giả, nghệ sĩ khách mời hay ban lãnh đạo hay không.
12. Khu vực vệ sinh (Restroom): Số lượng buồng WC nam/nữ, khoảng cách tới sảnh tiệc, tần suất dọn dẹp vệ sinh trong suốt sự kiện.
13. Cách âm và giới hạn độ ồn (Decibel limit): Khả năng cách âm với các sảnh kế bên để tránh hiện tượng dội âm thanh giữa hai sự kiện diễn ra cùng lúc.
14. An toàn PCCC & Lối thoát hiểm: Có đầy đủ bình chữa cháy khí CO2, lối thoát hiểm chỉ dẫn đèn Exit sáng rõ ràng và không bị khóa chốt.
15. Đường truyền Internet cáp quang & Wifi: Băng thông đường truyền riêng (Dedicated Leased Line) cho nhu cầu Livestream Full HD hoặc check-in quét mã QR tốc độ cao.
16. Hỗ trợ người khuyết tật: Có đường dốc (ramp) cho xe lăn di chuyển từ bãi xe vào thang máy và sảnh tiệc.
17. Khả năng chịu tải treo trần (Rigging Points): Trần nhà có điểm treo chuyên dụng cho giàn khung truss ánh sáng và màn hình LED thả hay không.
18. Vị trí quầy lễ tân check-in & Foyer đón khách: Khu vực sảnh chờ (Foyer) có đủ rộng rãi để bày bàn đón khách, backdrop chụp ảnh và tiệc teabreak mà không gây ùn tắc thang máy.
19. Chính sách hủy phạt và bảo lưu cọc của Venue: Mức phạt hủy theo mốc thời gian (30, 60, 90 ngày) và phương thức chuyển ngày khi có yếu tố khách quan.
20. Đội ngũ nhân sự kỹ thuật trực sảnh on-site: Cung cấp thông tin liên hệ và số hotline của quản lý sảnh trực tiếp túc trực trong suốt thời gian diễn ra chương trình.`,
  },

  // ── PRICING (5 tài liệu) ───────────────────────────────────────────────────
  {
    id: "doc-pricing-wedding",
    title: "Bảng giá chi tiết dịch vụ tổ chức tiệc cưới trọn gói cao cấp năm 2026",
    category: "pricing",
    tags: [
      "báo giá",
      "giá cưới",
      "wedding",
      "tiệc cưới",
      "đám cưới",
      "gói cơ bản",
      "gói tiêu chuẩn",
      "gói luxury",
      "trang trí hoa tươi",
      "kịch bản tiệc cưới",
    ],
    content: `Bảng giá dịch vụ cưới trọn gói tại EventViet cập nhật mới nhất cho mùa cưới 2026:

1. Gói Cơ Bản (Mức chi phí: 150.000.000 - 250.000.000 VNĐ):
- Quy mô phù hợp: Tiệc cưới ấm cúng khoảng 100 - 150 khách mời.
- Hạng mục bao gồm:
  + Trang trí Backdrop chụp hình đón khách (kích thước 3m x 2.5m) kết hợp hoa tươi 50% và hoa lụa cao cấp.
  + Cổng hoa đón khách và Bàn Gallery trưng bày hình ảnh kỷ niệm của cô dâu chú rể.
  + Lối đi sân khấu rải cánh hoa tươi kèm trụ hoa dẫn lối phong cách tối giản thanh lịch.
  + Sân khấu làm lễ tiêu chuẩn, tháp rượu champagne và bánh cưới trang trí 3 tầng.
  + Hệ thống âm thanh ánh sáng cơ bản của sảnh tiệc có kỹ thuật viên căn chỉnh.
  + MC đám cưới chuyên nghiệp điều phối toàn bộ nghi thức lễ cưới truyền thống và hiện đại.
  + Đội ngũ 01 thợ chụp ảnh phóng sự cưới suốt tiệc (giao file gốc + chỉnh sửa 200 tấm).
  + Thực đơn tiệc bàn tròn tiêu chuẩn: 300.000 - 450.000 VNĐ / khách.

2. Gói Tiêu Chuẩn (Mức chi phí: 300.000.000 - 500.000.000 VNĐ):
- Quy mô phù hợp: Tiệc cưới 150 - 300 khách.
- Hạng mục bao gồm:
  + Thiết kế concept cá nhân hóa 100% dựa trên câu chuyện tình yêu của cặp đôi (Storytelling Wedding).
  + Toàn bộ hoa trang trí là 100% hoa tươi theo mùa nhập khẩu từ Đà Lạt, Hà Lan và Ecuador.
  + Photo booth 3D nghệ thuật kích thước lớn (4.5m x 3m) với hiệu ứng đèn led neon sign và hoa rủ.
  + Lối đi sân khấu lát gương phản chiếu ánh sao hoặc hiệu ứng mặt nước tráng gương nghệ thuật.
  + Hệ thống ánh sáng biểu diễn lập trình moving head beam, par led rọi hoa làm nổi bật cô dâu chú rể.
  + Ban nhạc Acoustic (Violin, Guitar, Ca sĩ) đón khách trong sảnh chờ 60 phút.
  + MC song ngữ Anh - Việt hoặc MC sự kiện giàu kinh nghiệm.
  + Đội ngũ 02 nhiếp ảnh gia phóng sự + 01 thợ quay phim chính chuẩn 4K.
  + Đội ngũ điều phối viên cưới riêng biệt 4 người lo toan từ khâu chuẩn bị trang phục, đón khách đến điều phối kịch bản.
  + Thực đơn ẩm thực cao cấp: 500.000 - 850.000 VNĐ / khách.

3. Gói Luxury (Mức chi phí: 600.000.000 - 1.200.000.000+ VNĐ):
- Quy mô phù hợp: Đám cưới xa hoa thượng lưu từ 300 đến 600+ khách tại khách sạn 5 sao hoặc Destination Wedding bãi biển.
- Hạng mục bao gồm:
  + Giám đốc sáng tạo (Creative Director) trực tiếp thiết kế không gian kiến trúc hoa nghệ thuật (Art Floral Installation) biến sảnh tiệc thành khu rừng cổ tích hoặc lâu đài ánh sáng.
  + Toàn bộ hoa tươi nhập khẩu cao cấp (hoa tulip Hà Lan, hồng Ohara, cẩm tú cầu, hoa lan hồ điệp).
  + Hệ thống trình diễn Visual 3D Mapping trên sân khấu và hiệu ứng âm thanh ánh sáng chuẩn concert.
  + Dàn nhạc giao hưởng thính phòng đón khách và đệm nhạc nghi lễ làm lễ đường.
  + Đội ngũ Media chuyên nghiệp 6 máy quay phim chuẩn điện ảnh, bay drone flycam trong nhà và ngoài trời, dựng clip Same-Day Edit chiếu ngay cuối buổi tiệc.
  + Quà tặng cảm ơn khách mời cao cấp thiết kế riêng in dấu ấn tên cô dâu chú rể.
  + Thực đơn yến tiệc Fine Dining chuẩn 5 sao quốc tế: 1.200.000 - 2.500.000 VNĐ / khách.`,
  },
  {
    id: "doc-pricing-corporate",
    title: "Báo giá chi tiết các loại hình sự kiện doanh nghiệp, hội nghị và gala dinner",
    category: "pricing",
    tags: [
      "báo giá",
      "sự kiện doanh nghiệp",
      "corporate",
      "team building",
      "hội nghị",
      "ra mắt sản phẩm",
      "year end party",
      "triển lãm",
      "chi phí tổ chức",
    ],
    content: `Bảng định mức chi phí tổ chức sự kiện dành cho khách hàng doanh nghiệp và đoàn thể:

1. Hoạt động Team Building bãi biển & ngoài trời:
- Chi phí: 5.000.000 - 20.000.000 VNĐ cho đoàn 50 người; các đoàn lớn từ 100 - 300 người từ 30.000.000 - 80.000.000 VNĐ.
- Bao gồm: Kịch bản trò chơi vận động xây dựng văn hóa gắn kết độc quyền, MC hoạt náo năng lượng cao, hệ thống đạo cụ phao hơi khổng lồ, áo team đồng màu, cờ đội, loa kéo lưu động công suất lớn, nhân sự cứu hộ y tế và nước uống đóng chai suốt chương trình.

2. Hội nghị khách hàng & Hội thảo khoa học (Conference & Seminar):
- Chi phí: 30.000.000 - 100.000.000 VNĐ (quy mô 100 - 300 khách tham dự).
- Bao gồm: Thiết kế và in ấn backdrop check-in formex nổi, bục phát biểu bọc hoa tươi, hệ thống micro cổ ngỗng hội thảo và micro đại biểu, màn hình chiếu hoặc màn hình LED trình chiếu slide, teabreak giữa giờ tiêu chuẩn bánh ngọt Pháp - trà - cafe thơm ngon, túi tài liệu hội nghị và thẻ đeo khách mời.

3. Lễ ra mắt sản phẩm mới (Product Launch Event):
- Chi phí: 80.000.000 - 300.000.000 VNĐ.
- Bao gồm: Thiết kế concept công nghệ tương lai mang tính bùng nổ truyền thông, cơ chế hé lộ sản phẩm ấn tượng (màn che lụa rơi Kabuki, màn hình kinetic trượt mở hoặc bục nâng xoay 360 độ), hệ thống pháo sáng điện tử lạnh và khói CO2 biểu diễn, đội ngũ PG lễ tân chuyên nghiệp đón khách, chụp ảnh kỷ niệm và thông cáo báo chí truyền thông.

4. Tiệc Tất niên & Dạ tiệc Gala Dinner (Year-End Party):
- Chi phí: 50.000.000 - 200.000.000 VNĐ (quy mô 100 - 400 nhân sự).
- Bao gồm: Sân khấu âm thanh ánh sáng ca nhạc sôi động, kịch bản vinh danh trao thưởng nhân viên xuất sắc, minigame bốc thăm trúng thưởng (Lucky Draw) với giao diện quay số visual điện tử trên màn hình LED, ban nhạc Rock/Pop hoặc DJ khuấy động không khí cuối tiệc.

5. Hội chợ xúc tiến thương mại & Triển lãm (Exhibition & Trade Fair):
- Chi phí: 100.000.000 - 500.000.000 VNĐ tùy số lượng gian hàng.
- Bao gồm: Thiết kế quy hoạch mặt bằng triển lãm, gia công dựng gian hàng tiêu chuẩn (3m x 3m vách nhôm alu) hoặc gian hàng đặc biệt thiết kế riêng bằng gỗ MDF sơn phủ cao cấp, hệ thống điện chiếu sáng riêng cho từng booth, thảm trải lối đi, biển chỉ dẫn và an ninh trật tự xuyên suốt triển lãm.`,
  },
  {
    id: "doc-pricing-birthday",
    title: "Báo giá dịch vụ tổ chức tiệc sinh nhật, thôi nôi và dạ tiệc kỷ niệm",
    category: "pricing",
    tags: [
      "báo giá",
      "sinh nhật",
      "thôi nôi",
      "tiệc kỷ niệm",
      "birthday",
      "gói thân mật",
      "gói vip",
      "gói luxury",
      "bánh kem",
      "hoạt náo",
    ],
    content: `Báo giá chi tiết tổ chức tiệc sinh nhật cá nhân, tiệc thôi nôi em bé và kỷ niệm thành lập công ty:

1. Gói Thân Mật (Chi phí: 10.000.000 - 30.000.000 VNĐ):
- Quy mô: 30 - 50 khách tại nhà riêng, phòng tiệc VIP nhà hàng hoặc quán cafe sân vườn.
- Bao gồm:
  + Backdrop trang trí theo chủ đề màu sắc khách hàng yêu thích (backdrop bong bóng organic nghệ thuật kết hợp hoa lụa).
  + Bàn decor phụ kiện: khung ảnh kỷ niệm, nến thơm, hoa tươi cắm bình nhỏ, bảng thông tin Chalkboard dấu ấn tuổi mới.
  + Bánh sinh nhật trang trí fondant hoặc kem bơ tạo hình nghệ thuật.
  + 01 chú hề tạo hình bong bóng nghệ thuật tặng các bé hoặc 01 MC hoạt náo mini dẫn dắt minigame trong 2 tiếng.
  + 01 nhiếp ảnh gia chụp hình lưu niệm trọn tiệc (giao toàn bộ file gốc đã chỉnh sáng).

2. Gói VIP (Chi phí: 50.000.000 - 150.000.000 VNĐ):
- Quy mô: 50 - 100 khách mời tại rooftop lounge sang trọng hoặc sảnh khách sạn 4-5 sao.
- Bao gồm:
  + Backdrop 3D kích thước lớn gắn chữ Neon Sign phát sáng tên chủ nhân buổi tiệc, kết hợp 100% hoa tươi nhập khẩu rực rỡ.
  + Dàn âm thanh ánh sáng biểu diễn mini show ca nhạc acoustic riêng tư.
  + Ban nhạc Acoustic 3 thành viên biểu diễn suốt thời gian tiệc.
  + MC dẫn dắt chương trình chuyên nghiệp, hài hước và tinh tế.
  + Tiệc Welcome Drink cocktail nhẹ đón khách kèm canapé khai vị.
  + Clip phóng sự ngắn về hành trình cuộc đời / sự nghiệp trình chiếu chúc mừng.

3. Gói Luxury Celebration (Chi phí: 200.000.000 - 500.000.000 VNĐ):
- Quy mô: 100 - 250+ khách dành cho tiệc mừng thọ, kỷ niệm ngân khánh ngày cưới, sinh nhật chủ tịch tập đoàn hoặc người nổi tiếng.
- Bao gồm:
  + Biến đổi toàn bộ không gian phòng tiệc theo concept độc bản (Gatsby Night, Dạ tiệc Hoàng Gia, Tropical Paradise...).
  + Toàn bộ hoa tươi ngoại nhập tạo hình thác hoa nghệ thuật.
  + Màn hình LED P2.5 siêu nét, hiệu ứng ánh sáng moving head sân khấu chuẩn show truyền hình.
  + Tiết mục nghệ sĩ nổi tiếng hoặc ảo thuật gia biểu diễn theo yêu cầu.
  + Thực đơn ẩm thực Fine Dining thượng hạng kết hợp rượu vang nhập khẩu cao cấp.
  + Quà tặng lưu niệm sang trọng cá nhân hóa cho từng khách mời dự tiệc.`,
  },
  {
    id: "doc-pricing-av",
    title: "Báo giá cho thuê trang thiết bị âm thanh, ánh sáng, màn hình LED và livestream",
    category: "pricing",
    tags: [
      "báo giá",
      "âm thanh",
      "ánh sáng",
      "màn hình led",
      "livestream",
      "av",
      "máy chiếu",
      "kỹ thuật sân khấu",
      "loa line array",
    ],
    content: `Bảng đơn giá cho thuê thiết bị kỹ thuật nghe nhìn (Audio - Visual) chuyên nghiệp phục vụ sự kiện:

1. Hệ thống Âm thanh chuyên nghiệp:
- Gói hội thảo nhỏ (< 100 khách): 5.000.000 - 8.000.000 VNĐ / buổi (gồm 2 loa Full-range JBL/RCF, 4 micro không dây Shure UHF, mixer kỹ thuật số số 16 kênh, kỹ thuật viên trực).
- Gói tiệc vừa & Gala Dinner (200 - 500 khách): 12.000.000 - 25.000.000 VNĐ / buổi (gồm hệ thống Line Array mini 4 sub 4 top, loa kiểm âm sân khấu monitor, micro không dây chuyên dụng, mixer Allen & Heath / Yamaha số hóa).
- Gói đại nhạc hội & sân khấu ngoài trời (500 - 2.000 khách): 30.000.000 - 50.000.000 VNĐ / sự kiện (dàn loa Line Array công suất khủng d&b audiotechnik / L-Acoustics / JBL VTX, hệ thống xử lý số DSP, micro cài đầu Shure cao cấp).

2. Màn hình LED P3 & P2.5 Indoor / Outdoor:
- Đơn giá thuê theo diện tích: 500.000 - 750.000 VNĐ / m² / ngày (đã bao gồm bộ xử lý hình ảnh Video Processor 4K, khung truss chịu lực nhôm hợp kim và kỹ thuật viên điều khiển hình ảnh).
- Chi phí thông dụng:
  + Màn LED sảnh vừa (kích thước 4m x 2.5m = 10m²): khoảng 6.000.000 - 8.000.000 VNĐ.
  + Màn LED sân khấu lớn (kích thước 7m x 4m = 28m²): khoảng 16.000.000 - 22.000.000 VNĐ.
  + Hệ thống đại màn hình cánh gà kết hợp (50 - 100m²): 30.000.000 - 80.000.000 VNĐ.

3. Hệ thống Ánh sáng sân khấu:
- Gói ánh sáng cơ bản: 3.000.000 - 8.000.000 VNĐ (gồm 8 đèn Par LED 54 bóng 3W, 4 đèn Moving Head Beam 230W, máy phun khói sân khấu, bàn điều khiển).
- Gói ánh sáng biểu diễn tiêu chuẩn: 12.000.000 - 20.000.000 VNĐ (16 Par LED, 8 Moving Beam 350W, 4 đèn Blinder chớp rọi khán giả, 2 đèn Fresnel rọi mặt MC, máy tạo sương mù Haze machine, bàn điều khiển GrandMA onPC).
- Gói ánh sáng show nghệ thuật lớn: 25.000.000 - 35.000.000 VNĐ (hệ thống wash, spot, laser công suất lớn, đèn Follow spot công suất cao rọi từng bước đi của nhân vật chính).

4. Giải pháp Livestream đa điểm cầu chuyên nghiệp:
- Chi phí: 10.000.000 - 30.000.000 VNĐ / buổi.
- Trang thiết bị: Bàn trộn hình Blackmagic ATEM Mini Extreme ISO / Television Studio 4K, 2 - 3 máy quay phim chuyên nghiệp Sony FX3/FX6 chuẩn Full HD/4K, đường truyền Internet vệ tinh bonding gộp băng thông đảm bảo không giật lag, phát sóng đồng thời trên Facebook, YouTube và phòng họp Zoom bảo mật.

5. Gói Combo Trọn Gói AV Tiết Kiệm:
- Chi phí combo: 20.000.000 - 150.000.000 VNĐ (tiết kiệm từ 15% đến 25% so với thuê lẻ từng hạng mục, bảo đảm tính tương thích đồng bộ kỹ thuật 100%).`,
  },
  {
    id: "doc-pricing-fb",
    title: "Báo giá menu ẩm thực F&B, tiệc Teabreak, tiệc Buffet, Set Menu và Bánh sự kiện",
    category: "pricing",
    tags: [
      "f&b",
      "ẩm thực",
      "menu",
      "báo giá đồ ăn",
      "teabreak",
      "tiệc buffet",
      "set menu",
      "cocktail",
      "bánh cưới",
      "gói đồ uống",
    ],
    content: `Chi tiết bảng giá dịch vụ ẩm thực (Food & Beverage) do EventViet cùng các đối tác bếp hàng đầu thực hiện:

1. Tiệc Teabreak & Welcome Cocktail:
- Gói Teabreak hội nghị tiêu chuẩn: 80.000 - 180.000 VNĐ / người.
  + Gồm 3-5 loại bánh mặn ngọt (croissant phô mai, bánh choux kem, tart trứng, su kem, muffin chocolate), đĩa hoa quả nhiệt đới tươi theo mùa, trà túi lọc Lipton/trà thảo mộc, cafe phin truyền thống và nước trái cây tươi nguyên chất.
- Gói Finger Food & Cocktail Party: 200.000 - 500.000 VNĐ / người.
  + Gồm các món Canapé tinh tế (thịt xông khói cuộn dưa lưới, bò cuộn măng tây, bánh mỳ bơ tỏi tôm nướng, đĩa cold cuts phô mai xông khói kèm olive), cocktail pha chế và rượu vang sủi sparkling wine khai vị.

2. Tiệc Đứng Tự Chọn (Dinner Buffet):
- Mức giá: 400.000 - 800.000 VNĐ / khách (tối thiểu từ 50 khách trở lên).
- Cấu trúc thực đơn: Từ 25 đến 40 món ăn phong phú gồm:
  + Khai vị: Salad cá ngừ rong biển, gỏi củ hũ dừa tôm thịt, súp kem bí đỏ bánh mỳ giòn.
  + Món chính: Tôm sú nướng bơ tỏi, mực một nắng sa tế, bò Mỹ sốt tiêu đen, gà nướng mật ong, cá hồi áp chảo sốt chanh leo, sườn heo hầm rượu vang đỏ, mỳ Ý xào hải sản, cơm chiên hoàng bào.
  + Quầy nướng BBQ trực tiếp tại chỗ do đầu bếp phục vụ.
  + Tráng miệng: Bánh flan caramel, chè hạt sen long nhãn, kem tươi và hoa quả 5 loại.

3. Tiệc Bàn Tròn Truyền Thống & Hiện Đại (Set Menu):
- Mức giá: 600.000 - 2.000.000 VNĐ / khách (tương đương 6.000.000 - 20.000.000 VNĐ / bàn 10 người).
- Set thực đơn 6 - 8 món đẳng cấp:
  + Món 1: Súp bào ngư vi cá thảo mộc hoặc súp sò điệp hải vị tuyết giáp.
  + Món 2: Gỏi ngó sen tôm thịt hoàng gia kèm phồng tôm giòn rụm.
  + Món 3: Tôm càng sen nướng muối ớt hoặc tôm sú sốt trứng muối béo ngậy.
  + Món 4: Gà ta quay giòn da bánh bao chiên thơm giòn.
  + Món 5: Bắp bò Úc hầm tiêu xanh ăn kèm bánh mỳ tươi.
  + Món 6: Cá tầm nướng lá chuối hoặc cá chẽm hấp Hong Kong xì dầu.
  + Món 7: Lẩu nấm hải sản tươi sống hoặc cơm chiên hải sản hạt sen.
  + Món 8: Tráng miệng chè yến tuyết nhĩ táo đỏ hoặc bánh mousse trà xanh.

4. Gói Đồ Uống Trọn Gói (Drink Package trong 2.5 tiếng):
- Gói phổ thông: 100.000 - 200.000 VNĐ / khách (uống không giới hạn bia Heineken/Tiger lon, nước ngọt Coca/Sprite, nước khoáng Aquafina).
- Gói cao cấp: 200.000 - 350.000 VNĐ / khách (bổ sung rượu vang đỏ & trắng nhập khẩu từ Chile, Pháp hoặc vang nổ Ý).

5. Bánh Kem Sinh Nhật & Bánh Cưới Nghệ Thuật:
- Mức giá: 5.000.000 - 50.000.000 VNĐ tùy theo kích thước và độ cầu kỳ.
- Bánh fondant tạo hình thủ công 2 đến 5 tầng, cốt bánh red velvet hoặc vani socola Bỉ, trang trí hoa đường nghệ thuật dát lá vàng 24K ăn được.`,
  },

  // ── PROCESS & POLICY (5 tài liệu) ──────────────────────────────────────────
  {
    id: "doc-process-detailed",
    title: "Quy trình làm việc chuẩn 6 bước và timeline thực thi dự án sự kiện tại EventViet",
    category: "process",
    tags: [
      "quy trình",
      "6 bước",
      "timeline",
      "tiến độ",
      "khảo sát",
      "proposal",
      "hợp đồng",
      "triển khai",
      "tổng duyệt",
      "nghiệm thu",
    ],
    content: `Quy trình dịch vụ chuyên nghiệp chuẩn ISO 6 bước giúp khách hàng an tâm tuyệt đối:

- Bước 1: Tiếp nhận yêu cầu & Tư vấn ban đầu (Thời gian: 1 - 3 ngày làm việc):
  Ghi nhận loại sự kiện, mục tiêu truyền thông, số lượng khách mời dự kiến, địa điểm mong muốn và khung ngân sách. Chỉ định Project Manager tư vấn sơ bộ trực tiếp qua điện thoại hoặc gặp mặt tại văn phòng.

- Bước 2: Khảo sát thực địa & Xây dựng Proposal chi tiết (Thời gian: 3 - 7 ngày):
  Đội ngũ kỹ thuật đến tận venue đo đạc trần, sàn, kiểm tra nguồn điện và hệ thống âm thanh ánh sáng. Lên bản thiết kế concept ý tưởng, bản vẽ 2D/3D sơ bộ và bảng dự toán chi phí chi tiết từng hạng mục để khách hàng phản hồi và lựa chọn.

- Bước 3: Đàm phán, Ký kết Hợp đồng & Đặt cọc (Thời gian: 2 - 4 ngày):
  Thống nhất các điều khoản pháp lý, phạm vi dịch vụ, bảng phụ lục kỹ thuật, chính sách bảo mật và cam kết bảo hành chất lượng. Khách hàng thực hiện thanh toán tiền đặt cọc đợt 1 (30% giá trị hợp đồng).

- Bước 4: Lên kế hoạch chi tiết, sản xuất vật tư & chuẩn bị kỹ thuật (Thời gian: 2 - 4 tuần):
  Hoàn thiện Master Script (kịch bản tổng thể chương trình), MC Script phân vai chi tiết từng phút, đặt may/in ấn backdrop và ấn phẩm quà tặng, casting tuyển chọn MC, vũ đoàn ca sĩ, chốt menu nếm thử món F&B, hoàn tất các thủ tục xin giấy phép văn hóa theo luật định.

- Bước 5: Chạy sự kiện (D-Day Event Execution):
  Thi công setup sân khấu và trang thiết bị trước giờ G từ 6 đến 24 tiếng. Tiến hành Rehearsal (tổng duyệt) âm thanh ánh sáng, kiểm tra máy chiếu và chạy thử (dry run) với MC và ban nhạc. Đội ngũ Event Coordinator và Stage Manager điều phối luồng khách và giải quyết mọi tình huống phát sinh tại chỗ.

- Bước 6: Nghiệm thu, Hậu kỳ Media & Quyết toán hợp đồng (Thời gian: 3 - 7 ngày sau sự kiện):
  Bàn giao toàn bộ dữ liệu ảnh gốc đã xử lý và video clip highlight/full show hoàn thiện. Họp tổng kết rút kinh nghiệm (Post-event evaluation), ký biên bản nghiệm thu bàn giao và xuất hóa đơn VAT, thanh toán nốt khoản phí 30% còn lại.`,
  },
  {
    id: "doc-contract-terms",
    title: "Các điều khoản pháp lý cốt lõi và mẫu hợp đồng dịch vụ tổ chức sự kiện",
    category: "policy",
    tags: [
      "hợp đồng",
      "điều khoản",
      "pháp lý",
      "trách nhiệm",
      "force majeure",
      "bảo mật",
      "sở hữu trí tuệ",
      "tranh chấp",
      "luật áp dụng",
    ],
    content: `Các điều khoản pháp lý cốt lõi trong hợp đồng kinh tế giữa EventViet và khách hàng:

1. Phạm vi cung cấp dịch vụ (Scope of Services):
Mọi hạng mục thiết bị, nhân sự, số lượng và thông số kỹ thuật được liệt kê chi tiết trong Phụ lục đính kèm Hợp đồng. Bất kỳ sự thay đổi phát sinh ngoài phụ lục phải được hai bên xác nhận bằng văn bản hoặc Phụ lục bổ sung trước khi triển khai ít nhất 03 ngày làm việc.

2. Quyền và nghĩa vụ của Bên A (Khách hàng):
- Cung cấp đầy đủ và kịp thời các thông tin, tài liệu, logo, video clip phục vụ cho công tác chuẩn bị sự kiện.
- Cử đại diện có thẩm quyền phê duyệt thiết kế mỹ thuật và kịch bản đúng thời hạn cam kết.
- Thanh toán đúng và đủ giá trị hợp đồng theo các đợt đã thỏa thuận.
- Hỗ trợ cung cấp giấy tờ pháp lý cần thiết nếu tổ chức tại trụ sở hoặc địa điểm riêng của Bên A.

3. Quyền và nghĩa vụ của Bên B (EventViet):
- Đảm bảo toàn bộ trang thiết bị kỹ thuật đúng chất lượng, thương hiệu và thông số đã cam kết trong hợp đồng.
- Bố trí nhân sự chuyên nghiệp, đúng tác phong, có mặt đúng giờ và điều hành sự kiện theo đúng kịch bản đã được Bên A phê duyệt.
- Chịu trách nhiệm bảo đảm an toàn lao động, an toàn điện và phòng cháy chữa cháy trong suốt quá trình thi công và thu dọn hiện trường.
- Bồi thường thiệt hại trực tiếp nếu vi phạm nghiêm trọng cam kết tiến độ hoặc chất lượng do lỗi chủ quan của EventViet.

4. Điều khoản Bất khả kháng (Force Majeure):
- Các sự kiện bất khả kháng bao gồm: thiên tai bão lũ cấp độ cảnh báo đỏ, động đất, hỏa hoạn không do lỗi các bên, chiến tranh, hoặc lệnh cấm tụ tập khẩn cấp của Thủ tướng/Ủy ban nhân dân do dịch bệnh nguy hiểm.
- Khi xảy ra trường hợp bất khả kháng, bên bị ảnh hưởng phải thông báo bằng văn bản cho bên kia trong vòng 24 giờ. Hai bên cùng nhau thiện chí thỏa thuận dời ngày tổ chức sự kiện mà không phải chịu bất kỳ khoản tiền phạt vi phạm nào; các chi phí nguyên vật liệu thực tế đã gia công hoàn thiện không thể hủy sẽ được hai bên chia sẻ trên tinh thần tương trợ.

5. Quyền sở hữu trí tuệ (Intellectual Property):
Tất cả các ý tưởng concept, thiết kế đồ họa 3D, kịch bản độc quyền do EventViet sáng tạo thuộc quyền sở hữu trí tuệ của EventViet cho đến khi Hợp đồng được thanh toán hoàn tất. EventViet được quyền sử dụng tư liệu hình ảnh và video ghi lại tại sự kiện cho mục đích lưu trữ portfolio truyền thông (trừ phi có thỏa thuận bảo mật văn bản riêng của khách hàng).

6. Điều khoản Bảo mật thông tin (NDA):
Hai bên cam kết giữ bí mật tuyệt đối về giá trị hợp đồng, chiến lược sản phẩm mới của khách hàng, bài phát biểu nội bộ và danh sách thông tin khách mời tham dự.

7. Giải quyết tranh chấp và Luật áp dụng:
Hợp đồng được điều chỉnh theo pháp luật nước CHXHCN Việt Nam. Mọi tranh chấp phát sinh ưu tiên giải quyết qua thương lượng hòa giải thiện chí trong vòng 30 ngày; nếu không đạt được đồng thuận, vụ việc sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại TP. Hồ Chí Minh để phán quyết.`,
  },
  {
    id: "doc-deposit-policy",
    title: "Chính sách đặt cọc, tiến độ thanh toán và quy định xuất hóa đơn giá trị gia tăng (VAT)",
    category: "policy",
    tags: [
      "đặt cọc",
      "thanh toán",
      "tiến độ",
      "30%",
      "40%",
      "hóa đơn vat",
      "chuyển khoản",
      "pos",
      "tài khoản công ty",
    ],
    content: `Chính sách tài chính minh bạch và tiến độ giải ngân tại EventViet:

1. Tiến độ thanh toán 3 đợt tiêu chuẩn:
- Đợt 1 - Đặt cọc giữ lịch (30% tổng giá trị hợp đồng):
  Thực hiện ngay sau khi hai bên ký kết Hợp đồng dịch vụ. Khoản tiền cọc này dùng để khóa lịch tổ chức sự kiện, giữ chân nhân sự chủ chốt (Project Manager, MC, Nghệ sĩ) và đặt cọc giữ chỗ với địa điểm venue.
- Đợt 2 - Tạm ứng thi công (40% tổng giá trị hợp đồng):
  Thực hiện trước ngày diễn ra sự kiện từ 14 đến 30 ngày (tùy quy mô sự kiện). Khoản tiền này phục vụ công tác mua sắm vật tư, gia công sản xuất sân khấu backdrop, đặt cọc dịch vụ ẩm thực F&B và kỹ thuật âm thanh ánh sáng.
- Đợt 3 - Quyết toán hợp đồng (30% tổng giá trị còn lại + các khoản phát sinh nghiệm thu thực tế):
  Thực hiện trong vòng từ 03 đến 05 ngày làm việc sau khi sự kiện kết thúc thành công và hai bên ký kết Biên bản nghiệm thu bàn giao dịch vụ.

2. Phương thức thanh toán được chấp nhận:
- Chuyển khoản ngân hàng chính thức: Khách hàng chuyển khoản vào tài khoản pháp nhân Công ty TNHH Giải pháp Sự kiện EventViet (Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam - Vietcombank Chi nhánh TP.HCM hoặc Ngân hàng Quân Đội - MB Bank).
- Thanh toán quẹt thẻ qua máy POS tại văn phòng: Hỗ trợ thẻ ATM nội địa, thẻ tín dụng Visa, Mastercard, JCB, American Express (áp dụng phí quẹt thẻ theo quy định ngân hàng liên kết).

3. Quy định xuất Hóa đơn Giá trị gia tăng (VAT):
- Tất cả các báo giá tiêu chuẩn của EventViet đều là giá chưa bao gồm thuế GTGT (VAT 8% hoặc 10% tùy theo quy định hiện hành của cơ quan thuế đối với từng nhóm dịch vụ).
- EventViet xuất hóa đơn điện tử hợp lệ gửi trực tiếp qua email của khách hàng hoặc bộ phận kế toán doanh nghiệp trong vòng 03 ngày làm việc sau khi nhận đủ tiền thanh toán đợt cuối.
- Khách hàng có trách nhiệm cung cấp chính xác Tên công ty, Mã số thuế và Địa chỉ đăng ký kinh doanh theo giấy phép.`,
  },
  {
    id: "doc-cancellation-policy",
    title: "Chính sách hủy dịch vụ, dời ngày tổ chức sự kiện và mức hoàn tiền đặt cọc",
    category: "policy",
    tags: [
      "chính sách hủy",
      "đổi lịch",
      "dời lịch",
      "hoàn cọc",
      "phạt hủy",
      "reschedule",
      "hoàn 70%",
      "hoàn 50%",
      "hoàn 20%",
      "miễn phí dời lịch",
    ],
    content: `Quy định về việc hủy dịch vụ hoặc dời lịch tổ chức sự kiện nhằm đảm bảo quyền lợi đôi bên:

1. Chính sách Hủy bỏ dịch vụ từ phía Khách hàng:
- Hủy trước ngày diễn ra sự kiện từ 90 ngày trở lên:
  Khách hàng được hoàn trả lại 70% số tiền cọc đã thanh toán. EventViet giữ lại 30% tiền cọc để bù đắp các chi phí khảo sát thực địa, nhân công lên ý tưởng concept, bản vẽ 3D và các chi phí hành chính ban đầu.
- Hủy trước ngày diễn ra sự kiện từ 60 đến dưới 90 ngày:
  Khách hàng được hoàn trả lại 50% số tiền cọc đã thanh toán.
- Hủy trước ngày diễn ra sự kiện từ 30 đến dưới 60 ngày:
  Khách hàng được hoàn trả lại 20% số tiền cọc đã thanh toán.
- Hủy trong vòng dưới 30 ngày trước ngày diễn ra sự kiện:
  Không hoàn lại tiền cọc (0% hoàn cọc), do toàn bộ chi phí đặt cọc sảnh tiệc venue, nguyên vật liệu đã gia công xưởng mộc và chi phí giữ lịch nghệ sĩ/MC đã được thanh toán cho các đối tác thứ ba và không thể thu hồi.
- Hủy gấp trong vòng dưới 07 ngày trước ngày sự kiện:
  Ngoài việc mất 100% tiền cọc, khách hàng có trách nhiệm bồi hoàn thêm từ 10% đến 20% giá trị hợp đồng đối với các chi phí nguyên liệu thực phẩm tươi sống F&B và thiết bị đã xuất kho vận chuyển đến hiện trường.

2. Chính sách Dời ngày tổ chức (Reschedule):
- Thông báo đổi lịch trước ít nhất 14 ngày làm việc:
  Khách hàng được MIỄN PHÍ dời lịch 01 lần trong vòng tối đa 06 tháng kể từ ngày dự kiến ban đầu (với điều kiện ngày mới còn trống lịch của venue và đội ngũ kỹ thuật EventViet).
- Thông báo đổi lịch từ 07 đến dưới 14 ngày trước sự kiện:
  Áp dụng mức phí hỗ trợ dời lịch là 10% tổng giá trị hợp đồng (chi phí bồi hoàn ngày công nhân sự và nhà cung cấp đã khóa lịch phục vụ riêng cho bạn).
- Thông báo đổi lịch dưới 07 ngày:
  Trường hợp này được xem xét giải quyết tương đương chính sách hủy gấp; tuy nhiên EventViet sẽ nỗ lực tối đa thương lượng cùng venue và nghệ sĩ để giảm thiểu thiệt hại chi phí cho khách hàng.`,
  },
  {
    id: "doc-faq-extended",
    title: "Bộ 20 câu hỏi giải đáp mở rộng về dịch vụ và vận hành sự kiện tại EventViet",
    category: "process",
    tags: [
      "faq",
      "câu hỏi thường gặp",
      "hỏi đáp",
      "bảo hiểm sự kiện",
      "mc riêng",
      "overtime",
      "thời tiết mưa",
      "giấy phép biểu diễn",
      "corkage fee",
      "trả ảnh video",
    ],
    content: `Bộ 20 câu hỏi và câu trả lời mở rộng giải quyết chi tiết mọi thắc mắc của khách hàng:

Câu 1: EventViet có mua bảo hiểm cho khách tham gia sự kiện không?
Trả lời: Có. Đối với các sự kiện quy mô từ 500 khách trở lên hoặc các hoạt động Team building bãi biển vận động mạnh, EventViet luôn tư vấn và cung cấp gói bảo hiểm trách nhiệm công cộng (Public Liability Insurance) với hạn mức bồi thường lên tới 10 tỷ đồng để bảo vệ an toàn cho mọi người tham dự.

Câu 2: Tôi có thể tự mời MC hoặc ca sĩ riêng của công ty tôi được không?
Trả lời: Hoàn toàn được. EventViet sẽ hỗ trợ tiếp nhận kịch bản, làm việc trực tiếp với MC/nghệ sĩ riêng của bạn để phổ biến timeline, hỗ trợ soundcheck âm thanh và chạy khớp chương trình trong buổi tổng duyệt.

Câu 3: Nếu chương trình bị kéo dài quá giờ dự kiến thì tính phí phát sinh thế nào?
Trả lời: Phí ngoài giờ (overtime) tính theo thời gian thực tế: Ekip âm thanh ánh sáng và điều phối tính từ 500.000 - 1.500.000 VNĐ/giờ tùy quy mô dàn máy; chi phí ngoài giờ của venue sẽ tính đúng theo hóa đơn quy định của ban quản lý địa điểm đó.

Câu 4: Khi tổ chức tiệc ngoài trời gặp mưa bão bất ngờ thì xử lý ra sao?
Trả lời: EventViet luôn có Plan B dự phòng: thiết lập sẵn nhà bạt không gian hoặc mái che di động, bọc chống nước toàn bộ dây điện và thiết bị âm thanh, chuẩn bị sẵn ô dù cầm tay đón khách từ bãi xe vào tiệc.

Câu 5: EventViet có hỗ trợ thủ tục xin giấy phép tổ chức biểu diễn không?
Trả lời: Có, bộ phận pháp lý của EventViet sẽ thay mặt khách hàng soạn hồ sơ, nộp và hoàn tất thủ tục xin giấy phép biểu diễn nghệ thuật, treo băng rôn quảng cáo tại Sở Văn hóa Thể thao và Du lịch các tỉnh thành.

Câu 6: Khách hàng có được mang rượu hoặc bia từ ngoài vào sảnh tiệc không?
Trả lời: Được, tuy nhiên hầu hết các khách sạn 5 sao sẽ áp dụng phí phục vụ khui mở chai (corkage fee). EventViet với vai trò đối tác thân thiết sẽ giúp bạn đàm phán giảm từ 30% đến 50% mức phí này.

Câu 7: Thời gian trả hình ảnh và video clip hoàn chỉnh sau sự kiện là bao lâu?
Trả lời: File ảnh gốc demo trả trong vòng 24 giờ sau sự kiện; toàn bộ ảnh chỉnh màu chất lượng cao trả sau 3-5 ngày; clip teaser highlight 3 phút trả sau 5 ngày và video full show hoàn chỉnh trả sau 7 ngày làm việc.

Câu 8: EventViet có nhận thi công gian hàng triển lãm đơn lẻ không?
Trả lời: Có, xưởng cơ khí và mộc mỹ thuật của chúng tôi nhận thi công cả gian hàng tiêu chuẩn lẫn gian hàng thiết kế đặc biệt theo bản vẽ 3D của khách hàng.

Câu 9: Đặt lịch hẹn tư vấn và khảo sát địa điểm có tốn chi phí không?
Trả lời: Hoàn toàn MIỄN PHÍ. Chuyên viên tư vấn của EventViet sẽ đến tận văn phòng của bạn hoặc hẹn gặp trực tiếp tại địa điểm dự kiến tổ chức để khảo sát và tư vấn chi tiết.

Câu 10: Tôi có thể thay đổi số lượng bàn tiệc và món ăn trước bao nhiêu ngày?
Trả lời: Quý khách có thể chốt tăng giảm số lượng bàn tiệc và điều chỉnh món ăn trước ngày diễn ra sự kiện tối thiểu 07 ngày làm việc để bộ phận bếp kịp chuẩn bị nguyên liệu tươi ngon nhất.

Câu 11: Đội ngũ kỹ thuật viên của EventViet có mặt tại sảnh trước bao lâu?
Trả lời: Đội ngũ kỹ thuật luôn có mặt trước giờ đón khách từ 4 đến 8 tiếng đối với sự kiện vừa và trước 24 tiếng đối với các đại nhạc hội lớn để lắp đặt và test thiết bị kỹ lưỡng.

Câu 12: EventViet có cung cấp hệ thống dịch cabin đa ngôn ngữ không?
Trả lời: Có, chúng tôi cung cấp cabin dịch cách âm tiêu chuẩn châu Âu kèm tai nghe hồng ngoại đa kênh không dây phục vụ các hội thảo quốc tế song ngữ hoặc đa ngữ.

Câu 13: Quy trình xuất hóa đơn giá trị gia tăng (VAT) được tiến hành như thế nào?
Trả lời: Sau khi thanh toán quyết toán và ký biên bản nghiệm thu, hóa đơn điện tử hợp lệ theo chuẩn thông tư của Tổng cục Thuế sẽ được gửi qua email kế toán của bạn trong vòng 3 ngày làm việc.

Câu 14: Tôi có thể thuê riêng từng hạng mục như âm thanh, ánh sáng hay backdrop không?
Trả lời: Có, EventViet sẵn sàng cho thuê lẻ từng hạng mục thiết bị hoặc hỗ trợ thi công backdrop riêng lẻ theo đúng nhu cầu của quý khách.

Câu 15: Tôi có phải cọc tiền trước khi nhận bản vẽ thiết kế 3D không?
Trả lời: Bản vẽ concept ý tưởng sơ bộ là hoàn toàn miễn phí. Đối với bản vẽ kỹ thuật 3D phối cảnh không gian chi tiết, khách hàng tạm ứng phí cam kết thiết kế từ 5 đến 10 triệu đồng; số tiền này sẽ được trừ 100% vào giá trị hợp đồng khi ký kết chính thức.

Câu 16: EventViet có cung cấp PG, lễ tân nam nữ đón khách không?
Trả lời: Có, đội ngũ PG/PB của chúng tôi ngoại hình đẹp, chiều cao chuẩn (nữ từ 1m68, nam từ 1m78), trang phục áo dài truyền thống hoặc vest hiện đại đồng bộ, kỹ năng giao tiếp tiếng Anh tốt.

Câu 17: Nếu số lượng khách tham dự thực tế tăng đột biến vượt dự kiến thì xử lý ra sao?
Trả lời: Bếp đối tác luôn chuẩn bị nguồn thực phẩm dự phòng từ 5% đến 10%. Về bàn ghế và chỗ ngồi, đội ngũ logistics sẽ bố trí tăng cường bàn tiệc dự phòng trong vòng 15 phút.

Câu 18: Tôi có thể thanh toán dịch vụ bằng thẻ tín dụng quốc tế Visa/Mastercard không?
Trả lời: Có, văn phòng chúng tôi trang bị máy quẹt POS hỗ trợ tất cả các dòng thẻ Visa, Mastercard, JCB, thẻ ghi nợ nội địa Napas.

Câu 19: EventViet có nhận tổ chức sự kiện tại Phú Quốc, Côn Đảo hay Nha Trang không?
Trả lời: Có, chúng tôi đã có nhiều năm kinh nghiệm điều phối container thiết bị ra các đảo và tỉnh xa, đồng thời kết nối chặt chẽ với các resort 5 sao lớn tại Phú Quốc, Nha Trang, Hạ Long.

Câu 20: Làm thế nào để tôi được làm việc với một Project Manager phụ trách riêng?
Trả lời: Ngay khi bạn đặt lịch tư vấn và xác nhận thông tin cơ bản, chúng tôi sẽ phân công một Project Manager chuyên trách theo sát bạn 24/7 từ lúc lên ý tưởng, duyệt báo giá đến ngày diễn ra sự kiện.`,
  },

  // ── TEAM & SERVICES (5 tài liệu) ──────────────────────────────────────────
  {
    id: "doc-team",
    title: "Hồ sơ năng lực đội ngũ chuyên gia và nhân sự quản lý chủ chốt tại EventViet",
    category: "team",
    tags: [
      "nhân sự",
      "đội ngũ",
      "chuyên gia",
      "project manager",
      "vũ hoàng nam",
      "lê minh châu",
      "nguyễn thái bình",
      "trần thị hoa",
      "phạm đức long",
      "lịch hẹn trống",
    ],
    content: `Giới thiệu đội ngũ nhân sự lãnh đạo và chuyên gia điều hành trực tiếp các dự án tại EventViet:

1. Vũ Hoàng Nam - Senior Project Manager (8 năm kinh nghiệm):
- Chuyên môn: Điều hành đại sự kiện doanh nghiệp quy mô lớn, Year-End Party, Lễ kỷ niệm thành lập tập đoàn và Hội nghị thượng đỉnh công nghệ (từng quản lý sự kiện cho FPT, Viettel, Vingroup).
- Điểm mạnh: Kỹ năng quản trị ngân sách xuất sắc, tối ưu hóa dòng tiền và xử lý khủng hoảng tiến độ chuẩn xác đến từng phút.
- Tình trạng lịch hẹn trống: Sẵn sàng nhận lịch tư vấn khách hàng mới vào các buổi sáng Thứ 3, Thứ 5 và sáng Thứ 7 hàng tuần.

2. Lê Minh Châu - Creative Director (7 năm kinh nghiệm):
- Chuyên môn: Đạo diễn ý tưởng nghệ thuật, chuyên gia thẩm mỹ tiệc cưới luxury và dạ tiệc VIP. Tốt nghiệp thủ khoa Đại học Mỹ thuật TP.HCM, từng thực hiện hơn 150 đám cưới thượng lưu cá nhân hóa.
- Điểm mạnh: Gu thẩm mỹ tinh tế, khả năng biến hóa concept hoa tươi độc bản và xây dựng kịch bản giàu cảm xúc chạm tới trái tim người xem.
- Tình trạng lịch hẹn trống: Trống lịch tư vấn trực tiếp vào các buổi chiều Thứ 2, Thứ 4 và Thứ 6.

3. Nguyễn Thái Bình - Technical Director (10 năm kinh nghiệm AV & Stage):
- Chuyên môn: Chỉ huy trưởng kỹ thuật âm thanh, ánh sáng, màn hình LED cỡ lớn, hiệu ứng 3D mapping và truyền hình trực tiếp đa điểm cầu. Từng đảm trách kỹ thuật cho các festival âm nhạc hơn 10.000 khán giả.
- Điểm mạnh: Am hiểu sâu sắc về âm học công trình, thiết kế giàn khung truss chịu lực an toàn tuyệt đối và quy trình chống sốc điện phòng cháy nổ.
- Tình trạng lịch hẹn trống: Sẵn sàng hỗ trợ khảo sát thực địa hiện trường cùng khách hàng theo lịch hẹn trước 01 ngày làm việc.

4. Trần Thị Hoa - F&B Manager & Hospitality Lead (6 năm kinh nghiệm):
- Chuyên môn: Quản lý ẩm thực tiệc cưới, yến tiệc ngoại giao và tiệc teabreak sang trọng. Từng giữ vị trí Giám sát Banquet tại các khách sạn 5 sao quốc tế (Park Hyatt Saigon, Sheraton).
- Điểm mạnh: Khả năng cân đối dinh dưỡng và khẩu vị vùng miền, kiểm soát quy trình vệ sinh an toàn thực phẩm nghiêm ngặt theo chuẩn HACCP.
- Tình trạng lịch hẹn trống: Nhận lịch hẹn nếm thử món và tư vấn thực đơn tiệc từ Thứ 2 đến Thứ 6 hàng tuần.

5. Phạm Đức Long - Logistics & Operations Head (9 năm kinh nghiệm):
- Chuyên môn: Chỉ đạo đội thi công dàn dựng kết cấu sân khấu, điều phối xe tải vận chuyển, quản lý luồng giao thông và an ninh hiện trường.
- Điểm mạnh: Tác phong thi công nhanh nhẹn, kỷ luật thép, luôn cam kết hoàn thành bàn giao mặt bằng trước giờ đón khách ít nhất 4 tiếng.
- Tình trạng tiếp nhận: Trực tiếp giám sát toàn bộ các công trình thi công thực tế tại công trường.`,
  },
  {
    id: "doc-mc-list",
    title: "Danh bạ 10 MC chuyên nghiệp hợp tác chiến lược cùng EventViet và biểu phí",
    category: "team",
    tags: [
      "mc",
      "người dẫn chương trình",
      "mc song ngữ",
      "mc đám cưới",
      "mc sự kiện",
      "mc doanh nghiệp",
      "báo giá mc",
      "dẫn chương trình",
    ],
    content: `Danh sách 10 MC tài năng được EventViet tuyển chọn hợp tác độc quyền và liên kết chiến lược:

1. MC Hoàng Nam (8 năm kinh nghiệm, Song ngữ Anh - Việt):
- Phong cách: Lịch lãm, đĩnh đạc, phát âm tiếng Anh chuẩn bản ngữ, kỹ năng phỏng vấn tương tác sân khấu xuất sắc.
- Sự kiện phù hợp: Hội nghị thượng đỉnh quốc tế, Diễn đàn kinh tế, Lễ ra mắt sản phẩm toàn cầu, Gala doanh nghiệp đa quốc gia.
- Mức giá thuê: 15.000.000 - 25.000.000 VNĐ / sự kiện.

2. MC Thảo My (6 năm kinh nghiệm):
- Phong cách: Duyên dáng, giọng nói truyền cảm ấm áp, xử lý tình huống khéo léo.
- Sự kiện phù hợp: Tiệc cưới phong cách lãng mạn, Lễ kỷ niệm ngày cưới, Dạ tiệc tri ân khách hàng thân thiết.
- Mức giá thuê: 6.000.000 - 12.000.000 VNĐ / tiệc.

3. MC Đức Anh (10 năm kinh nghiệm hoạt náo):
- Phong cách: Cực kỳ hài hước, năng lượng bùng nổ, khả năng khuấy động đám đông hàng ngàn người.
- Sự kiện phù hợp: Team building bãi biển, Year-End Party bùng nổ, Ngày hội gia đình doanh nghiệp (Family Day).
- Mức giá thuê: 8.000.000 - 15.000.000 VNĐ / chương trình.

4. MC Mai Phương (7 năm kinh nghiệm, Song ngữ Hoa - Việt):
- Phong cách: Sang trọng, thông thạo tiếng Quan Thoại và tiếng Quảng Đông chuyên ngành thương mại.
- Sự kiện phù hợp: Hội chợ triển lãm xúc tiến thương mại, Lễ khánh thành nhà máy đối tác Đài Loan, Trung Quốc, Singapore.
- Mức giá thuê: 12.000.000 - 20.000.000 VNĐ / sự kiện.

5. MC Tuấn Kiệt (5 năm kinh nghiệm):
- Phong cách: Trẻ trung, trendy, nắm bắt nhanh các xu hướng mạng xã hội (Gen Z).
- Sự kiện phù hợp: Lễ hội âm nhạc sinh viên, Ra mắt game online, Sự kiện thể thao điện tử eSports.
- Mức giá thuê: 5.000.000 - 9.000.000 VNĐ / show.

6. MC Khánh Vy (Song ngữ Hàn - Việt, 5 năm kinh nghiệm):
- Phong cách: Tươi sáng, đáng yêu, am hiểu văn hóa giải trí Hàn Quốc.
- Sự kiện phù hợp: Ngày hội văn hóa Hàn - Việt, K-pop fan meeting, Sự kiện của các doanh nghiệp Hàn Quốc tại Việt Nam.
- Mức giá thuê: 14.000.000 - 22.000.000 VNĐ / sự kiện.

7. MC Thanh Tùng (12 năm kinh nghiệm):
- Phong cách: Giọng đọc truyền hình chuẩn Hà Nội, phong thái trang nghiêm và uy tín.
- Sự kiện phù hợp: Hội thảo khoa học cấp quốc gia, Lễ đón nhận huân chương, Lễ kỷ niệm thành lập ngành.
- Mức giá thuê: 10.000.000 - 18.000.000 VNĐ / sự kiện.

8. MC Kim Oanh (8 năm kinh nghiệm):
- Phong cách: Giọng Nam Bộ ngọt ngào, am hiểu sâu sắc các nghi thức cưới truyền thống 3 miền.
- Sự kiện phù hợp: Lễ ăn hỏi trầu cau truyền thống, Đám cưới phong cách Nam Bộ, Tiệc mừng thọ gia đình.
- Mức giá thuê: 5.000.000 - 10.000.000 VNĐ / tiệc.

9. MC Quốc Bảo (Cựu MC truyền hình trung ương):
- Phong cách: Đẳng cấp bậc thầy, ứng biến sắc bén, tạo sức hút mạnh mẽ cho các chương trình tọa đàm chuyên sâu.
- Sự kiện phù hợp: Talkshow đối thoại cùng CEO, Tọa đàm kinh tế cấp cao của các tập đoàn niêm yết.
- Mức giá thuê: 20.000.000 - 35.000.000 VNĐ / sự kiện.

10. MC Minh Trang (MC chuyên dẫn chương trình thiếu nhi):
- Phong cách: Hoạt bát, hóa thân công chúa/chú hề dễ thương, dẫn dắt các bé vui nhộn và an toàn.
- Sự kiện phù hợp: Tiệc thôi nôi, Tiệc sinh nhật cho bé từ 1 - 10 tuổi, Sự kiện Trung thu và Quốc tế Thiếu nhi.
- Mức giá thuê: 3.000.000 - 6.000.000 VNĐ / buổi.`,
  },
  {
    id: "doc-catering",
    title: "Thông tin chi tiết 5 đơn vị đối tác Catering ẩm thực chiến lược của EventViet",
    category: "team",
    tags: [
      "catering",
      "đối tác ẩm thực",
      "deli western",
      "cơm niêu",
      "intercon catering",
      "bếp nhà hàng",
      "premium buffet",
      "ẩm thực",
      "thực đơn",
    ],
    content: `Hồ sơ 5 đơn vị đối tác cung ứng dịch vụ ẩm thực (Catering) liên kết chiến lược cùng EventViet:

1. Deli Western Cuisine:
- Phong cách chủ đạo: Ẩm thực Âu - Mỹ hiện đại, các món steak bò nướng lò than hoa, gan ngỗng áp chảo, mì Ý làm tay tươi và hải sản Địa Trung Hải.
- Mức giá trung bình: 500.000 - 1.200.000 VNĐ / suất tiệc.
- Năng lực phục vụ: Tối đa 800 khách đồng thời trong một sự kiện.
- Khu vực hoạt động: TP. Hồ Chí Minh, Bình Dương, Long An.
- Thích hợp cho: Tiệc cưới phong cách phương Tây, Tiệc tri ân đối tác nước ngoài, tiệc cocktail networking.

2. Cơm Niêu & Ẩm Thực Cố Đô:
- Phong cách chủ đạo: Ẩm thực truyền thống 3 miền Việt Nam đậm đà bản sắc: cơm niêu đập giòn rụm, cá bống kho tộ, canh cua mồng tơi cà pháo, gà ta hấp lá chanh, chả giò tôm cua.
- Mức giá trung bình: 300.000 - 650.000 VNĐ / suất.
- Năng lực phục vụ: Lên tới 1.500 khách cùng lúc.
- Khu vực hoạt động: TP.HCM và các tỉnh đồng bằng sông Cửu Long.
- Thích hợp cho: Lễ hội văn hóa truyền thống, tiệc họp mặt gia đình, đại hội công đoàn công ty.

3. InterCon 5-Star Catering:
- Phong cách chủ đạo: Yến tiệc ngoại giao và tiệc cưới xa hoa tiêu chuẩn khách sạn 5 sao quốc tế. Đội ngũ bếp trưởng từng phục vụ nhiều nhà hàng Michelin.
- Mức giá trung bình: 1.200.000 - 3.500.000 VNĐ / suất (kèm gói rượu vang cao cấp).
- Năng lực phục vụ: Phục vụ lưu động linh hoạt từ 50 đến 2.000 khách.
- Khu vực hoạt động: Toàn quốc (TP.HCM, Hà Nội, Đà Nẵng, Nha Trang, Phú Quốc).
- Thích hợp cho: Sự kiện cấp nhà nước, tiệc cưới giới siêu giàu, dạ hội kỷ niệm tập đoàn đa quốc gia.

4. Bếp Nhà Hàng Asian Fusion:
- Phong cách chủ đạo: Giao thoa ẩm thực hiện đại giữa Nhật Bản, Hàn Quốc, Thái Lan và Việt Nam (Sashimi cá hồi cá ngừ tươi cắt tại bàn, tôm hùm sốt tomyum cay nồng, bò wagyu nướng đá muối).
- Mức giá trung bình: 600.000 - 1.500.000 VNĐ / suất.
- Năng lực phục vụ: 1.000 khách.
- Khu vực hoạt động: TP.HCM, Vũng Tàu, Đồng Nai.
- Thích hợp cho: Gala dinner giới trẻ, sinh nhật VIP, sự kiện doanh nghiệp công nghệ năng động.

5. Premium Buffet Co:
- Phong cách chủ đạo: Tiệc đứng buffet tự chọn đa dạng hơn 60 món Á - Âu, quầy BBQ nướng không khói ngoài trời, quầy tráng miệng kem trái cây phong phú.
- Mức giá trung bình: 350.000 - 750.000 VNĐ / suất.
- Năng lực phục vụ: Nhận phục vụ tiệc quy mô từ 100 đến 3.000 người.
- Khu vực hoạt động: Toàn bộ vùng kinh tế trọng điểm phía Nam.
- Thích hợp cho: Ngày hội công ty (Company Trip), tiệc tất niên nhà máy, tiệc liên hoan trường học.`,
  },
  {
    id: "doc-photography",
    title: "Báo giá các gói chụp ảnh phóng sự, quay phim chuyên nghiệp và truyền thông sự kiện",
    category: "pricing",
    tags: [
      "chụp ảnh",
      "quay phim",
      "photography",
      "media",
      "phóng sự cưới",
      "quay phim 4k",
      "flycam",
      "same day edit",
      "cinematic",
      "báo giá media",
    ],
    content: `Chi tiết 4 gói dịch vụ Media quay phim, chụp ảnh phóng sự và truyền thông sự kiện do EventViet cung cấp:

1. Gói Media Cơ Bản (Chi phí: 5.000.000 VNĐ):
- Phù hợp với: Tiệc sinh nhật gia đình, hội thảo nửa ngày hoặc lễ khai trương cửa hàng nhỏ.
- Nhân sự và trang thiết bị: 01 nhiếp ảnh gia chuyên nghiệp tác nghiệp trong vòng 4 tiếng với máy ảnh Full-frame Sony A7IV / Canon R6 kèm ống kính cao cấp.
- Sản phẩm bàn giao: Chụp không giới hạn số lượng ảnh (thực tế từ 300 - 500 ảnh), chỉnh sửa ánh sáng màu sắc toàn bộ ảnh, bàn giao file gốc và file hoàn thiện qua Google Drive trong vòng 48 tiếng.

2. Gói Media Tiêu Chuẩn (Chi phí: 15.000.000 VNĐ):
- Phù hợp với: Tiệc cưới trọn vẹn từ lễ gia tiên đến tiệc tối, hoặc Gala Dinner công ty (thời gian làm việc 8 - 10 tiếng).
- Nhân sự và trang thiết bị: 02 thợ chụp ảnh phóng sự góc rộng và cận cảnh + 01 thợ quay phim chính chuẩn 4K, trang bị đèn flash phòng tiệc và gimbal chống rung chuyên dụng.
- Sản phẩm bàn giao: Toàn bộ ảnh chỉnh sửa màu (khoảng 800 - 1.200 ảnh) + 01 video clip highlight tóm tắt 3 - 5 phút lồng nhạc điện ảnh + 01 video phóng sự dài 20 - 30 phút ghi lại toàn bộ chương trình.

3. Gói Media Premium (Chi phí: 40.000.000 VNĐ):
- Phù hợp với: Lễ ra mắt thương hiệu quy mô lớn hoặc tiệc cưới luxury cần truyền thông tức thì.
- Nhân sự và trang thiết bị: Ê-kíp 5 người gồm 02 thợ chụp ảnh, 02 thợ quay phim, 01 kỹ thuật viên bay flycam 4K trên cao và 01 dựng phim on-site tại hiện trường.
- Điểm đặc biệt: Tính năng Same-Day Edit (dựng ngay clip highlight nóng trong vòng 3 tiếng để chiếu trên màn hình LED tiệc tối). Đồng thời cung cấp trạm chụp in ảnh lấy liền (Photobooth print) tặng khách mời mang về tới 300 tấm ảnh kèm bìa lưu niệm.

4. Gói Cinematic Production (Chi phí: 80.000.000 VNĐ):
- Phù hợp với: Đại nhạc hội, festival doanh nghiệp hoặc chiến dịch quảng bá thương hiệu quốc tế.
- Nhân sự và trang thiết bị: Hệ thống máy quay phim chuẩn điện ảnh quốc tế (ARRI Alexa Mini / RED Komodo), ống kính Cine Lens sắc nét tuyệt đối, cẩu quay phim Jimmy Jib 12m, hệ thống thu âm trường quay lọc tiếng ồn đa kênh.
- Sản phẩm bàn giao: Phim tài liệu ngắn về sự kiện đạt tiêu chuẩn chiếu rạp, kịch bản phân cảnh đạo diễn công phu và toàn bộ tư liệu truyền thông định dạng 4K HDR.`,
  },
  {
    id: "doc-entertainment",
    title: "Danh mục các tiết mục biểu diễn nghệ thuật, ban nhạc, DJ và nghệ nhân sự kiện",
    category: "team",
    tags: [
      "nghệ sĩ",
      "biểu diễn",
      "ban nhạc",
      "dj",
      "vũ đoàn",
      "ảo thuật",
      "xiếc",
      "photobooth",
      "giải trí sự kiện",
      "báo giá biểu diễn",
    ],
    content: `Bảng danh mục và báo giá các loại hình biểu diễn giải trí làm sôi động chương trình sự kiện:

1. Ban nhạc sống (Live Band):
- Ban nhạc Acoustic (Guitar, Cajon, Violin/Saxophone, Ca sĩ): 5.000.000 - 12.000.000 VNĐ / buổi (biểu diễn đón khách và xen kẽ trong tiệc thời lượng 90 - 120 phút).
- Ban nhạc Jazz / Cổ điển thính phòng: 10.000.000 - 20.000.000 VNĐ / buổi (thích hợp tiệc rượu vang, lễ kỷ niệm trang trọng).
- Ban nhạc Pop / Rock hiện đại (Full dàn trống Jazz, guitar điện, bass, keyboard và 2 ca sĩ nam nữ): 20.000.000 - 50.000.000 VNĐ (cháy hết mình trong phần hội của Gala Dinner và Year-End Party).

2. DJ biểu diễn âm nhạc điện tử:
- DJ tiệc trẻ trung (chơi nhạc Deep House, Tropical House tiệc hồ bơi, sinh nhật): 3.000.000 - 8.000.000 VNĐ / set 2 tiếng.
- DJ tên tuổi kết hợp cùng nghệ sĩ Violin LED hoặc Saxophone điện tử: 15.000.000 - 40.000.000 VNĐ / show biểu diễn bùng nổ cuối tiệc.

3. Vũ đoàn múa nghệ thuật:
- Tiết mục múa mở màn (Key Moment Dance): 8.000.000 - 25.000.000 VNĐ (vũ đoàn 6 - 12 vũ công múa tương tác màn hình LED 3D, múa trống nước LED, múa lân sư rồng khai trương hồng phát).
- Trình diễn thời trang (Fashion Catwalk): Đội ngũ người mẫu chuyên nghiệp catwalk trình diễn bộ sưu tập từ 20.000.000 - 60.000.000 VNĐ.

4. Tiết mục Ảo thuật & Xiếc tạp kỹ:
- Ảo thuật gia tương tác sân khấu hài hước (30 phút): 4.000.000 - 10.000.000 VNĐ.
- Xiếc công phu, xiếc uốn dẻo nghệ thuật, múa lửa ngoài trời: 6.000.000 - 15.000.000 VNĐ (đầy đủ chứng chỉ an toàn phòng cháy chữa cháy).
- Nghệ sĩ hài / Comedian diễn tiểu phẩm theo chủ đề công ty: 10.000.000 - 30.000.000 VNĐ.

5. Dịch vụ Tương tác & Nghệ nhân dân gian:
- Quầy chụp ảnh Photobooth 360 độ hoặc máy chụp in ảnh lấy ngay phong cách Hàn Quốc: 5.000.000 - 12.000.000 VNĐ / gói 3-4 tiếng (không giới hạn số lượng ảnh in kèm phụ kiện hóa trang vui nhộn).
- Nghệ nhân tò he truyền thống, nghệ nhân vẽ tranh cát nghệ thuật, nghệ nhân vẽ tranh ký họa chân dung trực tiếp tặng khách: 2.000.000 - 5.000.000 VNĐ / nghệ nhân / buổi.`,
  },
];

export const documents = DOCUMENTS;
