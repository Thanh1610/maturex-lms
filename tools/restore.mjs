import { restoreBackup, argumentsFor } from "./backup-lib.mjs";

const usage =
  "node tools/restore.mjs --from <backup-directory> --to <new-data-directory>";
try {
  if (process.argv.includes("--help")) console.log(usage);
  else {
    const args = argumentsFor(process.argv.slice(2), ["--from", "--to"]);
    const result = await restoreBackup({
      source: args["--from"],
      destination: args["--to"],
    });
    console.log(
      `Restore verified: ${result.databasePath}\nUploads: ${result.uploadsPath}\nFiles: ${result.files}\nPoint the stopped application to these new paths; existing data was not changed.`,
    );
  }
} catch (error) {
  console.error(`Restore failed: ${error.message}\nUsage: ${usage}`);
  process.exitCode = 1;
}
