import {
  Badge,
  Button,
  Icon,
  PageHead,
  Progress,
  useApp,
} from "@/components/ui";
import { paths } from "../../portal-data";
import { progress } from "../../portal-store";

export function PathDetails({ path }: { path: any }) {
  const { state, go, dispatch, notify, close } = useApp();
  return (
    <>
      <div
        className={`path-detail-intro ${path.color} rounded-[9px] p-6 text-left`}
      >
        <Icon name={path.icon} size={40} />
        <h2 className="my-[15px] mb-2.5 text-[18px] font-semibold">
          {path.title}
        </h2>
        <p className="text-[12px] leading-[1.8]">{path.description}</p>
        <Badge color="white">Mục tiêu: {path.target}</Badge>
      </div>
      <p className="muted small text-[10px] text-[var(--muted,#9b91ab)] my-3">
        Gợi ý học theo thứ tự. Mỗi bước gồm bài học và thực hành; đánh giá năng
        lực dựa trên bằng chứng riêng.
      </p>
      <div className="path-steps my-5 mb-[25px]">
        {path.courses.map((id: string, i: number) => {
          const c = state.courses.find((c: any) => c.id === id);
          if (!c) return null;
          return (
            <button
              key={id}
              className="flex items-center gap-[13px] py-4 border-b border-[#efe8f3] text-left w-full hover:bg-[#faf8fd] px-1 rounded-md transition-colors"
              onClick={() => {
                go(`course/${id}`);
                close();
              }}
            >
              <span
                className={`w-[30px] h-[30px] rounded-full bg-[#f1e8fa] text-[#b199c3] flex items-center justify-center text-[11px] shrink-0 ${progress(state, id) === 100 ? "done !bg-[#e9f2e5] !text-[#90a27d]" : ""}`}
              >
                {progress(state, id) === 100 ? (
                  <Icon name="Check" size={16} />
                ) : (
                  i + 1
                )}
              </span>
              <div className="flex-1 min-w-0">
                <strong className="text-[12px] block text-[#6a5a78]">
                  {c.title}
                </strong>
                <small className="text-[10px] block text-[#aa9ab4] mt-[5px]">
                  {c.duration} · {progress(state, id)}% hoàn thành
                </small>
              </div>
              <Icon
                name="ArrowUpRight"
                size={17}
                className="ml-auto text-[#bba4c9]"
              />
            </button>
          );
        })}
      </div>
      <Button
        icon="Plus"
        onClick={() => {
          path.courses.forEach((id: string) => {
            dispatch({ type: "enroll", id });
          });
          notify("Đã thêm các khóa học trong lộ trình.");
          close();
        }}
      >
        Thêm vào hành trình của tôi
      </Button>
    </>
  );
}

