"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastProvider = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    theme="light"
    toastClassName={() =>
      "rounded-[20px] border border-slate-200 bg-white text-slate-900 shadow-panel"
    }
    bodyClassName={() => "text-sm font-medium"}
  />
);
