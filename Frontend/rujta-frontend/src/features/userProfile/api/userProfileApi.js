// src/features/user/api/userProfileApi.js
import apiClient from "../../../shared/api/apiClient";
export const getUserProfile = () => {
return apiClient.get("/UserProfile/me");
};
export const updateUserProfile = (data) => {
return apiClient.put("/UserProfile/update", data);
};