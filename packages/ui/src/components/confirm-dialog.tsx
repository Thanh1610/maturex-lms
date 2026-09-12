"use client";

import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Icon } from "./icon";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Xác nhận hành động",
  description = "Bạn có chắc chắn muốn thực hiện hành động này? Thao tác này không thể hoàn tác.",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const isDestructive = variant === "destructive";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isLoading) return;
        onOpenChange(nextOpen);
        if (!nextOpen) onCancel?.();
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
              isDestructive
                ? "bg-red-50 text-red-600"
                : "bg-[#f3edf9] text-[#71548e]"
            }`}
          >
            <Icon
              name={isDestructive ? "AlertTriangle" : "HelpCircle"}
              size={20}
            />
          </div>
          <DialogTitle className="text-base font-semibold text-[#302143]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#7d708d] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            size="sm"
            className={`text-xs h-8 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#71548e] hover:bg-[#5e4379] text-white"
            }`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
