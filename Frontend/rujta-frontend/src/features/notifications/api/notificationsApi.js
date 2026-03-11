import apiClient from "../../../shared/api/apiClient";

// ================= Get My Notifications =================
export const getMyNotifications = () => {
  // لاحظ إننا صححنا ال-route عشان ي match مع controller
  return apiClient.get("/notification");
};

// ================= Mark As Read =================
export const markNotificationAsRead = (id) => {
  return apiClient.put(`/notification/${id}/read`);
};

// ================= Create Test Notification =================
export const createTestNotification = (title, message) => {
  return apiClient.post(
    "/notification/test",
    { title, message },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};