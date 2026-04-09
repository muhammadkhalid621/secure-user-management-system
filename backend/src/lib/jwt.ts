import { createHmac } from "node:crypto";
import { ERROR_CODES } from "../constants/error-codes.js";
import { HTTP_STATUS } from "../constants/http.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { AppError } from "../errors/app-error.js";

type JwtPayload = Record<string, unknown> & {
  exp: number;
  iat: number;
};

const base64UrlEncode = (value: string): string =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

export const parseDurationToSeconds = (value: string): number => {
  const match = value.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(`Unsupported token expiry format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    case "d":
      return amount * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported token expiry unit: ${unit}`);
  }
};

const signSegment = (header: string, payload: string, secret: string): string =>
  createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

export const signJwt = (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string
): string => {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + parseDurationToSeconds(expiresIn)
  };

  const encodedHeader = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = signSegment(encodedHeader, encodedPayload, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyJwt = (token: string, secret: string): JwtPayload => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.INVALID_TOKEN_FORMAT,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_TOKEN
    );
  }

  const expectedSignature = signSegment(header, payload, secret);

  if (signature !== expectedSignature) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.INVALID_TOKEN_SIGNATURE,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_TOKEN
    );
  }

  const decodedPayload = JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);

  if (decodedPayload.exp <= now) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.TOKEN_EXPIRED,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.TOKEN_EXPIRED
    );
  }

  return decodedPayload;
};
