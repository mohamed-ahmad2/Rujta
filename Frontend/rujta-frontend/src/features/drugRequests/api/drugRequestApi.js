import apiClient from "../../../shared/api/apiClient";

export const getMyDrugRequests = () =>
  apiClient.get("/DrugRequest/my");

export const getAllDrugRequests = (status = null, pharmacyId = null) => {
  const params = {};
  if (status)     params.status     = status;
  if (pharmacyId) params.pharmacyId = pharmacyId;
  return apiClient.get("/DrugRequest", { params });
};

export const submitDrugRequest = (data) =>
  apiClient.post("/DrugRequest", data);

export const reviewDrugRequest = (id, data) =>
  apiClient.put(`/DrugRequest/${id}/review`, data);