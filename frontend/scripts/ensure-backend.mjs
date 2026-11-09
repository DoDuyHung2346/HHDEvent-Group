import { spawnSync } from "node:child_process";

const candidates = process.platform === "win32" ? ["python", "py"] : ["python3", "python"];
const python = candidates.find((command) => {
  const check = spawnSync(command, ["-c", "import fastapi, uvicorn, qdrant_client, bm25s, psycopg"], {
    stdio: "ignore",
    shell: false,
  });
  return check.status === 0;
});

const selected = python ?? candidates[0];
if (!python) {
  console.log("Backend dependencies are missing. Installing backend/requirements.txt...");
  const install = spawnSync(selected, ["-m", "pip", "install", "-r", "backend/requirements.txt"], {
    stdio: "inherit",
    shell: false,
  });
  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}

console.log(`Backend ready (${selected}).`);
