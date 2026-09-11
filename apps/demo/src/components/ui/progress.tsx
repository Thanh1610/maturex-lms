import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";
import { cn } from "@/lib/utils";

const ProgressRoot = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1 w-full overflow-hidden rounded-[5px] bg-[#eeeaf3]",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-[var(--color-purple-hover,#ab94c7)] transition-all duration-300"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
ProgressRoot.displayName = ProgressPrimitive.Root.displayName;

export interface ProgressProps {
  value: number;
  color?: string;
  label?: boolean;
  className?: string;
}

export function Progress({
  value,
  color = "",
  label = false,
  className = "",
}: ProgressProps) {
  return (
    <div className={cn("progress-wrap my-[17px] mb-[9px]", className)}>
      {label && (
        <div className="between tiny flex items-center justify-between gap-[14px] text-[10px] mb-[9px]">
          <span>Tiến độ học tập</span>
          <strong>{value}%</strong>
        </div>
      )}
      <ProgressRoot value={value} className={color} />
    </div>
  );
}

export { ProgressRoot };
