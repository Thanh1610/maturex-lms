import { notify, generateEventReminders } from "./social.js";
import { generateCohortReminders } from "./cohorts.js";
export function initJobs(db) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS user_preferences(user_id TEXT PRIMARY KEY REFERENCES users(id),email_notifications INTEGER NOT NULL DEFAULT 1)",
  );
}
export function runJobs(db, integrations, origin) {
  generateEventReminders(db);
  generateCohortReminders(db);
  const date = new Date(),
    tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    today = date.toISOString().slice(0, 10);
  const paths = db
    .prepare(
      `SELECT pe.*,lp.title FROM path_enrollments pe JOIN learning_paths lp ON lp.id=pe.path_id
    WHERE due_date>=? AND due_date<=? AND EXISTS(SELECT 1 FROM path_courses pc WHERE pc.path_id=pe.path_id AND
      (NOT EXISTS(SELECT 1 FROM assignments a WHERE a.course_id=pc.course_id AND a.user_id=pe.user_id AND a.status='approved') OR
       EXISTS(SELECT 1 FROM lessons l WHERE l.course_id=pc.course_id AND NOT EXISTS(SELECT 1 FROM progress p WHERE p.lesson_id=l.id AND p.user_id=pe.user_id))))`,
    )
    .all(today, tomorrow);
  for (const p of paths)
    notify(
      db,
      p.user_id,
      `Lộ trình “${p.title}” đến hạn ${p.due_date}.`,
      "paths",
      `path-due:${p.path_id}:${p.due_date}`,
    );
  if (!integrations.status().smtp.configured) return;
  const pending = db
    .prepare(
      `SELECT n.*,u.email FROM notifications n JOIN users u ON u.id=n.user_id LEFT JOIN user_preferences p ON p.user_id=u.id
    WHERE u.active=1 AND COALESCE(p.email_notifications,1)=1 AND n.read_at IS NULL
      AND n.created_at>? AND NOT EXISTS(SELECT 1 FROM mail_outbox m WHERE m.dedupe_key='notification:'||n.id)
    ORDER BY n.created_at LIMIT 50`,
    )
    .all(new Date(Date.now() - 7 * 86400000).toISOString());
  for (const n of pending)
    integrations.enqueueEmail({
      to: n.email,
      subject: "Thông báo MatureX LMS",
      text: n.text + "\n\n" + origin + "/#" + n.route,
      key: "notification:" + n.id,
    });
}
