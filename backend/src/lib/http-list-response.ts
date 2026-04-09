import type { Response } from "express";
import { RESPONSE_FLAG } from "../constants/http.js";

export const okWithMeta = (
  res: Response,
  payload: {
    data: unknown;
    meta: unknown;
    message?: string;
  }
) =>
  res.json({
    success: RESPONSE_FLAG.SUCCESS,
    ...(payload.message ? { message: payload.message } : {}),
    data: payload.data,
    meta: payload.meta
  });
