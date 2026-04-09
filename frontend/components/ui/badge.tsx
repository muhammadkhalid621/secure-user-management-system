"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-slate-100 text-slate-600",
        destructive: "bg-red-100 text-red-700"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export const Badge = ({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);
