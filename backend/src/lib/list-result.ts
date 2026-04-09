import { buildPaginationMeta, type ListQuery } from "./list-query.js";

export const buildListResult = <TRow>({
  rows,
  count,
  listQuery
}: {
  rows: TRow[];
  count: number;
  listQuery?: ListQuery;
}) => ({
  rows,
  meta: buildPaginationMeta({
    page: listQuery?.page ?? 1,
    limit: listQuery?.limit ?? (count || 1),
    total: count
  })
});
