import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Field,
  Icon,
  PageHead,
  Progress,
  Stat,
  statusColor,
  statusLabel,
  useApp,
} from "@/components/ui";
import { levels, normalize, paths, people } from "../../portal-data";
import { progress } from "../../portal-store";

export function AssignPath({ person }: { person: any }) {
  const { state, dispatch, notify, close } = useApp();
  const allPaths = [...paths, ...(state.customPaths || [])];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const p = allPaths.find((p) => p.id === f.get("path"));
        if (!p) return;
        dispatch({
          type: "assignPath",
          value: {
            person: person.id,
            title: p.title,
            courses: p.courses,
            due: f.get("due"),
            reason: f.get("reason"),
          },
        });
        notify(`Đã giao lộ trình cho ${person.name} trong demo.`);
        close();
      }}
    >
      <div className="person-line flex items-center gap-[11px] text-left p-0 mb-4">
        <Avatar person={person} />
        <div>
          <strong className="block text-[12px] text-[#8d6f9f] font-[550]">
            {person.name}
          </strong>
          <small className="block text-[10px] text-[#b09abd] mt-1">
            {person.job} · {person.team}
          </small>
        </div>
      </div>
      <Field label="Lộ trình phát triển">
        <select
          name="path"
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
        >
          {allPaths.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ngày mục tiêu">
        <input
          type="date"
          name="due"
          required
          defaultValue="2026-10-09"
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
        />
      </Field>
      <Field label="Lý do & kết quả mong muốn">
        <textarea
          name="reason"
          required
          minLength={10}
          rows={3}
          defaultValue="Áp dụng nội dung đã học vào một nhiệm vụ thực tế và nhận phản hồi từ mentor."
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
        />
      </Field>
      <div className="callout blue p-[15px_17px] rounded-lg flex items-start gap-3 mt-4 border border-[#00000004] text-[11px]">
        <Icon name="Info" className="mt-0.5 shrink-0" />
        <p className="m-0 text-[11px] leading-[1.8]">
          Giao lộ trình được lưu trong demo. Chưa gửi email hoặc thông báo bên
          ngoài.
        </p>
      </div>
      <div className="modal-actions flex justify-end gap-2.5 mt-[25px] border-t border-[#ede7f2] pt-5">
        <Button type="submit" icon="Compass">
          Giao lộ trình
        </Button>
      </div>
    </form>
  );
}

export function PersonDetail({ person }: { person: any }) {
  const { state, open } = useApp();
  const work = state.assignments.filter((a: any) => a.person === person.id);
  return (
    <div className="stack flex flex-col gap-4">
      <div className="person-line flex items-center gap-[11px] text-left p-0 mb-2">
        <Avatar person={person} size="large" />
        <div>
          <h2 className="m-0 text-[19px] text-[#8f6fa1] font-semibold">
            {person.name}
          </h2>
          <p className="text-[12px] mt-[5px] text-[#b199bd]">
            {person.job} · {person.team}
          </p>
        </div>
      </div>
      <h3 className="text-[13px] font-semibold text-[#6a5b78] m-0">
        Học tập & thực hành
      </h3>
      {work.map((a: any) => (
        <div
          className="resource-row flex items-center gap-3 py-[15px] border-b border-[#efe9f4] last:border-0 text-[11px] text-left w-full"
          key={a.id}
        >
          <Icon name="FileText" className="text-[#a18cb2]" />
          <div className="flex-1 min-w-0">
            <strong className="text-[11px] text-[#81718d] font-medium block">
              {a.title}
            </strong>
            <small className="block text-[10px] text-[#ad9db7] mt-[5px]">
              Hạn {a.due}
            </small>
          </div>
          <Badge color={statusColor[a.status]}>{statusLabel[a.status]}</Badge>
        </div>
      ))}
      {!work.length && (
        <p className="muted text-[11px] text-[var(--muted,#9b91ab)] m-0">
          Chưa có bài thực hành trong dữ liệu demo.
        </p>
      )}
      <h3 className="text-[13px] font-semibold text-[#6a5b78] m-0">
        Lộ trình đã giao
      </h3>
      {state.pathAssignments
        ?.filter((x: any) => x.person === person.id)
        .map((x: any) => (
          <div
            className="callout lavender p-[15px_17px] rounded-lg flex items-start gap-3 border border-[#00000004] text-[11px]"
            key={x.id}
          >
            <Icon name="Compass" className="mt-0.5 shrink-0" />
            <div>
              <strong className="text-[11px] font-semibold block">
                {x.title}
              </strong>
              <p className="m-0 text-[11px] leading-[1.8]">
                Hạn {x.due} · {x.reason}
              </p>
            </div>
          </div>
        ))}
      <h3 className="text-[13px] font-semibold text-[#6a5b78] m-0">
        Bằng chứng mới
      </h3>
      {state.evidence
        ?.filter((e: any) => e.person === person.id)
        .map((e: any) => (
          <div
            className="evidence-row flex items-center gap-3.5 py-[18px] border-b border-[#eee6f5] last:border-0 text-[#9db293]"
            key={e.id}
          >
            <Icon name="ShieldCheck" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <strong className="text-[12px] block text-[#90749f]">
                {e.title}
              </strong>
              <small className="text-[10px] block mt-1 text-[#b29cbe]">
                {levels[e.level]} · {e.reviewer}
              </small>
            </div>
          </div>
        ))}
      {!state.evidence?.some((e: any) => e.person === person.id) && (
        <p className="muted text-[11px] text-[var(--muted,#9b91ab)] m-0">
          Chưa có bằng chứng mới được xác nhận trong demo.
        </p>
      )}
      <Button
        icon="Plus"
        className="mt-2"
        onClick={() =>
          open(
            `Giao lộ trình cho ${person.name}`,
            <AssignPath person={person} />,
          )
        }
      >
        Giao lộ trình phát triển
      </Button>
    </div>
  );
}

