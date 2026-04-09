import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/lib/types";
import { Button } from "./button";

export const PaginationControls = ({
  meta,
  onPageChange
}: {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}) => {
  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-200/70 pt-4">
      <p className="text-sm text-slate-500">
        Page {meta.page} of {meta.totalPages} · {meta.total} records
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
