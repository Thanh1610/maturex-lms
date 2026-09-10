import { randomUUID } from "node:crypto";
import { check, type PublicUser, textField } from "./auth";
import { type AppDatabase, transaction } from "./database";

const now = () => new Date().toISOString();
const result = (
  data: Record<string, unknown> = { ok: true },
  status = 200,
): { status: number; data: Record<string, unknown> } => ({ status, data });

const teacher = (user: { role: string }) =>
  check(
    ["admin", "instructor"].includes(user.role),
    403,
    "Bạn không có quyền quản lý lịch học.",
  );

export function initSocial(db: AppDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      description TEXT NOT NULL, location TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK(capacity > 0), status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','cancelled')),
      version INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS event_attendees (
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id),
      attendance TEXT NOT NULL DEFAULT 'registered' CHECK(attendance IN ('registered','present','absent')),
      created_at TEXT NOT NULL, PRIMARY KEY(event_id,user_id)
    );
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), body TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS community_replies (
      id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id), body TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS community_likes (
      post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id), PRIMARY KEY(post_id,user_id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL, route TEXT NOT NULL, read_at TEXT, created_at TEXT NOT NULL, dedupe_key TEXT,
      UNIQUE(user_id,dedupe_key)
    );
    CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id,created_at);
    CREATE INDEX IF NOT EXISTS events_start ON events(status,starts_at);
    CREATE INDEX IF NOT EXISTS community_reply_post ON community_replies(post_id,created_at);
  `);
}

export function notify(
  db: AppDatabase,
  userId: string,
  text: string,
  route: string,
  dedupeKey: string | null = null,
): void {
  db.prepare(
    "INSERT OR IGNORE INTO notifications (id,user_id,text,route,created_at,dedupe_key) VALUES (?,?,?,?,?,?)",
  ).run(randomUUID(), userId, text, route, now(), dedupeKey);
}

export function generateEventReminders(
  db: AppDatabase,
  timestamp = Date.now(),
): void {
  const due = db
    .prepare(
      `SELECT e.id,e.title,e.starts_at,a.user_id FROM events e JOIN event_attendees a ON a.event_id=e.id
    WHERE e.status='scheduled' AND e.starts_at>? AND e.starts_at<=?`,
    )
    .all(
      new Date(timestamp).toISOString(),
      new Date(timestamp + 24 * 3600000).toISOString(),
    ) as Array<{
    id: string;
    title: string;
    starts_at: string;
    user_id: string;
  }>;
  for (const item of due) {
    notify(
      db,
      item.user_id,
      `Lịch học “${item.title}” sắp bắt đầu trong 24 giờ.`,
      "calendar",
      `event-reminder:${item.id}:${item.starts_at}`,
    );
  }
}

interface EventRow {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  status: string;
  version: number;
  created_at: string;
}

function getEvent(db: AppDatabase, id: string): EventRow {
  const event = db.prepare("SELECT * FROM events WHERE id=?").get(id) as unknown as
    | EventRow
    | undefined;
  check(event, 404, "Không tìm thấy lịch học.");
  return event;
}

function manageEvent(
  db: AppDatabase,
  user: { id: string; role: string },
  id: string,
): EventRow {
  teacher(user);
  const event = getEvent(db, id);
  check(
    user.role === "admin" || event.owner_id === user.id,
    403,
    "Bạn không phụ trách lịch học này.",
  );
  return event;
}

interface EventFields {
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
}

function fields(body: Record<string, unknown>): EventFields {
  const startsStr = String(body.starts_at || "");
  const endsStr = String(body.ends_at || "");
  const starts = Date.parse(startsStr);
  const ends = Date.parse(endsStr);
  check(
    typeof body.starts_at === "string" &&
      typeof body.ends_at === "string" &&
      Number.isFinite(starts) &&
      Number.isFinite(ends),
    400,
    "Thời gian không hợp lệ.",
  );
  check(
    starts > Date.now() && ends > starts,
    400,
    "Lịch học phải bắt đầu trong tương lai và kết thúc sau giờ bắt đầu.",
  );
  const capacity = Number(body.capacity);
  check(
    Number.isInteger(capacity) && capacity > 0 && capacity <= 10000,
    400,
    "Số chỗ cần từ 1 đến 10.000.",
  );
  return {
    title: textField(body.title, "Tên lịch học", 180),
    description: textField(body.description ?? "", "Mô tả", 5000, 0),
    location: textField(body.location, "Địa điểm hoặc liên kết", 1000),
    starts_at: new Date(starts).toISOString(),
    ends_at: new Date(ends).toISOString(),
    capacity,
  };
}

function checkVersion(event: EventRow, body: Record<string, unknown>): void {
  check(
    Number.isInteger(body.version) && body.version === event.version,
    409,
    "Lịch học đã thay đổi. Hãy tải lại trước khi lưu.",
  );
}

function eventNotice(
  db: AppDatabase,
  event: EventRow,
  text: string,
  key: string,
): void {
  const rows = db
    .prepare("SELECT user_id FROM event_attendees WHERE event_id=?")
    .all(event.id) as Array<{ user_id: string }>;
  for (const attendee of rows) {
    notify(db, attendee.user_id, text, "calendar", key);
  }
}

function eventList(
  db: AppDatabase,
  user: { id: string; role: string },
): Array<Record<string, unknown>> {
  const events = db
    .prepare(
      `SELECT e.*,u.name AS owner_name,
    (SELECT COUNT(*) FROM event_attendees a WHERE a.event_id=e.id) AS attendee_count,
    EXISTS(SELECT 1 FROM event_attendees a WHERE a.event_id=e.id AND a.user_id=?) AS enrolled,
    (SELECT attendance FROM event_attendees a WHERE a.event_id=e.id AND a.user_id=?) AS attendance
    FROM events e JOIN users u ON u.id=e.owner_id ORDER BY e.starts_at`,
    )
    .all(user.id, user.id) as Array<Record<string, unknown>>;

  return events.map((event) => ({
    ...event,
    ...(user.role === "admin" ||
    (user.role === "instructor" && event.owner_id === user.id)
      ? {
          attendees: db
            .prepare(
              `SELECT a.user_id,a.attendance,u.name FROM event_attendees a JOIN users u ON u.id=a.user_id WHERE a.event_id=? ORDER BY u.name`,
            )
            .all(String(event.id)),
        }
      : {}),
  }));
}

const escapeIcs = (value: unknown) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

const icsDate = (value: string | number) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

function calendarFile(event: EventRow): { ics: string; fileName: string } {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MatureX//Learning//VI",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@maturex`,
    `DTSTAMP:${icsDate(now())}`,
    `DTSTART:${icsDate(event.starts_at)}`,
    `DTEND:${icsDate(event.ends_at)}`,
    `SEQUENCE:${event.version}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    `STATUS:${event.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const folded = lines.map((line) => {
    let output = "";
    let bytes = 0;
    for (const char of line) {
      const size = Buffer.byteLength(char);
      if (bytes + size > 75) {
        output += "\r\n ";
        bytes = 1;
      }
      output += char;
      bytes += size;
    }
    return output;
  });
  return {
    ics: `${folded.join("\r\n")}\r\n`,
    fileName: `maturex-${event.id}.ics`,
  };
}

