import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(".env");
const source = readFileSync(envPath, "utf8");
const existing = new Map();

for (const line of source.split(/\r?\n/)) {
  const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
  if (match) existing.set(match[1], match[2]);
}

const key = existing.get("LLM_API_KEY") || existing.get("GEMINI_API_KEY") || "";
if (!key.startsWith("sk-")) {
  throw new Error("Không tìm thấy Vilao key dạng sk-... trong .env; không thay đổi cấu hình.");
}

const updates = {
  LLM_PROVIDER: "gemini",
  LLM_API_KEY: key,
  GEMINI_API_KEY: "",
  LLM_BASE_URL: "https://api.vilao.ai/v1",
  LLM_MODEL: "gemini-3.8-flash",
  EMBED_PROVIDER: "local_st",
  EMBED_MODEL: "paraphrase-multilingual-MiniLM-L12-v2",
  EMBED_DIM: "384",
  EMBED_BATCH: "32",
  VECTOR_BACKEND: "qdrant_local",
  QDRANT_PATH: "./backend/data/qdrant-vilao-local",
  DB_URL: "sqlite:///./backend/data/app-vilao-local.db",
};

const retained = source
  .split(/\r?\n/)
  .filter((line) => {
    if (/^base url:/i.test(line) || /^chib\//i.test(line)) return false;
    const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
    return !match || !(match[1] in updates);
  });

retained.push("", "# Vilao chat + local multilingual embedding profile");
for (const [name, value] of Object.entries(updates)) retained.push(`${name}=${value}`);
writeFileSync(envPath, `${retained.join("\n").replace(/\n+$/, "")}\n`, "utf8");

console.log("Đã cấu hình Vilao cho LLM và local_st cho embedding. API key không được hiển thị.");
