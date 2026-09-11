import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Field,
  Icon,
  PageHead,
  statusColor,
  statusLabel,
  Tabs,
  useApp,
} from "@/components/ui";
import { levels, normalize, people, rubric } from "../../portal-data";

export function ReviewForm({ id }: { id: string }) {
  const { state, dispatch, notify, close } = useApp();
  const a = state.assignments.find((a: any) => a.id === id);
  const p = people.find((p) => p.id === a?.person) || people[0];
  const [scores, setScores] = useState(a?.scores || [3, 3, 3]);
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState("approved");
  const [level, setLevel] = useState(2);

  if (!a) return null;

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
      {rubric.map((r: string, i: number) => (
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
              setScores((s: number[]) =>
                s.map((x: number, j: number) =>
                  i === j ? Number(e.target.value) : x,
                ),
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
  const [tab, setTab] = useState("submitted");
  const [q, setQ] = useState("");
  const list = state.assignments.filter(
    (a: any) =>
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
            {
              state.assignments.filter((a: any) => a.status === "submitted")
                .length
            }{" "}
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
            count: state.assignments.filter(
              (a: any) => a.status === "submitted",
            ).length,
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
        {list.map((a: any) => {
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
