import type { ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "./icon";

export function Empty({
  title = "Chưa có nội dung",
  description = "Nội dung sẽ xuất hiện tại đây khi bạn bắt đầu.",
  children,
  action,
  onClick,
  className = "",
  ...props
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
  action?: string;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`empty px-5 py-[45px] text-center flex flex-col items-center justify-center min-h-[230px] w-full ${className}`}
      {...props}
    >
      <span className="icon-tile lavender mb-5 w-[43px] h-[43px] inline-flex items-center justify-center rounded-[11px] shrink-0">
        <Icon name="FolderOpen" size={28} />
      </span>
      <h3 className="text-base text-[#9b7dac] font-medium mt-0 mb-2.5">
        {title}
      </h3>
      {description && (
        <p className="text-[11px] max-w-[370px] text-[#baa1c8] mb-5 leading-[1.85]">
          {description}
        </p>
      )}
      {children}
      {action && onClick && (
        <Button onClick={onClick} kind="secondary">
          {action}
        </Button>
      )}
    </div>
  );
}
