import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  download,
  Empty,
  Field,
  Icon,
  PageHead,
  Progress,
  SectionHead,
  Stat,
  statusColor,
  statusLabel,
  Tabs,
  useApp,
} from "@/components/ui";
import {
  categories,
  levels,
  normalize,
  paths,
  people,
  rubric,
} from "./demo-data";
import { progress } from "./demo-store";

function SkillDetail({ id }) {
  const { state, go, close } = useApp();
  const skill = state.skills.find((s) => s.id === id);
  const evidence = state.evidence.filter(
    (e) => e.skill === id && e.person === "me",
  );
  const related = state.courses.filter(
    (c) => c.skill === id && c.status === "published",
  );
  return (
    <div className="stack flex flex-col gap-4">
      <div className={`skill-detail-top ${skill.color} p-[23px] rounded-[9px]`}>
        <span className="eyebrow text-[10px] tracking-[1.4px] font-semibold opacity-70 block mb-1">
          {skill.group}
        </span>
        <h2 className="text-[19px] font-[550] my-1">{skill.name}</h2>
        <p className="text-[12px] m-0">
          {levels[skill.level]} → Mục tiêu: {levels[skill.target]}
        </p>
      </div>
      <h3 className="text-[13px] font-semibold text-[#6a5b78] m-0">
        Các mức năng lực
      </h3>
      {levels.slice(1).map((l, i) => (
        <div className="level-description flex gap-3.5 items-center" key={l}>
          <span
            className={`w-[33px] h-[33px] shrink-0 flex items-center justify-center rounded-[7px] bg-[#f2ecf9] text-[#c7b1d7] font-medium text-[11px] ${skill.level >= i + 1 ? "filled !bg-[#b399ca] !text-white" : ""}`}
          >
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <strong className="text-[12px] block text-[#9478a6]">{l}</strong>
            <small className="text-[10px] block text-[#b29cbe] mt-1">
              {
                [
                  "Giải thích và nhận diện được tình huống.",
                  "Hoàn thành với sự hỗ trợ từ người hướng dẫn.",
                  "Tự thực hiện đạt tiêu chí trong phạm vi xác định.",
                  "Hướng dẫn người khác và cải thiện cách làm.",
                ][i]
              }
            </small>
          </div>
          {skill.level === i + 1 && <Badge color="green">Hiện tại</Badge>}
        </div>
      ))}
      <h3 className="text-[13px] font-semibold text-[#6a5b78] m-0">
        Bằng chứng được xác nhận
      </h3>
      {evidence.length ? (
        evidence.map((e) => (
          <div
            className="evidence-row flex items-center gap-3.5 py-[18px] border-b border-[#eee6f5] text-[#9db293]"
            key={e.id}
          >
            <Icon name="ShieldCheck" size={23} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <strong className="text-[12px] block text-[#90749f]">
                {e.title}
              </strong>
              <small className="text-[10px] block mt-[7px] text-[#b29cbe]">
                {e.reviewer} · {e.date} · {e.scope}
              </small>
              <span className="text-[10px] mt-[7px] block text-[#8ea785]">
                Mức xác nhận: {levels[e.level]}
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="muted small text-[10px] text-[var(--muted,#9b91ab)] m-0">
          Mức hiện tại là dữ liệu mẫu ban đầu. Chưa có bằng chứng mới được duyệt
          trong phiên demo. Nộp và duyệt một bài thực hành để trải nghiệm.
        </p>
      )}
      <h3 className="text-[13px] font-semibold text-[#6a5b78] m-0">
        Học để phát triển tiếp
      </h3>
      {related.map((c) => (
        <button
          className="resource-row clickable flex items-center gap-3 py-[15px] border-b border-[#efe9f4] last:border-0 text-[11px] text-left w-full hover:bg-[#fcfaff] px-1 rounded transition-colors"
          key={c.id}
          onClick={() => {
            go(`course/${c.id}`);
            close();
          }}
        >
          <span
            className={`icon-tile ${c.color} w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0`}
          >
            <Icon name={c.icon} size={18} />
          </span>
          <strong className="text-[11px] text-[#81718d] font-medium flex-1">
            {c.title}
          </strong>
          <Icon
            name="ArrowRight"
            size={17}
            className="ml-auto text-[#baa0cd]"
          />
        </button>
      ))}
    </div>
  );
}
export function Skills() {
  const { state, open, go } = useApp();
  const [tab, setTab] = useState("Bản đồ năng lực");
  const ev = state.evidence.filter((e) => e.person === "me");
  return (
    <>
      <PageHead
        eyebrow="MỖI NGƯỜI MỘT HÀNH TRÌNH"
        title="Hồ sơ năng lực"
        description="Nhìn thấy sự tiến bộ qua những điều bạn thực sự làm được."
      >
        <Button
          kind="secondary"
          icon="Download"
          onClick={() =>
            download(
              "ho-so-nang-luc-minh-anh.txt",
              "HỒ SƠ NĂNG LỰC · DỮ LIỆU DEMO\nMinh Anh\n\n" +
                state.skills
                  .map(
                    (s) =>
                      `${s.name}: ${levels[s.level]} / Mục tiêu: ${levels[s.target]}`,
                  )
                  .join("\n") +
                "\n\nBẰNG CHỨNG\n" +
                ev
                  .map((e) => `${e.title} · ${e.reviewer} · ${e.scope}`)
                  .join("\n"),
            )
          }
        >
          Xuất hồ sơ
        </Button>
      </PageHead>
      <section className="profile-banner flex items-center gap-[23px] rounded-[13px] p-[30px] bg-[#ece7f4] border border-[#e4dbed] mb-[27px] max-md:flex-col max-md:items-start">
        <Avatar person={people[0]} size="large" />
        <div>
          <h2 className="text-[24px] font-[550] text-[#7d638e] mb-[5px]">
            Minh Anh
          </h2>
          <p className="text-[11px] text-[#a890b8] mb-[15px]">
            Product Researcher <span className="mx-[7px]">·</span> Thedeerly /
            EcomCreate
          </p>
          <div className="flex items-center gap-2">
            <Badge color="white">Đang phát triển chuyên môn</Badge>
            <span className="tiny text-[10px] text-[#b19cc0]">
              Hồ sơ nhân sự minh họa
            </span>
          </div>
        </div>
        <div className="profile-stats ml-auto text-right pr-2.5 max-md:ml-0 max-md:text-left">
          <strong className="text-[38px] tracking-[-1px] text-[#977cae] block font-medium leading-none">
            {state.skills.filter((s) => s.level >= s.target).length}
            <span className="text-[21px] text-[#b8a3c8]">
              {" "}
              / {state.skills.length}
            </span>
          </strong>
          <small className="text-[10px] text-[#b09bbb] block mt-1">
            Năng lực đạt mục tiêu
          </small>
        </div>
      </section>
      <Tabs
        items={[
          "Bản đồ năng lực",
          "Bằng chứng & sản phẩm",
          "Mục tiêu phát triển",
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Bản đồ năng lực" && (
        <>
          <div className="level-legend flex flex-wrap gap-[22px] m-[0_0_25px] text-[10px] text-[#a38faf]">
            {levels.slice(1).map((l, i) => (
              <span key={l} className="flex items-center gap-[7px]">
                <i className="not-italic w-5 h-5 rounded-[5px] bg-[#f0e9f6] text-[#b19ac1] flex items-center justify-center text-[10px] font-medium">
                  {i + 1}
                </i>
                {l}
              </span>
            ))}
          </div>
          <div className="skills-grid grid grid-cols-3 max-[1200px]:gap-[13px] max-md:grid-cols-1 gap-[19px]">
            {state.skills.map((s) => (
              <button
                className="skill-card block text-left bg-white border border-[var(--border,#e9eaf0)] rounded-xl p-[22px] max-[1200px]:p-[18px] transition-transform hover:-translate-y-[3px] hover:border-[#d6c3e4]"
                key={s.id}
                onClick={() => open(s.name, <SkillDetail id={s.id} />)}
              >
                <div className="between flex items-center justify-between text-[#b5a1c3]">
                  <span
                    className={`icon-tile ${s.color} w-[34px] h-[34px] rounded-[9px] flex items-center justify-center`}
                  >
                    <Icon name="Target" size={18} />
                  </span>
                  <Icon name="ArrowUpRight" size={18} />
                </div>
                <span className="category text-[10px] text-[#a28db4] font-medium block my-[17px] mb-[7px]">
                  {s.group}
                </span>
                <h3 className="text-[15px] text-[#896e9a] font-[550]">
                  {s.name}
                </h3>
                <div className="skill-levels flex gap-2 my-[22px] mb-[15px]">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={`h-[31px] flex-1 flex items-center justify-center rounded-[5px] text-[10px] bg-[#f2edf8] text-[#c9b8d5] relative ${s.level >= n ? "filled !bg-[#b9a1cf] !text-white" : ""} ${n === s.target ? "target-level after:content-[''] after:absolute after:-bottom-[5px] after:left-[40%] after:w-[20%] after:border-b-2 after:border-[#b495cb]" : ""}`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="between flex items-center justify-between">
                  <span className="small text-[10px] text-[#a68ab8]">
                    {levels[s.level]}
                  </span>
                  <span className="muted tiny text-[10px] text-[var(--muted,#9b91ab)]">
                    Mục tiêu: mức {s.target}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="callout sand p-[15px_17px] rounded-lg flex items-start gap-3 mt-6 border border-[#00000004] text-[11px]">
            <Icon name="Info" className="mt-0.5 shrink-0" />
            <p className="m-0 text-[11px] leading-[1.8]">
              Năng lực được xác nhận theo phạm vi và bằng chứng. Hoàn thành khóa
              học không tự cấp năng lực hoặc quyền điều hành.
            </p>
          </div>
        </>
      )}
      {tab === "Bằng chứng & sản phẩm" && (
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
          <SectionHead
            title="Những điều bạn đã làm được"
            description="Bài thực hành được duyệt sẽ xuất hiện tại đây."
          />
          {ev.map((e) => (
            <div
              className="evidence-row flex items-center gap-3.5 py-[18px] border-b border-[#eee6f5] last:border-0 text-[#9db293]"
              key={e.id}
            >
              <span className="icon-tile green w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0">
                <Icon name="ShieldCheck" size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <strong className="text-[12px] block text-[#90749f]">
                  {e.title}
                </strong>
                <small className="text-[10px] block mt-[7px] text-[#b29cbe]">
                  {e.reviewer} xác nhận · {e.date} · {e.scope}
                </small>
                <p className="text-[10px] m-0 mt-[7px] text-[#8ea785]">
                  {levels[e.level]}
                </p>
              </div>
              <Badge color="green">Đã xác nhận</Badge>
            </div>
          ))}
          {!ev.length && (
            <Empty
              title="Bắt đầu từ một sản phẩm thực hành"
              description="Nộp bài, nhận phản hồi và được giảng viên xác nhận để xây hồ sơ bằng chứng."
            >
              <Button onClick={() => go("assignments")}>
                Mở bài thực hành
              </Button>
            </Empty>
          )}
        </section>
      )}
      {tab === "Mục tiêu phát triển" && (
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
          <h2 className="text-[17px] font-semibold text-[#766184] mb-1">
            Ứng dụng AI vào nghiên cứu khách hàng
          </h2>
          <p className="muted text-[11px] text-[var(--muted,#9b91ab)] mb-5">
            Mục tiêu minh họa: tự thực hiện một nhiệm vụ nghiên cứu có kiểm
            chứng, trong phạm vi được giao.
          </p>
          {state.skills
            .filter((s) => s.level < s.target)
            .map((s) => (
              <button
                key={s.id}
                className="goal-row flex items-center gap-[13px] py-[19px] border-b border-[#eee6f5] w-full text-left text-[#b497ca] hover:bg-[#faf7fc] px-1 rounded transition-colors"
                onClick={() => open(s.name, <SkillDetail id={s.id} />)}
              >
                <Icon name="Target" size={18} />
                <div className="flex-1 min-w-0">
                  <strong className="text-[12px] block text-[#91759f]">
                    {s.name}
                  </strong>
                  <small className="text-[10px] block text-[#b59cc5] mt-1.5">
                    {levels[s.level]} → {levels[s.target]}
                  </small>
                </div>
                <Icon name="ChevronRight" size={16} />
              </button>
            ))}
          <Button icon="Compass" className="mt-5" onClick={() => go("paths")}>
            Xem lộ trình hỗ trợ
          </Button>
        </section>
      )}
    </>
  );
}

function AssignPath({ person }) {
  const { state, dispatch, notify, close } = useApp();
  const allPaths = [...paths, ...(state.customPaths || [])];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        const p = allPaths.find((p) => p.id === f.get("path"));
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
function PersonDetail({ person }) {
  const { state, open } = useApp();
  const work = state.assignments.filter((a) => a.person === person.id);
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
      {work.map((a) => (
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
        .filter((x) => x.person === person.id)
        .map((x) => (
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
        .filter((e) => e.person === person.id)
        .map((e) => (
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
      {!state.evidence.some((e) => e.person === person.id) && (
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
function AddMember() {
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
  const [q, setQ] = useState(""),
    [team, setTeam] = useState("Tất cả đơn vị");
  const members = [...people, ...(state.members || [])];
  const list = members.filter(
    (p) =>
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
            state.assignments.filter((a) => a.status === "submitted").length
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
            {["Tất cả đơn vị", ...new Set(members.map((p) => p.team))].map(
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
              {list.map((p) => {
                const assignments = state.assignments.filter(
                  (a) => a.person === p.id,
                );
                const done =
                  p.id === "me"
                    ? Math.round(
                        state.enrolled.reduce(
                          (n, id) => n + progress(state, id),
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
                          assignments.filter((a) => a.status === "approved")
                            .length
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

function ReviewForm({ id }) {
  const { state, dispatch, notify, close } = useApp();
  const a = state.assignments.find((a) => a.id === id);
  const p = people.find((p) => p.id === a.person) || people[0];
  const [scores, setScores] = useState(a.scores || [3, 3, 3]),
    [feedback, setFeedback] = useState(""),
    [decision, setDecision] = useState("approved"),
    [level, setLevel] = useState(2);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({
          type: "review",
          id,
          value: { scores, feedback, status: decision, level: Number(level) },
        });
        notify(
          decision === "approved"
            ? "Đã xác nhận kết quả và thêm bằng chứng năng lực."
            : "Đã gửi yêu cầu bổ sung để người học nộp lại.",
        );
        close();
      }}
    >
      <div className="between flex justify-between items-center mb-4">
        <div className="person-line flex items-center gap-[11px]">
          <Avatar person={p} />
          <div>
            <strong className="block text-[12px] text-[#8d6f9f] font-[550]">
              {p.name}
            </strong>
            <small className="block text-[10px] text-[#b09abd] mt-1">
              {p.job} · Lần nộp {a.attempt || 1}
            </small>
          </div>
        </div>
        <Badge color="blue">Chờ đánh giá</Badge>
      </div>
      <h3 className="text-[13px] font-[550] text-[#9372a5] mt-4 mb-1">
        Đề bài
      </h3>
      <p className="muted small text-[11px] text-[#b49cc4] mb-3 leading-[1.7]">
        {a.description}
      </p>
      <h3 className="text-[13px] font-[550] text-[#9372a5] mt-4 mb-2">
        Sản phẩm người học
      </h3>
      <div className="submission-box bg-[#f8f3fc] border border-[#ece0f5] rounded-[9px] p-[19px] whitespace-pre-wrap leading-[1.9] text-[12px] text-[#9b7fad] mb-[23px]">
        {a.body}
      </div>
      {a.file && (
        <p className="muted tiny text-[10px] text-[#b9a5c8] mb-3">
          Tệp: {a.file} · Demo chỉ lưu tên
        </p>
      )}
      <div className="between flex justify-between items-center mt-4 mb-2">
        <h3 className="text-[13px] font-[550] text-[#9372a5] m-0">
          Đánh giá theo tiêu chí
        </h3>
        <button
          type="button"
          className="text-btn flex items-center gap-1.5 text-[11px] text-[#9b87bc] hover:underline cursor-pointer"
          onClick={() =>
            setFeedback(
              "Gợi ý AI mô phỏng — cần người đánh giá kiểm tra: Bài đã mô tả cách thực hiện. Hãy đối chiếu nguồn của từng nhận định, làm rõ giới hạn dữ liệu và xác nhận đầu ra có thể dùng cho quyết định nào.",
            )
          }
        >
          <Icon name="Sparkles" size={15} />
          AI hỗ trợ review
        </button>
      </div>
      {rubric.map((r, i) => (
        <div
          className="rubric-score flex justify-between gap-[15px] items-center py-3 border-b border-[#efe6f5] text-[#a085af] text-[11px] max-sm:flex-wrap max-sm:gap-2"
          key={r}
        >
          <span className="text-[#887093]">{r}</span>
          <select
            aria-label={r}
            className="text-[10px] p-[6px_10px] border border-[#e3d7ec] rounded-md bg-white text-[#7d608d] max-sm:w-full"
            value={scores[i]}
            onChange={(e) =>
              setScores((s) =>
                s.map((x, j) => (i === j ? Number(e.target.value) : x)),
              )
            }
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} / 4 —{" "}
                {["Cần làm lại", "Cần bổ sung", "Đạt", "Vượt yêu cầu"][n - 1]}
              </option>
            ))}
          </select>
        </div>
      ))}
      <Field
        label="Phản hồi cho người học"
        hint="Nêu điều đã đạt, bằng chứng còn thiếu và bước tiếp theo."
      >
        <textarea
          required
          minLength={10}
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Nhận xét cụ thể dựa trên bài đã nộp…"
        />
      </Field>
      <div className="form-grid grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 my-3">
        <Field label="Kết quả">
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
          >
            <option value="approved">Đạt yêu cầu</option>
            <option value="revision">Cần bổ sung và nộp lại</option>
          </select>
        </Field>
        {decision === "approved" && (
          <Field label="Mức năng lực được chứng minh">
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              {levels.slice(1).map((l, i) => (
                <option key={l} value={i + 1}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <div className="callout sand p-[15px_17px] rounded-lg flex items-start gap-3 mt-4 border border-[#00000004] text-[11px]">
        <Icon name="ShieldCheck" className="mt-0.5 shrink-0" />
        <p className="m-0 text-[11px] leading-[1.8]">
          Người đánh giá chịu trách nhiệm xác nhận. Mức năng lực chỉ áp dụng
          trong phạm vi bài thực hành này.
        </p>
      </div>
      <div className="modal-actions flex justify-end items-center gap-2.5 mt-5 pt-4 border-t border-[#f0e8f7]">
        <Button type="button" kind="secondary" onClick={close}>
          Để sau
        </Button>
        <Button type="submit" icon="CheckCheck">
          Lưu đánh giá & gửi phản hồi
        </Button>
      </div>
    </form>
  );
}
export function Reviews() {
  const { state, open } = useApp();
  const [tab, setTab] = useState("submitted"),
    [q, setQ] = useState("");
  const list = state.assignments.filter(
    (a) =>
      (tab === "submitted"
        ? a.status === "submitted"
        : tab === "revision"
          ? a.status === "revision"
          : a.status === "approved") &&
      normalize(
        `${a.title} ${people.find((p) => p.id === a.person)?.name || ""}`,
      ).includes(normalize(q)),
  );
  return (
    <>
      <PageHead
        eyebrow="PHẢN HỒI ĐỂ CÙNG TỐT HƠN"
        title="Đánh giá bài tập"
        description="Mỗi phản hồi rõ ràng giúp người học tiến thêm một bước."
      />
      <div className="review-intro flex items-center gap-[19px] p-[25px] bg-[#f1eaf7] border border-[#eaddf2] rounded-[11px] mb-[25px] text-[#b093c1]">
        <Icon
          name="MessageCircle"
          size={32}
          className="shrink-0 text-[#9b7cad]"
        />
        <div>
          <h3 className="text-[15px] text-[#9471a7] font-[550] m-0 mb-1.5">
            {state.assignments.filter((a) => a.status === "submitted").length}{" "}
            bài thực hành đang chờ bạn
          </h3>
          <p className="text-[11px] text-[#817489] m-0 leading-[1.7]">
            Đánh giá sản phẩm, làm rõ bằng chứng và gợi ý bước phát triển tiếp
            theo.
          </p>
        </div>
      </div>
      <Tabs
        items={[
          {
            id: "submitted",
            label: "Chờ đánh giá",
            count: state.assignments.filter((a) => a.status === "submitted")
              .length,
          },
          { id: "revision", label: "Đã yêu cầu bổ sung" },
          { id: "approved", label: "Đã xác nhận" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="search-input review-search mb-[22px] max-w-[450px] flex gap-2.5 items-center border border-[var(--border,#e9eaf0)] rounded-lg bg-white px-[13px] text-[#afa5b8] focus-within:outline-2 focus-within:outline-[#cbb8e0]">
        <Icon name="Search" size={18} />
        <input
          aria-label="Tìm bài cần đánh giá"
          placeholder="Tìm người học hoặc bài tập…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border-0 bg-transparent py-3 w-full text-[11px] outline-none text-[#56515f]"
        />
      </div>
      <div className="review-list grid grid-cols-2 max-md:grid-cols-1 gap-5">
        {list.map((a) => {
          const p = people.find((p) => p.id === a.person) || people[0];
          return (
            <article
              className="review-card border border-[var(--border,#e9eaf0)] rounded-xl bg-white p-[23px] max-sm:p-5"
              key={a.id}
            >
              <div className="between flex justify-between items-center">
                <div className="person-line flex items-center gap-[11px]">
                  <Avatar person={p} />
                  <div>
                    <strong className="block text-[12px] text-[#8d6f9f] font-[550]">
                      {p.name}
                    </strong>
                    <small className="block text-[10px] text-[#817489] mt-1">
                      {p.team} · Lần nộp {a.attempt || 1}
                    </small>
                  </div>
                </div>
                <Badge color={statusColor[a.status]}>
                  {statusLabel[a.status]}
                </Badge>
              </div>
              <h3 className="text-[15px] text-[#9475a4] line-height-[1.7] my-[22px] mb-2.5 font-[550]">
                {a.title}
              </h3>
              <p className="muted small text-[11px] text-[#817489] line-clamp-2 overflow-hidden mb-[23px] min-h-[43px] leading-[1.8]">
                {a.body}
              </p>
              <div className="between flex justify-between items-center border-t border-[#f0e7f6] pt-[15px]">
                <span className="tiny muted text-[10px] text-[#9b91ab]">
                  {a.type} · {rubric.length} tiêu chí
                </span>
                <Button
                  kind={a.status === "submitted" ? "primary" : "secondary"}
                  onClick={() =>
                    open(
                      a.title,
                      a.status === "submitted" ? (
                        <ReviewForm id={a.id} />
                      ) : (
                        <div className="stack flex flex-col gap-3">
                          <h3 className="text-[14px] font-[550] text-[#9273a5] m-0">
                            Bài đã nộp
                          </h3>
                          <p className="text-[11px] text-[#817489] leading-[1.8] m-0">
                            {a.body}
                          </p>
                          <h3 className="text-[14px] font-[550] text-[#9273a5] m-0">
                            Phản hồi
                          </h3>
                          <p className="text-[11px] text-[#817489] leading-[1.8] m-0">
                            {a.feedback}
                          </p>
                          <Badge color={statusColor[a.status]}>
                            {statusLabel[a.status]}
                          </Badge>
                        </div>
                      ),
                      true,
                    )
                  }
                >
                  {a.status === "submitted" ? "Xem & đánh giá" : "Xem kết quả"}
                  <Icon name="ArrowRight" size={16} />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      {!list.length && (
        <Empty
          title="Hàng chờ đang trống"
          description="Bài nộp của người học sẽ xuất hiện tại đây để được phản hồi."
        />
      )}
    </>
  );
}

function CourseEditor({ id }: { id?: string }) {
  const { state, dispatch, close, notify } = useApp();
  const existing = state.courses.find((c) => c.id === id);
  const [title, setTitle] = useState(existing?.title || ""),
    [category, setCategory] = useState(existing?.category || "AI & Dữ liệu"),
    [description, setDescription] = useState(existing?.description || ""),
    [lessons, setLessons] = useState(existing?.lessons.join("\n") || ""),
    [exercise, setExercise] = useState(existing?.exercise || ""),
    [source, setSource] = useState(""),
    [generated, setGenerated] = useState(false);
  function generate() {
    setTitle((t) => t || "Thực hành giao việc và kiểm chứng kết quả với AI");
    setDescription(
      "Tạo đề bài rõ ràng, đánh giá nguồn và áp dụng AI vào một nhiệm vụ có phạm vi. Nội dung nháp được tạo theo kịch bản demo.",
    );
    setLessons(
      "Xác định mục tiêu và đầu ra\nViết brief có bối cảnh\nKiểm chứng sản phẩm do AI tạo\nỨng dụng và rút kinh nghiệm",
    );
    setExercise(
      "Chọn một nhiệm vụ thực tế. Viết brief, dùng AI để tạo bản nháp và ghi lại ít nhất ba điểm đã kiểm chứng trước khi sử dụng.",
    );
    setGenerated(true);
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const lines = lessons
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);
        if (!lines.length) {
          notify("Cần ít nhất một bài học.");
          return;
        }
        const f = new FormData(e.currentTarget);
        const cid = id || `course-${Date.now()}`;
        dispatch({
          type: "saveCourse",
          id: cid,
          value: {
            id: cid,
            title: title.trim(),
            description,
            category,
            lessons: lines,
            exercise,
            scope: f.get("scope"),
            level: f.get("level"),
            duration: f.get("duration"),
            teacher: "Ngọc Linh",
            color: existing?.color || "lavender",
            icon: existing?.icon || "Sparkles",
            label: "LEARN & PRACTICE",
            students: existing?.students || 0,
            skill: existing?.skill || "ai",
            status: existing?.status || "draft",
            source,
          },
        });
        notify("Đã lưu khóa học. Có thể phát hành từ danh sách quản lý.");
        close();
      }}
    >
      <div className="upload-zone border border-dashed border-[#cbb3dc] bg-[#fcf9ff] rounded-[10px] p-6 text-center flex items-center flex-col text-[#b291c8] mb-5">
        <Icon name="Upload" size={28} className="text-[#9b7fad]" />
        <strong className="block text-[14px] font-medium text-[#9c7bac] my-[13px] mb-1">
          Từ buổi đào tạo đến học liệu
        </strong>
        <p className="text-[11px] text-[#887093] my-1 mb-3">
          Chọn record hoặc tài liệu để mô phỏng quy trình biên tập.
        </p>
        <input
          aria-label="Chọn record mẫu"
          type="file"
          accept="video/*,.pdf,.ppt,.pptx,.txt"
          onChange={(e) => setSource(e.target.files?.[0]?.name || "")}
          className="text-[10px] border-0 bg-transparent max-w-full p-2.5 text-[#887093]"
        />
        {source && <Badge color="green">{source}</Badge>}
        <button
          type="button"
          className="btn secondary my-3 flex items-center gap-1.5"
          onClick={generate}
        >
          <Icon name="Sparkles" size={17} />
          Tạo học liệu mẫu bằng AI
        </button>
        {generated && (
          <small className="muted block mt-1.5 text-[9px] text-[#887093]">
            Đã điền tự động các trường từ record. Bạn có thể sửa trực tiếp.
          </small>
        )}
      </div>
      <Field label="Tên khóa học">
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>
      <Field label="Chủ đề">
        <select
          aria-label="Chủ đề khóa học"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Giới thiệu ngắn">
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Field>
      <div className="form-grid grid grid-cols-3 max-sm:grid-cols-1 gap-3.5 my-3">
        <Field label="Phạm vi">
          <select
            name="scope"
            defaultValue={existing?.scope || "Nội bộ toàn công ty"}
          >
            <option>Nội bộ toàn công ty</option>
            <option>Khối nghiệp vụ</option>
            <option>Theo lời mời</option>
          </select>
        </Field>
        <Field label="Cấp độ">
          <select name="level" defaultValue={existing?.level || "Cơ bản"}>
            <option>Cơ bản</option>
            <option>Ứng dụng</option>
            <option>Nâng cao</option>
          </select>
        </Field>
        <Field label="Thời lượng dự kiến">
          <input
            name="duration"
            defaultValue={existing?.duration || "2 giờ thực hành"}
          />
        </Field>
      </div>
      <Field label="Danh sách bài học (mỗi bài một dòng)">
        <textarea
          rows={5}
          value={lessons}
          onChange={(e) => setLessons(e.target.value)}
          placeholder="Bài 1: Tổng quan\nBài 2: Thực hành\n..."
        />
      </Field>
      <Field label="Đề bài thực hành">
        <textarea
          rows={3}
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Gợi ý bài thực hành giúp học viên áp dụng kiến thức vào thực tế công việc..."
        />
      </Field>
      <div className="modal-actions flex justify-end items-center gap-2.5 mt-5 pt-4 border-t border-[#f0e8f7]">
        <Button type="submit" icon="Sparkles">
          Lưu và hoàn tất
        </Button>
      </div>
    </form>
  );
}
function CreatePath() {
  const { state, dispatch, close, notify } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!selected.length) {
          notify("Chọn ít nhất một khóa học.");
          return;
        }
        const f = new FormData(e.currentTarget);
        dispatch({
          type: "addPath",
          value: {
            id: `path-${Date.now()}`,
            title: f.get("title"),
            description: f.get("description"),
            target: f.get("target"),
            courses: selected,
            weeks: `${f.get("weeks")} tuần`,
            color: "blue",
            icon: "Compass",
          },
        });
        notify("Đã tạo lộ trình mới.");
        close();
      }}
    >
      <Field label="Tên lộ trình">
        <input name="title" required minLength={5} />
      </Field>
      <Field label="Mô tả">
        <textarea name="description" required />
      </Field>
      <div className="form-grid grid grid-cols-2 max-sm:grid-cols-1 gap-3.5 my-3">
        <Field label="Năng lực / kết quả mục tiêu">
          <input name="target" required />
        </Field>
        <Field label="Số tuần dự kiến">
          <input
            name="weeks"
            type="number"
            min="1"
            max="52"
            defaultValue="4"
            required
          />
        </Field>
      </div>
      <h3 className="text-[14px] font-[550] text-[#9b77ad] mt-4 mb-2">
        Chọn khóa học theo thứ tự
      </h3>
      <div className="course-picker border border-[#eee5f5] rounded-[9px] max-h-[220px] overflow-y-auto p-2 bg-[#fcf9ff]">
        {state.courses
          .filter((c) => c.status === "published")
          .map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2.5 py-[13px] border-b border-[#eee5f5] text-[11px] text-[#aa8bbd]"
            >
              <input
                type="checkbox"
                className="accent-[#ac8dc5]"
                checked={selected.includes(c.id)}
                onChange={() =>
                  setSelected((s) =>
                    s.includes(c.id)
                      ? s.filter((id) => id !== c.id)
                      : [...s, c.id],
                  )
                }
              />
              <span>{c.title}</span>
              {selected.includes(c.id) && (
                <Badge className="ml-auto">{selected.indexOf(c.id) + 1}</Badge>
              )}
            </label>
          ))}
      </div>
      <div className="modal-actions flex justify-end items-center gap-2.5 mt-5 pt-4 border-t border-[#f0e8f7]">
        <Button type="submit" icon="Compass">
          Tạo lộ trình
        </Button>
      </div>
    </form>
  );
}
export function Studio() {
  const { state, dispatch, open, go, notify, close } = useApp();
  const [tab, setTab] = useState("Khóa học"),
    [q, setQ] = useState(""),
    [status, setStatus] = useState("all");
  const list = state.courses.filter(
    (c) =>
      normalize(c.title).includes(normalize(q)) &&
      (status === "all" || c.status === status),
  );
  return (
    <>
      <PageHead
        eyebrow="BIẾN TRI THỨC THÀNH TRẢI NGHIỆM HỌC"
        title="Quản lý đào tạo"
        description="Biên tập học liệu, xây lộ trình và tổ chức những buổi học có ý nghĩa."
      >
        <Button
          icon="Plus"
          onClick={() =>
            open(
              tab === "Lộ trình" ? "Tạo lộ trình" : "Tạo khóa học từ học liệu",
              tab === "Lộ trình" ? <CreatePath /> : <CourseEditor />,
              true,
            )
          }
        >
          {tab === "Lộ trình" ? "Tạo lộ trình" : "Tạo khóa học"}
        </Button>
      </PageHead>
      <div className="studio-banner flex items-center gap-[19px] p-[25px] bg-[#f1eaf7] border border-[#eaddf2] rounded-[11px] mb-[25px] text-[#b093c1]">
        <span className="icon-tile lavender w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="Sparkles" size={28} />
        </span>
        <div className="flex-1">
          <h3 className="text-[15px] text-[#9471a7] font-[550] m-0 mb-1.5">
            Một buổi chia sẻ. Nhiều cơ hội học tập.
          </h3>
          <p className="text-[11px] text-[#817489] m-0 leading-[1.7]">
            AI hỗ trợ chia chương, tóm tắt và soạn bài tập. Bạn giữ vai trò biên
            tập và duyệt.
          </p>
        </div>
        <Button
          kind="secondary"
          onClick={() => open("Biên tập từ record", <CourseEditor />, true)}
        >
          Thử với record
          <Icon name="ArrowUpRight" size={17} />
        </Button>
      </div>
      <Tabs items={["Khóa học", "Lộ trình"]} value={tab} onChange={setTab} />
      {tab === "Khóa học" ? (
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px]">
          <div className="filter-row flex gap-3 max-[900px]:gap-2 items-center mb-[19px]">
            <div className="search-input flex gap-2.5 items-center border border-[var(--border,#e9eaf0)] rounded-lg bg-white px-[13px] min-w-0 flex-1 text-[#afa5b8] focus-within:outline-2 focus-within:outline-[#cbb8e0]">
              <Icon name="Search" size={18} />
              <input
                aria-label="Tìm khóa học quản lý"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm trong nội dung của bạn…"
                className="border-0 bg-transparent py-3 w-full text-[11px] outline-none text-[#56515f]"
              />
            </div>
            <select
              aria-label="Trạng thái khóa học"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-[11px] p-[12px_30px_12px_12px] min-w-[160px] border border-[var(--border,#e9eaf0)] rounded-lg bg-white text-[#6c5980]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="published">Đã phát hành</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>
          <div className="table-scroll overflow-x-auto max-w-full">
            <table className="studio-table w-full text-left whitespace-nowrap border-collapse">
              <thead>
                <tr className="border-b border-[#efe7f5]">
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    KHÓA HỌC
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    PHẠM VI
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    TRẠNG THÁI
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#efe7f5] last:border-0 hover:bg-[#fcfaff]"
                  >
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <button
                        className="studio-course flex items-center gap-3 text-left p-0 whitespace-normal min-w-[260px] max-w-[400px] hover:opacity-80"
                        onClick={() => go(`course/${c.id}`)}
                      >
                        <span
                          className={`icon-tile ${c.color} w-[38px] h-[44px] rounded-[7px] flex items-center justify-center shrink-0`}
                        >
                          <Icon name={c.icon} />
                        </span>
                        <div>
                          <strong className="text-[11px] leading-[1.8] font-medium text-[#977ba7] block">
                            {c.title}
                          </strong>
                          <small className="text-[10px] text-[#817489] block mt-1">
                            {c.category} · {c.lessons.length} bài học
                          </small>
                        </div>
                      </button>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <span className="small text-[10px] text-[#6c5980]">
                        {c.scope}
                      </span>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <Badge color={statusColor[c.status]}>
                        {statusLabel[c.status]}
                      </Badge>
                    </td>
                    <td className="text-[11px] text-[#aa8eb8] p-[20px_14px]">
                      <div className="table-actions flex items-center gap-2">
                        <button
                          className="icon-btn p-1.5 rounded-md hover:bg-[#f3edf8] text-[#8f749e]"
                          aria-label={`Sửa ${c.title}`}
                          onClick={() =>
                            open(
                              "Biên tập khóa học",
                              <CourseEditor id={c.id} />,
                              true,
                            )
                          }
                        >
                          <Icon name="Pencil" size={17} />
                        </button>
                        <button
                          className="text-btn text-[10px] text-[#9b87bc] hover:underline"
                          onClick={() =>
                            open(
                              c.status === "published"
                                ? "Lưu trữ khóa học?"
                                : "Phát hành khóa học?",
                              <div className="stack flex flex-col gap-3">
                                <p>
                                  <strong>{c.title}</strong>
                                </p>
                                <p className="text-[11px] text-[#817489] leading-[1.8]">
                                  {c.status === "published"
                                    ? "Khóa sẽ được ẩn khỏi thư viện khám phá. Hồ sơ học tập đã có được giữ lại."
                                    : "Khóa sẽ xuất hiện trong thư viện demo. Xác nhận bạn đã rà soát nội dung và bài tập."}
                                </p>
                                <Button
                                  onClick={() => {
                                    dispatch({
                                      type: "publish",
                                      id: c.id,
                                      value:
                                        c.status === "published"
                                          ? "archived"
                                          : "published",
                                    });
                                    notify(
                                      c.status === "published"
                                        ? "Đã lưu trữ khóa học."
                                        : "Đã phát hành khóa học vào thư viện.",
                                    );
                                    close();
                                  }}
                                >
                                  {c.status === "published"
                                    ? "Lưu trữ"
                                    : "Xác nhận phát hành"}
                                </Button>
                              </div>,
                            )
                          }
                        >
                          {c.status === "published" ? "Lưu trữ" : "Phát hành"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!list.length && <Empty title="Chưa có nội dung phù hợp" />}
        </section>
      ) : (
        <div className="studio-paths grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-5">
          {[...paths, ...(state.customPaths || [])].map((p) => (
            <div
              className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[22px] flex flex-col justify-between"
              key={p.id}
            >
              <div>
                <span
                  className={`icon-tile ${p.color} w-10 h-10 rounded-lg flex items-center justify-center`}
                >
                  <Icon name={p.icon} />
                </span>
                <h3 className="text-[15px] font-[550] text-[#9b77ad] my-4 mb-2">
                  {p.title}
                </h3>
                <p className="muted small text-[11px] text-[#817489] leading-[1.8] min-h-[60px]">
                  {p.description}
                </p>
              </div>
              <div className="between flex justify-between items-center mt-4 pt-3 border-t border-[#f2e9f8]">
                <Badge color={p.color}>
                  {p.courses.length} khóa · {p.weeks}
                </Badge>
                <button
                  className="text-btn text-[11px] text-[#9b87bc] hover:underline flex items-center gap-1"
                  onClick={() =>
                    open("Giao lộ trình", <AssignPath person={people[0]} />)
                  }
                >
                  Giao học
                  <Icon name="ArrowRight" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function Reports() {
  const { state, go } = useApp();
  const [scope, setScope] = useState("Toàn MatureX");
  const members = [...people, ...(state.members || [])].filter(
    (p) => scope === "Toàn MatureX" || p.team === scope,
  );
  const ids = members.map((p) => p.id);
  const assignments = state.assignments.filter((a) => ids.includes(a.person));
  const approved = assignments.filter((a) => a.status === "approved").length,
    submitted = assignments.filter((a) => a.status !== "todo").length;
  const evidence = state.evidence.filter((e) => ids.includes(e.person));
  const exportReport = () =>
    download(
      "bao-cao-dao-tao-demo.csv",
      "\uFEFF" +
        [
          [
            "Phạm vi",
            "Số thành viên",
            "Bài đã nộp",
            "Bài đạt",
            "Bằng chứng mới",
          ],
          [scope, members.length, submitted, approved, evidence.length],
        ]
          .map((r) =>
            r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","),
          )
          .join("\r\n"),
      "text/csv;charset=utf-8",
    );
  return (
    <>
      <PageHead
        eyebrow="NHÌN VÀO SỰ THAY ĐỔI"
        title="Báo cáo & hiệu quả"
        description="Theo dõi từ việc tham gia đến thực hành và bằng chứng áp dụng."
      >
        <select
          aria-label="Phạm vi báo cáo"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="text-[11px] p-[10px_30px_10px_12px] border border-[var(--border,#e9eaf0)] rounded-lg bg-white text-[#6c5980]"
        >
          {[
            "Toàn MatureX",
            "Thedeerly",
            "EcomCreate",
            "Microm",
            "Timond.de",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Button kind="secondary" icon="Download" onClick={exportReport}>
          Xuất báo cáo
        </Button>
      </PageHead>
      <div className="stats-grid grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4 mb-6">
        <Stat
          icon="Users"
          value={members.length}
          label="Nhân sự trong phạm vi"
        />
        <Stat
          icon="FileText"
          color="blue"
          value={submitted}
          label="Bài đã nộp"
        />
        <Stat
          icon="CheckCircle2"
          color="green"
          value={approved}
          label="Bài đạt yêu cầu"
        />
        <Stat
          icon="ShieldCheck"
          color="peach"
          value={evidence.length}
          label="Bằng chứng mới"
        />
      </div>
      <div className="reports-grid grid grid-cols-2 max-md:grid-cols-1 gap-[23px] mb-6">
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-sm:p-5">
          <SectionHead
            title="Từ học tập đến ứng dụng"
            description="Số bài thực hành theo trạng thái trong demo."
          />
          <div className="report-bars">
            {[
              ["Được giao", assignments.length, "lavender"],
              ["Đã nộp", submitted, "blue"],
              ["Đạt yêu cầu", approved, "green"],
              ["Bằng chứng mới", evidence.length, "peach"],
            ].map(([label, n, color]) => (
              <div key={label} className="my-[22px]">
                <div className="between flex justify-between items-center text-[11px] text-[#ac8eba] mb-2.5">
                  <span>{label}</span>
                  <strong className="text-[#887093] font-medium">{n}</strong>
                </div>
                <div
                  className={`report-bar ${color} h-[11px] bg-[#f7f2fb] rounded-[4px] overflow-hidden`}
                >
                  <span
                    className="block h-full bg-current opacity-50 rounded-[4px] transition-all duration-300"
                    style={{
                      width:
                        Math.max(0, (n / (assignments.length || 1)) * 100) +
                        "%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="muted tiny text-[10px] text-[#b9a5c8] mt-[25px] leading-[1.9]">
            “Bằng chứng mới” tính từ đánh giá được thực hiện trong demo. Bài đạt
            trong dữ liệu khởi tạo có thể chưa có hồ sơ bằng chứng mới.
          </p>
        </section>
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-sm:p-5">
          <SectionHead
            title="Nơi cần hỗ trợ"
            description="Những hành động có thể thực hiện ngay."
          />
          <div className="insight flex items-start gap-[13px] py-[21px] border-b border-[#eee3f7]">
            <span className="icon-tile peach w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
              <Icon name="MessageCircle" />
            </span>
            <div>
              <h3 className="text-[13px] text-[#a280b3] font-[550] m-0 mb-1">
                {assignments.filter((a) => a.status === "submitted").length} bài
                chờ phản hồi
              </h3>
              <p className="text-[11px] text-[#b99bc9] m-0 mb-3 leading-[1.7]">
                Phản hồi kịp thời giúp người học sửa và áp dụng ngay.
              </p>
              <button
                className="text-btn text-[11px] text-[#9b87bc] hover:underline flex items-center gap-1"
                onClick={() => go("reviews")}
              >
                Mở hàng chờ
                <Icon name="ArrowRight" size={16} />
              </button>
            </div>
          </div>
          <div className="insight flex items-start gap-[13px] py-[21px] border-0">
            <span className="icon-tile lavender w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
              <Icon name="Compass" />
            </span>
            <div>
              <h3 className="text-[13px] text-[#a280b3] font-[550] m-0 mb-1">
                {
                  state.pathAssignments.filter((p) => ids.includes(p.person))
                    .length
                }{" "}
                lộ trình được giao mới
              </h3>
              <p className="text-[11px] text-[#b99bc9] m-0 mb-3 leading-[1.7]">
                Làm rõ mục tiêu và dành thời gian hướng dẫn trong công việc.
              </p>
              <button
                className="text-btn text-[11px] text-[#9b87bc] hover:underline flex items-center gap-1"
                onClick={() => go("team")}
              >
                Xem đội ngũ
                <Icon name="ArrowRight" size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
      <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-sm:p-5">
        <SectionHead
          title="Hiệu quả cần kiểm chứng khi vận hành thật"
          description="Ba phép đo cần có dữ liệu đầu vào, đánh giá sau học và bối cảnh công việc."
        />
        <div className="impact-grid grid grid-cols-3 max-md:grid-cols-1 gap-[22px] max-sm:gap-3 mt-[25px]">
          {[
            [
              "Chất lượng đầu ra",
              "So sánh sản phẩm trước và sau học theo cùng tiêu chí.",
            ],
            [
              "Khả năng tự thực hiện",
              "Theo dõi nhiệm vụ đạt chuẩn và mức hỗ trợ cần thiết.",
            ],
            [
              "Thời gian hướng dẫn",
              "Đo công sức review, sửa lỗi và hỗ trợ của mentor.",
            ],
          ].map(([t, d]) => (
            <div
              key={t}
              className="p-[18px] bg-[#fbf8fd] border border-[#f0e7f7] rounded-lg"
            >
              <Badge color="gray">Chưa có dữ liệu thật</Badge>
              <h3 className="text-[13px] my-[15px] mb-2 text-[#887093] font-medium">
                {t}
              </h3>
              <p className="text-[10px] m-0 text-[#817489] leading-[1.8]">
                {d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function NewPost() {
  const { dispatch, close, notify } = useApp();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        dispatch({
          type: "post",
          value: {
            id: `post${Date.now()}`,
            person: "me",
            title: f.get("title"),
            body: f.get("body"),
            topic: f.get("topic"),
            likes: 0,
            liked: false,
            replies: [],
          },
        });
        notify("Đã đăng chia sẻ trong cộng đồng demo.");
        close();
      }}
    >
      <Field label="Tiêu đề">
        <input name="title" required minLength={5} />
      </Field>
      <Field label="Chủ đề">
        <select name="topic">
          {categories.slice(1).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Điều bạn muốn chia sẻ">
        <textarea name="body" required minLength={10} rows={6} />
      </Field>
      <div className="modal-actions flex justify-end items-center gap-2.5 mt-5 pt-4 border-t border-[#f0e8f7]">
        <Button type="submit" icon="Send">
          Đăng chia sẻ
        </Button>
      </div>
    </form>
  );
}
function PostDetail({ id }) {
  const { state, dispatch } = useApp();
  const p = state.posts.find((p) => p.id === id);
  const [reply, setReply] = useState("");
  return (
    <div className="stack flex flex-col gap-4">
      <Badge>{p.topic}</Badge>
      <p className="text-[12px] leading-[2] text-[#817489] whitespace-pre-wrap">
        {p.body}
      </p>
      <h3 className="text-[14px] font-[550] text-[#9272a6] mt-2 mb-1">
        Trao đổi ({p.replies.length})
      </h3>
      {p.replies.map((r, i) => (
        <div
          className="reply p-[15px] bg-[#f8f2fd] rounded-lg text-[11px] text-[#887093]"
          key={i}
        >
          <strong className="block font-medium text-[#887093] mb-1">
            {r.name}
          </strong>
          <p className="m-0 text-[11px] leading-[1.8] text-[#817489]">
            {r.body}
          </p>
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          dispatch({
            type: "reply",
            id,
            value: { name: "Minh Anh", body: reply.trim() },
          });
          setReply("");
        }}
        className="mt-2"
      >
        <Field label="Phản hồi của bạn">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            required
            rows={3}
          />
        </Field>
        <div className="mt-3">
          <Button type="submit" icon="Send">
            Gửi phản hồi
          </Button>
        </div>
      </form>
    </div>
  );
}
export function Community() {
  const { state, dispatch, open } = useApp();
  const [topic, setTopic] = useState("Tất cả");
  const posts = state.posts.filter(
    (p) => topic === "Tất cả" || p.topic === topic,
  );
  return (
    <>
      <PageHead
        eyebrow="TRI THỨC LỚN LÊN KHI ĐƯỢC CHIA SẺ"
        title="Cộng đồng học tập"
        description="Một góc nhìn mới, một bài học nhỏ, một cuộc trò chuyện có ý nghĩa."
      >
        <Button
          icon="Plus"
          onClick={() => open("Chia sẻ một điều đã học", <NewPost />)}
        >
          Viết chia sẻ
        </Button>
      </PageHead>
      <div className="community-layout grid grid-cols-[minmax(0,1fr)_270px] max-lg:grid-cols-[minmax(0,1fr)_240px] max-md:grid-cols-1 gap-[25px]">
        <div>
          <div className="chips flex flex-wrap gap-2 mb-5">
            {["Tất cả", "AI & Dữ liệu", "Văn hoá MatureX", "Chuyên môn"].map(
              (t) => (
                <button
                  className={`px-3 py-1.5 rounded-full text-[11px] border border-[#e6ddf0] cursor-pointer transition-colors ${
                    topic === t
                      ? "selected bg-[#9a76ae] text-white border-[#9a76ae]"
                      : "bg-white text-[#7d608d] hover:bg-[#faf6fd]"
                  }`}
                  key={t}
                  onClick={() => setTopic(t)}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          {posts.map((post) => {
            const p = people.find((p) => p.id === post.person) || people[0];
            return (
              <article
                className="panel post-card bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-sm:p-5 mb-5"
                key={post.id}
              >
                <div className="between flex justify-between items-center">
                  <div className="person-line flex items-center gap-[11px]">
                    <Avatar person={p} />
                    <div>
                      <strong className="block text-[12px] text-[#8d6f9f] font-[550]">
                        {p.name}
                      </strong>
                      <small className="block text-[10px] text-[#817489] mt-1">
                        {p.job} · Chia sẻ trong demo
                      </small>
                    </div>
                  </div>
                  <Badge color={p.color}>{post.topic}</Badge>
                </div>
                <h2 className="text-[20px] max-sm:text-[18px] text-[#9272a6] my-6 mb-3.5 font-medium leading-[1.6]">
                  {post.title}
                </h2>
                <p className="text-[12px] max-sm:text-[11px] leading-[2] text-[#817489] whitespace-pre-wrap break-words">
                  {post.body}
                </p>
                <div className="post-actions border-t border-[#eee4f6] pt-[18px] mt-[22px] flex items-center gap-5">
                  <button
                    className={`text-[10px] flex items-center gap-1.5 p-0 cursor-pointer ${
                      post.liked
                        ? "liked text-[#a16fbf] font-medium"
                        : "text-[#b497c5] hover:text-[#9272a6]"
                    }`}
                    onClick={() => dispatch({ type: "like", id: post.id })}
                  >
                    <Icon name="ThumbsUp" size={17} />
                    {post.likes} hữu ích
                  </button>
                  <button
                    className="text-[10px] flex items-center gap-1.5 p-0 text-[#b497c5] hover:text-[#9272a6] cursor-pointer"
                    onClick={() =>
                      open(post.title, <PostDetail id={post.id} />)
                    }
                  >
                    <Icon name="MessageCircle" size={17} />
                    {post.replies.length} phản hồi
                  </button>
                  <button
                    className="text-btn text-[10px] text-[#9b87bc] hover:underline flex items-center gap-1 cursor-pointer"
                    onClick={() =>
                      open(post.title, <PostDetail id={post.id} />)
                    }
                  >
                    Tham gia trao đổi
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </article>
            );
          })}
          {!posts.length && (
            <Empty title="Chưa có chia sẻ trong chủ đề này">
              <Button
                onClick={() => open("Chia sẻ một điều đã học", <NewPost />)}
              >
                Bắt đầu cuộc trò chuyện
              </Button>
            </Empty>
          )}
        </div>
        <aside className="max-md:hidden">
          <div className="panel community-note bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-5">
            <span className="icon-tile green w-10 h-10 rounded-lg flex items-center justify-center">
              <Icon name="Sprout" size={26} />
            </span>
            <h3 className="text-[14px] font-[550] mt-4 mb-2 text-[#665276]">
              Một không gian để cùng học
            </h3>
            <p className="text-[11px] text-[#817489] leading-[1.8] m-0 mb-4">
              Chia sẻ trải nghiệm cụ thể. Tôn trọng góc nhìn khác. Đặt câu hỏi
              để hiểu thêm.
            </p>
            <hr className="border-0 border-t border-[#f0e7f7] my-4" />
            <strong className="block text-[11px] text-[#a787b6] mb-1 font-medium">
              Gợi ý cho hôm nay
            </strong>
            <p className="text-[11px] text-[#817489] leading-[1.8] m-0">
              Điều gì bạn vừa áp dụng vào công việc? Kết quả thực tế đã dạy bạn
              điều gì?
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export function SettingsPage() {
  const { state, dispatch, open, close, notify, role } = useApp();
  return (
    <>
      <PageHead
        eyebrow="KHÔNG GIAN THEO CÁCH CỦA BẠN"
        title="Cài đặt"
        description="Quản lý trải nghiệm học tập và dữ liệu demo."
      />
      <div className="settings-layout grid grid-cols-[minmax(0,1fr)_320px] max-lg:grid-cols-[minmax(0,1fr)_270px] max-md:grid-cols-1 gap-[23px]">
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-sm:p-5">
          <h2 className="text-[18px] font-medium text-[#665276] m-0 mb-1">
            Thông báo học tập
          </h2>
          <p className="muted small text-[11px] text-[#b9a5c8] m-0 mb-4">
            Các lựa chọn được lưu trong trình duyệt. Demo chưa gửi thông báo ra
            ngoài.
          </p>
          {[
            [
              "weekly",
              "Tổng hợp mỗi tuần",
              "Nhìn lại những điều đã học và bước tiếp theo.",
            ],
            [
              "assignment",
              "Bài tập & phản hồi",
              "Nhắc khi có bài thực hành hoặc phản hồi mới.",
            ],
            [
              "reminder",
              "Nhắc lịch đào tạo",
              "Gợi nhắc những buổi học đã đăng ký.",
            ],
          ].map(([id, title, description]) => (
            <div
              className="setting-row flex justify-between items-center gap-5 py-5 border-b border-[#eee4f5]"
              key={id}
            >
              <div>
                <strong className="block text-[12px] font-medium text-[#665276]">
                  {title}
                </strong>
                <p className="text-[10px] text-[#817489] m-0 mt-1.5">
                  {description}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={state.settings[id]}
                aria-label={title}
                className={`switch w-[37px] h-[22px] rounded-[13px] bg-[#e8ddf1] relative p-[3px] shrink-0 cursor-pointer transition-colors ${
                  state.settings[id] ? "on bg-[#b69ace]" : ""
                }`}
                onClick={() =>
                  dispatch({
                    type: "settings",
                    value: { [id]: !state.settings[id] },
                  })
                }
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white block shadow-[0_1px_4px_#70578415] transition-transform ${
                    state.settings[id] ? "translate-x-[15px]" : ""
                  }`}
                />
              </button>
            </div>
          ))}
          <h2 className="space-top text-[18px] font-medium text-[#665276] mt-6 mb-1">
            Dữ liệu cá nhân
          </h2>
          <div className="setting-row flex justify-between items-center gap-5 py-5 border-b border-[#eee4f5]">
            <div>
              <strong className="block text-[12px] font-medium text-[#665276]">
                Ghi chú cá nhân
              </strong>
              <p className="text-[10px] text-[#817489] m-0 mt-1.5">
                Chỉ hiển thị trong không gian người học trên demo.
              </p>
            </div>
            <Badge color="green">Riêng tư trong giao diện</Badge>
          </div>
          <p className="muted tiny text-[10px] text-[#b9a5c8] mt-4 leading-[1.8]">
            Chuyển vai là mô phỏng giao diện, không phải cơ chế bảo mật. Người
            có quyền sử dụng trình duyệt này có thể đọc dữ liệu localStorage.
          </p>
        </section>
        <aside className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-sm:p-5 flex flex-col gap-2">
          <h3 className="text-[14px] font-[550] text-[#9b77ad] m-0">
            Về bản demo
          </h3>
          <p className="muted text-[11px] text-[#817489] m-0 mb-3">
            MX LMS · Phiên bản trải nghiệm 0.1
          </p>
          <div className="settings-info flex justify-between gap-3 text-[10px] text-[#817489] py-3.5 border-b border-[#f1e6f8]">
            <span>Ngôn ngữ</span>
            <strong className="text-[#887093] font-medium">Tiếng Việt</strong>
          </div>
          <div className="settings-info flex justify-between gap-3 text-[10px] text-[#817489] py-3.5 border-b border-[#f1e6f8]">
            <span>Lưu trữ</span>
            <strong className="text-[#887093] font-medium">
              Trình duyệt hiện tại
            </strong>
          </div>
          <div className="settings-info flex justify-between gap-3 text-[10px] text-[#817489] py-3.5 border-b border-[#f1e6f8]">
            <span>AI & record</span>
            <strong className="text-[#887093] font-medium">Mô phỏng</strong>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <Button
              kind="secondary"
              icon="Download"
              onClick={() =>
                download(
                  "maturex-demo-data.json",
                  JSON.stringify(state, null, 2),
                  "application/json",
                )
              }
            >
              Xuất dữ liệu demo
            </Button>
            <Button
              kind="danger"
              icon="RotateCcw"
              onClick={() =>
                open(
                  "Đặt lại dữ liệu demo?",
                  <div className="stack flex flex-col gap-3">
                    <p className="text-[11px] text-[#817489] leading-[1.8] m-0">
                      Tất cả bài đã nộp, đánh giá, ghi chú, khóa học và thiết
                      lập bạn thử trong demo sẽ được thay bằng dữ liệu mẫu ban
                      đầu.
                    </p>
                    <p className="text-[11px] text-[#817489] leading-[1.8] m-0">
                      Bạn có thể xuất dữ liệu trước khi đặt lại.
                    </p>
                    <div className="modal-actions flex justify-end items-center gap-2.5 mt-3 pt-3 border-t border-[#f0e8f7]">
                      <Button kind="secondary" onClick={close}>
                        Giữ dữ liệu
                      </Button>
                      <Button
                        kind="danger"
                        onClick={() => {
                          dispatch({ type: "reset" });
                          close();
                          notify("Đã khôi phục dữ liệu mẫu ban đầu.");
                        }}
                      >
                        Đặt lại demo
                      </Button>
                    </div>
                  </div>,
                )
              }
            >
              Đặt lại dữ liệu
            </Button>
          </div>
        </aside>
      </div>
      {role !== "learner" && (
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-sm:p-5 mt-6">
          <SectionHead
            title="Phân quyền dự kiến"
            description="Ma trận trải nghiệm để duyệt; chưa có xác thực hoặc phân quyền máy chủ."
          />
          <div className="table-scroll overflow-x-auto max-w-full">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead>
                <tr className="border-b border-[#efe7f5]">
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    KHẢ NĂNG
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    NGƯỜI HỌC
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    GIẢNG VIÊN
                  </th>
                  <th className="text-[10px] text-[#bca9c8] font-medium tracking-[0.8px] bg-[#faf7fc] p-3.5">
                    QUẢN LÝ
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Học, hỏi AI, nộp bài", "Cá nhân", "Cá nhân", "Cá nhân"],
                  [
                    "Biên tập & phát hành học liệu",
                    "—",
                    "Theo phân công",
                    "Theo phân công",
                  ],
                  ["Đánh giá bài tập", "—", "Theo phân công", "Theo nhóm"],
                  [
                    "Giao lộ trình & báo cáo",
                    "—",
                    "Theo phân công",
                    "Theo nhóm",
                  ],
                  ["Ghi chú & phản tư riêng", "Cá nhân", "Cá nhân", "Cá nhân"],
                ].map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b border-[#efe7f5] last:border-0 hover:bg-[#fcfaff]"
                  >
                    {row.map((v, i) => (
                      <td
                        key={i}
                        className="text-[11px] text-[#aa8eb8] p-[16px_14px]"
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
