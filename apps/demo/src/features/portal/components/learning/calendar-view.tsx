import { useState } from "react";
import {
  Badge,
  Button,
  download,
  Empty,
  Field,
  Icon,
  PageHead,
  useApp,
} from "@/components/ui";

export function EventDetails({ id }: { id: string }) {
  const { state, dispatch, notify } = useApp();
  const e = state.events.find((e: any) => e.id === id);
  if (!e) return null;

  return (
    <div className="event-details">
      <Badge color={e.color}>{e.type}</Badge>
      <h2 className="text-[21px] my-[15px] font-semibold text-[#6a557b]">
        {e.title}
      </h2>
      <p className="flex gap-2.5 items-center text-[#a18cab] text-[12px] my-2">
        <Icon name="CalendarDays" size={18} />
        Ngày {e.day}/{e.month}/2026 · {e.time}
      </p>
      <p className="flex gap-2.5 items-center text-[#a18cab] text-[12px] my-2">
        <Icon name="Users" size={18} />
        Hướng dẫn: {e.teacher}
      </p>
      <div className="callout lavender p-[15px_17px] rounded-lg flex items-start gap-3 mt-5 border border-[#00000004] text-[11px]">
        <Icon name="Video" className="mt-0.5 shrink-0" />
        <p className="m-0 text-[11px] leading-[1.8]">
          Buổi đào tạo trực tuyến minh họa. Demo chưa kết nối phòng họp hoặc gửi
          lời mời lịch.
        </p>
      </div>
      <div className="flex gap-2.5 mt-[23px]">
        <Button
          icon={e.registered ? "Check" : "Plus"}
          kind={e.registered ? "secondary" : "primary"}
          onClick={() => {
            dispatch({ type: "event", id });
            notify(
              e.registered
                ? "Đã hủy đăng ký trong demo."
                : "Đã đăng ký buổi đào tạo trong demo.",
            );
          }}
        >
          {e.registered ? "Hủy đăng ký" : "Đăng ký tham gia"}
        </Button>
        <Button
          kind="ghost"
          icon="Download"
          onClick={() => {
            const date = `2026${String(e.month).padStart(2, "0")}${String(e.day).padStart(2, "0")}`;
            download(
              "maturex-lich-hoc.ics",
              `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MatureX//LMS Demo//VI\r\nBEGIN:VEVENT\r\nUID:${e.id}@maturex-demo\r\nDTSTAMP:20260909T000000Z\r\nDTSTART;TZID=Asia/Ho_Chi_Minh:${date}T${e.time.slice(0, 5).replace(":", "")}00\r\nDTEND;TZID=Asia/Ho_Chi_Minh:${date}T${e.time.slice(-5).replace(":", "")}00\r\nSUMMARY:[DEMO] ${e.title}\r\nEND:VEVENT\r\nEND:VCALENDAR`,
              "text/calendar",
            );
          }}
        >
          Tải tệp lịch
        </Button>
      </div>
    </div>
  );
}

