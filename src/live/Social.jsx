import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Empty, Icon } from "../ui.jsx";
import { api, dateLabel } from "./api.js";

function useSocial(path, _state, mutate) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    const request = ++sequence.current;
    setError("");
    try {
      const next = await api(path);
      if (request === sequence.current) setData(next);
      return next;
    } catch (error) {
      if (request === sequence.current) setError(error.message);
      return null;
    }
  }, [path]);
  useEffect(() => {
    reload();
    return () => {
      sequence.current++;
    };
  }, [reload]);
  const change = async (path, method, body, message) => {
    const saved = await mutate(path, method, body, message);
    if (saved) await reload();
    return saved;
  };
  return { data, error, reload, change, setError };
}
function LoadState({ resource }) {
  if (resource.error)
    return (
      <div className="live-error" role="alert">
        {resource.error}{" "}
        <Button kind="ghost" onClick={resource.reload}>
          Thử lại
        </Button>
      </div>
    );
  if (!resource.data)
    return (
      <p role="status" className="muted">
        Đang tải dữ liệu…
      </p>
    );
  return null;
}
const localDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
function EventEditor({ initial, busy, change, onClose }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          ...initial,
          starts_at: localDate(initial.starts_at),
          ends_at: localDate(initial.ends_at),
        }
      : {
          title: "",
          description: "",
          location: "",
          starts_at: "",
          ends_at: "",
          capacity: 20,
        },
  );
  const [error, setError] = useState("");
  const set = (field, value) =>
    setForm((previous) => ({ ...previous, [field]: value }));
  async function save(event) {
    event.preventDefault();
    setError("");
    const starts = Date.parse(form.starts_at),
      ends = Date.parse(form.ends_at);
    if (
      !Number.isFinite(starts) ||
      !Number.isFinite(ends) ||
      starts <= Date.now() ||
      ends <= starts
    ) {
      setError(
        "Chọn giờ bắt đầu trong tương lai và giờ kết thúc sau giờ bắt đầu.",
      );
      return;
    }
    const saved = await change(
      `/events${initial ? `/${initial.id}` : ""}`,
      initial ? "PUT" : "POST",
      {
        ...form,
        capacity: Number(form.capacity),
        starts_at: new Date(starts).toISOString(),
        ends_at: new Date(ends).toISOString(),
      },
      "Đã lưu lịch học.",
    );
    if (saved) onClose();
  }
  return (
    <form onSubmit={save} className="live-panel live-form social-editor">
      <div className="between">
        <h2>{initial ? "Chỉnh sửa lịch học" : "Tạo lịch học"}</h2>
        <Button kind="ghost" type="button" onClick={onClose} disabled={busy}>
          Đóng
        </Button>
      </div>
      <label>
        Tên lịch học
        <input
          required
          maxLength={180}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </label>
      <label>
        Mô tả
        <textarea
          rows={3}
          maxLength={5000}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <label>
        Địa điểm hoặc liên kết tham gia
        <input
          required
          maxLength={1000}
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </label>
      <div className="live-two-col">
        <label>
          Bắt đầu
          <input
            required
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => set("starts_at", e.target.value)}
          />
        </label>
        <label>
          Kết thúc
          <input
            required
            type="datetime-local"
            value={form.ends_at}
            onChange={(e) => set("ends_at", e.target.value)}
          />
        </label>
      </div>
      <p className="muted small">
        Giờ hiển thị theo múi giờ thiết bị:{" "}
        {Intl.DateTimeFormat().resolvedOptions().timeZone}.
      </p>
      <label>
        Số chỗ
        <input
          required
          type="number"
          min={1}
          max={10000}
          value={form.capacity}
          onChange={(e) => set("capacity", e.target.value)}
        />
      </label>
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy ? "Đang lưu…" : "Lưu lịch học"}
      </Button>
    </form>
  );
}
function Location({ value }) {
  try {
    const url = new URL(value);
    if (["http:", "https:"].includes(url.protocol))
      return (
        <a href={url.href} target="_blank" rel="noopener noreferrer">
          {value} ↗
        </a>
      );
  } catch {
    /* Plain venue name. */
  }
  return <span>{value}</span>;
}
export function Calendar({ state, mutate, busy }) {
  const resource = useSocial("/events", state, mutate);
  const [editor, setEditor] = useState(null);
  const [filter, setFilter] = useState("upcoming");
  const [cancel, setCancel] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const canCreate = ["admin", "instructor"].includes(state.user.role);
  const items = (resource.data?.events || []).filter(
    (event) =>
      filter === "all" ||
      (filter === "mine"
        ? event.enrolled
        : event.status === "scheduled" &&
          Date.parse(event.ends_at) > Date.now()),
  );
  async function download(event) {
    setDownloading(true);
    resource.setError("");
    try {
      const data = await api(`/events/${event.id}/ics`);
      const url = URL.createObjectURL(
        new Blob([data.ics], { type: "text/calendar;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      resource.setError(error.message);
    } finally {
      setDownloading(false);
    }
  }
  return (
    <>
      <div className="between live-page-heading">
        <div>
          <span className="live-eyebrow">HỌC CÙNG NHAU</span>
          <h1>Lịch học</h1>
          <p className="muted">
            Đăng ký buổi học, lưu lịch và theo dõi điểm danh.
          </p>
        </div>
        {canCreate && (
          <Button
            icon="Plus"
            disabled={busy || !!editor}
            onClick={() => setEditor({})}
          >
            Tạo lịch học
          </Button>
        )}
      </div>
      {editor && (
        <EventEditor
          key={editor.id || "new"}
          initial={editor.id ? editor : null}
          change={resource.change}
          busy={busy}
          onClose={() => setEditor(null)}
        />
      )}
      <div className="live-filters">
        <label className="social-filter">
          Hiển thị
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="mine">Đã đăng ký</option>
            <option value="all">Tất cả lịch học</option>
          </select>
        </label>
        <span className="muted">{items.length} buổi học</span>
      </div>
      <LoadState resource={resource} />
      {resource.data && !items.length && (
        <Empty
          title="Chưa có lịch học phù hợp"
          description={
            canCreate
              ? "Tạo một buổi học để kết nối đội ngũ."
              : "Lịch học sẽ xuất hiện khi giảng viên lên lịch."
          }
        />
      )}
      <div className="stack">
        {items.map((event) => {
          const future = Date.parse(event.starts_at) > Date.now(),
            cancelled = event.status === "cancelled";
          const manage =
            state.user.role === "admin" ||
            (state.user.role === "instructor" &&
              event.owner_id === state.user.id);
          return (
            <article className="live-panel social-event" key={event.id}>
              <div className="social-event-date">
                <strong>{new Date(event.starts_at).getDate()}</strong>
                <span>Tháng {new Date(event.starts_at).getMonth() + 1}</span>
                <small>{new Date(event.starts_at).getFullYear()}</small>
              </div>
              <div className="social-event-content">
                <div className="social-tags">
                  <Badge color={cancelled ? "rose" : "green"}>
                    {cancelled
                      ? "Đã hủy"
                      : future
                        ? "Sắp diễn ra"
                        : Date.parse(event.ends_at) > Date.now()
                          ? "Đang diễn ra"
                          : "Đã kết thúc"}
                  </Badge>
                  {!!event.enrolled && <Badge>Đã đăng ký</Badge>}
                  {event.attendance === "present" && (
                    <Badge color="green">Có mặt</Badge>
                  )}
                  {event.attendance === "absent" && (
                    <Badge color="rose">Vắng mặt</Badge>
                  )}
                </div>
                <h2>{event.title}</h2>
                <p className="live-prose">{event.description}</p>
                <p className="muted">
                  <Icon name="Clock" size={15} /> {dateLabel(event.starts_at)} –{" "}
                  {dateLabel(event.ends_at)}
                </p>
                <p className="social-location">
                  <Icon name="ExternalLink" size={15} />{" "}
                  <Location value={event.location} />
                </p>
                <p className="muted">
                  {event.owner_name} · {event.attendee_count}/{event.capacity}{" "}
                  người đăng ký
                </p>
                <div className="live-row-actions">
                  {!cancelled &&
                    future &&
                    (event.enrolled ? (
                      <Button
                        kind="secondary"
                        disabled={busy}
                        onClick={() =>
                          resource.change(
                            `/events/${event.id}/enroll`,
                            "DELETE",
                            {},
                            "Đã hủy đăng ký lịch học.",
                          )
                        }
                      >
                        Hủy đăng ký
                      </Button>
                    ) : (
                      <Button
                        disabled={
                          busy || event.attendee_count >= event.capacity
                        }
                        onClick={() =>
                          resource.change(
                            `/events/${event.id}/enroll`,
                            "POST",
                            {},
                            "Đã đăng ký lịch học.",
                          )
                        }
                      >
                        {event.attendee_count >= event.capacity
                          ? "Đã hết chỗ"
                          : "Đăng ký tham gia"}
                      </Button>
                    ))}
                  <Button
                    kind="ghost"
                    icon="Download"
                    disabled={downloading}
                    onClick={() => download(event)}
                  >
                    Tải lịch .ics
                  </Button>
                  {manage && !cancelled && future && (
                    <Button
                      kind="secondary"
                      disabled={busy || !!editor}
                      onClick={() => setEditor(event)}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                  {manage &&
                    !cancelled &&
                    Date.parse(event.ends_at) > Date.now() && (
                      <Button
                        kind="ghost"
                        disabled={busy}
                        onClick={() => setCancel(event.id)}
                      >
                        Hủy buổi học
                      </Button>
                    )}
                </div>
                {cancel === event.id && (
                  <div className="social-confirm" role="alert">
                    <p>
                      Hủy “{event.title}”? Người đã đăng ký sẽ nhận thông báo.
                    </p>
                    <div className="live-row-actions">
                      <Button
                        disabled={busy}
                        onClick={async () => {
                          if (
                            await resource.change(
                              `/events/${event.id}/cancel`,
                              "POST",
                              { version: event.version },
                              "Đã hủy buổi học và thông báo người tham gia.",
                            )
                          )
                            setCancel(null);
                        }}
                      >
                        Xác nhận hủy
                      </Button>
                      <Button
                        kind="ghost"
                        disabled={busy}
                        onClick={() => setCancel(null)}
                      >
                        Giữ lịch học
                      </Button>
                    </div>
                  </div>
                )}
                {manage && (
                  <details className="social-roster">
                    <summary>
                      Danh sách đăng ký ({event.attendee_count})
                    </summary>
                    {!event.attendees?.length ? (
                      <p className="muted">Chưa có người đăng ký.</p>
                    ) : (
                      event.attendees.map((attendee) => (
                        <div
                          className="between social-attendee"
                          key={attendee.user_id}
                        >
                          <span>{attendee.name}</span>
                          <select
                            aria-label={`Điểm danh ${attendee.name}`}
                            value={attendee.attendance}
                            disabled={busy || future || cancelled}
                            onChange={(e) =>
                              resource.change(
                                `/events/${event.id}/attendance/${attendee.user_id}`,
                                "POST",
                                { attendance: e.target.value },
                                "Đã lưu điểm danh.",
                              )
                            }
                          >
                            <option value="registered">Chưa điểm danh</option>
                            <option value="present">Có mặt</option>
                            <option value="absent">Vắng mặt</option>
                          </select>
                        </div>
                      ))
                    )}
                    {future && (
                      <p className="muted small">
                        Điểm danh mở khi buổi học bắt đầu.
                      </p>
                    )}
                  </details>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function CommunityPost({ post, user, change, busy }) {
  const [reply, setReply] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = user.role === "admin" || post.user_id === user.id;
  async function submit(event) {
    event.preventDefault();
    if (
      await change(
        `/community/${post.id}/replies`,
        "POST",
        { body: reply },
        "Đã gửi phản hồi.",
      )
    )
      setReply("");
  }
  return (
    <article className="live-panel social-post">
      <div className="between">
        <div className="social-author">
          <span className="live-avatar">{post.author_name.slice(0, 1)}</span>
          <div>
            <strong>{post.author_name}</strong>
            <small className="muted">{dateLabel(post.created_at)}</small>
          </div>
        </div>
        {canDelete && (
          <Button
            kind="ghost"
            disabled={busy}
            onClick={() => setDeleting(!deleting)}
          >
            Xóa bài
          </Button>
        )}
      </div>
      {deleting && (
        <div className="social-confirm">
          <p>Xóa bài viết và tất cả phản hồi?</p>
          <div className="live-row-actions">
            <Button
              disabled={busy}
              onClick={() =>
                change(
                  `/community/${post.id}`,
                  "DELETE",
                  {},
                  "Đã xóa bài viết.",
                )
              }
            >
              Xác nhận xóa
            </Button>
            <Button kind="ghost" onClick={() => setDeleting(false)}>
              Giữ bài viết
            </Button>
          </div>
        </div>
      )}
      <p className="live-prose social-post-body">{post.body}</p>
      <div className="social-post-actions">
        <Button
          kind={post.liked ? "secondary" : "ghost"}
          aria-pressed={!!post.liked}
          icon="ThumbsUp"
          disabled={busy}
          onClick={() =>
            change(
              `/community/${post.id}/like`,
              post.liked ? "DELETE" : "POST",
              {},
              post.liked ? "Đã bỏ thích." : "Đã thích bài viết.",
            )
          }
        >
          {post.likes} lượt thích
        </Button>
        <span className="muted">{post.replies.length} phản hồi</span>
      </div>
      {post.replies.map((item) => (
        <div className="social-reply" key={item.id}>
          <div className="between">
            <strong>{item.author_name}</strong>
            {(user.role === "admin" || item.user_id === user.id) && (
              <Button
                kind="ghost"
                disabled={busy}
                onClick={() =>
                  change(
                    `/community/${post.id}/replies/${item.id}`,
                    "DELETE",
                    {},
                    "Đã xóa phản hồi.",
                  )
                }
              >
                Xóa phản hồi
              </Button>
            )}
          </div>
          <p className="live-prose">{item.body}</p>
          <small className="muted">{dateLabel(item.created_at)}</small>
        </div>
      ))}
      <form className="live-form social-reply-form" onSubmit={submit}>
        <label>
          Phản hồi bài viết của {post.author_name}
          <textarea
            required
            maxLength={5000}
            rows={2}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Chia sẻ kinh nghiệm hoặc đặt câu hỏi…"
          />
        </label>
        <Button type="submit" kind="secondary" disabled={busy || !reply.trim()}>
          Gửi phản hồi
        </Button>
      </form>
    </article>
  );
}
export function Community({ state, mutate, busy }) {
  const [offset, setOffset] = useState(0);
  const resource = useSocial(`/community?offset=${offset}`, state, mutate);
  const [body, setBody] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (
      await resource.change("/community", "POST", { body }, "Đã đăng bài viết.")
    ) {
      setBody("");
      setOffset(0);
    }
  }
  return (
    <>
      <div className="live-page-heading">
        <span className="live-eyebrow">KẾT NỐI & CHIA SẺ</span>
        <h1>Cộng đồng học tập</h1>
        <p className="muted">
          Đặt câu hỏi, chia sẻ trải nghiệm và học từ đồng đội.
        </p>
      </div>
      <form className="live-panel live-form social-editor" onSubmit={submit}>
        <label>
          Bạn muốn chia sẻ điều gì?
          <textarea
            required
            rows={4}
            maxLength={10000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Một điều vừa học được, một bài học thực tế…"
          />
        </label>
        <div className="between">
          <small className="muted">
            Bài viết hiển thị với mọi thành viên trong không gian học tập.
          </small>
          <Button icon="Send" type="submit" disabled={busy || !body.trim()}>
            Đăng bài
          </Button>
        </div>
      </form>
      <LoadState resource={resource} />
      {resource.data && !resource.data.posts.length && (
        <Empty
          title="Chưa có bài viết"
          description="Bắt đầu cuộc trò chuyện bằng một trải nghiệm học tập của bạn."
        />
      )}
      <div className="stack">
        {resource.data?.posts.map((post) => (
          <CommunityPost
            key={post.id}
            post={post}
            user={state.user}
            change={resource.change}
            busy={busy}
          />
        ))}
      </div>
      {!!resource.data && (resource.data.total > 30 || offset > 0) && (
        <div className="social-pagination">
          <Button
            kind="secondary"
            disabled={busy || offset === 0}
            onClick={() => setOffset(Math.max(0, offset - 30))}
          >
            Trang trước
          </Button>
          <span>
            Trang {offset / 30 + 1} · {resource.data.total} bài viết
          </span>
          <Button
            kind="secondary"
            disabled={busy || offset + 30 >= resource.data.total}
            onClick={() => setOffset(offset + 30)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </>
  );
}
export function Notifications({ state, go, mutate, busy }) {
  const resource = useSocial("/notifications", state, mutate);
  const [unreadOnly, setUnreadOnly] = useState(false);
  useEffect(() => {
    const timer = setInterval(resource.reload, 60000);
    return () => clearInterval(timer);
  }, [resource.reload]);
  const items = (resource.data?.notifications || []).filter(
    (item) => !unreadOnly || !item.read_at,
  );
  return (
    <>
      <div className="between live-page-heading">
        <div>
          <span className="live-eyebrow">THEO DÕI HOẠT ĐỘNG</span>
          <h1>Thông báo</h1>
          <p className="muted">
            {resource.data?.unread || 0} chưa đọc · Cập nhật học tập và nhắc
            lịch trong ứng dụng.
          </p>
        </div>
        <Button
          kind="secondary"
          disabled={busy || !resource.data?.unread}
          onClick={() =>
            resource.change(
              "/notifications/read-all",
              "POST",
              {},
              "Đã đánh dấu tất cả là đã đọc.",
            )
          }
        >
          Đọc tất cả
        </Button>
      </div>
      <div className="live-filters">
        <label className="social-checkbox">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />{" "}
          Chỉ hiện chưa đọc
        </label>
      </div>
      <LoadState resource={resource} />
      {resource.data && !items.length && (
        <Empty
          title={unreadOnly ? "Bạn đã đọc hết thông báo" : "Chưa có thông báo"}
          description="Thông báo xuất hiện khi có hoạt động liên quan đến bạn."
        />
      )}
      <div className="stack">
        {items.map((item) => (
          <article
            key={item.id}
            className={
              "live-panel social-notification " +
              (!item.read_at ? "social-unread" : "")
            }
          >
            <span className="social-notification-icon">
              <Icon
                name={item.route === "calendar" ? "CalendarDays" : "Bell"}
                size={22}
              />
            </span>
            <div>
              <p className="live-prose">{item.text}</p>
              <small className="muted">{dateLabel(item.created_at)}</small>
              {!item.read_at && (
                <span className="social-unread-label">Chưa đọc</span>
              )}
              <div className="live-row-actions">
                {item.route && (
                  <Button
                    kind="ghost"
                    onClick={async () => {
                      if (
                        item.read_at ||
                        (await resource.change(
                          `/notifications/${item.id}/read`,
                          "POST",
                          {},
                          "Đã đọc thông báo.",
                        ))
                      )
                        go(item.route);
                    }}
                    disabled={busy}
                  >
                    Xem chi tiết →
                  </Button>
                )}
                {!item.read_at && (
                  <Button
                    kind="ghost"
                    disabled={busy}
                    onClick={() =>
                      resource.change(
                        `/notifications/${item.id}/read`,
                        "POST",
                        {},
                        "Đã đọc thông báo.",
                      )
                    }
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
