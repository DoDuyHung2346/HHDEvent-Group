# EventHHD AI Platform — Cuộc thi Vibe Coding 2026

Nền tảng tư vấn tổ chức sự kiện bằng AI, kết hợp chatbot RAG, dự toán hạng mục, đặt lịch tư vấn 1-1 và cổng quản trị vận hành.

> Các trường trong dấu `<...>` là thông tin đội thi cần bổ sung trước khi nộp bài. Không đưa API key, mật khẩu hay Service Role key vào README, source ZIP hoặc GitHub.

## 1. Thông tin chung

| Hạng mục | Nội dung |
|---|---|
| Tên sản phẩm | EventHHD AI Platform |
| Tên đội thi | Hoan và 2 thằng đệ |
| Bảng thi | Bảng A - Công nghệ  |
| Đề bài bốc thăm | Đề 4: Chatbot FAQ & đặt lịch tư vấn |
| Demo online |https://hhd-event-group.vercel.app/?fbclid=IwY2xjawVesFtleHRuA2FlbQIxMABwZG9mBWJyaWQRMWxEWjF2VlNoT2piMHI5ZlpzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEflAbxXUreGi_PPSN_kO5ML8E4Fue-Vc5ck4ssoK71GYvOpICwUtu3rHMtEJ4_aem_j8bfa_zm16ONxHBS2TDMWg |
| Video demo (≤ 02 phút) | https://drive.google.com/file/d/1Iqce0_W1TURKWfRwUd5w31-21qeYAT2Y/view?usp=drive_link |
| Source ZIP | `<Bổ sung URL gói mã nguồn>` |
| Minh chứng dùng AI | [docs/AI_LOG.md](docs/AI_LOG.md) |
| Bảng kiểm thử | https://docs.google.com/document/d/1gm7ZEyCiKs3Q0ZepVEh31p1FTK3y2aYKX9Polv78N1g/edit?usp=sharing |

Tiêu chí vòng loại: <https://vibecoding.info.vn/tieu-chi-cham-thi>.

## 2. Tính năng chính

- Chatbot AI tư vấn tổ chức sự kiện bằng RAG từ tài liệu doanh nghiệp đã được quản trị viên tải lên.
- Phân loại ý định: lời chào, hỏi dịch vụ/FAQ, hỏi chi phí, câu hỏi ngoài lĩnh vực, yêu cầu đặt lịch và đổi lịch.
- Tính toán minh bạch cho hạng mục có công thức, ví dụ sân khấu và thảm đỏ theo m²; không tự bịa đơn giá khi thiếu dữ liệu.
- Dự toán sơ bộ theo quy mô khách/ngân sách, sau đó mở phiếu đặt lịch khi cần chuyên viên chốt phương án.
- Đặt lịch tư vấn 1-1, đổi lịch, giới hạn số lịch theo số điện thoại và giới hạn sức chứa theo khung giờ.
- Đăng ký/đăng nhập khách hàng, lưu lịch sử hội thoại và lịch hẹn qua Supabase.
- Cổng quản trị: giám sát lịch hẹn, nhân sự, biểu phí, upload tài liệu RAG, xem chunks/index và kiểm tra AI.
- Theo dõi token input/output/tổng token mà nhà cung cấp trả về, cùng trạng thái lưu trữ RAG; không hiển thị API key.

## 3. Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 |
| Backend RAG | FastAPI, SQLAlchemy, Pydantic |
| AI | Google Gemini hoặc endpoint OpenAI-compatible; có chế độ mock minh bạch khi không có API thật |
| Retrieval | Hybrid retrieval: Qdrant vector search + BM25 + reranking/gating |
| Embedding | Gemini Embedding hoặc `paraphrase-multilingual-MiniLM-L12-v2` chạy local |
| Dữ liệu nghiệp vụ | Supabase PostgreSQL, Supabase Storage và Qdrant Cloud trong cấu hình cloud; SQLite/Qdrant local cho phát triển |
| Xác thực | Supabase Auth và session quản trị server-side |
| Kiểm thử | Vitest, Pytest |

## 4. Kiến trúc và tích hợp AI

