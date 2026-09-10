import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDatabase(path) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 5000 });
  db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;");
  const version = db.prepare("PRAGMA user_version").get().user_version;
  if (version > 2) {
    db.close();
    throw new Error("Database schema is newer than this application.");
  }
  if (version === 0)
    transaction(db, () => {
      db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK(role IN ('admin','instructor','learner')),
        password_hash TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE sessions (
        token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
      );
      CREATE TABLE courses (
        id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
        skill TEXT NOT NULL, exercise TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('draft','published','archived')),
        created_at TEXT NOT NULL
      );
      CREATE TABLE lessons (
        id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        position INTEGER NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL,
        UNIQUE(course_id, position)
      );
      CREATE TABLE enrollments (
        user_id TEXT NOT NULL REFERENCES users(id), course_id TEXT NOT NULL REFERENCES courses(id),
        created_at TEXT NOT NULL, PRIMARY KEY(user_id, course_id)
      );
      CREATE TABLE progress (
        user_id TEXT NOT NULL REFERENCES users(id), lesson_id TEXT NOT NULL REFERENCES lessons(id),
        completed_at TEXT NOT NULL, PRIMARY KEY(user_id, lesson_id)
      );
      CREATE TABLE assignments (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), course_id TEXT NOT NULL REFERENCES courses(id),
        status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','submitted','revision','approved')),
        body TEXT NOT NULL DEFAULT '', feedback TEXT NOT NULL DEFAULT '',
        version INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, UNIQUE(user_id, course_id)
      );
      CREATE TABLE assignment_history (
        id TEXT PRIMARY KEY, assignment_id TEXT NOT NULL REFERENCES assignments(id), actor_id TEXT NOT NULL REFERENCES users(id),
        status TEXT NOT NULL, body TEXT NOT NULL, feedback TEXT NOT NULL, level INTEGER,
        version INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(assignment_id, version)
      );
      CREATE TABLE evidence (
        assignment_id TEXT PRIMARY KEY REFERENCES assignments(id), user_id TEXT NOT NULL REFERENCES users(id),
        skill TEXT NOT NULL, level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 4),
        reviewer_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
      );
      CREATE INDEX assignments_course ON assignments(course_id);
      CREATE INDEX sessions_expiry ON sessions(expires_at);
      PRAGMA user_version=1;
    `);
    });
  if (version < 2)
    transaction(db, () => {
      db.exec(`
      ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1));
      ALTER TABLE users ADD COLUMN team TEXT NOT NULL DEFAULT '';
      ALTER TABLE users ADD COLUMN job TEXT NOT NULL DEFAULT '';
      ALTER TABLE users ADD COLUMN manager_id TEXT REFERENCES users(id);
      ALTER TABLE users ADD COLUMN management INTEGER NOT NULL DEFAULT 0 CHECK(management IN (0,1));
      CREATE TABLE password_resets(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL,used_at INTEGER);
      CREATE TABLE audit_log(id TEXT PRIMARY KEY,actor_id TEXT REFERENCES users(id),action TEXT NOT NULL,target_id TEXT,created_at TEXT NOT NULL);
      PRAGMA user_version=2;
    `);
    });
  return db;
}
export function transaction(db, work) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
