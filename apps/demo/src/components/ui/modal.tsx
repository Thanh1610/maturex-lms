import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[#30293c55] backdrop-blur-[3px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    wide?: boolean;
    showClose?: boolean;
  }
>(({ className, children, wide = false, showClose = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "bg-white border border-[#e9deef] rounded-2xl max-sm:rounded-xl shadow-[0_25px_95px_#32243b25] max-h-[90vh] max-sm:max-h-[94vh] overflow-auto",
        wide ? "w-[780px] max-w-[95vw]" : "w-[580px] max-w-[95vw]",
        className,
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute right-5 top-5 inline-flex items-center justify-center w-8 h-8 rounded-[7px] shrink-0 text-[#81838e] hover:bg-[#f0edf8] hover:text-[var(--color-purple,#6b57bd)] transition-colors cursor-pointer focus:outline-none">
          <Icon name="X" size={18} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between gap-5 px-[25px] py-5 max-sm:px-5 max-sm:py-[17px] border-b border-[#ede4f4] sticky top-0 bg-white z-[3] rounded-t-2xl max-sm:rounded-t-xl",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-[17px] max-sm:text-[15px] text-[#9674aa] font-[550] m-0",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function Modal({ title, children, onClose, wide = false }: ModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent wide={wide} showClose={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <button
            type="button"
            className="icon-btn inline-flex items-center justify-center w-8 h-8 rounded-[7px] shrink-0 text-[#81838e] hover:bg-[#f0edf8] hover:text-[var(--color-purple,#6b57bd)] cursor-pointer"
            aria-label="Đóng hộp thoại"
            onClick={onClose}
          >
            <Icon name="X" size={18} />
          </button>
        </DialogHeader>
        <div className="modal-body p-[25px] max-sm:p-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
