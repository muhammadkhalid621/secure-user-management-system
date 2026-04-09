import { Card, CardContent, CardHeader } from "./card";

export const DataTableShell = ({
  header,
  filters,
  table,
  pagination
}: {
  header: React.ReactNode;
  filters?: React.ReactNode;
  table: React.ReactNode;
  pagination?: React.ReactNode;
}) => (
  <Card>
    <CardHeader>{header}</CardHeader>
    <CardContent className="space-y-4">
      {filters}
      {table}
      {pagination}
    </CardContent>
  </Card>
);
