import { createBackup, argumentsFor } from "./backup-lib.mjs";

const usage =
  "node tools/backup.mjs --database <sqlite> --uploads <directory> --out <new-backup-directory>";
try {
  if (process.argv.includes("--help")) console.log(usage);
  else {
    const args = argumentsFor(process.argv.slice(2), [
      "--database",
      "--uploads",
      "--out",
    ]);
    const result = await createBackup({
      databasePath:
        args["--database"] || process.env.LMS_DATABASE || ".local/lms.sqlite",
      uploadsPath:
        args["--uploads"] || process.env.LMS_UPLOADS || ".local/uploads",
      destination: args["--out"],
    });
    console.log(
      `Backup verified: ${args["--out"]} (${result.files.length} referenced files).`,
    );
  }
} catch (error) {
  console.error(`Backup failed: ${error.message}\nUsage: ${usage}`);
  process.exitCode = 1;
}
