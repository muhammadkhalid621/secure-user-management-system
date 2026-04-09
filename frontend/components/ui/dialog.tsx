"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export const Dialog = ({
  open,
  title,
  description,
  children,
  onClose,
  className
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className={cn("relative z-10 w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl", className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              {title}
            </h2>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmationDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  isSubmitting = false,
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  isSubmitting?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) => (
  <Dialog open={open} title={title} description={description} onClose={onClose}>
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant={tone === "danger" ? "default" : "secondary"}
        className={tone === "danger" ? "bg-red-600 text-white hover:bg-red-500" : undefined}
        onClick={() => {
          void onConfirm();
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Please wait..." : confirmLabel}
      </Button>
    </div>
  </Dialog>
);
