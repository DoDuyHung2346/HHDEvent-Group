# EventHHD AI Platform

Nền tảng tư vấn tổ chức sự kiện gồm Next.js, FastAPI RAG, Qdrant/BM25, SQLite cho tri thức RAG và Supabase PostgreSQL cho tài khoản, khách hàng, lịch hẹn và lịch sử chat.

## Khởi chạy bằng Docker

1. Nếu chỉ cần mọi người clone về để thử giao diện RAG và upload tài liệu, dùng cấu hình demo không cần API key:

   ```powershell
   Copy-Item .env.demo.example .env
   ```

   Chế độ này upload, phân đoạn và lập chỉ mục được ngay, nhưng câu trả lời AI là mock và không có đăng nhập/đặt lịch Supabase.

2. Để chạy đầy đủ bằng dịch vụ thật, tạo file từ mẫu production thay thế:

   ```powershell
   Copy-Item .env.example .env
   ```

   Mở `.env` và điền tối thiểu:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (hoặc cấu hình LLM/embedding tương ứng)
   - thay `ADMIN_TOKEN` bằng chuỗi bí mật riêng.

3. Chạy toàn bộ ứng dụng:

   ```powershell
   docker compose up --build
   ```

Mở `http://localhost:3000`. API RAG và Swagger ở `http://localhost:8000/docs`.

`docker compose down` chỉ dừng dịch vụ; dữ liệu RAG vẫn nằm trong Docker volume `eventhhd_rag_data`. Chỉ dùng `docker compose down -v` khi muốn xóa toàn bộ SQLite, Qdrant và file đã tải lên.

> `.env` bị Git bỏ qua để không lộ khóa Supabase/Gemini. Vì vậy, mỗi người clone repository phải tự tạo `.env` theo một trong hai mẫu trên; không sao chép file `.env` có khóa thật của người khác.

## Chuyển nguyên môi trường cho máy khác để kiểm thử

Nếu người nhận dùng cùng file `.env` của bạn, họ sẽ dùng chung Supabase và AI thật. Tuy vậy, tài liệu RAG, vector Qdrant và SQLite RAG nằm trong Docker volume của từng máy, nên cần chuyển thêm một file backup.

Trên máy đang chạy đầy đủ, xuất dữ liệu (file tạo ra đã được Git bỏ qua):

```powershell
.\infra\scripts\export-rag-data.ps1
```

Gửi cho người nhận hai file qua kênh riêng tư: `.env` và `eventhhd-rag-data.tar.gz`. Người nhận clone đúng commit/nhánh, chép hai file vào thư mục gốc dự án, rồi chạy:

```powershell
.\infra\scripts\import-rag-data.ps1 -ArchivePath .\eventhhd-rag-data.tar.gz -ResetRagData
```

Lệnh nhập chỉ xóa Docker volume RAG local trên máy nhận trước khi khôi phục; không xóa hay thay đổi dữ liệu Supabase. Sau đó họ mở `http://localhost:3000` và có đủ tài liệu, lịch sử dữ liệu Supabase và AI thật như môi trường của bạn.

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
├── infra/docker/             # Dockerfile và entrypoint cho từng service
├── supabase/                 # SQL migrations/schema cho PostgreSQL
├── docs/                     # Tài liệu kiến trúc, kiểm thử
├── docker-compose.yml        # Cách chạy chuẩn toàn hệ thống
└── .env.example              # Mẫu cấu hình, không chứa secret
```

## Kiến trúc runtime

```text
Browser → Next.js (frontend:3000) → /api/rag proxy → FastAPI RAG (backend:8000)
                                      ├→ Qdrant + SQLite RAG volume
                                      └→ Supabase PostgreSQL
```

Proxy `/api/rag` giúp trình duyệt không phải biết hostname Docker nội bộ; FastAPI chỉ nhận token quản trị từ Next.js server.

## Phát triển không dùng Docker

```powershell
cd frontend
npm install
npm run dev
```

Lệnh này khởi động Next.js và FastAPI từ cấu trúc mới. Dùng `npm test` để chạy frontend tests và `npm run test:backend` để chạy backend tests.

Bạn cũng có thể đứng ở thư mục gốc và dùng `npm run dev`; root package chỉ là command wrapper, source frontend vẫn nằm trong `frontend/`.
