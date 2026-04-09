export type FieldErrors<T extends string> = Partial<Record<T, string>>;

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
