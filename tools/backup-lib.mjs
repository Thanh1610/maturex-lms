import { DatabaseSync, backup } from "node:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, constants } from "node:fs";
import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

const blobName =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const ensure = (condition, message) => {
  if (!condition) throw new Error(message);
};
async function absent(path) {
  try {
    await lstat(path);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  throw new Error(
    `Destination already exists: ${path}. Choose a new directory.`,
  );
}
async function regular(path) {
  const info = await lstat(path);
  ensure(
    info.isFile() && !info.isSymbolicLink(),
    `Unsafe or non-regular file: ${path}`,
  );
  return info;
}
async function directory(path) {
  const info = await lstat(path);
  ensure(
    info.isDirectory() && !info.isSymbolicLink(),
    `Unsafe directory: ${path}`,
  );
}
async function digest(path) {
  const info = await regular(path);
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return { size: info.size, sha256: hash.digest("hex") };
}
function references(db) {
  if (
    !db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='files'",
      )
      .get()
  )
    return [];
  const files = db.prepare("SELECT id,size FROM files ORDER BY id").all();
  for (const file of files)
    ensure(
      blobName.test(file.id) &&
        Number.isSafeInteger(file.size) &&
        file.size >= 0,
      "Invalid file reference in database.",
    );
  return files;
}
function integrity(db) {
  const checks = db.prepare("PRAGMA integrity_check").all();
  ensure(
    checks.length === 1 && checks[0].integrity_check === "ok",
    "SQLite integrity check failed.",
  );
  ensure(
    db.prepare("PRAGMA foreign_key_check").all().length === 0,
    "SQLite foreign key check failed.",
  );
}
function validateManifest(manifest) {
  ensure(
    manifest &&
      manifest.format === 1 &&
      manifest.database?.name === "lms.sqlite" &&
      Array.isArray(manifest.files),
    "Invalid backup manifest.",
  );
  const validHash = (item) =>
    item &&
    /^[a-f0-9]{64}$/.test(item.sha256) &&
    Number.isSafeInteger(item.size) &&
    item.size >= 0;
  ensure(validHash(manifest.database), "Invalid database hash or size.");
  ensure(
    manifest.files.every((item) => blobName.test(item.id) && validHash(item)),
    "Invalid or unsafe file manifest.",
  );
  ensure(
    new Set(manifest.files.map((item) => item.id)).size ===
      manifest.files.length,
    "Invalid duplicate file manifest.",
  );
}
async function checkCopy(source, destination, expected) {
  await regular(source);
  await copyFile(source, destination, constants.COPYFILE_EXCL);
  const actual = await digest(destination);
  ensure(
    actual.size === expected.size && actual.sha256 === expected.sha256,
    `Backup hash or size mismatch: ${basename(source)}`,
  );
}
async function withStaging(destination, work) {
  ensure(
    typeof destination === "string" && destination.trim(),
    "Destination is required.",
  );
  const target = resolve(destination),
    parent = dirname(target);
  ensure(target !== parent, "Invalid destination root.");
  await directory(parent);
  await absent(target);
  const staging = join(parent, `.${basename(target)}.partial-${randomUUID()}`);
  await mkdir(staging, { mode: 0o700 });
  let placed = false;
  try {
    const result = await work(staging);
    // Reserve a fresh directory only after all checks; never replace an existing target.
    await mkdir(target, { mode: 0o700 });
    placed = true;
    for (const name of await readdir(staging))
      await rename(join(staging, name), join(target, name));
    await rm(staging, { recursive: true });
    return result;
  } catch (error) {
    // Only delete directories created by this invocation and verified inside the chosen parent.
    for (const candidate of [staging, ...(placed ? [target] : [])]) {
      const rel = relative(parent, candidate);
      ensure(
        rel &&
          !rel.startsWith(".." + sep) &&
          rel !== ".." &&
          !rel.includes(sep),
        "Unsafe cleanup path.",
      );
      await rm(candidate, { recursive: true, force: true }).catch(() => {});
    }
    throw error;
  }
}

export async function createBackup({ databasePath, uploadsPath, destination }) {
  ensure(
    typeof databasePath === "string" &&
      databasePath &&
      typeof uploadsPath === "string" &&
      uploadsPath,
    "Database and uploads paths are required.",
  );
  databasePath = resolve(databasePath);
  uploadsPath = resolve(uploadsPath);
  await regular(databasePath);
  return withStaging(destination, async (staging) => {
    const source = new DatabaseSync(databasePath, {
      readOnly: true,
      timeout: 5000,
    });
    const snapshotPath = join(staging, "lms.sqlite");
    try {
      await backup(source, snapshotPath);
    } finally {
      source.close();
    }
    // Snapshot first: live uploads commit their immutable blobs before the database reference.
    const snapshot = new DatabaseSync(snapshotPath, { readOnly: true });
    let files;
    try {
      integrity(snapshot);
      files = references(snapshot);
    } finally {
      snapshot.close();
    }
    await mkdir(join(staging, "uploads"), { mode: 0o700 });
    if (files.length) await directory(uploadsPath);
    const manifest = {
      format: 1,
      created_at: new Date().toISOString(),
      database: { name: "lms.sqlite", ...(await digest(snapshotPath)) },
      files: [],
    };
    for (const file of files) {
      const sourcePath = join(uploadsPath, file.id),
        targetPath = join(staging, "uploads", file.id);
      await regular(sourcePath);
      await copyFile(sourcePath, targetPath, constants.COPYFILE_EXCL);
      const hash = await digest(targetPath);
      ensure(
        hash.size === file.size,
        `File size differs from database: ${file.id}`,
      );
      manifest.files.push({ id: file.id, ...hash });
    }
    await writeFile(
      join(staging, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
      { flag: "wx", mode: 0o600 },
    );
    return manifest;
  });
}

export async function restoreBackup({ source, destination }) {
  ensure(typeof source === "string" && source, "Backup source is required.");
  source = resolve(source);
  await directory(source);
  const manifestPath = join(source, "manifest.json");
  await regular(manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  validateManifest(manifest);
  await directory(join(source, "uploads"));
  return withStaging(destination, async (staging) => {
    const snapshotPath = join(staging, "lms.sqlite");
    await checkCopy(
      join(source, "lms.sqlite"),
      snapshotPath,
      manifest.database,
    );
    const snapshot = new DatabaseSync(snapshotPath, { readOnly: true });
    let files;
    try {
      integrity(snapshot);
      files = references(snapshot);
    } finally {
      snapshot.close();
    }
    const listed = new Map(manifest.files.map((file) => [file.id, file]));
    ensure(
      files.length === listed.size &&
        files.every((file) => listed.get(file.id)?.size === file.size),
      "Manifest does not match database file references.",
    );
    await mkdir(join(staging, "uploads"), { mode: 0o700 });
    for (const file of manifest.files)
      await checkCopy(
        join(source, "uploads", file.id),
        join(staging, "uploads", file.id),
        file,
      );
    await writeFile(
      join(staging, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
      { flag: "wx", mode: 0o600 },
    );
    return {
      databasePath: resolve(destination, "lms.sqlite"),
      uploadsPath: resolve(destination, "uploads"),
      files: files.length,
    };
  });
}

export function argumentsFor(argv, allowed) {
  const result = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    ensure(
      allowed.includes(key) &&
        argv[i + 1] &&
        !argv[i + 1].startsWith("--") &&
        result[key] === undefined,
      `Invalid argument: ${key}`,
    );
    result[key] = argv[i + 1];
  }
  return result;
}
