"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#1f1b2d] group-[.toaster]:border-[#e9eaf0] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl text-xs",
          description: "group-[.toast]:text-[#81838e] text-xs",
          actionButton:
            "group-[.toast]:bg-[#6b57bd] group-[.toast]:text-white text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-[#f0edf8] group-[.toast]:text-[#6b57bd] text-xs",
          success:
            "group-[.toaster]:border-[#cde8cf] group-[.toaster]:text-[#2c6e3b]",
          error:
            "group-[.toaster]:border-[#f2d0cc] group-[.toaster]:text-[#a83232]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
export { toast } from "sonner";
