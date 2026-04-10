"use client";

import { toast } from "react-toastify";

export { AppToastContainer } from "./toast-container";

export const appToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message)
};
