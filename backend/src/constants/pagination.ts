export const SORT_ORDERS = {
  ASC: "asc",
  DESC: "desc"
} as const;

export type SortOrder = (typeof SORT_ORDERS)[keyof typeof SORT_ORDERS];

