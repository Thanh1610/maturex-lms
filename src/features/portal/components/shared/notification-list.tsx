import { Icon, useApp } from "@/components/ui";

export function NotificationList() {
  const { state, dispatch, go, close } = useApp();

  return (
    <>
      <div className="between">
        <span className="muted small">Thông báo</span>
        <button
          className="text-btn"
          onClick={() => dispatch({ type: "readNotifications" })}
        >
          Đánh dấu đã đọc
        </button>
      </div>
      <div className="notification-list">
        {state.notifications.map((n: any) => (
          <button
            key={n.id}
            onClick={() => {
              dispatch({ type: "readNotifications" });
              go(n.route);
              close();
            }}
          >
            <span className={`notice-dot ${n.read ? "read" : ""}`} />
            <div>
              <strong>{n.text}</strong>
              <small>{n.read ? "Đã đọc" : "Mới"}</small>
            </div>
            <Icon name="ChevronRight" size={17} />
          </button>
        ))}
      </div>
    </>
  );
}
