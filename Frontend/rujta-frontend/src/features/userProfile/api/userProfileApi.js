// src/features/user/api/userProfileApi.js
import apiClient from "../../../shared/api/apiClient";

export const getUserProfile = () => {
    return apiClient.get("/userprofile/me");
};

export const updateUserProfile = (data) => {
    return apiClient.put("/userprofile/update", data);
};
