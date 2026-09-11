import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { cn } from "../lib/utils";
export interface AvatarPerson {
  name?: string;
  initials?: string;
  color?: string;
}

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full font-semibold items-center justify-center",
      className,
    )}
    {...props}
  />
));
AvatarRoot.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted font-semibold",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export interface AvatarProps {
  person?: AvatarPerson;
  size?: "small" | "large" | "";
  className?: string;
}

export function Avatar({ person, size = "", className = "" }: AvatarProps) {
  const sizeClass =
    size === "small"
      ? "w-[29px] h-[29px] text-[10px]"
      : size === "large"
        ? "w-[76px] h-[76px] text-[23px] border-4 border-white/70"
        : "w-[35px] h-[35px] text-[11px]";

  return (
    <AvatarRoot
      className={cn(
        "avatar",
        person?.color || "lavender",
        size,
        sizeClass,
        className,
      )}
      title={person?.name}
    >
      <AvatarFallback className="bg-inherit text-inherit">
        {person?.initials || "MA"}
      </AvatarFallback>
    </AvatarRoot>
  );
}

export { AvatarFallback, AvatarImage, AvatarRoot };
