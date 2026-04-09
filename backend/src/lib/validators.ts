import { AppError } from "../errors/app-error.js";
import { ERROR_CODES } from "../constants/error-codes.js";
import { HTTP_STATUS } from "../constants/http.js";
import { ERROR_MESSAGES, MESSAGE_BUILDERS } from "../constants/messages.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validationError = (message: string) =>
  new AppError(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);

const requireObjectBody = (body: unknown): Record<string, unknown> => {
  if (!isRecord(body)) {
    throw validationError(ERROR_MESSAGES.COMMON.REQUEST_BODY_OBJECT);
  }

  return body;
};

const stringField = (
  value: unknown,
  key: string,
  minLength = 1
): string => {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw validationError(MESSAGE_BUILDERS.invalidField(key));
  }

  return value.trim();
};

const optionalStringField = (value: unknown): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw validationError(ERROR_MESSAGES.COMMON.OPTIONAL_STRING_INVALID);
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const emailField = (value: unknown): string => {
  const email = stringField(value, "email");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw validationError(ERROR_MESSAGES.COMMON.INVALID_EMAIL);
  }

  return email.toLowerCase();
};

const passwordField = (value: unknown): string => {
  const password = stringField(value, "password", 8);

  if (password.length < 8) {
    throw validationError(ERROR_MESSAGES.COMMON.PASSWORD_MIN_LENGTH);
  }

  return password;
};

export const validateRegisterBody = (body: unknown) => {
  const normalizedBody = requireObjectBody(body);

  return {
    name: stringField(normalizedBody.name, "name", 2),
    email: emailField(normalizedBody.email),
    password: passwordField(normalizedBody.password)
  };
};

export const validateLoginBody = (body: unknown) => {
  const normalizedBody = requireObjectBody(body);

  return {
    email: emailField(normalizedBody.email),
    password: passwordField(normalizedBody.password)
  };
};

export const validateRefreshBody = (body: unknown) => {
  const normalizedBody = requireObjectBody(body);

  return {
    refreshToken: stringField(normalizedBody.refreshToken, "refreshToken")
  };
};

export const validateStringArray = (value: unknown, key: string): string[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw validationError(MESSAGE_BUILDERS.invalidField(key));
  }

  return Array.from(new Set(value.map((item) => item.trim())));
};

export const validateIdParam = (value: unknown, key = "id"): string =>
  stringField(value, key);

export const validateUserCreateBody = (body: unknown) => {
  const normalizedBody = requireObjectBody(body);

  return {
    name: stringField(normalizedBody.name, "name", 2),
    email: emailField(normalizedBody.email),
    password: passwordField(normalizedBody.password),
    roleIds:
      normalizedBody.roleIds === undefined
        ? undefined
        : validateStringArray(normalizedBody.roleIds, "roleIds")
  };
};

export const validateUserUpdateBody = (body: unknown) => {
  const normalizedBody = requireObjectBody(body);

  return {
    name: optionalStringField(normalizedBody.name),
    email:
      normalizedBody.email === undefined ? undefined : emailField(normalizedBody.email),
    roleIds:
      normalizedBody.roleIds === undefined
        ? undefined
        : validateStringArray(normalizedBody.roleIds, "roleIds")
  };
};

export const validateRoleCreateBody = (body: unknown) => {
  const normalizedBody = requireObjectBody(body);

  return {
    name: stringField(normalizedBody.name, "name", 2),
    slug: stringField(normalizedBody.slug, "slug", 2).toLowerCase(),
    description: optionalStringField(normalizedBody.description),
    permissionIds: validateStringArray(normalizedBody.permissionIds, "permissionIds")
  };
};

export const validateRoleUpdateBody = (body: unknown) => {
  const normalizedBody = requireObjectBody(body);

  return {
    name: optionalStringField(normalizedBody.name),
    slug:
      normalizedBody.slug === undefined
        ? undefined
        : stringField(normalizedBody.slug, "slug", 2).toLowerCase(),
    description:
      normalizedBody.description === undefined
        ? undefined
        : optionalStringField(normalizedBody.description) ?? null,
    permissionIds:
      normalizedBody.permissionIds === undefined
        ? undefined
        : validateStringArray(normalizedBody.permissionIds, "permissionIds")
  };
};
