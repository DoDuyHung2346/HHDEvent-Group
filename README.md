# 🌟 EventViet AI – Hệ Thống Tư Vấn Sự Kiện & RAG Tri Thức Doanh Nghiệp

## Chạy toàn bộ hệ thống bằng một lệnh

Yêu cầu: Node.js 20+ và Python 3.11+.

```bash
copy .env.example .env       # PowerShell: Copy-Item .env.example .env
# mở .env và chỉ cần thay GEMINI_API_KEY (đồng thời đổi ADMIN_TOKEN)
npm install
npm run dev
```

`npm run dev` khởi động đồng thời Next.js tại `http://localhost:3000` và FastAPI RAG tại `http://127.0.0.1:8000`. Script sẽ tự kiểm tra và cài `backend/requirements.txt` nếu máy chưa có dependency backend. Swagger: `http://127.0.0.1:8000/docs`.

### Cấu trúc repository

```text
├── src/                 # Next.js frontend và API proxy
├── public/              # Static assets
├── backend/app/         # FastAPI, ingestion, embedding, retrieval, RAG
├── backend/tests/       # Pytest unit/e2e tests
├── backend/data/        # SQLite, Qdrant, uploads (ignored by Git)
├── scripts/             # Bootstrap/dev helper scripts
├── tests/               # Frontend Vitest tests
├── docs/                # Architecture/demo notes
├── .env.example         # Template an toàn, không chứa secret
├── package.json         # Root scripts: npm run dev/build/test
└── backend/requirements.txt
```

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_Store-red?style=flat)](https://qdrant.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![Tests](https://img.shields.io/badge/Tests-130%2B_Passing-success?style=flat)]()

Hệ thống tư vấn tổ chức sự kiện chuyên nghiệp tích hợp **RAG (Retrieval-Augmented Generation)** tiêu chuẩn Big Tech, quản lý nhân sự thông minh theo ca kíp, và điều phối lịch hẹn tự động không bịa thông tin (Zero Hallucination).

---

## 🏛️ Kiến Trúc Tổng Thể (System Architecture)

```
                          ┌───────────────────────────┐
                          │   Next.js 16 (Turbopack)  │
                          │   Frontend & Client UI    │
                          └─────────────┬─────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │ HTTP REST / JSON                      │
                    ▼                                       ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │   Next.js API Route    │              │  FastAPI Backend (RAG) │
       │  /api/chat (SSR proxy) │              │  /api/kb & /api/chat   │
       └────────────┬───────────┘              └────────────┬───────────┘
                    │                                       │
     ┌──────────────┴──────────────┐         ┌──────────────┴──────────────┐
     │ Fallback Local FAQ Cache   │         │ 1. Sentence-Transformers    │
     │ Rate Limiting & Validation  │         │    (Local Multilingual-v2)  │
     │ Staff Storage & Dispatch    │         │ 2. Qdrant Vector Store      │
     │ Customer Session Memory     │         │ 3. BM25s Keyword Engine     │
     └─────────────────────────────┘         │ 4. Reciprocal Rank Fusion   │
                                             │ 5. LLM Structured Gen (Vilao│
                                             │    / Gemini-3.8-Flash)      │
                                             │ 6. Guardrails & Validation  │
                                             └─────────────────────────────┘
```

---

## 🚀 Các Tính Năng Nổi Bật

### 1. Chatbot Tư Vấn Sự Kiện Thông Minh (24/7 AI Consultant)
- **Tư vấn báo giá & concept tức thì**: Khách hàng chọn quy mô khách, concept, mức trang trí và nhận dự toán tức thời.
- **Phản hồi trọng tâm**: Trả về text thuần thân thiện kèm các option chip thao tác nhanh, chỉ hiển thị form đặt lịch khi khách thực sự có nhu cầu.
- **Customer Memory**: Tự động nhận diện và ghi nhớ tên khách, số điện thoại, ngân sách, số lượng khách, loại sự kiện xuyên suốt phiên trò chuyện.

### 2. RAG Document Ingestion & Chunking Pipeline
- **Bóc tách đa định dạng**: Hỗ trợ `.pdf`, `.docx`, `.xlsx`, `.csv`, `.md`, `.txt`, `.html`.
- **Chunking chuyên biệt theo domain**: Chunking FAQ theo cặp hỏi-đáp, chunking Package theo bảng giá, chunking Policy theo cấu trúc cha-con (Parent-Child).
- **Local Dense Embedding**: Sử dụng mô hình `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 chiều, hỗ trợ tiếng Việt tối ưu, chạy hoàn toàn offline không phụ thuộc API key ngoài).
- **Hybrid Retrieval**: Kết hợp Dense Vector Search (Qdrant) + Sparse Keyword Search (BM25s) qua thuật toán **Reciprocal Rank Fusion (RRF)**.
- **Giao diện Ingestion Progress thời gian thực**: Modal 5 bước trực quan (Validate $\rightarrow$ Parse $\rightarrow$ Chunk $\rightarrow$ Embed $\rightarrow$ Index) kèm live console log và modal tra cứu chunks đã tạo.

### 3. Đồng Bộ Nhân Sự Chuẩn Xác (Zero-Hallucination Staff Sync)
- **Tuyệt đối không bịa nhân viên**: Danh sách nhân viên thực tế trong hệ thống (`StaffMember[]`) được truyền trực tiếp vào context prompt của LLM.
- **Ràng buộc bảo mật (Guardrails)**: Bộ lọc `Number Guard` và `Contact Guard` tự động kiểm tra số điện thoại và mã nhân viên hợp lệ, chặn đứng việc sinh số lạ ngoài hệ thống.
- **Thuật toán đề xuất nhân sự tối ưu**: Phân công chuyên viên dựa trên chuyên môn sự kiện (tiệc cưới, gala, hội nghị, VIP), ca làm việc (ca sáng / ca chiều / cả ngày), kiểm tra trùng lịch và cân bằng tải số ca trong ngày.
- **Chế độ xử lý sự cố (Incident Mode)**: Cho phép chuyển giao toàn bộ lịch của nhân viên gặp sự cố sang nhân sự thay thế chỉ với 1 cú click.

### 4. Quản Trị Hệ Thống & Kiểm Toán (Admin Portal)
- Đăng nhập bảo mật theo vai trò Admin / Khách hàng với cơ chế chống treo loading state.
- Modal **Lịch sử đăng nhập (Audit Log)** ghi lại IP, thiết bị, thời gian và trạng thái xác thực.
- Quản lý danh mục tài liệu RAG: Upload, xem chunks, xóa tài liệu và tự động cập nhật phiên bản Knowledge Base (`kb_version`).

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```
vibecoding2026.1/
├── backend/                        # FastAPI RAG Backend Service
│   ├── app/
│   │   ├── api/                    # API endpoints: health, chat, kb, admin, feedback
│   │   ├── core/                   # Schemas, errors, security, logging
│   │   ├── ingestion/              # Parsers, chunkers (FAQ/Package/Policy), quality
│   │   ├── llm/                    # Local ST Embedder, Gemini LLM client, fakes
│   │   ├── rag/                    # Gating, hybrid retrieval, rerank, prompt, validate
│   │   ├── retrieval/              # Qdrant Vector Store, BM25s index, tokenizer_vi
│   │   ├── store/                  # SQLite models (Document, Chunk, Trace, Job)
│   │   ├── config.py               # Pydantic Settings
│   │   └── main.py                 # FastAPI application & lifespan
│   ├── tests/                      # 33 Backend Pytest unit & e2e test cases
│   └── requirements.txt            # Python dependencies
│
├── src/                            # Next.js 16 Frontend App
│   ├── app/                        # App Router: /, /admin, /login, /customer, /api
│   ├── components/
│   │   ├── admin/                  # StaffManagement, DocumentIngestModal, ChunksModal, LoginHistoryModal
│   │   ├── booking/                # BookingForm, SlotPicker, MyBookingsModal
│   │   └── chat/                   # ChatWindow, MessageBubble, OptionChips, Cards
│   ├── hooks/                      # useChat, useBookings, useCustomer, useAuth
│   ├── lib/
│   │   ├── ai/                     # LLM client & prompt templates
│   │   ├── auth/                   # Admin & User authentication, login history
│   │   ├── booking/                # Slot scheduling & validation
│   │   ├── kb/                     # Local fallback knowledge retrieval
│   │   ├── rag/                    # RAG Backend API client
│   │   └── staff/                  # Staff storage, shift matching & recommendation
│   └── types/                      # TypeScript type definitions
│
├── tests/                          # 97 Frontend Vitest unit test cases
├── public/                         # Static assets & icons
├── .env                            # Cấu hình môi trường hợp nhất (Root .env)
├── .env.example                    # Template cấu hình mẫu
├── .gitignore                      # Git ignore chuẩn hóa cho cả Node.js & Python
├── package.json                    # Frontend dependencies & npm scripts
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
├── vitest.config.ts                # Vitest test runner configuration
└── README.md                       # Tài liệu hướng dẫn sử dụng
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### 1. Chuẩn Bị Môi Trường
- **Node.js**: v20+ hoặc v22+
- **Python**: v3.10+ (Khuyến nghị Conda environment: `ai_project_summer26`)

### 2. Thiết Lập Biến Môi Trường
Sao chép tệp mẫu và cập nhật các thông số cần thiết:
```bash
cp .env.example .env
```
*(Tệp `.env` đã được cấu hình sẵn các giá trị mặc định để chạy ngay)*.

### 3. Cài Đặt Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
pip install -r backend/requirements.txt
```

### 4. Khởi Chạy Ứng Dụng

**Terminal 1: Khởi chạy Backend RAG (FastAPI)**
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API Docs khả dụng tại: `http://127.0.0.1:8000/docs`*

**Terminal 2: Khởi chạy Frontend (Next.js)**
```bash
npm run dev
```
*Truy cập giao diện chính tại: `http://localhost:3000`*
*Trang quản trị Admin: `http://localhost:3000/admin`*

---

## 🧪 Kiểm Thử Hệ Thống (Testing)

Dự án bao gồm bộ kiểm thử tự động toàn diện với hơn 130 test cases:

```bash
# Chạy toàn bộ 97 frontend tests (Vitest)
npm test

# Chạy toàn bộ 33 backend tests (Pytest)
cd backend
pytest -v
```

---

## 🔐 Tài Khoản & Bảo Mật Mặc Định

| Vai trò | Thông tin đăng nhập | Ghi chú |
|---|---|---|
| **Khách hàng** | SĐT: `0912345678` | Trải nghiệm tư vấn & đặt lịch |
| **Quản trị viên** | Username: `admin` / Password: `password123` | Toàn quyền quản lý tài liệu & nhân viên |
| **Admin Token local** | `eventviet-local-admin-token` | Được đồng bộ trong root `.env` để chạy local |
