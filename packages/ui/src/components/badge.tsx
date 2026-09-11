import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-[5px] px-2 py-1 rounded-[5px] text-[10px] font-medium whitespace-nowrap leading-normal transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-purple-light,#efebfb)] text-[var(--color-purple-text,#7661b3)]",
        lavender:
          "bg-[var(--color-purple-light,#efebfb)] text-[var(--color-purple-text,#7661b3)]",
        green:
          "bg-[var(--color-green-bg,#e6f0e9)] text-[var(--color-green-text,#398572)]",
        peach:
          "bg-[var(--color-peach-bg,#faf0e7)] text-[var(--color-peach-text,#b88861)]",
        blue: "bg-[var(--color-blue-bg,#eaf0f9)] text-[var(--color-blue-text,#637da4)]",
        pink: "bg-[var(--color-pink-bg,#f5e9ef)] text-[var(--color-pink-text,#a36e8b)]",
        sand: "bg-[var(--color-sand-bg,#f5f0df)] text-[var(--color-sand-text,#9a8b59)]",
        gray: "bg-[var(--color-gray-bg,#f1f2f5)] text-[var(--color-gray-text,#777d8a)]",
        white: "bg-white/10 text-white/90 border border-white/20",
        outline: "text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  color?: string;
  dot?: boolean;
}

function Badge({
  className,
  variant,
  color,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const resolvedVariant = (variant || color || "default") as VariantProps<
    typeof badgeVariants
  >["variant"];

  return (
    <span
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {dot && (
        <i className="w-1 h-1 rounded-full bg-current inline-block not-italic" />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
