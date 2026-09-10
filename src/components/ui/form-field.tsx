import type { ReactNode } from "react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field flex flex-col gap-2 my-[18px]">
      <span className="text-[11px] font-medium text-[#8d779b]">{label}</span>
      {children}
      {hint && <small className="text-[10px] text-[#b29fc0]">{hint}</small>}
    </label>
  );
}
