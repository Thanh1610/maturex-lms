// Isolated browser verification runtime. Never writes to the user's LMS database.
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory = await mkdtemp(join(tmpdir(), "mx-lms-browser-"));
process.env.WEB_PORT = process.argv[2] || "5180";
process.env.API_PORT = process.argv[3] || "3010";
process.env.LMS_DATABASE = join(directory, "verification.sqlite");
process.env.LMS_UPLOADS = join(directory, "uploads");
for (const name of [
  "AI_API_KEY",
  "OPENAI_API_KEY",
  "AI_MODEL",
  "OIDC_ISSUER",
  "OIDC_CLIENT_ID",
  "OIDC_CLIENT_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
])
  delete process.env[name];
process.env.APP_ORIGIN = "http://127.0.0.1:" + process.env.WEB_PORT;
process.env.LMS_ALLOW_SETUP = "1";
await import("./dev.mjs");