```text
Trình duyệt
    │
    ▼
Next.js frontend :3000
    ├── API routes: chat, bookings, customers, auth
    └── /api/rag proxy (giữ ADMIN_TOKEN ở server)
              │
              ▼
        FastAPI RAG :8000
          ├── RAG pipeline: parse → chunk → embed → retrieve → generate
          ├── PostgreSQL: metadata, chunks, traces, token usage
          ├── Supabase Storage: file gốc đã upload
          └── Qdrant: vector embeddings
```

Luồng trả lời ưu tiên các quy tắc có thể kiểm chứng trước, sau đó mới truy xuất RAG:

1. Nhận diện lời chào, câu hỏi liên hệ, đặt/đổi lịch và câu hỏi ngoài lĩnh vực.
2. Tính hạng mục có công thức rõ ràng, như sân khấu/thảm đỏ theo m².
3. Truy xuất chunks từ Qdrant + BM25, dùng LLM tổng hợp câu trả lời có kiểm tra dữ liệu.
4. Nếu cần khảo sát/báo giá chốt, AI mở form đặt lịch; không lộ số điện thoại cá nhân của nhân viên.

### Bảo mật API key

- API key chỉ nằm trong `.env` và chỉ được đọc server-side.
- Browser gọi RAG qua Next.js proxy; không biết `ADMIN_TOKEN`, Qdrant key hay Supabase Service Role key.
- Trang quản trị chỉ hiển thị trạng thái cấu hình và token usage; không hiển thị giá trị key hoặc quota còn lại của nhà cung cấp.
- Không commit `.env`, database local, cache Qdrant, file upload hoặc archive RAG lên GitHub.

## 5. Cài đặt và chạy local

### Yêu cầu

- Node.js `>= 22.12.0` và npm `>= 10.8.0`.
- Python `>= 3.11` (Python 3.13 trên Windows được launcher hỗ trợ).
- Tài khoản/biến môi trường Supabase, Gemini và Qdrant nếu dùng AI/RAG cloud thật.

### Cấu hình

Tại thư mục gốc của dự án:

```powershell
Copy-Item .env.example .env
```

Mở `.env` và điền các biến cần thiết. Ít nhất với môi trường cloud thực tế:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-key>

GEMINI_API_KEY=<google-gemini-key>
LLM_API_KEY=<gemini-key-hoặc-openai-compatible-key>

DB_URL=postgresql+psycopg://<supabase-postgres-connection>
RAG_FILE_STORE=supabase
VECTOR_BACKEND=qdrant_server
QDRANT_URL=https://<qdrant-cluster>
QDRANT_API_KEY=<qdrant-key>
```

Xem đầy đủ các biến và cấu hình local/cloud trong [.env.example](.env.example). Trước khi dùng cloud, chạy các migration trong thư mục [supabase/migrations](supabase/migrations).

### Chạy ứng dụng

```powershell
npm run dev
```

Lệnh gốc tự cài dependency frontend/backend khi cần, rồi chạy đồng thời:

- Next.js: <http://localhost:3000>
- FastAPI RAG: <http://127.0.0.1:8000>

Không cần Docker. Nếu Next.js báo còn server cũ, dừng tiến trình Node cũ và xóa cache `frontend/.next/dev/` trước khi chạy lại.

## 6. Cấu trúc thư mục

```text
HHDEvent-Group/
├── frontend/                         # Next.js UI và API routes
│   ├── src/app/                      # Trang khách hàng, admin, login và API routes
│   ├── src/components/               # Chat, booking, admin, shared UI
│   ├── src/lib/                      # Auth, Supabase, RAG proxy, pricing, booking
│   ├── src/hooks/                    # Chat, customer, booking, auth hooks
│   ├── tests/                        # Vitest frontend
│   └── scripts/                      # Bootstrap và launcher local
├── backend/                          # FastAPI RAG service
│   ├── app/api/                      # Health, chat, KB, admin metrics
│   ├── app/ingestion/                # Parse, quality, chunk, embedding jobs
│   ├── app/retrieval/                # Qdrant, BM25, hybrid retrieval
│   ├── app/rag/                      # Prompt, gating, generate, validation
│   ├── app/store/                    # SQLAlchemy, object storage
│   ├── data/                         # Dữ liệu local phát triển (không commit)
│   ├── tests/                        # Pytest backend
│   └── requirements.txt
├── supabase/migrations/              # Schema PostgreSQL/Supabase
├── docs/                             # Kiến trúc, kịch bản demo, nhật ký AI
├── .env.example                      # Mẫu cấu hình, không có secret
├── package.json                      # Lệnh chạy từ thư mục gốc
├── TESTING.md                        # Bảng kiểm thử
└── README.md
```

## 7. Dữ liệu RAG, phân quyền và vận hành

### Dữ liệu RAG

1. Quản trị viên vào **Tài liệu & Upload Thông Tin** và tải DOCX/PDF/XLSX/CSV/MD/TXT/HTML.
2. Backend kiểm tra file, trích xuất văn bản, chia chunks, tạo embedding và index vào Qdrant.
3. Chỉ khi job có trạng thái `Ready`, tài liệu mới được dùng để trả lời.
4. Với cấu hình cloud, file gốc nằm ở Supabase Storage; metadata/chunks/traces ở PostgreSQL; vector nằm ở Qdrant Cloud. Dữ liệu không mất khi restart.

Để nạp hàng loạt file nguồn đang có trên máy vào kho cloud, xem hướng dẫn và dùng `backend/scripts/seed_rag_cloud.py` trong [docs/production-rag.md](docs/production-rag.md). Không push cache RAG/local database lên GitHub.

### Vai trò

- **Khách hàng:** đăng ký/đăng nhập, chat, gửi yêu cầu, đặt/đổi lịch và xem lịch của mình.
- **Quản trị viên:** quản lý lịch hẹn, nhân sự, biểu phí, tài liệu RAG và xem chỉ số AI.

## 8. Kiểm thử

```powershell
# Vitest frontend
npm test

