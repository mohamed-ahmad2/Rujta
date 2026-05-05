// src/context/useNotification.js
import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};