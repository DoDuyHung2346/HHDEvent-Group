import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(scriptDir, "..");
const envPath = resolve(frontendDir, "..", ".env");

// Next.js starts from frontend/, while the project's private config lives in
// the repository root. Load only missing values so shell-provided values can
// still override .env in CI or a hosted environment.
try {
  for (const sourceLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim().replace(/^export\s+/, "");
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
} catch (error) {
  console.warn("Không đọc được .env gốc; Next.js sẽ dùng biến môi trường hiện có.", error instanceof Error ? error.message : "");
}

const nextCli = resolve(frontendDir, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextCli, "dev", "--webpack", "-H", "0.0.0.0"], {
  cwd: frontendDir,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => process.exitCode = code ?? (signal ? 1 : 0));
