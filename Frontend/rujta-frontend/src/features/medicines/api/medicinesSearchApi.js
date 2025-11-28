// src/features/medicines/api/medicinesSearchApi.js
import apiClient from "../../../shared/api/apiClient";

export const searchMedicines = (query, top = 10) => {
    return apiClient.get("/medicines/search", {
        params: { query, top },
    });
};
