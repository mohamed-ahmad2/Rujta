import apiClient from "../../../../shared/api/apiClient";

export const getAdminNotifications = () => {
    return apiClient.get("/notification/pharmacy"); // ✅ change this
};

export const markAdminNotificationAsRead = (id) => {
    return apiClient.put(`/notification/${id}/read`);
};