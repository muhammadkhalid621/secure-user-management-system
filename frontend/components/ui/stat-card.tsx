import type { LucideIcon } from "lucide-react";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";

export const StatCard = ({
  label,
  value,
  detail,
  icon: Icon,
  accent
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  accent?: string;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">
            {value}
          </p>
        </div>
        <div className="rounded-3xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{detail}</p>
        {accent ? <Badge variant="secondary">{accent}</Badge> : null}
      </div>
    </CardContent>
  </Card>
);