export function NewEvent() {
  const { dispatch, close, notify } = useApp();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const date = ((f.get("date") as string) || "").split("-");
        const start = (f.get("start") as string) || "";
        const end = (f.get("end") as string) || "";
        if (end <= start) {
          notify("Giờ kết thúc cần sau giờ bắt đầu.");
          return;
        }
        dispatch({
          type: "addEvent",
          value: {
            id: `e${Date.now()}`,
            title: f.get("title"),
            day: Number(date[2]),
            month: Number(date[1]),
            time: `${start} – ${end}`,
            teacher: f.get("teacher"),
            type: f.get("type"),
            color: "lavender",
            registered: false,
          },
        });
        notify("Đã tạo buổi đào tạo trong lịch demo.");
        close();
      }}
    >
      <Field label="Tên buổi đào tạo">
        <input
          name="title"
          required
          placeholder="Ví dụ: AI thực hành cùng đội ngũ"
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none focus:border-[#cbb8e0]"
        />
      </Field>
      <div className="form-grid grid grid-cols-2 max-md:grid-cols-1 gap-x-[18px]">
        <Field label="Ngày tổ chức">
          <input
            type="date"
            name="date"
            min="2026-01-01"
            max="2026-12-31"
            defaultValue="2026-09-16"
            required
            className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
          />
        </Field>
        <Field label="Hình thức">
          <select
            name="type"
            className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
          >
            <option>Workshop</option>
            <option>Mentoring</option>
            <option>Chia sẻ</option>
          </select>
        </Field>
        <Field label="Bắt đầu">
          <input
            type="time"
            name="start"
            defaultValue="14:00"
            required
            className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
          />
        </Field>
        <Field label="Kết thúc">
          <input
            type="time"
            name="end"
            defaultValue="15:30"
            required
            className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
          />
        </Field>
      </div>
      <Field label="Người hướng dẫn">
        <input
          name="teacher"
          defaultValue="Ngọc Linh"
          required
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none focus:border-[#cbb8e0]"
        />
      </Field>
      <div className="modal-actions flex justify-end gap-2.5 mt-[25px] border-t border-[#ede7f2] pt-5">
        <Button type="submit" icon="Plus">
          Tạo buổi đào tạo
        </Button>
      </div>
    </form>
  );
}

