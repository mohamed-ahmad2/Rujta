import { createContext } from "react";

export const AdminNotificationContext = createContext({
  connection: null,
  notifications: [],
  setNotifications: () => {},
});