import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  download,
  Empty,
  Icon,
  PageHead,
  SectionHead,
  Tabs,
  useApp,
} from "@/components/ui";
import { levels, people } from "../../portal-data";

export function SkillDetail({ id }: { id: string }) {
  const { state, go, close } = useApp();
  const skill = state.skills.find((s: any) => s.id === id);
  if (!skill) return null;
  const evidence = state.evidence.filter(
    (e: any) => e.skill === id && e.person === "me",
  );
  const related = state.courses.filter(
    (c: any) => c.skill === id && c.status === "published",
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
        evidence.map((e: any) => (
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
      {related.map((c: any) => (
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
  const ev = state.evidence.filter((e: any) => e.person === "me");

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
                    (s: any) =>
                      `${s.name}: ${levels[s.level]} / Mục tiêu: ${levels[s.target]}`,
                  )
                  .join("\n") +
                "\n\nBẰNG CHỨNG\n" +
                ev
                  .map((e: any) => `${e.title} · ${e.reviewer} · ${e.scope}`)
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
            {state.skills.filter((s: any) => s.level >= s.target).length}
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
            {state.skills.map((s: any) => (
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
          {ev.map((e: any) => (
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
            .filter((s: any) => s.level < s.target)
            .map((s: any) => (
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
