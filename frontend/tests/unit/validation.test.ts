import {
  hasValidationErrors,
  validateAuthFields,
  validateProfileFields,
  validateRoleFields,
  validateUserFields
} from "@/lib/validation";

describe("validation helpers", () => {
  it("validates registration fields", () => {
    const result = validateAuthFields("register", {
      name: "A",
      email: "bad-email",
      password: "123"
    });

    expect(result.name).toBeDefined();
    expect(result.email).toBeDefined();
    expect(result.password).toBeDefined();
    expect(hasValidationErrors(result)).toBe(true);
  });

  it("allows a valid role payload", () => {
    const result = validateRoleFields({
      name: "Admin",
      slug: "admin"
    });

    expect(hasValidationErrors(result)).toBe(false);
  });

  it("requires a password when creating a user", () => {
    const result = validateUserFields(
      {
        name: "Jane Doe",
        email: "jane@example.com",
        password: ""
      },
      false
    );

    expect(result.password).toBeDefined();
  });

  it("accepts a valid profile payload", () => {
    const result = validateProfileFields({
      name: "Jane Doe",
      email: "jane@example.com"
    });

    expect(hasValidationErrors(result)).toBe(false);
  });
});
