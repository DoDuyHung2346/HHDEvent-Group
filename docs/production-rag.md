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
