import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(scriptDir, "..");
const nextPackage = resolve(frontendDir, "node_modules", "next", "package.json");

// Clone mới chưa có node_modules thì cài một lần. Những lần sau không gọi npm
// install nữa để tránh Windows lock file và giúp npm run dev khởi động nhanh.
if (!existsSync(nextPackage)) {
  console.log("Đang cài frontend dependencies lần đầu...");
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const install = spawnSync(npmCommand, ["install", "--legacy-peer-deps", "--workspaces=false"], {
    cwd: frontendDir,
    stdio: "inherit",
    shell: false,
  });
  if (install.status !== 0) process.exit(install.status ?? 1);
}

console.log("Frontend dependencies sẵn sàng.");
