import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon";

export type ButtonKind =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "white"
  | string;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  icon?: string;
  children?: ReactNode;
  className?: string;
}

const buttonKindStyles: Record<string, string> = {
  primary:
    "bg-[var(--purple,#6b57bd)] text-white shadow-[0_3px_5px_#6b57bd15] hover:bg-[#5c49ad]",
  secondary:
    "bg-white border border-[#e4e3eb] text-[#747080] hover:border-[#bcb0d6] hover:bg-[#fdfbff]",
  ghost:
    "bg-transparent text-[#747080] hover:bg-[#f4f2f8] hover:text-[#5c49ad]",
  danger: "bg-[#fbeeed] text-[#b0433e] hover:bg-[#f7dedc]",
  white:
    "bg-white text-[#6b57bd] shadow-[0_3px_5px_#00000010] hover:bg-[#f9f8fc]",
};

export function Button({
  kind = "primary",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 rounded-[7px] px-4 py-[11px] text-[11px] font-medium border border-transparent leading-[1.55] min-h-[38px] transition-all duration-150 whitespace-nowrap cursor-pointer hover:not-disabled:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45";
  const kindStyle = buttonKindStyles[kind] || buttonKindStyles.primary;

  return (
    <button
      className={`btn ${kind} ${baseStyle} ${kindStyle} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={17} />}
      <span className="inline-flex items-center justify-center gap-[9px]">
        {children}
      </span>
    </button>
  );
}
