import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES } from "../../src/constants/error-codes.js";
import { SUCCESS_MESSAGES } from "../../src/constants/messages.js";
import { AppError } from "../../src/errors/app-error.js";
import { createMockContext, getRouteHandlers, runHandlers } from "../helpers/router.js";

const authServiceMock = {
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
  logoutWithAudit: vi.fn(),
  getProfile: vi.fn(),
  verifyAccessToken: vi.fn(),
  resolveAuthContext: vi.fn()
};

vi.mock("../../src/modules/auth/auth.service.js", () => ({
  authService: authServiceMock
}));

vi.mock("../../src/middlewares/rate-limit.middleware.js", () => ({
  createRateLimitMiddleware: () => (_req: unknown, _res: unknown, next: (error?: unknown) => void) => next()
}));

const { authRouter } = await import("../../src/routes/auth.routes.js");

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a user", async () => {
    authServiceMock.register.mockResolvedValue({ id: "u1" });
    const handlers = getRouteHandlers(authRouter, "post", "/register");
    const { req, res } = createMockContext({
      body: { name: "Jane Doe", email: "jane@example.com", password: "Password123" }
    });

    await runHandlers(handlers, req, res);

    expect(authServiceMock.register).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      message: SUCCESS_MESSAGES.AUTH.REGISTERED
    });
  });

  it("rejects invalid register payload", async () => {
    const handlers = getRouteHandlers(authRouter, "post", "/register");
    const { req, res } = createMockContext({
      body: { name: "", email: "bad", password: "123" }
    });

    await expect(runHandlers(handlers, req, res)).rejects.toBeInstanceOf(AppError);
  });

  it("logs in", async () => {
    authServiceMock.login.mockResolvedValue({ tokens: { accessToken: "a" } });
    const handlers = getRouteHandlers(authRouter, "post", "/login");
    const { req, res } = createMockContext({
      body: { email: "jane@example.com", password: "Password123" }
    });

    await runHandlers(handlers, req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: SUCCESS_MESSAGES.AUTH.LOGIN
    });
  });

  it("refreshes a token", async () => {
    authServiceMock.refresh.mockResolvedValue({ tokens: { accessToken: "next" } });
    const handlers = getRouteHandlers(authRouter, "post", "/refresh");
    const { req, res } = createMockContext({
      body: { refreshToken: "refresh-token" }
    });

    await runHandlers(handlers, req, res);

    expect(res.body).toMatchObject({
      success: true,
      message: SUCCESS_MESSAGES.AUTH.REFRESH
    });
  });

  it("requires auth for logout", async () => {
    const handlers = getRouteHandlers(authRouter, "post", "/logout");
    const { req, res } = createMockContext({
      body: { refreshToken: "refresh-token" }
    });

    await expect(runHandlers(handlers, req, res)).rejects.toMatchObject({
      code: ERROR_CODES.UNAUTHORIZED
    });
  });

  it("logs out with auth", async () => {
    authServiceMock.verifyAccessToken.mockReturnValue({
      sub: "u1",
      email: "jane@example.com",
      type: "access",
      exp: Date.now() / 1000 + 900,
      iat: Date.now() / 1000
    });
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "u1",
      email: "jane@example.com",
      roles: ["user"],
      permissions: ["auth.logout"]
    });

    const handlers = getRouteHandlers(authRouter, "post", "/logout");
    const { req, res } = createMockContext({
      body: { refreshToken: "refresh-token" },
      headers: { authorization: "Bearer token" }
    });

    await runHandlers(handlers, req, res);

    expect(authServiceMock.logoutWithAudit).toHaveBeenCalled();
    expect(res.body).toMatchObject({
      success: true,
      message: SUCCESS_MESSAGES.AUTH.LOGOUT
    });
  });

  it("returns profile for authenticated user", async () => {
    authServiceMock.verifyAccessToken.mockReturnValue({
      sub: "u1",
      email: "jane@example.com",
      type: "access",
      exp: Date.now() / 1000 + 900,
      iat: Date.now() / 1000
    });
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "u1",
      email: "jane@example.com",
      roles: ["user"],
      permissions: ["auth.profile.read"]
    });
    authServiceMock.getProfile.mockResolvedValue({ id: "u1" });

    const handlers = getRouteHandlers(authRouter, "get", "/profile");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" }
    });

    await runHandlers(handlers, req, res);

    expect(authServiceMock.getProfile).toHaveBeenCalledWith("u1");
    expect(res.body).toMatchObject({
      success: true,
      data: { id: "u1" }
    });
  });
});

