import { useState } from "react";
import {
  Badge,
  Button,
  Empty,
  Field,
  Icon,
  PageHead,
  Stat,
  statusColor,
  statusLabel,
  Tabs,
  useApp,
} from "@/components/ui";
import { rubric } from "../../portal-data";

export function AssignmentDetail({ id }: { id: string }) {
  const { state, dispatch, notify, close } = useApp();
  const a = state.assignments.find((a: any) => a.id === id);
  const [body, setBody] = useState(a?.status === "revision" ? a.body : "");
  const [file, setFile] = useState("");
  const [hint, setHint] = useState(false);

  if (!a) return <Empty />;
  const canSubmit = ["todo", "revision"].includes(a.status);

  return (
    <div className="assignment-detail">
      <div className="flex items-center gap-2">
        <Badge color={statusColor[a.status]}>{statusLabel[a.status]}</Badge>
        <span className="muted small text-[10px] text-[var(--muted,#9b91ab)]">
          Hạn {a.due} · {a.type}
        </span>
      </div>
      <p className="text-[12px] text-[#918098] my-[19px] leading-[1.8]">
        {a.description}
      </p>
      <h3 className="text-[13px] font-semibold text-[#6a5b78] mb-2.5">
        Tiêu chí đánh giá
      </h3>
      <div className="rubric-preview grid grid-cols-3 max-md:grid-cols-1 gap-2.5 mb-5">
        {rubric.map((r, i) => (
          <div
            key={r}
            className="text-[10px] bg-[#f8f5fb] p-3 rounded-[7px] text-[#a18cad] leading-[1.8]"
          >
            <span className="block text-[#baa5cc] text-[15px] mb-[5px] font-bold">
              {i + 1}
            </span>
            {r}
          </div>
        ))}
      </div>
      {a.feedback && (
        <div
          className={`feedback-box p-[18px] rounded-[9px] my-5 ${a.status === "approved" ? "green bg-[#e9f2e5] text-[#55785a]" : "peach bg-[#faede6] text-[#8e614d]"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="MessageCircle" size={19} />
            <strong className="font-semibold text-[12px]">
              Phản hồi từ {a.reviewer || "Ngọc Linh"}
            </strong>
          </div>
          <p className="text-[12px] my-2 leading-[1.7]">{a.feedback}</p>
          {a.scores && (
            <span className="small text-[10px] block opacity-80 mt-1">
              Tiêu chí: {a.scores.join(" / ")} (thang 4)
            </span>
          )}
        </div>
      )}
      {a.body && (
        <details
          open={!canSubmit}
          className="my-[15px] text-[#a38eaf] text-[11px] leading-[1.8]"
        >
          <summary className="cursor-pointer font-medium mb-2">
            Bài đã nộp · Lần {a.attempt || 1}
          </summary>
          <p className="submitted-body whitespace-pre-wrap bg-[#faf7fc] p-4 rounded-[7px] text-[12px] text-[#907c9d]">
            {a.body}
          </p>
          {a.file && (
            <p className="tiny muted text-[10px] text-[var(--muted,#9b91ab)] mt-1">
              Tệp minh họa: {a.file} (chỉ lưu tên tệp)
            </p>
          )}
        </details>
      )}
      {a.history?.length > 0 && (
        <details className="my-[15px] text-[#a38eaf] text-[11px] leading-[1.8]">
          <summary className="cursor-pointer font-medium mb-2">
            Lịch sử sửa bài ({a.history.length})
          </summary>
          {a.history.map((h: any, i: number) => (
            <div
              className="history-item border-l-2 border-[#e8dcef] p-3 my-3 pl-4"
              key={i}
            >
              <strong className="block text-[11px] text-[#716179]">
                Lần {i + 1}
              </strong>
              <p className="text-[11px] whitespace-pre-wrap my-1">{h.body}</p>
              <small className="block text-[10px] text-[#b09abd]">
                Phản hồi: {h.feedback}
              </small>
            </div>
          ))}
        </details>
      )}
      {canSubmit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "submit", id, value: { body, file } });
            notify("Đã nộp bài. Giảng viên có thể xem trong Đánh giá bài tập.");
            close();
          }}
        >
          <Field
            label="Bài làm của bạn"
            hint="Tối thiểu 30 ký tự. Nêu bối cảnh, cách làm, nguồn và điều bạn đã kiểm chứng."
          >
            <textarea
              required
              minLength={30}
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Trình bày bài làm hoặc dán đường dẫn sản phẩm, kèm giải thích cách bạn thực hiện…"
              className="w-full p-3 border border-[#e5dceb] rounded-[7px] text-[12px] text-[#6c5980] outline-none focus:border-[#cbb8e0]"
            />
          </Field>
          <Field
            label="Tệp đính kèm (tùy chọn)"
            hint="Demo chỉ lưu tên tệp, không tải nội dung lên máy chủ."
          >
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
              className="text-[10px] p-3 border border-[#e5dceb] rounded-[7px] w-full"
            />
          </Field>
          <button
            type="button"
            className="ai-feedback-btn flex items-center gap-[7px] text-[#a084b7] text-[11px] py-[5px] my-3 hover:text-[#8464ae]"
            onClick={() => setHint(true)}
          >
            <Icon name="Sparkles" size={17} />
            Nhờ AI góp ý trước khi nộp
          </button>
          {hint && (
            <div className="callout lavender p-[15px_17px] rounded-lg flex items-start gap-3 border border-[#00000004] text-[11px]">
              <Icon name="Sparkles" className="mt-0.5 shrink-0" />
              <p className="m-0 text-[11px] leading-[1.8]">
                <strong>Gợi ý mô phỏng:</strong>{" "}
                {body.length < 30
                  ? "Bạn hãy viết bản nháp trước. Bắt đầu bằng người sử dụng kết quả và quyết định cần hỗ trợ."
                  : "Hãy rà soát: từng nhận định đã có nguồn chưa, bạn đã phân biệt suy luận với dữ kiện chưa, và người khác có thể kiểm chứng đầu ra bằng cách nào?"}
              </p>
            </div>
          )}
          <div className="modal-actions flex justify-end gap-2.5 mt-[25px] border-t border-[#ede7f2] pt-5">
            <Button type="button" kind="secondary" onClick={close}>
              Để sau
            </Button>
            <Button type="submit" icon="Send">
              {a.status === "revision" ? "Nộp lại bài" : "Nộp bài thực hành"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="callout blue p-[15px_17px] rounded-lg flex items-start gap-3 border border-[#00000004] text-[11px]">
          <Icon name="Info" className="mt-0.5 shrink-0" />
          <p className="m-0 text-[11px] leading-[1.8]">
            {a.status === "submitted"
              ? "Bài đã vào hàng chờ. Chuyển sang vai Giảng viên để trải nghiệm đánh giá và phản hồi."
              : "Kết quả và phản hồi đã được lưu. Xem hồ sơ năng lực để theo dõi bằng chứng được xác nhận."}
          </p>
        </div>
      )}
    </div>
  );
}

export function Assignments() {
  const { state, open } = useApp();
  const [tab, setTab] = useState("all");
  const mine = state.assignments.filter((a: any) => a.person === "me");
  const filtered = mine.filter(
    (a: any) =>
      tab === "all" ||
      (tab === "todo" && ["todo", "revision"].includes(a.status)) ||
      a.status === tab,
  );

  return (
    <>
      <PageHead
        eyebrow="HIỂU QUA THỰC HÀNH"
        title="Bài tập & phản hồi"
        description="Thử sức, nhận góp ý và làm tốt hơn qua mỗi lần thực hành."
      />
      <div className="stats-grid three-stats grid grid-cols-3 max-md:grid-cols-1 gap-3 my-5 mb-[26px]">
        <Stat
          icon="FileText"
          color="peach"
          value={
            mine.filter((a: any) => ["todo", "revision"].includes(a.status))
              .length
          }
          label="Cần thực hành"
        />
        <Stat
          icon="MessageCircle"
          color="blue"
          value={mine.filter((a: any) => a.status === "submitted").length}
          label="Đang chờ phản hồi"
        />
        <Stat
          icon="CheckCircle2"
          color="green"
          value={mine.filter((a: any) => a.status === "approved").length}
          label="Đã đạt yêu cầu"
        />
      </div>
      <Tabs
        items={[
          { id: "all", label: "Tất cả", count: mine.length },
          { id: "todo", label: "Cần thực hành" },
          { id: "submitted", label: "Chờ phản hồi" },
          { id: "approved", label: "Đã đánh giá" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="assignment-list flex flex-col gap-[18px]">
        {filtered.map((a: any) => {
          const c = state.courses.find((c: any) => c.id === a.course);
          return (
            <article
              className="assignment-card flex items-center gap-[19px] bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-md:flex-col max-md:items-start"
              key={a.id}
            >
              <span
                className={`assignment-symbol ${c?.color || "lavender"} w-[66px] h-[78px] flex items-center justify-center rounded-[9px] shrink-0`}
              >
                <Icon
                  name={a.type === "Phản tư" ? "MessageCircle" : "FileText"}
                  size={29}
                />
              </span>
              <div className="assignment-summary flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="category text-[10px] text-[#a28db4] font-medium">
                    {c?.category}
                  </span>
                  <Badge color={statusColor[a.status]}>
                    {statusLabel[a.status]}
                  </Badge>
                </div>
                <h3 className="text-[15px] font-[550] my-2.5 mb-[5px] text-[#716179]">
                  {a.title}
                </h3>
                <p className="text-[10px] text-[#afa0b7] mb-3.5">{c?.title}</p>
                <div className="course-meta flex flex-wrap gap-3 text-[10px] text-[#a9a1b0] items-center">
                  <span className="flex items-center gap-1">
                    <Icon name="CalendarDays" size={14} />
                    Hạn {a.due}
                  </span>
                  <span>{a.type}</span>
                  {a.attempt && <span>Lần nộp {a.attempt}</span>}
                </div>
              </div>
              <Button
                kind={
                  ["todo", "revision"].includes(a.status)
                    ? "primary"
                    : "secondary"
                }
                className="max-md:w-full"
                onClick={() =>
                  open(a.title, <AssignmentDetail id={a.id} />, true)
                }
              >
                {a.status === "todo"
                  ? "Làm bài"
                  : a.status === "revision"
                    ? "Bổ sung bài"
                    : "Xem bài & phản hồi"}
                <Icon name="ArrowRight" size={16} />
              </Button>
            </article>
          );
        })}
        {!filtered.length && (
          <Empty
            title="Chưa có bài tập trong mục này"
            description="Các bài tập và phản hồi sẽ được cập nhật theo lộ trình của bạn."
          />
        )}
      </div>
    </>
  );
}
