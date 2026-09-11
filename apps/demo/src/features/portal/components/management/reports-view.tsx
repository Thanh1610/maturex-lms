import { useState } from "react";
import {
  Badge,
  Button,
  download,
  Icon,
  PageHead,
  SectionHead,
  Stat,
  useApp,
} from "@/components/ui";
import { people } from "../../portal-data";

export function Reports() {
  const { state, go } = useApp();
  const [scope, setScope] = useState("Toàn MatureX");
  const members = [...people, ...(state.members || [])].filter(
    (p) => scope === "Toàn MatureX" || p.team === scope,
  );
  const ids = members.map((p) => p.id);
  const assignments = state.assignments.filter((a: any) =>
    ids.includes(a.person),
  );
  const approved = assignments.filter(
    (a: any) => a.status === "approved",
  ).length;
  const submitted = assignments.filter((a: any) => a.status !== "todo").length;
  const evidence = state.evidence.filter((e: any) => ids.includes(e.person));

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
              <div key={label as string} className="my-[22px]">
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
                        Math.max(
                          0,
                          ((n as number) / (assignments.length || 1)) * 100,
                        ) + "%",
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
                {
                  assignments.filter((a: any) => a.status === "submitted")
                    .length
                }{" "}
                bài chờ phản hồi
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
                  state.pathAssignments?.filter((p: any) =>
                    ids.includes(p.person),
                  ).length
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
