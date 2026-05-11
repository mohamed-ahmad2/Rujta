// src/features/druginteraction/api/drugInteractionApi.js
import apiClient from "../../../shared/api/apiClient";

// الـ endpoint الأصلي — مش بنشيله عشان ممكن يتستخدم في حتة تانية
export const checkDrugInteractions = (data) => {
  return apiClient.post("/DrugInteraction/check", data);
};

// ✅ الجديد — بيشوف الـ interactions بين الأدوية في الأوردر الحالي مع بعضها
export const checkOrderInteractions = (data) => {
  return apiClient.post("/DrugInteraction/check-order", data);
};

// ✅ الجديد — بيقارن الأوردر الحالي بالأوردرات القديمة للـ user
export const checkHistoryInteractions = (data) => {
  return apiClient.post("/DrugInteraction/check-history", data);
};

export const getMlHealthStatus = () => {
  return apiClient.get("/DrugInteraction/health");
};