# Pytest backend
npm run test:backend

# Lint và build frontend
npm run lint
npm run build
```

Chi tiết các ca kiểm thử và kết quả gần nhất nằm trong [TESTING.md](TESTING.md). Kịch bản trình diễn nằm trong [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## 9. Giới hạn hiện tại

- Quota còn lại và hóa đơn chính xác của Gemini/Vilao không được API key trả về an toàn; xem trên dashboard nhà cung cấp. Admin chỉ tổng hợp token usage mà API phản hồi.
- FAQ tĩnh trong `frontend/src/lib/kb/faq.data.ts` là fallback có sẵn trong source. Thao tác thêm/xóa FAQ tại UI admin hiện chưa đồng bộ thành CRUD database/RAG; tài liệu upload RAG vẫn được lưu và index thật.
- Một số chế độ phát triển có thể dùng SQLite/Qdrant local theo `.env.example`; chỉ cấu hình cloud mới chia sẻ và lưu bền vững giữa các máy.
- Chất lượng trả lời phụ thuộc vào tài liệu đã tải lên, embedding, ngưỡng retrieval và khả năng sẵn sàng của nhà cung cấp AI.

## 10. Nguồn tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

## 11. Minh chứng dùng AI để xây dựng sản phẩm

Nhật ký mẫu các vòng yêu cầu AI → phát hiện lỗi → yêu cầu cải thiện → kết quả có tại [docs/AI_LOG.md](docs/AI_LOG.md).

Trước khi nộp bài, đội cần bổ sung tối đa 5 ảnh/đoạn hội thoại chọn lọc và nêu rõ:

1. Mục tiêu phát triển.
2. Yêu cầu gửi AI.
3. Lỗi hoặc điểm chưa đúng phát hiện khi kiểm thử.
4. Yêu cầu sửa và kết quả kiểm tra lại.

## 12. Hồ sơ bàn giao

- Source ZIP chỉ chứa mã nguồn, README, `.env.example`, migration và tài liệu cần thiết; không chứa secret hoặc database/cache local.
- Bổ sung URL video demo tối đa 2 phút và tài khoản demo (nếu ban tổ chức yêu cầu).
- Chạy kiểm thử, cập nhật [TESTING.md](TESTING.md) với kết quả thực tế trước khi nộp.
- Kiểm tra các placeholder `<...>` trong README trước khi đóng gói.
