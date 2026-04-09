import { describe, expect, it } from "vitest";
import { signJwt, verifyJwt } from "../../src/lib/jwt.js";
import { AUTH_TOKEN_TYPES } from "../../src/constants/auth.js";

describe("jwt helpers", () => {
  it("signs and verifies a token", () => {
    const token = signJwt(
      {
        sub: "user-1",
        email: "user@example.com",
        type: AUTH_TOKEN_TYPES.ACCESS
      },
      "test-secret",
      "15m"
    );

    const payload = verifyJwt(token, "test-secret");

    expect(payload.sub).toBe("user-1");
    expect(payload.email).toBe("user@example.com");
    expect(payload.type).toBe(AUTH_TOKEN_TYPES.ACCESS);
    expect(typeof payload.exp).toBe("number");
  });
});
