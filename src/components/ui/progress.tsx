export function Progress({
  value,
  color = "",
  label = false,
}: {
  value: number;
  color?: string;
  label?: boolean;
}) {
  return (
    <div className="progress-wrap my-[17px] mb-[9px]">
      {label && (
        <div className="between tiny flex items-center justify-between gap-[14px] text-[10px] mb-[9px]">
          <span>Tiến độ học tập</span>
          <strong>{value}%</strong>
        </div>
      )}
      <div
        className={`progress ${color} h-1 rounded-[5px] bg-[#eeeaf3] overflow-hidden`}
        role="progressbar"
        aria-label="Tiến độ học tập"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="h-full block bg-[#ab94c7] rounded-[5px] transition-[width] duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
