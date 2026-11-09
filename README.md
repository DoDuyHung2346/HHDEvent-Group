# EventHHD AI Platform

Nền tảng tư vấn tổ chức sự kiện gồm Next.js, FastAPI RAG, Qdrant/BM25, SQLite cho tri thức RAG và Supabase PostgreSQL cho tài khoản, khách hàng, lịch hẹn và lịch sử chat.

## Chạy local

Yêu cầu: Node.js 22+, Python 3.11+ và Internet ở lần chạy đầu để cài package/model embedding.

1. Tạo file cấu hình riêng, không commit:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Điền Supabase/Gemini của môi trường vào `.env`. Nếu chỉ thử luồng RAG offline, dùng `.env.demo.example` thay thế.

3. Tại thư mục gốc dự án, chạy một lệnh:

   ```powershell
   npm run dev
   ```

Lần đầu lệnh tự cài package frontend và Python dependency cho backend, sau đó chạy Next.js tại `http://localhost:3000` và FastAPI RAG tại `http://127.0.0.1:8000`. Next.js tự đọc file `.env` ở thư mục gốc. Trên Windows, launcher đã tương thích Python 3.13; không cần Docker và cũng không cần chạy riêng backend.

Tài liệu được tải tại Admin → Tài liệu & Upload Thông Tin. Dữ liệu RAG local được lưu ở `backend/data/` (SQLite, Qdrant, uploads) và bị Git bỏ qua; không push dữ liệu này hoặc `.env` lên GitHub.

## Cấu trúc dự án

```text
.
├── frontend/                 # Next.js UI, API routes và frontend tests
│   ├── src/
│   ├── public/
│   ├── tests/
│   └── package.json
├── backend/                  # FastAPI RAG service
│   ├── app/                  # API, ingestion, retrieval, LLM, vector store
│   ├── tests/
│   ├── data/                 # Dữ liệu local khi phát triển (không commit)
│   └── requirements.txt
├── supabase/                 # SQL migrations/schema cho PostgreSQL
├── docs/                     # Tài liệu kiến trúc, kiểm thử
└── .env.example              # Mẫu cấu hình, không chứa secret
```

## Kiến trúc runtime

```text
Browser → Next.js (frontend:3000) → /api/rag proxy → FastAPI RAG (backend:8000)
                                      ├→ Qdrant + SQLite tại backend/data/
                                      └→ Supabase PostgreSQL
```

Proxy `/api/rag` giúp trình duyệt không phải biết địa chỉ nội bộ của FastAPI; FastAPI chỉ nhận token quản trị từ Next.js server.

Source frontend nằm trong `frontend/`, backend trong `backend/`. Dùng `npm test` hoặc `npm run test:backend` khi cần kiểm thử.
