import type { ApiErrorResponse } from "./types";

export class FrontendApiError extends Error {
  constructor(
    message: string,
    public readonly code = "FRONTEND_API_ERROR",
    public readonly status = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "FrontendApiError";
  }
}

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse =>
  typeof value === "object" &&
  value !== null &&
  "success" in value &&
  (value as { success?: boolean }).success === false;

export const fetchJson = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const payload = (await response.json().catch(() => null)) as T | ApiErrorResponse | null;

  if (!response.ok) {
    if (payload && isApiErrorResponse(payload)) {
      throw new FrontendApiError(
        payload.error.message,
        payload.error.code,
        response.status,
        payload.error.details
      );
    }

    throw new FrontendApiError("Request failed", "REQUEST_FAILED", response.status);
  }

  return payload as T;
};

export const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};
