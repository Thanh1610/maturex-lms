import type { ReactNode } from "react";

export function Badge({
  children,
  color = "lavender",
  dot = false,
  className = "",
  ...props
}: {
  children?: ReactNode;
  color?: string;
  dot?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <span
      className={`badge ${color} inline-flex items-center gap-[5px] px-2 py-1 rounded-[5px] text-[10px] font-medium whitespace-nowrap leading-normal ${className}`}
      {...props}
    >
      {dot && (
        <i className="w-1 h-1 rounded-full bg-current inline-block not-italic" />
      )}
      {children}
    </span>
  );
}
