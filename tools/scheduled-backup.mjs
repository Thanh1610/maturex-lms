import { resolve, dirname, join } from "node:path";
import { createBackup } from "./backup-lib.mjs";
const databasePath = resolve(process.env.LMS_DATABASE || ".local/lms.sqlite");
const uploadsPath = resolve(
  process.env.LMS_UPLOADS || join(dirname(databasePath), "uploads"),
);
const destination = join(
  resolve(process.env.LMS_BACKUPS || ".local/backups"),
  new Date().toISOString().replace(/[:.]/g, "-"),
);
try {
  await createBackup({ databasePath, uploadsPath, destination });
  console.log("MatureX backup complete: " + destination);
} catch (error) {
  console.error("MatureX backup failed: " + error.message);
  process.exitCode = 1;
}
