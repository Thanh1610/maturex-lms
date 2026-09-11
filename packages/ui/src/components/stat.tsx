import { Icon } from "./icon";

export function Stat({
  icon,
  color = "lavender",
  value,
  label,
  sub,
}: {
  icon: string;
  color?: string;
  value: string | number;
  label: string;
  sub?: string;
}) {
  return (
    <div className="stat border border-[var(--border,#e9eaf0)] rounded-[10px] bg-white p-[17px_13px] max-sm:p-[17px_14px] flex items-center gap-2.5 max-sm:gap-[11px] min-w-0">
      <div
        className={`icon-tile ${color} w-[34px] h-[34px] max-sm:w-[35px] max-sm:h-[35px] rounded-[9px] inline-flex items-center justify-center shrink-0`}
      >
        <Icon name={icon} size={18} />
      </div>
      <div>
        <strong className="text-[23px] max-sm:text-[25px] leading-[1.2] font-semibold block tracking-[-0.7px]">
          {value}
        </strong>
        <span className="block text-[10px] text-[#a5a0ac] mt-1.25 whitespace-nowrap">
          {label}
        </span>
      </div>
      {sub && (
        <small className="text-[10px] text-[var(--green,#448171)] ml-auto">
          {sub}
        </small>
      )}
    </div>
  );
}

export function download(
  name: string,
  text: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const statusLabel: Record<string, string> = {
  todo: "Chưa nộp",
  submitted: "Chờ phản hồi",
  revision: "Cần bổ sung",
  approved: "Đạt yêu cầu",
  published: "Đã phát hành",
  draft: "Bản nháp",
  archived: "Đã lưu trữ",
};

export const statusColor: Record<string, string> = {
  todo: "sand",
  submitted: "blue",
  revision: "peach",
  approved: "green",
  published: "green",
  draft: "sand",
  archived: "gray",
};