export function AddMember() {
  const { dispatch, close, notify } = useApp();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const name = ((f.get("name") as string) || "").trim();
        dispatch({
          type: "addMember",
          value: {
            id: `person${Date.now()}`,
            name,
            initials: name
              .split(" ")
              .slice(-2)
              .map((s) => s[0])
              .join(""),
            job: f.get("job"),
            team: f.get("team"),
            color: "lavender",
            progress: 0,
          },
        });
        notify("Đã thêm hồ sơ nhân sự mẫu.");
        close();
      }}
    >
      <p className="muted small text-[10px] text-[var(--muted,#9b91ab)] mb-3">
        Chỉ tạo hồ sơ minh họa trong trình duyệt, không tạo tài khoản hoặc gửi
        lời mời.
      </p>
      <Field label="Họ tên">
        <input
          name="name"
          required
          minLength={2}
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
        />
      </Field>
      <Field label="Vai trò chuyên môn">
        <input
          name="job"
          required
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
        />
      </Field>
      <Field label="Đơn vị / dự án">
        <select
          name="team"
          className="w-full p-2.5 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none"
        >
          {["MatureX", "Thedeerly", "EcomCreate", "Microm", "Timond.de"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </Field>
      <div className="modal-actions flex justify-end gap-2.5 mt-[25px] border-t border-[#ede7f2] pt-5">
        <Button type="submit" icon="Plus">
          Thêm hồ sơ mẫu
        </Button>
      </div>
    </form>
  );
}

