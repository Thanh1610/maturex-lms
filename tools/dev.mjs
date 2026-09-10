import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const webPort = Number(process.env.WEB_PORT || 5173);
const apiPort = Number(process.env.API_PORT || 3001);
// Fail before launching either child if a port is already occupied.
async function available(port) {
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(port, "127.0.0.1", () => probe.close(resolve));
  });
}
try {
  await available(webPort);
  await available(apiPort);
} catch (error) {
  console.error(
    `Không thể khởi động: cổng ${error.port} đang được sử dụng. Đặt WEB_PORT/API_PORT khác hoặc dừng tiến trình cũ.`,
  );
  process.exit(1);
}
const env = {
  ...process.env,
  APP_ORIGIN: process.env.APP_ORIGIN || `http://127.0.0.1:${webPort}`,
  LMS_ALLOW_SETUP: process.env.LMS_ALLOW_SETUP || "1",
};
const children = [
  spawn(process.execPath, ["server/index.js"], {
    cwd,
    env,
    stdio: "inherit",
    windowsHide: true,
  }),
  spawn(
    "pnpm",
    [
      "next",
      "dev",
      "-p",
      String(webPort),
    ],
    { cwd, env, stdio: "inherit", windowsHide: true, shell: true },
  ),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => stop(code || 0));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
