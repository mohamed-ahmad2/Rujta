// src/context/NotificationContext.jsx
import { createContext } from "react";

export const NotificationContext = createContext({
  connection: null,
  notifications: [],
  setNotifications: () => {},
  lastConnectedAt: null, // ✅ add this

});