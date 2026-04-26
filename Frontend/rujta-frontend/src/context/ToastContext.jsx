// src/context/ToastContext.jsx
import { createContext } from "react";

export const ToastContext = createContext({
  showToast: () => {},
});