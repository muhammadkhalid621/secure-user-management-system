import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES } from "../../src/constants/error-codes.js";
import { SUCCESS_MESSAGES } from "../../src/constants/messages.js";
import { createMockContext, getRouteHandlers, runHandlers } from "../helpers/router.js";

const userServiceMock = {
  createFromInput: vi.fn(),
  list: vi.fn(),
  findSafeByIdOrThrow: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

const roleServiceMock = {
  ensureAllExist: vi.fn(),
  findByIdOrThrow: vi.fn()
};

const authServiceMock = {
  verifyAccessToken: vi.fn(),
  resolveAuthContext: vi.fn()
};

vi.mock("../../src/modules/users/user.service.js", () => ({
  userService: userServiceMock
}));

vi.mock("../../src/modules/roles/role.service.js", () => ({
  roleService: roleServiceMock
}));

vi.mock("../../src/modules/auth/auth.service.js", () => ({
  authService: authServiceMock
}));

vi.mock("../../src/middlewares/cache.middleware.js", () => ({
  cacheMiddleware: () => (_req: unknown, _res: unknown, next: (error?: unknown) => void) => next()
}));

const { usersRouter } = await import("../../src/routes/users.routes.js");

describe("users routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authServiceMock.verifyAccessToken.mockReturnValue({
      sub: "admin-1",
      email: "admin@example.com",
      type: "access",
      exp: Date.now() / 1000 + 900,
      iat: Date.now() / 1000
    });
  });

  it("creates a user", async () => {
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "admin-1",
      email: "admin@example.com",
      roles: ["admin"],
      permissions: ["users.create"]
    });
    userServiceMock.createFromInput.mockResolvedValue({ id: "u1" });

    const handlers = getRouteHandlers(usersRouter, "post", "/");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" },
      body: {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password123",
        roleIds: ["role-1"]
      }
    });

    await runHandlers(handlers, req, res);

    expect(roleServiceMock.ensureAllExist).toHaveBeenCalledWith(["role-1"]);
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      message: SUCCESS_MESSAGES.USERS.CREATED
    });
  });

  it("lists users with meta", async () => {
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "admin-1",
      email: "admin@example.com",
      roles: ["admin"],
      permissions: ["users.read"]
    });
    userServiceMock.list.mockResolvedValue({
      rows: [{ id: "u1" }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });

    const handlers = getRouteHandlers(usersRouter, "get", "/");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" },
      query: { page: "1", limit: "10" }
    });

    await runHandlers(handlers, req, res);

    expect(res.body).toMatchObject({
      success: true,
      data: [{ id: "u1" }],
      meta: { page: 1, total: 1 }
    });
  });

  it("gets own user profile", async () => {
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "u1",
      email: "u1@example.com",
      roles: ["user"],
      permissions: ["users.read.own"]
    });
    userServiceMock.findSafeByIdOrThrow.mockResolvedValue({ id: "u1" });

    const handlers = getRouteHandlers(usersRouter, "get", "/:id");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" },
      params: { id: "u1" }
    });

    await runHandlers(handlers, req, res);

    expect(res.body).toMatchObject({
      success: true,
      data: { id: "u1" }
    });
  });

  it("blocks role assignment update without elevated permission", async () => {
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "u1",
      email: "u1@example.com",
      roles: ["user"],
      permissions: ["users.update.own"]
    });

    const handlers = getRouteHandlers(usersRouter, "put", "/:id");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" },
      params: { id: "u1" },
      body: { roleIds: ["role-2"] }
    });

    await expect(runHandlers(handlers, req, res)).rejects.toMatchObject({
      code: ERROR_CODES.FORBIDDEN
    });
  });

  it("deletes a user", async () => {
    authServiceMock.resolveAuthContext.mockResolvedValue({
      userId: "admin-1",
      email: "admin@example.com",
      roles: ["admin"],
      permissions: ["users.delete"]
    });
    userServiceMock.delete.mockResolvedValue({ id: "u1" });

    const handlers = getRouteHandlers(usersRouter, "delete", "/:id");
    const { req, res } = createMockContext({
      headers: { authorization: "Bearer token" },
      params: { id: "u1" }
    });

    await runHandlers(handlers, req, res);

    expect(res.body).toMatchObject({
      success: true,
      message: SUCCESS_MESSAGES.USERS.DELETED
    });
  });
});

