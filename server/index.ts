import { resolve } from "node:path";
import { createApp } from "./app";

const port = Number(process.env.API_PORT || 3001);
const serve =
  process.env.SERVE_STATIC === "1" || process.env.NODE_ENV === "production";
const origin =
  process.env.APP_ORIGIN ||
  (serve ? `http://127.0.0.1:${port}` : "http://127.0.0.1:5173");
const databasePath = resolve(process.env.LMS_DATABASE || ".local/lms.sqlite");

const { server, db, integrations } = createApp({
  databasePath,
  origin,
  allowSetup: process.env.LMS_ALLOW_SETUP === "1",
  uploadsPath: process.env.LMS_UPLOADS
    ? resolve(process.env.LMS_UPLOADS)
    : undefined,
  enableWorkers: true,
  staticDir: serve ? resolve("dist") : null,
});

server.listen(port, process.env.APP_HOST || "127.0.0.1", () =>
  console.log(
    `MX LMS API: http://127.0.0.1:${port} | Database: ${databasePath}`,
  ),
);

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  server.close(async () => {
    await integrations.stop();
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
