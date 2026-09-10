import { useState } from "react";
import {
  categories,
  levels,
  normalize,
  paths,
  people,
  rubric,
} from "./data.js";
import { progress } from "./store.js";
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
} from "./ui.jsx";

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
    <div className="stack">
      <div className={`skill-detail-top ${skill.color}`}>
        <span className="eyebrow">{skill.group}</span>
        <h2>{skill.name}</h2>
        <p>
          {levels[skill.level]} → Mục tiêu: {levels[skill.target]}
        </p>
      </div>
      <h3>Các mức năng lực</h3>
      {levels.slice(1).map((l, i) => (
        <div className="level-description" key={l}>
          <span className={skill.level >= i + 1 ? "filled" : ""}>{i + 1}</span>
          <div>
            <strong>{l}</strong>
            <small>
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
      <h3>Bằng chứng được xác nhận</h3>
      {evidence.length ? (
        evidence.map((e) => (
          <div className="evidence-row" key={e.id}>
            <Icon name="ShieldCheck" size={23} />
            <div>
              <strong>{e.title}</strong>
              <small>
                {e.reviewer} · {e.date} · {e.scope}
              </small>
              <span>Mức xác nhận: {levels[e.level]}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="muted small">
          Mức hiện tại là dữ liệu mẫu ban đầu. Chưa có bằng chứng mới được duyệt
          trong phiên demo. Nộp và duyệt một bài thực hành để trải nghiệm.
        </p>
      )}
      <h3>Học để phát triển tiếp</h3>
      {related.map((c) => (
        <button
          className="resource-row clickable"
          key={c.id}
          onClick={() => {
            go(`course/${c.id}`);
            close();
          }}
        >
          <span className={`icon-tile ${c.color}`}>
            <Icon name={c.icon} />
          </span>
          <strong>{c.title}</strong>
          <Icon name="ArrowRight" size={17} />
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
      <section className="profile-banner">
        <Avatar person={people[0]} size="large" />
        <div>
          <h2>Minh Anh</h2>
          <p>
            Product Researcher <span>·</span> Thedeerly / EcomCreate
          </p>
          <div className="flex">
            <Badge color="white">Đang phát triển chuyên môn</Badge>
            <span className="tiny">Hồ sơ nhân sự minh họa</span>
          </div>
        </div>
        <div className="profile-stats">
          <strong>
            {state.skills.filter((s) => s.level >= s.target).length}
            <span> / {state.skills.length}</span>
          </strong>
          <small>Năng lực đạt mục tiêu</small>
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
          <div className="level-legend">
            {levels.slice(1).map((l, i) => (
              <span key={l}>
                <i>{i + 1}</i>
                {l}
              </span>
            ))}
          </div>
          <div className="skills-grid">
            {state.skills.map((s) => (
              <button
                className="skill-card"
                key={s.id}
                onClick={() => open(s.name, <SkillDetail id={s.id} />)}
              >
                <div className="between">
                  <span className={`icon-tile ${s.color}`}>
                    <Icon name="Target" />
                  </span>
                  <Icon name="ArrowUpRight" size={18} />
                </div>
                <span className="category">{s.group}</span>
                <h3>{s.name}</h3>
                <div className="skill-levels">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={`${s.level >= n ? "filled" : ""} ${n === s.target ? "target-level" : ""}`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="between">
                  <span className="small">{levels[s.level]}</span>
                  <span className="muted tiny">Mục tiêu: mức {s.target}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="callout sand">
            <Icon name="Info" />
            <p>
              Năng lực được xác nhận theo phạm vi và bằng chứng. Hoàn thành khóa
              học không tự cấp năng lực hoặc quyền điều hành.
            </p>
          </div>
        </>
      )}
      {tab === "Bằng chứng & sản phẩm" && (
        <section className="panel">
          <SectionHead
            title="Những điều bạn đã làm được"
            description="Bài thực hành được duyệt sẽ xuất hiện tại đây."
          />
          {ev.map((e) => (
            <div className="evidence-row" key={e.id}>
              <span className="icon-tile green">
                <Icon name="ShieldCheck" />
              </span>
              <div>
                <strong>{e.title}</strong>
                <small>
                  {e.reviewer} xác nhận · {e.date} · {e.scope}
                </small>
                <p>{levels[e.level]}</p>
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
        <section className="panel">
          <h2>Ứng dụng AI vào nghiên cứu khách hàng</h2>
          <p className="muted">
            Mục tiêu minh họa: tự thực hiện một nhiệm vụ nghiên cứu có kiểm
            chứng, trong phạm vi được giao.
          </p>
          {state.skills
            .filter((s) => s.level < s.target)
            .map((s) => (
              <button
                key={s.id}
                className="goal-row"
                onClick={() => open(s.name, <SkillDetail id={s.id} />)}
              >
                <Icon name="Target" />
                <div>
                  <strong>{s.name}</strong>
                  <small>
                    {levels[s.level]} → {levels[s.target]}
                  </small>
                </div>
                <Icon name="ChevronRight" />
              </button>
            ))}
          <Button icon="Compass" onClick={() => go("paths")}>
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
      <div className="person-line">
        <Avatar person={person} />
        <div>
          <strong>{person.name}</strong>
          <small>
            {person.job} · {person.team}
          </small>
        </div>
      </div>
      <Field label="Lộ trình phát triển">
        <select name="path">
          {allPaths.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ngày mục tiêu">
        <input type="date" name="due" required defaultValue="2026-10-09" />
      </Field>
      <Field label="Lý do & kết quả mong muốn">
        <textarea
          name="reason"
          required
          minLength={10}
          rows={3}
          defaultValue="Áp dụng nội dung đã học vào một nhiệm vụ thực tế và nhận phản hồi từ mentor."
        />
      </Field>
      <div className="callout blue">
        <Icon name="Info" />
        <p>
          Giao lộ trình được lưu trong demo. Chưa gửi email hoặc thông báo bên
          ngoài.
        </p>
      </div>
      <div className="modal-actions">
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
    <div className="stack">
      <div className="person-line">
        <Avatar person={person} size="large" />
        <div>
          <h2>{person.name}</h2>
          <p>
            {person.job} · {person.team}
          </p>
        </div>
      </div>
      <h3>Học tập & thực hành</h3>
      {work.map((a) => (
        <div className="resource-row" key={a.id}>
          <Icon name="FileText" />
          <div>
            <strong>{a.title}</strong>
            <small>Hạn {a.due}</small>
          </div>
          <Badge color={statusColor[a.status]}>{statusLabel[a.status]}</Badge>
        </div>
      ))}
      {!work.length && (
        <p className="muted">Chưa có bài thực hành trong dữ liệu demo.</p>
      )}
      <h3>Lộ trình đã giao</h3>
      {state.pathAssignments
        .filter((x) => x.person === person.id)
        .map((x) => (
          <div className="callout lavender" key={x.id}>
            <Icon name="Compass" />
            <div>
              <strong>{x.title}</strong>
              <p>
                Hạn {x.due} · {x.reason}
              </p>
            </div>
          </div>
        ))}
      <h3>Bằng chứng mới</h3>
      {state.evidence
        .filter((e) => e.person === person.id)
        .map((e) => (
          <div className="evidence-row" key={e.id}>
            <Icon name="ShieldCheck" />
            <div>
              <strong>{e.title}</strong>
              <small>
                {levels[e.level]} · {e.reviewer}
              </small>
            </div>
          </div>
        ))}
      {!state.evidence.some((e) => e.person === person.id) && (
        <p className="muted">
          Chưa có bằng chứng mới được xác nhận trong demo.
        </p>
      )}
      <Button
        icon="Plus"
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
        const f = new FormData(e.target);
        const name = f.get("name").trim();
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
      <p className="muted small">
        Chỉ tạo hồ sơ minh họa trong trình duyệt, không tạo tài khoản hoặc gửi
        lời mời.
      </p>
      <Field label="Họ tên">
        <input name="name" required minLength={2} />
      </Field>
      <Field label="Vai trò chuyên môn">
        <input name="job" required />
      </Field>
      <Field label="Đơn vị / dự án">
        <select name="team">
          {["MatureX", "Thedeerly", "EcomCreate", "Microm", "Timond.de"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
      </Field>
      <div className="modal-actions">
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
      <div className="stats-grid three-stats">
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
      <section className="panel">
        <div className="filter-row">
          <div className="search-input">
            <Icon name="Search" size={18} />
            <input
              aria-label="Tìm thành viên"
              placeholder="Tìm theo tên, vai trò…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            aria-label="Lọc đơn vị"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          >
            {["Tất cả đơn vị", ...new Set(members.map((p) => p.team))].map(
              (v) => (
                <option key={v}>{v}</option>
              ),
            )}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>THÀNH VIÊN</th>
                <th>ĐƠN VỊ / DỰ ÁN</th>
                <th>HỌC TẬP</th>
                <th>THỰC HÀNH</th>
                <th />
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
                  <tr key={p.id}>
                    <td>
                      <button
                        className="person-line"
                        onClick={() =>
                          open(`Hồ sơ ${p.name}`, <PersonDetail person={p} />)
                        }
                      >
                        <Avatar person={p} />
                        <div>
                          <strong>{p.name}</strong>
                          <small>{p.job}</small>
                        </div>
                      </button>
                    </td>
                    <td>
                      <Badge color="gray">{p.team}</Badge>
                    </td>
                    <td>
                      <div className="table-progress">
                        <Progress value={done} />
                        <small>
                          {done}%{" "}
                          <span className="muted">
                            {p.id === "me" ? "" : "· mẫu"}
                          </span>
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="small">
                        {
                          assignments.filter((a) => a.status === "approved")
                            .length
                        }
                        /{assignments.length} bài đạt
                      </span>
                    </td>
                    <td>
                      <button
                        className="text-btn"
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
      <div className="callout sand">
        <Icon name="Info" />
        <p>
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
      <div className="between">
        <div className="person-line">
          <Avatar person={p} />
          <div>
            <strong>{p.name}</strong>
            <small>
              {p.job} · Lần nộp {a.attempt || 1}
            </small>
          </div>
        </div>
        <Badge color="blue">Chờ đánh giá</Badge>
      </div>
      <h3>Đề bài</h3>
      <p className="muted small">{a.description}</p>
      <h3>Sản phẩm người học</h3>
      <div className="submission-box">{a.body}</div>
      {a.file && <p className="muted tiny">Tệp: {a.file} · Demo chỉ lưu tên</p>}
      <div className="between">
        <h3>Đánh giá theo tiêu chí</h3>
        <button
          type="button"
          className="text-btn"
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
        <div className="rubric-score" key={r}>
          <span>{r}</span>
          <select
            aria-label={r}
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
      <div className="form-grid">
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
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              {levels.slice(1).map((l, i) => (
                <option key={l} value={i + 1}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <div className="callout sand">
        <Icon name="ShieldCheck" />
        <p>
          Người đánh giá chịu trách nhiệm xác nhận. Mức năng lực chỉ áp dụng
          trong phạm vi bài thực hành này.
        </p>
      </div>
      <div className="modal-actions">
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
      <div className="review-intro">
        <Icon name="MessageCircle" size={32} />
        <div>
          <h3>
            {state.assignments.filter((a) => a.status === "submitted").length}{" "}
            bài thực hành đang chờ bạn
          </h3>
          <p>
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
      <div className="search-input review-search">
        <Icon name="Search" size={18} />
        <input
          aria-label="Tìm bài cần đánh giá"
          placeholder="Tìm người học hoặc bài tập…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="review-list">
        {list.map((a) => {
          const p = people.find((p) => p.id === a.person) || people[0];
          return (
            <article className="review-card" key={a.id}>
              <div className="between">
                <div className="person-line">
                  <Avatar person={p} />
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.team} · Lần nộp {a.attempt || 1}
                    </small>
                  </div>
                </div>
                <Badge color={statusColor[a.status]}>
                  {statusLabel[a.status]}
                </Badge>
              </div>
              <h3>{a.title}</h3>
              <p className="muted small">{a.body}</p>
              <div className="between">
                <span className="tiny muted">
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
                        <div className="stack">
                          <h3>Bài đã nộp</h3>
                          <p>{a.body}</p>
                          <h3>Phản hồi</h3>
                          <p>{a.feedback}</p>
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

function CourseEditor({ id }) {
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
        const f = new FormData(e.target);
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
      <div className="upload-zone">
        <Icon name="Upload" size={28} />
        <strong>Từ buổi đào tạo đến học liệu</strong>
        <p>Chọn record hoặc tài liệu để mô phỏng quy trình biên tập.</p>
        <input
          aria-label="Chọn record mẫu"
          type="file"
          accept="video/*,.pdf,.ppt,.pptx,.txt"
          onChange={(e) => setSource(e.target.files[0]?.name || "")}
        />
        {source && <Badge color="green">{source}</Badge>}
        <button type="button" className="btn secondary" onClick={generate}>
          <Icon name="Sparkles" size={17} />
          Tạo học liệu mẫu bằng AI
        </button>
        <small>
          Không upload hay đọc tệp. AI tạo một bản nháp có sẵn để anh thử chỉnh
          sửa.
        </small>
      </div>
      {generated && (
        <div className="callout green">
          <Icon name="CheckCircle2" />
          <p>
            Đã tạo bản nháp minh họa. Hãy biên tập và xác nhận nội dung trước
            khi phát hành.
          </p>
        </div>
      )}
      <Field label="Tên khóa học">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={5}
          placeholder="Tên khóa học rõ kết quả người học nhận được"
        />
      </Field>
      <div className="form-grid">
        <Field label="Danh mục">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.slice(1).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Phạm vi học tập">
          <select name="scope" defaultValue={existing?.scope || "Toàn MatureX"}>
            {[
              "Toàn MatureX",
              "EcomCreate",
              "Thedeerly",
              "Microm",
              "Timond.de",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Cấp độ">
          <select name="level" defaultValue={existing?.level || "Nền tảng"}>
            {["Nền tảng", "Ứng dụng", "Nâng cao"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Thời lượng dự kiến">
          <input
            name="duration"
            defaultValue={existing?.duration || "1 giờ 30 phút"}
            required
          />
        </Field>
      </div>
      <Field label="Mô tả & mục tiêu">
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={20}
        />
      </Field>
      <Field
        label="Nội dung bài học"
        hint="Mỗi dòng là một bài học. Khi chỉnh khóa đã phát hành, demo đặt lại tiến độ nếu cấu trúc bài thay đổi."
      >
        <textarea
          rows={5}
          value={lessons}
          onChange={(e) => setLessons(e.target.value)}
          required
        />
      </Field>
      <Field label="Bài thực hành cuối khóa">
        <textarea
          rows={3}
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          required
        />
      </Field>
      <div className="modal-actions">
        <Button kind="secondary" type="button" onClick={close}>
          Hủy
        </Button>
        <Button type="submit" icon="Check">
          Lưu khóa học
        </Button>
      </div>
    </form>
  );
}
function CreatePath() {
  const { state, dispatch, close, notify } = useApp();
  const [selected, setSelected] = useState([]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!selected.length) {
          notify("Chọn ít nhất một khóa học.");
          return;
        }
        const f = new FormData(e.target);
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
      <div className="form-grid">
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
      <h3>Chọn khóa học theo thứ tự</h3>
      <div className="checkbox-courses">
        {state.courses
          .filter((c) => c.status === "published")
          .map((c) => (
            <label key={c.id}>
              <input
                type="checkbox"
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
                <Badge>{selected.indexOf(c.id) + 1}</Badge>
              )}
            </label>
          ))}
      </div>
      <div className="modal-actions">
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
      <div className="studio-banner">
        <span className="icon-tile lavender">
          <Icon name="Sparkles" size={28} />
        </span>
        <div>
          <h3>Một buổi chia sẻ. Nhiều cơ hội học tập.</h3>
          <p>
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
        <section className="panel">
          <div className="filter-row">
            <div className="search-input">
              <Icon name="Search" size={18} />
              <input
                aria-label="Tìm khóa học quản lý"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm trong nội dung của bạn…"
              />
            </div>
            <select
              aria-label="Trạng thái khóa học"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="published">Đã phát hành</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>
          <div className="table-scroll">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>KHÓA HỌC</th>
                  <th>PHẠM VI</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button
                        className="studio-course"
                        onClick={() => go(`course/${c.id}`)}
                      >
                        <span className={`icon-tile ${c.color}`}>
                          <Icon name={c.icon} />
                        </span>
                        <div>
                          <strong>{c.title}</strong>
                          <small>
                            {c.category} · {c.lessons.length} bài học
                          </small>
                        </div>
                      </button>
                    </td>
                    <td>
                      <span className="small">{c.scope}</span>
                    </td>
                    <td>
                      <Badge color={statusColor[c.status]}>
                        {statusLabel[c.status]}
                      </Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-btn"
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
                          className="text-btn"
                          onClick={() =>
                            open(
                              c.status === "published"
                                ? "Lưu trữ khóa học?"
                                : "Phát hành khóa học?",
                              <div className="stack">
                                <p>
                                  <strong>{c.title}</strong>
                                </p>
                                <p>
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
        <div className="studio-paths">
          {[...paths, ...(state.customPaths || [])].map((p) => (
            <div className="panel" key={p.id}>
              <span className={`icon-tile ${p.color}`}>
                <Icon name={p.icon} />
              </span>
              <h3>{p.title}</h3>
              <p className="muted small">{p.description}</p>
              <div className="between">
                <Badge color={p.color}>
                  {p.courses.length} khóa · {p.weeks}
                </Badge>
                <button
                  className="text-btn"
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
      <div className="stats-grid">
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
      <div className="reports-grid">
        <section className="panel">
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
              <div key={label}>
                <div className="between">
                  <span>{label}</span>
                  <strong>{n}</strong>
                </div>
                <div className={`report-bar ${color}`}>
                  <span
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
          <p className="muted tiny">
            “Bằng chứng mới” tính từ đánh giá được thực hiện trong demo. Bài đạt
            trong dữ liệu khởi tạo có thể chưa có hồ sơ bằng chứng mới.
          </p>
        </section>
        <section className="panel">
          <SectionHead
            title="Nơi cần hỗ trợ"
            description="Những hành động có thể thực hiện ngay."
          />
          <div className="insight">
            <span className="icon-tile peach">
              <Icon name="MessageCircle" />
            </span>
            <div>
              <h3>
                {assignments.filter((a) => a.status === "submitted").length} bài
                chờ phản hồi
              </h3>
              <p>Phản hồi kịp thời giúp người học sửa và áp dụng ngay.</p>
              <button className="text-btn" onClick={() => go("reviews")}>
                Mở hàng chờ
                <Icon name="ArrowRight" size={16} />
              </button>
            </div>
          </div>
          <div className="insight">
            <span className="icon-tile lavender">
              <Icon name="Compass" />
            </span>
            <div>
              <h3>
                {
                  state.pathAssignments.filter((p) => ids.includes(p.person))
                    .length
                }{" "}
                lộ trình được giao mới
              </h3>
              <p>
                Làm rõ mục tiêu và dành thời gian hướng dẫn trong công việc.
              </p>
              <button className="text-btn" onClick={() => go("team")}>
                Xem đội ngũ
                <Icon name="ArrowRight" size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
      <section className="panel">
        <SectionHead
          title="Hiệu quả cần kiểm chứng khi vận hành thật"
          description="Ba phép đo cần có dữ liệu đầu vào, đánh giá sau học và bối cảnh công việc."
        />
        <div className="impact-grid">
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
            <div key={t}>
              <Badge color="gray">Chưa có dữ liệu thật</Badge>
              <h3>{t}</h3>
              <p>{d}</p>
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
      <div className="modal-actions">
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
    <div className="stack">
      <Badge>{p.topic}</Badge>
      <p>{p.body}</p>
      <h3>Trao đổi ({p.replies.length})</h3>
      {p.replies.map((r, i) => (
        <div className="reply" key={i}>
          <strong>{r.name}</strong>
          <p>{r.body}</p>
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
      >
        <Field label="Phản hồi của bạn">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            required
            rows={3}
          />
        </Field>
        <Button type="submit" icon="Send">
          Gửi phản hồi
        </Button>
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
      <div className="community-layout">
        <div>
          <div className="chips">
            {["Tất cả", "AI & Dữ liệu", "Văn hoá MatureX", "Chuyên môn"].map(
              (t) => (
                <button
                  className={topic === t ? "selected" : ""}
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
              <article className="panel post-card" key={post.id}>
                <div className="between">
                  <div className="person-line">
                    <Avatar person={p} />
                    <div>
                      <strong>{p.name}</strong>
                      <small>{p.job} · Chia sẻ trong demo</small>
                    </div>
                  </div>
                  <Badge color={p.color}>{post.topic}</Badge>
                </div>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
                <div className="post-actions">
                  <button
                    className={post.liked ? "liked" : ""}
                    onClick={() => dispatch({ type: "like", id: post.id })}
                  >
                    <Icon name="ThumbsUp" size={17} />
                    {post.likes} hữu ích
                  </button>
                  <button
                    onClick={() =>
                      open(post.title, <PostDetail id={post.id} />)
                    }
                  >
                    <Icon name="MessageCircle" size={17} />
                    {post.replies.length} phản hồi
                  </button>
                  <button
                    className="text-btn"
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
        <aside>
          <div className="panel community-note">
            <span className="icon-tile green">
              <Icon name="Sprout" size={26} />
            </span>
            <h3>Một không gian để cùng học</h3>
            <p>
              Chia sẻ trải nghiệm cụ thể. Tôn trọng góc nhìn khác. Đặt câu hỏi
              để hiểu thêm.
            </p>
            <hr />
            <strong>Gợi ý cho hôm nay</strong>
            <p>
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
      <div className="settings-layout">
        <section className="panel">
          <h2>Thông báo học tập</h2>
          <p className="muted small">
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
            <div className="setting-row" key={id}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <button
                role="switch"
                aria-checked={state.settings[id]}
                aria-label={title}
                className={`switch ${state.settings[id] ? "on" : ""}`}
                onClick={() =>
                  dispatch({
                    type: "settings",
                    value: { [id]: !state.settings[id] },
                  })
                }
              >
                <span />
              </button>
            </div>
          ))}
          <h2 className="space-top">Dữ liệu cá nhân</h2>
          <div className="setting-row">
            <div>
              <strong>Ghi chú cá nhân</strong>
              <p>Chỉ hiển thị trong không gian người học trên demo.</p>
            </div>
            <Badge color="green">Riêng tư trong giao diện</Badge>
          </div>
          <p className="muted tiny">
            Chuyển vai là mô phỏng giao diện, không phải cơ chế bảo mật. Người
            có quyền sử dụng trình duyệt này có thể đọc dữ liệu localStorage.
          </p>
        </section>
        <aside className="panel">
          <h3>Về bản demo</h3>
          <p className="muted">MX LMS · Phiên bản trải nghiệm 0.1</p>
          <div className="settings-info">
            <span>Ngôn ngữ</span>
            <strong>Tiếng Việt</strong>
          </div>
          <div className="settings-info">
            <span>Lưu trữ</span>
            <strong>Trình duyệt hiện tại</strong>
          </div>
          <div className="settings-info">
            <span>AI & record</span>
            <strong>Mô phỏng</strong>
          </div>
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
                <div className="stack">
                  <p>
                    Tất cả bài đã nộp, đánh giá, ghi chú, khóa học và thiết lập
                    bạn thử trong demo sẽ được thay bằng dữ liệu mẫu ban đầu.
                  </p>
                  <p>Bạn có thể xuất dữ liệu trước khi đặt lại.</p>
                  <div className="modal-actions">
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
        </aside>
      </div>
      {role !== "learner" && (
        <section className="panel">
          <SectionHead
            title="Phân quyền dự kiến"
            description="Ma trận trải nghiệm để duyệt; chưa có xác thực hoặc phân quyền máy chủ."
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>KHẢ NĂNG</th>
                  <th>NGƯỜI HỌC</th>
                  <th>GIẢNG VIÊN</th>
                  <th>QUẢN LÝ</th>
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
                  <tr key={row[0]}>
                    {row.map((v, i) => (
                      <td key={i}>{v}</td>
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
