import type { ReactNode } from "react";

export function PageHead({
  eyebrow,
  title,
  description,
  children,
  className = "",
  ...props
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`page-head flex justify-between items-center gap-[22px] mb-7 max-sm:flex-wrap max-sm:items-start max-sm:gap-3.5 ${className}`}
      {...props}
    >
      <div>
        {eyebrow && (
          <div className="eyebrow text-[10px] font-semibold tracking-[1.6px] text-[#a6a0ad] mb-2.5">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[26px] font-[650] tracking-[-0.9px] leading-[1.45] mb-[9px] mt-0">
          {title}
        </h1>
        {description && (
          <p className="text-[#9695a0] text-[11px] mb-0 leading-[1.85]">
            {description}
          </p>
        )}
      </div>
      <div className="head-actions flex items-center gap-[9px] shrink-0">
        {children}
      </div>
    </div>
  );
}

export function SectionHead({
  title,
  description,
  action,
  onClick,
  className = "",
  ...props
}: {
  title: string;
  description?: string;
  action?: string;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`section-head flex justify-between items-center gap-3 my-[25px] mb-4 ${className}`}
      {...props}
    >
      <div>
        <h2 className="text-[16px] font-[650] tracking-[-0.3px] mb-0 mt-0 leading-[1.5]">
          {title}
        </h2>
        {description && (
          <p className="text-[#a59ea9] text-[10px] mb-0 mt-1">{description}</p>
        )}
      </div>
      {action && (
        <button
          className="section-action text-[11px] font-medium text-[#8464ae] p-0 hover:underline"
          onClick={onClick}
          type="button"
        >
          {action}
        </button>
      )}
    </div>
  );
}
