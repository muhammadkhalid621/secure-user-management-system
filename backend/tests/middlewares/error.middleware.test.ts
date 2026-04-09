import { describe, expect, it, vi, beforeEach } from "vitest";
import { ERROR_CODES } from "../../src/constants/error-codes.js";
import { HTTP_STATUS } from "../../src/constants/http.js";
import { ERROR_MESSAGES } from "../../src/constants/messages.js";
import { AppError } from "../../src/errors/app-error.js";
import { createMockContext } from "../helpers/router.js";

const auditLogServiceMock = {
  record: vi.fn()
};

vi.mock("../../src/modules/audit-logs/audit-log.service.js", () => ({
  auditLogService: auditLogServiceMock
}));

const { errorHandler } = await import("../../src/middlewares/error.middleware.js");

describe("error middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditLogServiceMock.record.mockResolvedValue(undefined);
  });

  it("returns app errors and records them", async () => {
    const { req, res } = createMockContext({
      auth: { userId: "user-1" }
    });

    errorHandler(
      new AppError("Invalid input", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR),
      req as never,
      res as never,
      vi.fn()
    );

    await Promise.resolve();

    expect(res.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Invalid input"
      }
    });
    expect(auditLogServiceMock.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: "user-1",
        entityType: "api",
        action: "api.error",
        level: "warn",
        metadata: expect.objectContaining({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.VALIDATION_ERROR
        })
      })
    );
  });

  it("returns internal server errors and records them", async () => {
    const { req, res } = createMockContext();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    errorHandler(
      new Error("boom"),
      req as never,
      res as never,
      vi.fn()
    );

    await Promise.resolve();

    expect(res.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
      }
    });
    expect(auditLogServiceMock.record).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "api",
        action: "api.error",
        level: "error",
        metadata: expect.objectContaining({
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          code: ERROR_CODES.INTERNAL_SERVER_ERROR
        })
      })
    );

    consoleErrorSpy.mockRestore();
  });
});
