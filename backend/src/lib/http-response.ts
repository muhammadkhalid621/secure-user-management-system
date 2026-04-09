import type { Response } from "express";
import { HTTP_STATUS, RESPONSE_FLAG } from "../constants/http.js";

type SuccessPayload = {
  message?: string;
  data?: unknown;
};

const buildBody = ({ message, data }: SuccessPayload) => ({
  success: RESPONSE_FLAG.SUCCESS,
  ...(message ? { message } : {}),
  ...(data !== undefined ? { data } : {})
});

export const ok = (res: Response, payload: SuccessPayload = {}) =>
  res.json(buildBody(payload));

export const created = (res: Response, payload: SuccessPayload = {}) =>
  res.status(HTTP_STATUS.CREATED).json(buildBody(payload));
