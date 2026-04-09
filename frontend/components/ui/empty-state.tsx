import { Card, CardContent } from "./card";

export const EmptyState = ({
  title,
  description
}: {
  title: string;
  description: string;
}) => (
  <Card>
    <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-900">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-slate-600">{description}</p>
    </CardContent>
  </Card>
);
