import { cn } from "@/lib/utils";

export const FormField = ({
  label,
  hint,
  className,
  children
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={cn("block space-y-2", className)}>
    <div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
    {children}
  </label>
);
