import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "./constants";
import { clearAuthCookies, setAuthCookies } from "./auth-cookies";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthPayload,
  AuthTokens,
  SafeUser
} from "./types";

const backendBaseUrl =
  process.env.NEXT_SERVER_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

const createBackendUrl = (path: string) =>
  `${backendBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

const withJsonHeaders = (headers?: HeadersInit, accessToken?: string) => {
  const normalizedHeaders = new Headers(headers);
  normalizedHeaders.set("Content-Type", "application/json");

  if (accessToken) {
    normalizedHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return normalizedHeaders;
};

const parseJsonSafely = async <T>(response: Response) => {
  return (await response.json().catch(() => null)) as T | null;
};

const createJsonResponse = (payload: unknown, status: number) =>
  NextResponse.json(payload, { status });

const refreshTokens = async (refreshToken: string) => {
  const response = await fetch(createBackendUrl("/auth/refresh"), {
    method: "POST",
    headers: withJsonHeaders(),
    body: JSON.stringify({ refreshToken }),
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const payload = await parseJsonSafely<ApiSuccessResponse<AuthPayload>>(response);
  return payload?.data.tokens ?? null;
};

export const requestBackend = async (
  path: string,
  init?: RequestInit,
  accessToken?: string
) =>
  fetch(createBackendUrl(path), {
    ...init,
    headers: withJsonHeaders(init?.headers, accessToken),
    cache: "no-store"
  });

export const proxyBackendRequest = async ({
  path,
  method,
  body,
  search
}: {
  path: string;
  method: string;
  body?: string;
  search?: string;
}) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

  const executeRequest = async (token?: string) =>
    requestBackend(`${path}${search ?? ""}`, {
      method,
      body
    }, token);

  let backendResponse = await executeRequest(accessToken);
  let rotatedTokens: AuthTokens | null = null;

  if (backendResponse.status === 401 && refreshToken) {
    rotatedTokens = await refreshTokens(refreshToken);

    if (rotatedTokens) {
      backendResponse = await executeRequest(rotatedTokens.accessToken);
    }
  }

  const payload = await backendResponse.text();
  const response = new NextResponse(payload, {
    status: backendResponse.status,
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (rotatedTokens) {
    setAuthCookies(response, rotatedTokens);
  }

  if (backendResponse.status === 401 && !rotatedTokens) {
    clearAuthCookies(response);
  }

  return response;
};

export const createAuthResponse = (
  payload: ApiSuccessResponse<AuthPayload>,
  options?: { clear?: boolean }
) => {
  const response = NextResponse.json(payload);

  if (options?.clear) {
    clearAuthCookies(response);
    return response;
  }

  setAuthCookies(response, payload.data.tokens);
  return response;
};

export const proxyAuthMutation = async ({
  backendPath,
  fallbackCode,
  fallbackMessage,
  request
}: {
  backendPath: string;
  fallbackCode: string;
  fallbackMessage: string;
  request: Request;
}) => {
  const body = await request.text();
  const backendResponse = await requestBackend(backendPath, {
    method: "POST",
    body
  });

  const payload = (await backendResponse.json().catch(() => null)) as
    | ApiSuccessResponse<AuthPayload>
    | ApiErrorResponse
    | null;

  if (!backendResponse.ok || !payload || !("success" in payload) || !payload.success) {
    return createJsonResponse(
      payload ?? {
        success: false,
        error: {
          code: fallbackCode,
          message: fallbackMessage
        }
      },
      backendResponse.status || 500
    );
  }

  return createAuthResponse(payload);
};

export const unauthorizedJson = () =>
  createJsonResponse(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized"
      }
    },
    401
  );

export const successJson = <T>(data: T) =>
  createJsonResponse(
    {
      success: true,
      data
    },
    200
  );

export const createCollectionHandlers = (path: string) => ({
  GET: (request: Request) =>
    proxyBackendRequest({
      path,
      method: "GET",
      search: new URL(request.url).search
    }),
  POST: async (request: Request) =>
    proxyBackendRequest({
      path,
      method: "POST",
      body: await request.text()
    })
});

export const createEntityHandlers = (pathFactory: (id: string) => string) => ({
  GET: async (
    request: Request,
    context: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await context.params;
    return proxyBackendRequest({
      path: pathFactory(id),
      method: "GET",
      search: new URL(request.url).search
    });
  },
  PUT: async (
    request: Request,
    context: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await context.params;
    return proxyBackendRequest({
      path: pathFactory(id),
      method: "PUT",
      body: await request.text()
    });
  },
  DELETE: async (
    _request: Request,
    context: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await context.params;
    return proxyBackendRequest({
      path: pathFactory(id),
      method: "DELETE"
    });
  }
});

export const getServerSession = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  let activeAccessToken = accessToken;

  let profileResponse = accessToken
    ? await requestBackend("/auth/profile", { method: "GET" }, accessToken)
    : new Response(null, { status: 401 });

  if (profileResponse.status === 401 && refreshToken) {
    const tokens = await refreshTokens(refreshToken);

    if (!tokens) {
      return null;
    }

    activeAccessToken = tokens.accessToken;
    profileResponse = await requestBackend("/auth/profile", { method: "GET" }, tokens.accessToken);
  }

  if (!profileResponse.ok) {
    return null;
  }

  const payload = await parseJsonSafely<ApiSuccessResponse<SafeUser>>(profileResponse);

  if (!payload) {
    return null;
  }

  return {
    user: payload.data,
    socketToken: activeAccessToken ?? null
  };
};

export const getServerSessionResponse = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!accessToken && !refreshToken) {
    return unauthorizedJson();
  }

  let activeAccessToken = accessToken;
  let rotatedTokens: AuthTokens | null = null;

  let profileResponse = accessToken
    ? await requestBackend("/auth/profile", { method: "GET" }, accessToken)
    : new Response(null, { status: 401 });

  if (profileResponse.status === 401 && refreshToken) {
    rotatedTokens = await refreshTokens(refreshToken);

    if (!rotatedTokens) {
      const response = unauthorizedJson();
      clearAuthCookies(response);
      return response;
    }

    activeAccessToken = rotatedTokens.accessToken;
    profileResponse = await requestBackend("/auth/profile", { method: "GET" }, rotatedTokens.accessToken);
  }

  if (!profileResponse.ok) {
    const response = unauthorizedJson();
    clearAuthCookies(response);
    return response;
  }

  const payload = await parseJsonSafely<ApiSuccessResponse<SafeUser>>(profileResponse);

  if (!payload) {
    const response = unauthorizedJson();
    clearAuthCookies(response);
    return response;
  }

  const response = successJson({
    user: payload.data,
    socketToken: activeAccessToken ?? null
  });

  if (rotatedTokens) {
    setAuthCookies(response, rotatedTokens);
  }

  return response;
};
