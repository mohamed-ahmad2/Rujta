// src/features/notification/api/notificationsApi.js
import apiClient from "../../../shared/api/apiClient";

export const getMyNotifications = () => {
  return apiClient.get("/notification");
};

export const getUnreadCount = () => {
  return apiClient.get("/notification/unread-count");
};

export const markNotificationAsRead = (id) => {
  return apiClient.put(`/notification/${id}/read`);
};

export const getPharmacyNotifications = () => {
  return apiClient.get("/notification/pharmacy");
};

export const getPharmacyUnreadCount = () => {
  return apiClient.get("/notification/pharmacy/unread-count");
};

export const markPharmacyNotificationAsRead = (id) => {
  return apiClient.put(`/notification/pharmacy/${id}/read`);
};