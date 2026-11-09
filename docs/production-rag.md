# RAG persistent production setup

This project supports two modes:

- `local`: SQLite, local Qdrant, and `backend/data/uploads` for development.
- `cloud`: Supabase PostgreSQL + private Supabase Storage + Qdrant Cloud for durable production data.

## One-time cloud setup

1. Run `supabase/migrations/20261109_booking_integrity.sql`, then
   `supabase/migrations/20261110_rag_cloud_persistence.sql` in the Supabase SQL Editor.
2. Create a Qdrant Cloud cluster and copy its HTTPS endpoint and API key.
3. In the deployment environment, set the following server-only configuration:

```dotenv
# The direct/session-pooler PostgreSQL connection string from Supabase.
# Do not expose it with a NEXT_PUBLIC_ prefix.
DB_URL=postgresql+psycopg://postgres.PROJECT_REF:DB_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres

RAG_FILE_STORE=supabase
SUPABASE_STORAGE_BUCKET=rag-documents
SUPABASE_STORAGE_PREFIX=documents

VECTOR_BACKEND=qdrant_server
QDRANT_URL=https://YOUR_CLUSTER.REGION.aws.cloud.qdrant.io
QDRANT_API_KEY=YOUR_QDRANT_SECRET
QDRANT_COLLECTION=eventhhd_kb_chunks
```

`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already needed by the application; the latter stays server-only.

## Runtime behavior

An Admin upload is written to the private `rag-documents` bucket, processed into chunks in PostgreSQL, and indexed in Qdrant Cloud. Any later backend, restart, or another server reads the same knowledge base. Deleting a document marks its records inactive, removes its vectors, and deletes its original file from Storage.

The local temporary upload is still used during parsing only. It is not the source of truth in cloud mode.

## Nạp sẵn tài liệu dev vào RAG cloud

Không đưa SQLite, thư mục Qdrant local hay `backend/data/uploads` lên GitHub/Vercel. Dùng file nguồn DOCX/PDF/XLSX/CSV/MD/TXT/HTML và nạp một lần vào các dịch vụ cloud:

```powershell
# Kiểm tra danh sách file trước, không ghi dữ liệu
python backend/scripts/seed_rag_cloud.py --source "C:\duong-dan\toi\tai-lieu-goc" --dry-run

# Upload file gốc lên Supabase Storage, tạo chunks PostgreSQL và vectors Qdrant
python backend/scripts/seed_rag_cloud.py --source "C:\duong-dan\toi\tai-lieu-goc"
```

Script bỏ qua file có SHA-256 đã tồn tại. Chỉ dùng `--force` khi bạn thực sự muốn nạp lại một file. Sau khi mọi job báo `READY`, backend được triển khai ở bất cứ máy chủ Python nào với **cùng** biến môi trường cloud sẽ đọc ngay knowledge base này.

## Triển khai runtime

Vercel chỉ triển khai Next.js frontend; không chạy FastAPI RAG/embedding như một tiến trình nền bền vững. Cần triển khai `backend/` lên một dịch vụ Python riêng (Railway, Render paid service, Fly.io, Cloud Run hoặc VPS) với lệnh khởi động tương đương:

```bash
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT
```

Sau đó cấu hình Vercel server-side:

```dotenv
RAG_BACKEND_URL=https://<ten-dich-vu-fastapi>
ADMIN_TOKEN=<cung-gia-tri-voi-backend>
```

Không thêm `RAG_BACKEND_URL` vào biến `NEXT_PUBLIC_*`. Trên backend, đặt cùng `DB_URL`, `RAG_FILE_STORE=supabase`, `SUPABASE_*`, `QDRANT_*`, cấu hình Gemini/LLM và `ADMIN_TOKEN` như môi trường nạp dữ liệu.

## Railway: triển khai FastAPI nhẹ cho kho RAG đã seed

Repository đã có `railway.toml` và `backend/requirements.cloud.txt`. Bản cloud
không cài `sentence-transformers`/Torch, vì cấu hình production dùng Gemini
Embedding và Qdrant Cloud; nhờ đó chỉ phục vụ truy xuất kho đã lập chỉ mục,
không tải mô hình embedding local nặng.

1. Railway → **New Project** → **Deploy from GitHub Repo** → chọn repository này.
2. Trong Railway Variables, copy các biến cloud giống môi trường đã seed:

```dotenv
APP_ENV=production
DB_URL=postgresql+psycopg://...
RAG_FILE_STORE=supabase
SUPABASE_STORAGE_BUCKET=rag-documents
SUPABASE_STORAGE_PREFIX=documents
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
VECTOR_BACKEND=qdrant_server
QDRANT_URL=https://<qdrant-cluster>
QDRANT_API_KEY=...
QDRANT_COLLECTION=eventhhd_kb_chunks
GEMINI_API_KEY=...
LLM_API_KEY=...
LLM_PROVIDER=gemini
EMBED_PROVIDER=gemini
EMBED_MODEL=gemini-embedding-001
EMBED_DIM=768
ADMIN_TOKEN=<một-giá-trị-ngẫu-nhiên-dùng-chung-với-Vercel>
CORS_ORIGINS=https://hhd-event-group.vercel.app
```

3. Sau khi Railway báo `GET /api/health` thành công, copy URL public (ví dụ
`https://eventhhd-rag-production.up.railway.app`).
4. Trong Vercel → Project → Settings → Environment Variables, thêm/sửa:

```dotenv
RAG_BACKEND_URL=https://<railway-url>
ADMIN_TOKEN=<đúng-cùng-giá-trị-trên-Railway>
```

Chọn cả Production/Preview nếu cần, sau đó **Redeploy** Vercel. Không đặt
`RAG_BACKEND_URL` thành `localhost`, `127.0.0.1` hoặc biến `NEXT_PUBLIC_*`.

Khi backend tạm dừng, trang Admin vẫn có thể đọc danh sách tài liệu đã seed
từ Supabase PostgreSQL. Tuy nhiên chatbot cần backend online để truy xuất
Qdrant và tổng hợp câu trả lời từ các chunks.
