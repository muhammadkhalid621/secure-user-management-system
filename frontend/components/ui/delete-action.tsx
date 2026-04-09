"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmationDialog } from "./dialog";
import { Button } from "./button";

export const DeleteAction = ({
  title,
  description,
  onDelete
}: {
  title: string;
  description: string;
  onDelete: () => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label={title}>
        <Trash2 className="h-4 w-4" />
      </Button>
      <ConfirmationDialog
        open={open}
        title={title}
        description={description}
        confirmLabel="Delete"
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setOpen(false);
          }
        }}
        onConfirm={async () => {
          setIsSubmitting(true);

          try {
            await onDelete();
            setOpen(false);
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </>
  );
};
