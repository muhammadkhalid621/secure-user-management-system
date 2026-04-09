export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type AuthField = "name" | "email" | "password";
export type UserField = "name" | "email" | "password";
export type RoleField = "name" | "slug";
export type ProfileField = "name" | "email";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slugPattern = /^[a-z0-9-]+$/;

export const validateEmail = (value: string) =>
  emailPattern.test(value.trim().toLowerCase()) ? undefined : "Enter a valid email address.";

export const validatePassword = (value: string) =>
  value.trim().length >= 8 ? undefined : "Password must be at least 8 characters.";

export const validateRequired = (value: string, label: string, minLength = 1) =>
  value.trim().length >= minLength
    ? undefined
    : `${label} must be at least ${minLength} characters.`;

export const validateSlug = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (normalized.length < 2) {
    return "Slug must be at least 2 characters.";
  }

  return slugPattern.test(normalized)
    ? undefined
    : "Slug can only contain lowercase letters, numbers, and hyphens.";
};

export const hasValidationErrors = <T extends string>(errors: FieldErrors<T>) =>
  Object.values(errors).some(Boolean);

export const setFieldError = <T extends string>(
  current: FieldErrors<T>,
  key: T,
  message?: string
) => ({
  ...current,
  [key]: message
});

export const validateAuthFields = (
  mode: "login" | "register",
  input: { name?: string; email: string; password: string }
): FieldErrors<AuthField> => ({
  ...(mode === "register" ? { name: validateRequired(input.name ?? "", "Full name", 2) } : {}),
  email: validateEmail(input.email),
  password: validatePassword(input.password)
});

export const validateUserFields = (
  input: { name: string; email: string; password: string },
  editing: boolean
): FieldErrors<UserField> => ({
  name: validateRequired(input.name, "Full name", 2),
  email: validateEmail(input.email),
  ...(editing ? {} : { password: validatePassword(input.password) })
});

export const validateRoleFields = (input: {
  name: string;
  slug: string;
}): FieldErrors<RoleField> => ({
  name: validateRequired(input.name, "Role name", 2),
  slug: validateSlug(input.slug)
});

export const validateProfileFields = (input: {
  name: string;
  email: string;
}): FieldErrors<ProfileField> => ({
  name: validateRequired(input.name, "Full name", 2),
  email: validateEmail(input.email)
});