export function handleSocial({
  db,
  user,
  path,
  method,
  body = {},
  query,
}: {
  db: AppDatabase;
  user: PublicUser;
  path: string;
  method: string;
  body?: Record<string, unknown>;
  query?: URLSearchParams | Record<string, string>;
}): { status: number; data: Record<string, unknown> } | null {
  if (path === "/api/events" && method === "GET") {
    return result({ events: eventList(db, user) });
  }
  if (path === "/api/events" && method === "POST") {
    teacher(user);
    const value = fields(body);
    const id = randomUUID();
    db.prepare(
      "INSERT INTO events (id,owner_id,title,description,location,starts_at,ends_at,capacity,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    ).run(
      id,
      user.id,
      value.title,
      value.description,
      value.location,
      value.starts_at,
      value.ends_at,
      value.capacity,
      now(),
    );
    return result({ event: getEvent(db, id) }, 201);
  }
  let match = path.match(/^\/api\/events\/([^/]+)$/);
  if (match && method === "PUT") {
    return transaction(db, () => {
      const event = manageEvent(db, user, match[1]);
      checkVersion(event, body);
      check(
        event.status === "scheduled" &&
          Date.parse(event.starts_at) > Date.now(),
        409,
        "Chỉ sửa lịch chưa bắt đầu và chưa hủy.",
      );
      const value = fields(body);
      const count = (
        db
          .prepare("SELECT COUNT(*) n FROM event_attendees WHERE event_id=?")
          .get(event.id) as { n: number }
      ).n;
      check(
        value.capacity >= count,
        409,
        "Số chỗ không được thấp hơn số người đã đăng ký.",
      );
      db.prepare(
        "UPDATE events SET title=?,description=?,location=?,starts_at=?,ends_at=?,capacity=?,version=version+1 WHERE id=?",
      ).run(
        value.title,
        value.description,
        value.location,
        value.starts_at,
        value.ends_at,
        value.capacity,
        event.id,
      );
      eventNotice(
        db,
        event,
        `Lịch học “${value.title}” đã cập nhật. Hãy kiểm tra thời gian và địa điểm.`,
        `event-updated:${event.id}:${event.version + 1}`,
      );
      return result({ event: getEvent(db, event.id) });
    });
  }
  match = path.match(/^\/api\/events\/([^/]+)\/cancel$/);
  if (match && method === "POST") {
    return transaction(db, () => {
      const event = manageEvent(db, user, match[1]);
      checkVersion(event, body);
      check(event.status === "scheduled", 409, "Lịch học đã được hủy.");
      check(
        Date.parse(event.ends_at) > Date.now(),
        409,
        "Không thể hủy lịch đã kết thúc.",
      );
      db.prepare(
        "UPDATE events SET status='cancelled',version=version+1 WHERE id=?",
      ).run(event.id);
      eventNotice(
        db,
        event,
        `Lịch học “${event.title}” đã hủy.`,
        `event-cancelled:${event.id}`,
      );
      return result();
    });
  }
  match = path.match(/^\/api\/events\/([^/]+)\/enroll$/);
  if (match && ["POST", "DELETE"].includes(method)) {
    return transaction(db, () => {
      const event = getEvent(db, match[1]);
      check(
        Date.parse(event.starts_at) > Date.now(),
        409,
        "Lịch học đã bắt đầu; không thể thay đổi đăng ký.",
      );
      if (method === "DELETE") {
        db.prepare(
          "DELETE FROM event_attendees WHERE event_id=? AND user_id=?",
        ).run(event.id, user.id);
      } else {
        check(event.status === "scheduled", 409, "Lịch học đã hủy.");
        if (
          db
            .prepare(
              "SELECT 1 FROM event_attendees WHERE event_id=? AND user_id=?",
            )
            .get(event.id, user.id)
        )
          return result();
        const count = (
          db
            .prepare("SELECT COUNT(*) n FROM event_attendees WHERE event_id=?")
            .get(event.id) as { n: number }
        ).n;
        check(count < event.capacity, 409, "Lịch học đã hết chỗ.");
        db.prepare(
          "INSERT INTO event_attendees (event_id,user_id,created_at) VALUES (?,?,?)",
        ).run(event.id, user.id, now());
        notify(
          db,
          user.id,
          `Bạn đã đăng ký lịch học “${event.title}”.`,
          "calendar",
        );
      }
      return result();
    });
  }
  match = path.match(/^\/api\/events\/([^/]+)\/attendance\/([^/]+)$/);
  if (match && method === "POST") {
    const event = manageEvent(db, user, match[1]);
    check(
      event.status === "scheduled" && Date.parse(event.starts_at) <= Date.now(),
      409,
      "Chỉ điểm danh khi lịch học đã bắt đầu và chưa hủy.",
    );
    const attendance = String(body.attendance || "");
    check(
      ["registered", "present", "absent"].includes(attendance),
      400,
      "Trạng thái điểm danh không hợp lệ.",
    );
    const changed = db
      .prepare(
        "UPDATE event_attendees SET attendance=? WHERE event_id=? AND user_id=?",
      )
      .run(attendance, event.id, match[2]);
    check(changed.changes, 404, "Người học chưa đăng ký lịch này.");
    return result();
  }
  match = path.match(/^\/api\/events\/([^/]+)\/ics$/);
  if (match && method === "GET") {
    return result(calendarFile(getEvent(db, match[1])));
  }
  if (path === "/api/community" && method === "GET") {
    const raw = query instanceof URLSearchParams ? query.get("offset") : (query as Record<string, string>)?.offset;
    const offset = Number(raw || 0);
    check(
      Number.isSafeInteger(offset) && offset >= 0,
      400,
      "Trang không hợp lệ.",
    );
    const posts = db
      .prepare(
        `SELECT p.*,u.name AS author_name,(SELECT COUNT(*) FROM community_likes l WHERE l.post_id=p.id) AS likes,
      EXISTS(SELECT 1 FROM community_likes l WHERE l.post_id=p.id AND l.user_id=?) AS liked
      FROM community_posts p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC,p.id DESC LIMIT 30 OFFSET ?`,
      )
      .all(user.id, offset) as Array<Record<string, unknown>>;
    for (const post of posts) {
      post.replies = db
        .prepare(
          "SELECT r.*,u.name AS author_name FROM community_replies r JOIN users u ON u.id=r.user_id WHERE post_id=? ORDER BY r.created_at,r.id",
        )
        .all(String(post.id));
    }
    const total = (
      db.prepare("SELECT COUNT(*) n FROM community_posts").get() as {
        n: number;
      }
    ).n;
    return result({ posts, total });
  }
  if (path === "/api/community" && method === "POST") {
    const post = {
      id: randomUUID(),
      user_id: user.id,
      body: textField(body.body, "Nội dung bài viết", 10000),
      created_at: now(),
    };
    db.prepare(
      "INSERT INTO community_posts (id,user_id,body,created_at) VALUES (?,?,?,?)",
    ).run(post.id, post.user_id, post.body, post.created_at);
    return result({ post }, 201);
  }
  match = path.match(
    /^\/api\/community\/([^/]+)(?:\/(replies|like)(?:\/([^/]+))?)?$/,
  );
  if (match) {
    const post = db
      .prepare("SELECT * FROM community_posts WHERE id=?")
      .get(match[1]) as { id: string; user_id: string } | undefined;
    check(post, 404, "Không tìm thấy bài viết.");
    if (!match[2] && method === "DELETE") {
      check(
        user.role === "admin" || post.user_id === user.id,
        403,
        "Chỉ tác giả hoặc quản trị được xóa bài.",
      );
      db.prepare("DELETE FROM community_posts WHERE id=?").run(post.id);
      return result();
    }
    if (
      match[2] === "like" &&
      !match[3] &&
      ["POST", "DELETE"].includes(method)
    ) {
      if (method === "POST") {
        db.prepare(
          "INSERT OR IGNORE INTO community_likes (post_id,user_id) VALUES (?,?)",
        ).run(post.id, user.id);
      } else {
        db.prepare(
          "DELETE FROM community_likes WHERE post_id=? AND user_id=?",
        ).run(post.id, user.id);
      }
      return result();
    }
    if (match[2] === "replies" && !match[3] && method === "POST") {
      return transaction(db, () => {
        const reply = {
          id: randomUUID(),
          post_id: post.id,
          user_id: user.id,
          body: textField(body.body, "Phản hồi", 5000),
          created_at: now(),
        };
        db.prepare(
          "INSERT INTO community_replies (id,post_id,user_id,body,created_at) VALUES (?,?,?,?,?)",
        ).run(
          reply.id,
          reply.post_id,
          reply.user_id,
          reply.body,
          reply.created_at,
        );
        if (post.user_id !== user.id) {
          notify(
            db,
            post.user_id,
            `${user.name} đã phản hồi bài viết của bạn.`,
            "community",
            `reply:${reply.id}`,
          );
        }
        return result({ reply }, 201);
      });
    }
    if (match[2] === "replies" && match[3] && method === "DELETE") {
      const reply = db
        .prepare("SELECT * FROM community_replies WHERE id=? AND post_id=?")
        .get(match[3], post.id) as { id: string; user_id: string } | undefined;
      check(reply, 404, "Không tìm thấy phản hồi.");
      check(
        user.role === "admin" || reply.user_id === user.id,
        403,
        "Chỉ tác giả hoặc quản trị được xóa phản hồi.",
      );
      db.prepare("DELETE FROM community_replies WHERE id=?").run(reply.id);
      return result();
    }
  }
  if (path === "/api/notifications" && method === "GET") {
    generateEventReminders(db);
    const notifications = db
      .prepare(
        "SELECT id,user_id,text,route,read_at,created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC,id DESC",
      )
      .all(user.id) as Array<{ read_at?: string | null }>;
    return result({
      notifications,
      unread: notifications.filter((n) => !n.read_at).length,
    });
  }
  if (path === "/api/notifications/read-all" && method === "POST") {
    db.prepare(
      "UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL",
    ).run(now(), user.id);
    return result();
  }
  match = path.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (match && method === "POST") {
    const changed = db
      .prepare(
        "UPDATE notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND user_id=?",
      )
      .run(now(), match[1], user.id);
    check(changed.changes, 404, "Không tìm thấy thông báo.");
    return result();
  }
  return null;
}
