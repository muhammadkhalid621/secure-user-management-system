import { AppError } from "../errors/app-error.js";
import { SORT_ORDERS, type SortOrder } from "../constants/pagination.js";

type QueryRecord = Record<string, unknown>;

const getQueryValue = (query: QueryRecord, key: string): string | undefined => {
  const value = query[key];

  if (typeof value === "string") {
    return value.trim();
  }

  return undefined;
};

const parsePositiveInt = (
  value: string | undefined,
  fallback: number,
  key: string
): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`Invalid query param: ${key}`, 400, "VALIDATION_ERROR");
  }

  return parsed;
};

export type ListQuery = {
  page: number;
  limit: number;
  offset: number;
  search?: string;
  sortBy: string;
  sortOrder: SortOrder;
  filters: Record<string, string>;
};

export const parseListQuery = ({
  query,
  allowedSortBy,
  defaultSortBy,
  defaultPage,
  defaultLimit,
  maxLimit,
  allowedFilters = []
}: {
  query: QueryRecord;
  allowedSortBy: string[];
  defaultSortBy: string;
  defaultPage: number;
  defaultLimit: number;
  maxLimit: number;
  allowedFilters?: string[];
}): ListQuery => {
  const page = parsePositiveInt(getQueryValue(query, "page"), defaultPage, "page");
  const limit = Math.min(
    parsePositiveInt(getQueryValue(query, "limit"), defaultLimit, "limit"),
    maxLimit
  );
  const sortBy = getQueryValue(query, "sortBy") ?? defaultSortBy;
  const sortOrderValue = (getQueryValue(query, "sortOrder") ?? SORT_ORDERS.DESC).toLowerCase();

  if (!allowedSortBy.includes(sortBy)) {
    throw new AppError("Invalid sortBy value", 400, "VALIDATION_ERROR");
  }

  if (sortOrderValue !== SORT_ORDERS.ASC && sortOrderValue !== SORT_ORDERS.DESC) {
    throw new AppError("Invalid sortOrder value", 400, "VALIDATION_ERROR");
  }

  const filters = allowedFilters.reduce<Record<string, string>>((acc, filterKey) => {
    const value = getQueryValue(query, filterKey);

    if (value) {
      acc[filterKey] = value;
    }

    return acc;
  }, {});

  const search = getQueryValue(query, "search") || undefined;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    search,
    sortBy,
    sortOrder: sortOrderValue,
    filters
  };
};

export const buildPaginationMeta = ({
  page,
  limit,
  total
}: {
  page: number;
  limit: number;
  total: number;
}) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit))
});

