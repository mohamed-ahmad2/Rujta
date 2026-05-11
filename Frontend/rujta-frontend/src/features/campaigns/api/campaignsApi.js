import apiClient from "../../../shared/api/apiClient";

const toAdDto = (data) => ({
  templateName:  data.templateName  ?? "",
  badge:         data.badge         ?? "",
  adMode:        data.adMode        ?? "medicine",
  medicineId:    data.medicineId    ?? null,
  medicineName:  data.medicineName  ?? null,
  medicineImage: data.medicineImage ?? null,
  category:      data.category      ?? null,
  headline:      data.headline      ?? "",
  subtext:       data.subtext       ?? "",
  ctaLabel:      data.ctaLabel      ?? "",
  colorFrom:     data.colorFrom     ?? "#0ea5e9",
  colorTo:       data.colorTo       ?? "#0369a1",
  colorAccent:   data.colorAccent   ?? "#38bdf8",
  fontLabel:     data.fontLabel     ?? "Modern Sans",
  price:         data.price         ?? 0,
  durationDays:  data.durationDays  ?? 1,
  startsAt:      null,   // ✅ never set on creation — backend sets on activation
  expiresAt:     null,   // ✅ never set on creation — backend sets on activation
  isActive:      false,  // ✅ always false until payment succeeds
});

export const getAllAds      = ()       => apiClient.get("/ads");
export const getAdById      = (id)     => apiClient.get(`/ads/${id}`);
export const getActiveAds   = ()       => apiClient.get("/ads");
export const getAdsByPharmacy = (id)   => apiClient.get(`/ads/pharmacy/${id}`);

export const createAd = (data) => {
  const dto = toAdDto(data);
  console.log("📤 createAd → wire payload:", JSON.stringify(dto, null, 2));
  return apiClient.post("/ads", dto, {
    headers: { "Content-Type": "application/json" },
  });
};

export const updateAd = (id, data) =>
  apiClient.put(`/ads/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteAd      = (id)           => apiClient.delete(`/ads/${id}`);
export const toggleAdStatus = (id, isActive) =>
  apiClient.patch(`/ads/${id}/status`, { isActive }, {
    headers: { "Content-Type": "application/json" },
  });