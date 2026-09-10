import type { Person } from "@/types/index";

export function Avatar({
  person,
  size = "",
  className = "",
}: {
  person?: Partial<Person> & { initials?: string };
  size?: "small" | "large" | "";
  className?: string;
}) {
  const sizeClass =
    size === "small"
      ? "w-[29px] h-[29px] text-[10px]"
      : size === "large"
        ? "w-[76px] h-[76px] text-[23px] border-4 border-white/70"
        : "w-[35px] h-[35px] text-[11px]";

  return (
    <span
      className={`avatar ${person?.color || "lavender"} ${size} rounded-full inline-flex items-center justify-center font-semibold shrink-0 ${sizeClass} ${className}`}
      title={person?.name}
    >
      {person?.initials || "MA"}
    </span>
  );
}
