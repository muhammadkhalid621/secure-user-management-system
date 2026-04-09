import { Card, CardContent, CardHeader, CardTitle } from "./card";

type SeriesDatum = {
  label: string;
  value: number;
  toneClassName?: string;
};

export const BarChartCard = ({
  title,
  description,
  series
}: {
  title: string;
  description: string;
  series: SeriesDatum[];
}) => {
  const maxValue = Math.max(...series.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {series.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">{item.value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full ${item.toneClassName ?? "bg-primary"}`}
                style={{ width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 10 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
