import {
  Badge,
  Button,
  download,
  PageHead,
  SectionHead,
  useApp,
} from "@/components/ui";

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
