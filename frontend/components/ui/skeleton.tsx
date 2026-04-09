import { cn } from "@/lib/utils";

export const Skeleton = ({
  className
}: {
  className?: string;
}) => <div className={cn("animate-pulse rounded-2xl bg-slate-200/80", className)} />;