export function Team() {
  const { state, open } = useApp();
  const [q, setQ] = useState("");
  const [team, setTeam] = useState("Tất cả đơn vị");
  const members = [...people, ...(state.members || [])];
  const list = members.filter(
    (p: any) =>
      (team === "Tất cả đơn vị" || p.team === team) &&
      normalize(`${p.name} ${p.job}`).includes(normalize(q)),
  );

  return (
    <>
      <PageHead
        eyebrow="PHÁT TRIỂN CÙNG ĐỘI NGŨ"
        title="Đội ngũ"
        description="Hiểu nhu cầu học tập. Đồng hành đúng lúc. Tăng khả năng tự chủ."
      >
        <Button
          icon="Plus"
          onClick={() => open("Thêm thành viên demo", <AddMember />)}
        >
          Thêm thành viên
        </Button>
      </PageHead>
      <div className="stats-grid three-stats grid grid-cols-3 max-md:grid-cols-1 gap-3 my-5 mb-[26px]">
        <Stat icon="Users" value={members.length} label="Thành viên mẫu" />
        <Stat
          icon="ClipboardCheck"
          color="peach"
          value={
            state.assignments.filter((a: any) => a.status === "submitted")
              .length
          }
          label="Bài cần phản hồi"
        />
        <Stat
          icon="ShieldCheck"
          color="green"
          value={state.evidence.length}
          label="Bằng chứng mới"
        />
      </div>
      <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
        <div className="filter-row flex gap-3 max-[900px]:gap-2 items-center mb-[19px]">
          <div className="search-input flex gap-2.5 items-center border border-[var(--border,#e9eaf0)] rounded-lg bg-white px-[13px] min-w-0 flex-1 text-[#afa5b8] focus-within:outline-2 focus-within:outline-[#cbb8e0]">
            <Icon name="Search" size={18} />
            <input
              aria-label="Tìm thành viên"
              placeholder="Tìm theo tên, vai trò…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border-0 bg-transparent py-3 w-full text-[11px] outline-none text-[#56515f]"
            />
          </div>
          <select
            aria-label="Lọc đơn vị"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="text-[11px] p-[12px_30px_12px_12px] min-w-[160px] border border-[var(--border,#e9eaf0)] rounded-lg bg-white text-[#6c5980]"
          >
            {["Tất cả đơn vị", ...new Set(members.map((p: any) => p.team))].map(
              (v) => (
                <option key={v}>{v}</option>
              ),
            )}
          </select>
        </div>
        <div className="table-scroll overflow-x-auto max-w-full">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead>
              <tr className="border-b border-[#efe7f5]">
                <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                  THÀNH VIÊN
                </th>
                <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                  ĐƠN VỊ / DỰ ÁN
                </th>
                <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                  HỌC TẬP
                </th>
                <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                  THỰC HÀNH
                </th>
                <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5" />
              </tr>
            </thead>
            <tbody>
              {list.map((p: any) => {
                const assignments = state.assignments.filter(
                  (a: any) => a.person === p.id,
                );
                const done =
                  p.id === "me"
                    ? Math.round(
                        state.enrolled.reduce(
                          (n: number, id: string) => n + progress(state, id),
                          0,
                        ) / (state.enrolled.length || 1),
                      )
                    : p.progress;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-[#efe7f5] last:border-0 hover:bg-[#fcfaff]"
                  >
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <button
                        className="person-line flex items-center gap-[11px] text-left p-0 hover:opacity-80"
                        onClick={() =>
                          open(`Hồ sơ ${p.name}`, <PersonDetail person={p} />)
                        }
                      >
                        <Avatar person={p} />
                        <div>
                          <strong className="block text-[12px] text-[#8d6f9f] font-[550]">
                            {p.name}
                          </strong>
                          <small className="block text-[10px] text-[#b09abd] mt-1">
                            {p.job}
                          </small>
                        </div>
                      </button>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <Badge color="gray">{p.team}</Badge>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <div className="table-progress min-w-[110px] w-[120px]">
                        <div className="mb-1.5">
                          <Progress value={done} />
                        </div>
                        <small className="text-[10px] text-[#b29cc2] block">
                          {done}%{" "}
                          <span className="muted text-[var(--muted,#9b91ab)]">
                            {p.id === "me" ? "" : "· mẫu"}
                          </span>
                        </small>
                      </div>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <span className="small text-[10px] text-[#6c5980]">
                        {
                          assignments.filter(
                            (a: any) => a.status === "approved",
                          ).length
                        }
                        /{assignments.length} bài đạt
                      </span>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <button
                        className="text-btn text-[10px] text-[#9b87bc] hover:underline flex items-center gap-1"
                        onClick={() =>
                          open(
                            `Giao lộ trình cho ${p.name}`,
                            <AssignPath person={p} />,
                          )
                        }
                      >
                        Giao lộ trình
                        <Icon name="Plus" size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!list.length && (
          <Empty
            title="Không tìm thấy thành viên"
            description="Thử tên hoặc đơn vị khác."
          />
        )}
      </section>
      <div className="callout sand p-[15px_17px] rounded-lg flex items-start gap-3 mt-5 border border-[#00000004] text-[11px]">
        <Icon name="Info" className="mt-0.5 shrink-0" />
        <p className="m-0 text-[11px] leading-[1.8]">
          Tên nhân sự và tiến độ là dữ liệu minh họa. Quan hệ dự án tham khảo
          knowledge MatureX, chưa thay cho sơ đồ tổ chức hiện hành.
        </p>
      </div>
    </>
  );
}
