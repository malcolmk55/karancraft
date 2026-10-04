"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth,
  size,
  className,
}: ModalProps) {
  const chosenWidth = size || maxWidth || "2xl";
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  }[chosenWidth];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop using Base-UI */}
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" />

        {/* Modal Viewport and Popup */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <Dialog.Popup
            className={cn(
              "relative w-full rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] flex flex-col overflow-hidden my-auto outline-none",
              maxWidthClasses,
              className
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
                <div className="min-w-0 flex-1">
                  {title && (
                    <Dialog.Title className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {title}
                    </Dialog.Title>
                  )}
                  {description && (
                    <Dialog.Description className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                <Dialog.Close
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                  aria-label="بستن پنجره"
                >
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
