import { type ReactNode, useEffect, useRef } from "react";
import { Icon } from "./icon";

export interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function Modal({ title, children, onClose, wide = false }: ModalProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const nodes = ref.current.querySelectorAll(
          'button:not([disabled]),a,input,select,textarea,[tabindex="0"]',
        );
        const first = nodes[0] as HTMLElement | undefined,
          last = nodes[nodes.length - 1] as HTMLElement | undefined;
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop fixed inset-0 bg-[#30293c55] backdrop-blur-[3px] z-[100] flex items-center justify-center p-7 max-sm:p-3"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        ref={ref}
        className={`modal ${wide ? "wide w-[780px]" : "w-[580px]"} max-w-full max-h-[90vh] max-sm:max-h-[94vh] bg-white border border-[#e9deef] rounded-2xl max-sm:rounded-xl shadow-[0_25px_95px_#32243b25] overflow-auto`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between gap-5 px-[25px] py-5 max-sm:px-5 max-sm:py-[17px] border-b border-[#ede4f4] sticky top-0 bg-white z-[3] rounded-t-2xl max-sm:rounded-t-xl">
          <h2 className="text-[17px] max-sm:text-[15px] text-[#9674aa] font-[550] m-0">
            {title}
          </h2>
          <button
            className="icon-btn inline-flex items-center justify-center w-8 h-8 rounded-[7px] shrink-0 text-[#81838e] hover:bg-[#f0edf8] hover:text-[var(--purple,#6b57bd)] cursor-pointer"
            aria-label="Đóng hộp thoại"
            onClick={onClose}
          >
            <Icon name="X" />
          </button>
        </header>
        <div className="modal-body p-[25px] max-sm:p-5">{children}</div>
      </section>
    </div>
  );
}
