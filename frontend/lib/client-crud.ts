import { fetchJson, buildQueryString } from "./api";
import type { ApiSuccessResponse, CollectionResult } from "./types";

export const loadCollection = async <T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<CollectionResult<T>> => {
  const query = buildQueryString(params ?? {});
  const response = await fetchJson<ApiSuccessResponse<T[]>>(`${path}${query}`);
  return {
    rows: response.data,
    meta: response.meta
  };
};

export const submitEntity = async ({
  path,
  method,
  payload
}: {
  path: string;
  method: "POST" | "PUT" | "DELETE";
  payload?: unknown;
}) =>
  fetchJson(path, {
    method,
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) })
  });
