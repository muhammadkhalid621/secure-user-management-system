import { cn } from "@/lib/utils";

export const FiltersBar = ({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]", className)}>
    {children}
  </div>
);
