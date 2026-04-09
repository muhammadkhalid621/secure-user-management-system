import { Card, CardContent, CardHeader } from "./card";
import { Skeleton } from "./skeleton";

export const TableSkeleton = ({
  columns = 4,
  rows = 5,
  includeFilters = true
}: {
  columns?: number;
  rows?: number;
  includeFilters?: boolean;
}) => (
  <Card>
    <CardHeader className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </CardHeader>
    <CardContent className="space-y-4">
      {includeFilters ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : null}
      <div className="space-y-3 rounded-[28px] border border-slate-200/70 p-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton key={`cell-${rowIndex}-${columnIndex}`} className="h-10 w-full" />
            ))}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
