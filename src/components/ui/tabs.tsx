export function Tabs({
  items,
  value,
  onChange,
}: {
  items: Array<string | { id: string; label: string; count?: number }>;
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div
      className="tabs flex items-center gap-[23px] max-sm:gap-[22px] border-b border-[#e6e2ec] mb-[23px] overflow-auto [scrollbar-width:thin]"
      role="tablist"
    >
      {items.map((item) => {
        const key = typeof item === "string" ? item : item.id;
        const isSelected = value === key;
        return (
          <button
            role="tab"
            aria-selected={isSelected}
            key={key}
            className={`tabs-btn ${isSelected ? "active border-b-2 border-[#a28abd] text-[#8464ae]" : "text-[#a198ab] border-b-2 border-transparent"} text-[11px] max-sm:text-[10px] font-medium py-[15px] max-sm:py-3 whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors duration-150`}
            onClick={() => onChange(key)}
          >
            {typeof item === "string" ? item : item.label}
            {typeof item !== "string" && item.count !== undefined && (
              <span className="bg-[#f0eaf7] text-[#9477b8] text-[10px] px-1.5 py-0.5 rounded-[5px]">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
