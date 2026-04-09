import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext, getRouteHandlers, runHandlers } from "../helpers/router.js";

const auditLogServiceMock = {
  list: vi.fn()
};

const authServiceMock = {
  verifyAccessToken: vi.fn(),
  resolveAuthContext: vi.fn()
};

vi.mock("../../src/modules/audit-logs/audit-log.service.js", () => ({
  auditLogService: auditLogServiceMock
}));

vi.mock("../../src/modules/auth/auth.service.js", () => ({
  authService: authServiceMock
}));

const { auditLogsRouter } = await import("../../src/routes/audit-logs.routes.js");

describe("audit logs routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authServiceMock.verifyAccessToken.mockReturnValue({
      sub: "admin-1",
      email: "admin@example.com",
      type: "access",
      exp: Date.now() / 1000 + 900,
      iat: Date.now() / 1000
    });
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "admin-1",
      email: "admin@example.com",
      roles: ["admin"],
      permissions: ["audit-logs.read"]
    });
  });

  it("lists audit logs with meta", async () => {
    auditLogServiceMock.list.mockResolvedValue({
      rows: [{ id: "log-1", action: "auth.login.success" }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });

    const handlers = getRouteHandlers(auditLogsRouter, "get", "/");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" },
      query: {
        page: "1",
        limit: "10",
        search: "login",
        level: "info"
      }
    });

    await runHandlers(handlers, req, res);

    expect(auditLogServiceMock.list).toHaveBeenCalled();
    expect(res.body).toMatchObject({
      success: true,
      data: [{ id: "log-1", action: "auth.login.success" }],
      meta: { page: 1, total: 1 }
    });
  });
});
