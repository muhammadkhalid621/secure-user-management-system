import { AppError } from "../errors/app-error.js";

export const findOrThrow = <T>({
  value,
  message,
  statusCode,
  code
}: {
  value: T | null | undefined;
  message: string;
  statusCode: number;
  code: string;
}) => {
  if (!value) {
    throw new AppError(message, statusCode, code);
  }

  return value;
};