export function Paths() {
  const { state, open, go } = useApp();
  return (
    <>
      <PageHead
        eyebrow="HÀNH TRÌNH CÓ ĐỊNH HƯỚNG"
        title="Lộ trình của tôi"
        description="Biết mình đang ở đâu. Hiểu bước tiếp theo cần làm gì."
      />
      <div className="path-highlight flex items-center gap-5 p-[27px] bg-[#f0eaf7] border border-[#e6dcef] rounded-xl mb-6 max-md:flex-col max-md:items-start">
        <span className="icon-tile lavender w-[58px] h-[58px] bg-[#e9dff3] rounded-lg flex items-center justify-center shrink-0">
          <Icon name="Compass" size={34} />
        </span>
        <div className="flex-1">
          <span className="eyebrow text-[10px] tracking-[1.4px] font-semibold text-[#9c87b0] block mb-1">
            MỤC TIÊU PHÁT TRIỂN HIỆN TẠI
          </span>
          <h2 className="text-[17px] font-[550] text-[#866a98] my-1">
            Ứng dụng AI có kiểm chứng vào nghiên cứu khách hàng
          </h2>
          <p className="text-[10px] text-[#aa97b6] m-0">
            Lộ trình gợi ý cho vai trò Product Researcher · Thedeerly
          </p>
        </div>
        <Button
          kind="secondary"
          className="max-md:mt-2"
          onClick={() => go("skills")}
        >
          Xem năng lực
          <Icon name="ArrowUpRight" size={17} />
        </Button>
      </div>
      <div className="paths-list flex flex-col gap-5">
        {[...paths, ...(state.customPaths || [])].map((p: any, i: number) => {
          const done = Math.round(
            p.courses.reduce(
              (n: number, id: string) => n + progress(state, id),
              0,
            ) / p.courses.length,
          );
          return (
            <article
              key={p.id}
              className="path-card flex rounded-xl overflow-hidden bg-white border border-[var(--border,#e9eaf0)] max-md:flex-col"
            >
              <div
                className={`path-art ${p.color} w-[175px] max-[1200px]:w-[135px] max-md:w-full max-md:h-[110px] flex items-center justify-center flex-col gap-[25px] max-md:gap-2 shrink-0`}
              >
                <Icon name={p.icon} size={57} strokeWidth={1.3} />
                <span className="text-[10px] tracking-[2px] opacity-60">
                  PATH / 0{i + 1}
                </span>
              </div>
              <div className="path-card-main p-[23px_27px] flex-1 min-w-0">
                <div className="between flex items-center justify-between flex-wrap gap-2">
                  <Badge color={p.color}>
                    {i === 0
                      ? "Đang theo học"
                      : i === 1
                        ? "Nền tảng chung"
                        : "Hướng phát triển"}
                  </Badge>
                  <span className="muted small text-[10px] text-[var(--muted,#9b91ab)]">
                    {p.weeks} · {p.courses.length} khóa học
                  </span>
                </div>
                <h2 className="text-[19px] mt-3.5 mb-[7px] font-[550] text-[#71627b]">
                  {p.title}
                </h2>
                <p className="text-[11px] text-[#a798b2] mb-[18px]">
                  {p.description}
                </p>
                <div className="path-mini-courses flex gap-[17px] flex-wrap mb-4">
                  {p.courses.map((id: string, j: number) => {
                    const c = state.courses.find((c: any) => c.id === id);
                    return (
                      <button
                        key={id}
                        className="flex gap-[7px] items-center p-0 text-[10px] text-[#a38bb6] hover:text-[#8464ae]"
                        onClick={() => go(`course/${id}`)}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-[#f3ecfa] flex items-center justify-center text-[10px] ${progress(state, id) === 100 ? "done !bg-[#ecf3e9] !text-[#96ac87]" : ""}`}
                        >
                          {progress(state, id) === 100 ? (
                            <Icon name="Check" size={13} />
                          ) : (
                            j + 1
                          )}
                        </span>
                        {c?.category || id}
                      </button>
                    );
                  })}
                </div>
                <div className="path-card-bottom flex justify-between gap-[35px] items-center mt-1.5 max-md:flex-col max-md:items-start max-md:gap-3">
                  <div className="flex-1 max-w-[400px] max-md:max-w-full w-full">
                    <Progress value={done} />
                    <small className="text-[10px] text-[#b4a5bd] mt-1 block">
                      {done}% nội dung đã hoàn thành
                    </small>
                  </div>
                  <Button
                    kind={i === 0 ? "primary" : "secondary"}
                    onClick={() => open(p.title, <PathDetails path={p} />)}
                  >
                    Xem lộ trình
                    <Icon name="ArrowRight" size={17} />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {state.pathAssignments?.filter((x: any) => x.person === "me").length >
        0 && (
        <section className="panel bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[18px] mt-6">
          <h3 className="text-[13px] font-semibold text-[#6a5b78] mb-3">
            Lộ trình được giao
          </h3>
          {state.pathAssignments
            .filter((x: any) => x.person === "me")
            .map((x: any) => (
              <div
                className="resource-row flex items-center gap-3 py-[15px] border-b border-[#efe9f4] last:border-0 text-[11px] text-left w-full"
                key={x.id}
              >
                <Icon name="Compass" className="text-[#a18cb2]" />
                <div className="flex-1 min-w-0">
                  <strong className="text-[11px] text-[#81718d] font-medium block">
                    {x.title}
                  </strong>
                  <small className="block text-[10px] text-[#ad9db7] mt-[5px]">
                    Hạn {x.due} · {x.reason}
                  </small>
                </div>
              </div>
            ))}
        </section>
      )}
    </>
  );
}
