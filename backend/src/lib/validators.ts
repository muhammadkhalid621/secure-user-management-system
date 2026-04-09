import { AppError } from "../errors/app-error.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringField = (
  value: unknown,
  key: string,
  minLength = 1
): string => {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw new AppError(`Invalid field: ${key}`, 400, "VALIDATION_ERROR");
  }

  return value.trim();
};

const optionalStringField = (value: unknown): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError("Invalid optional string field", 400, "VALIDATION_ERROR");
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const emailField = (value: unknown): string => {
  const email = stringField(value, "email");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new AppError("Invalid email address", 400, "VALIDATION_ERROR");
  }

  return email.toLowerCase();
};

const passwordField = (value: unknown): string => {
  const password = stringField(value, "password", 8);

  if (password.length < 8) {
    throw new AppError(
      "Password must be at least 8 characters",
      400,
      "VALIDATION_ERROR"
    );
  }

  return password;
};

export const validateRegisterBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new AppError("Request body must be an object", 400, "VALIDATION_ERROR");
  }

  return {
    name: stringField(body.name, "name", 2),
    email: emailField(body.email),
    password: passwordField(body.password)
  };
};

export const validateLoginBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new AppError("Request body must be an object", 400, "VALIDATION_ERROR");
  }

  return {
    email: emailField(body.email),
    password: passwordField(body.password)
  };
};

export const validateRefreshBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new AppError("Request body must be an object", 400, "VALIDATION_ERROR");
  }

  return {
    refreshToken: stringField(body.refreshToken, "refreshToken")
  };
};

export const validateStringArray = (value: unknown, key: string): string[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new AppError(`Invalid field: ${key}`, 400, "VALIDATION_ERROR");
  }

  return Array.from(new Set(value.map((item) => item.trim())));
};

export const validateIdParam = (value: unknown, key = "id"): string =>
  stringField(value, key);

export const validateUserCreateBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new AppError("Request body must be an object", 400, "VALIDATION_ERROR");
  }

  return {
    name: stringField(body.name, "name", 2),
    email: emailField(body.email),
    password: passwordField(body.password),
    roleIds:
      body.roleIds === undefined ? undefined : validateStringArray(body.roleIds, "roleIds")
  };
};

export const validateUserUpdateBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new AppError("Request body must be an object", 400, "VALIDATION_ERROR");
  }

  return {
    name: optionalStringField(body.name),
    email: body.email === undefined ? undefined : emailField(body.email),
    roleIds:
      body.roleIds === undefined ? undefined : validateStringArray(body.roleIds, "roleIds")
  };
};

export const validateRoleCreateBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new AppError("Request body must be an object", 400, "VALIDATION_ERROR");
  }

  return {
    name: stringField(body.name, "name", 2),
    slug: stringField(body.slug, "slug", 2).toLowerCase(),
    description: optionalStringField(body.description),
    permissionIds: validateStringArray(body.permissionIds, "permissionIds")
  };
};

export const validateRoleUpdateBody = (body: unknown) => {
  if (!isRecord(body)) {
    throw new AppError("Request body must be an object", 400, "VALIDATION_ERROR");
  }

  return {
    name: optionalStringField(body.name),
    slug: body.slug === undefined ? undefined : stringField(body.slug, "slug", 2).toLowerCase(),
    description: body.description === undefined ? undefined : optionalStringField(body.description) ?? null,
    permissionIds:
      body.permissionIds === undefined
        ? undefined
        : validateStringArray(body.permissionIds, "permissionIds")
  };
};
