// Ngưỡng retrieval: score tối thiểu để gọi LLM
export const RETRIEVAL_THRESHOLD = 2;

// Số FAQ top được truy xuất
export const TOP_K_FAQS = 3;

// Giới hạn tin nhắn
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_HISTORY_TURNS = 6;

// Giờ làm việc
export const WORK_DAYS = [1, 2, 3, 4, 5, 6]; // T2-T7 (0=CN, 1=T2, ..., 6=T7)
export const WORK_HOUR_START = 8;
export const WORK_HOUR_END = 17;
export const SLOT_STEP_MINUTES = 30;

// Giới hạn đặt lịch
// Mỗi khung giờ có 4 chuyên viên, nên tối đa 4 khách có thể được nhận cùng lúc.
export const MAX_BOOKINGS_PER_SLOT = 4;
// Chống spam/chiếm toàn bộ lịch: một SĐT chỉ được giữ tối đa 3 lịch pending/ngày.
// Mỗi khách chỉ giữ tối đa 2 lịch tư vấn đang chờ xử lý trên toàn hệ thống.
export const MAX_BOOKINGS_PER_PHONE_PER_DAY = 2;

// Timeout AI (ms)
export const AI_TIMEOUT_MS = 8000;

// Rate limit
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút

// Schema version cho localStorage
export const BOOKING_SCHEMA_VERSION = 2;
export const BOOKING_STORAGE_KEY = "eventviet_bookings";

// Customer & Session storage constants
export const CUSTOMER_STORAGE_KEY = "eventviet_customers";
export const SESSION_STORAGE_KEY = "eventviet_sessions";
export const CUSTOMER_SCHEMA_VERSION = 1 as const;
export const SESSION_SCHEMA_VERSION = 1 as const;
export const MAX_SESSIONS_PER_CUSTOMER = 20;
export const MAX_MESSAGES_PER_SESSION = 100;
export const DOCUMENT_SEARCH_THRESHOLD = 1; // min score để hiện document results
export const RESCHEDULE_KEYWORDS = [
  "đổi lịch",
  "thay đổi lịch",
  "dời lịch",
  "reschedule",
  "đổi hẹn",
  "thay lịch",
  "dời hẹn",
  "chuyển lịch",
  "chuyển sang",
  "chuyển qua",
];
export const URGENT_KEYWORDS = [
  "gấp",
  "khẩn",
  "urgent",
  "ngay bây giờ",
  "liên hệ ngay",
  "cần gặp ngay",
  "khẩn cấp",
];
