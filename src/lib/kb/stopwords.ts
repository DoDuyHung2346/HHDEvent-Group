// Stop words phổ biến trong tiếng Việt - không dùng để matching
export const STOP_WORDS = new Set([
  "va", "la", "co", "khong", "cua", "trong", "de", "duoc",
  "voi", "cac", "nhung", "nay", "do", "khi", "thi", "tu",
  "mot", "hai", "ba", "bon", "sau", "bay", "tam", "chin",
  "se", "da", "dang", "bi", "cho", "theo", "tren", "duoi",
  "truoc", "ngoai", "ben", "vao", "ra", "len", "xuong",
  "hom", "qua", "mai", "sang", "chieu",
  "ban", "chung", "ho", "no", "bao", "nhieu",
  "rat", "neu", "ma", "roi", "tat", "moi", "deu",
  "toi", "anh", "chi", "em", "ong", "ba",
  // Thêm từ phổ biến không đặc trưng cho dịch vụ sự kiện
  "thoi", "tiet", "gian", "noi", "nha", "nhu", "the",
  "biet", "phai", "duoc", "muon", "hieu", "xem", "xin",
  "gio", "ngay", "nam", "thang", "tuan", "phut",
]);