export function Calendar() {
  const { state, open, role } = useApp();
  const [month, setMonth] = useState(8);
  const [day, setDay] = useState<number | null>(null);
  const count = new Date(2026, month + 1, 0).getDate();
  const offset = (new Date(2026, month, 1).getDay() + 6) % 7;
  const events = state.events.filter(
    (e: any) => e.month === month + 1 && (!day || e.day === day),
  );

  return (
    <>
      <PageHead
        eyebrow="HỌC TẬP CÙNG NHAU"
        title="Lịch đào tạo"
        description="Những cuộc gặp để sẻ chia kiến thức và cùng tiến bộ."
      >
        {role !== "learner" && (
          <Button
            icon="Plus"
            onClick={() => open("Tạo buổi đào tạo", <NewEvent />)}
          >
            Tạo buổi đào tạo
          </Button>
        )}
      </PageHead>
      <div className="calendar-layout grid grid-cols-[minmax(0,1fr)_285px] max-[1200px]:grid-cols-[minmax(0,1fr)_240px] max-[900px]:grid-cols-1 gap-[22px] max-[1200px]:gap-[15px]">
        <section className="panel calendar-panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-5 max-[1200px]:p-3.5 min-w-0">
          <div className="calendar-toolbar flex justify-between gap-3 items-center mb-6">
            <h2 className="text-[18px] font-semibold text-[#60516f] m-0">
              Tháng {month + 1}, 2026
            </h2>
            <div className="flex items-center gap-2">
              <Button
                kind="secondary"
                onClick={() => {
                  setMonth(8);
                  setDay(null);
                }}
              >
                Tháng demo
              </Button>
              <button
                className="icon-btn p-1 text-[var(--muted,#9b91ab)] hover:text-[#60516f] disabled:opacity-40"
                disabled={month === 0}
                aria-label="Tháng trước"
                onClick={() => {
                  setMonth((m) => m - 1);
                  setDay(null);
                }}
              >
                <Icon name="ChevronLeft" />
              </button>
              <button
                className="icon-btn p-1 text-[var(--muted,#9b91ab)] hover:text-[#60516f] disabled:opacity-40"
                disabled={month === 11}
                aria-label="Tháng sau"
                onClick={() => {
                  setMonth((m) => m + 1);
                  setDay(null);
                }}
              >
                <Icon name="ChevronRight" />
              </button>
            </div>
          </div>
          <div className="calendar-weekdays grid grid-cols-7 text-[10px] text-[#aa98b6] text-center pb-[15px] font-medium">
            {[
              "Thứ Hai",
              "Thứ Ba",
              "Thứ Tư",
              "Thứ Năm",
              "Thứ Sáu",
              "Thứ Bảy",
              "Chủ Nhật",
            ].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid grid grid-cols-7 border-t border-l border-[#eee8f4]">
            {Array.from({ length: offset }, (_, i) => (
              <div
                key={`empty${i}`}
                className="calendar-cell outside border-b border-r border-[#eee8f4] min-h-[110px] max-[1200px]:min-h-[98px] p-[5px] bg-[#faf8fd]"
              />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = i + 1;
              const es = state.events.filter(
                (e: any) => e.day === date && e.month === month + 1,
              );
              return (
                <div
                  key={date}
                  className={`calendar-cell border-b border-r border-[#eee8f4] min-h-[110px] max-[1200px]:min-h-[98px] p-[5px] min-w-0 transition-colors ${
                    date === 9 && month === 8 ? "today" : ""
                  } ${day === date ? "selected bg-[#f7f0fd]" : "hover:bg-[#faf9fd]"}`}
                >
                  <button
                    className={`date-number text-[10px] w-[25px] h-[25px] rounded-full flex items-center justify-center p-0 mb-1.5 font-medium ${
                      date === 9 && month === 8
                        ? "bg-[#b294c8] text-white"
                        : "text-[#a18cae] hover:bg-[#eee6f6]"
                    }`}
                    aria-label={`Ngày ${date} tháng ${month + 1}`}
                    onClick={() => setDay(day === date ? null : date)}
                  >
                    {date}
                  </button>
                  {es.map((e: any) => (
                    <button
                      key={e.id}
                      className={`calendar-event ${e.color} block text-left w-full text-[10px] leading-[1.65] p-[5px] rounded mb-1 [overflow-wrap:anywhere]`}
                      onClick={() => open(e.title, <EventDetails id={e.id} />)}
                    >
                      <span className="block text-[10px] opacity-80">
                        {e.time.slice(0, 5)}
                      </span>
                      <strong className="font-normal block truncate">
                        {e.title}
                      </strong>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
        <aside className="panel calendar-events bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
          <div className="between flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-semibold text-[#60516f] m-0">
              {day ? `Ngày ${day}/${month + 1}` : "Trong tháng này"}
            </h3>
            {day && (
              <button
                className="text-btn text-[10px] text-[#9b87bc] hover:underline"
                onClick={() => setDay(null)}
              >
                Xem tất cả
              </button>
            )}
          </div>
          {events.map((e: any) => (
            <button
              className="schedule-event flex items-start gap-3 text-left py-5 border-b border-[#f0e8f6] last:border-0 w-full hover:bg-[#faf7fc] px-1 rounded-md transition-colors"
              key={e.id}
              onClick={() => open(e.title, <EventDetails id={e.id} />)}
            >
              <span
                className={`date-tile ${e.color} w-10 shrink-0 rounded-[7px] flex items-center justify-center flex-col p-[8px_4px]`}
              >
                <small className="text-[10px] uppercase">{`TH${e.month}`}</small>
                <strong className="text-[21px] font-medium leading-none">
                  {e.day}
                </strong>
              </span>
              <div className="flex-1 min-w-0">
                <Badge color={e.color} className="!text-[10px]">
                  {e.type}
                </Badge>
                <h4 className="text-[10px] font-medium my-[9px] text-[#90779e]">
                  {e.title}
                </h4>
                <p className="text-[10px] text-[#b09cbe] m-0">{e.time}</p>
                {e.registered && (
                  <small className="green-text text-[10px] text-[#6d9673] block mt-1">
                    ✓ Đã đăng ký
                  </small>
                )}
              </div>
            </button>
          ))}
          {!events.length && (
            <Empty
              title="Lịch đang trống"
              description="Bạn có thể dành thời gian cho lộ trình cá nhân."
            />
          )}
        </aside>
      </div>
    </>
  );
}
