import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `${salt}:${derivedKey}`;
};

export const verifyPassword = (
  password: string,
  hashedPassword: string
): boolean => {
  const [salt, storedHash] = hashedPassword.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const suppliedHash = scryptSync(password, salt, KEY_LENGTH);
  const expectedHash = Buffer.from(storedHash, "hex");

  if (suppliedHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(suppliedHash, expectedHash);
};

