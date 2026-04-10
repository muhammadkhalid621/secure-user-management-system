"use client";

import type { MouseEvent } from "react";
import { X } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastCloseButton = ({
  closeToast
}: {
  closeToast?: (event: MouseEvent<HTMLElement>) => void;
}) => (
  <button
    type="button"
    onClick={(event) => closeToast?.(event)}
    aria-label="Close notification"
    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
  >
    <X className="h-4 w-4" />
  </button>
);

export const AppToastContainer = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    theme="light"
    closeButton={ToastCloseButton}
    hideProgressBar
    className="app-toast-container"
    toastClassName={() =>
      "app-toast pointer-events-auto flex min-h-16 w-full items-start gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-panel"
    }
    bodyClassName={() =>
      "app-toast-body m-0 flex-1 p-0 text-sm font-medium leading-5 text-slate-700 md:text-[15px]"
    }
  />
);
