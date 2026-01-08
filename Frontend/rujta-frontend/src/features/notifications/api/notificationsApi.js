import apiClient from "../../../shared/api/apiClient";

// ================= Get My Notifications =================
export const getMyNotifications = () => {
  return apiClient.get("/notification");
};

// ================= Mark As Read =================
export const markNotificationAsRead = (id) => {
  return apiClient.put(`/notification/${id}/read`);
};

// ================= Create Test Notification (DEV) =================
export const createTestNotification = (message) => {
  return apiClient.post("/notification/test", message, {
    headers: { "Content-Type": "application/json" },
  });
};
