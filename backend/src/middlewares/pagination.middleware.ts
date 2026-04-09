import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { parseListQuery, type ListQuery } from "../lib/list-query.js";

export type ListQueryRequest = Request & {
  listQuery?: ListQuery;
};

export const paginationGuard =
  ({
    allowedSortBy,
    defaultSortBy,
    allowedFilters = []
  }: {
    allowedSortBy: string[];
    defaultSortBy: string;
    allowedFilters?: string[];
  }) =>
  (req: ListQueryRequest, _res: Response, next: NextFunction) => {
    try {
      req.listQuery = parseListQuery({
        query: req.query as Record<string, unknown>,
        allowedSortBy,
        defaultSortBy,
        defaultPage: config.pagination.defaultPage,
        defaultLimit: config.pagination.defaultLimit,
        maxLimit: config.pagination.maxLimit,
        allowedFilters
      });

      next();
    } catch (error) {
      next(error);
    }
  };

