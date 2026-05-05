// src/features/campaigns/api/campaignsApi.js
import apiClient from "../../../shared/api/apiClient";

// ── Maps the frontend payload → exactly what AdDto expects ─────────────────
// AdDto fields: TemplateName, Badge, AdMode, MedicineId, MedicineName,
//               MedicineImage, Category, Headline, Subtext, CtaLabel,
//               ColorFrom, ColorTo, ColorAccent, FontLabel, IsActive
//
// NOTE: PharmacyId is injected server-side from the JWT claim — don't send it.
// NOTE: templateId, fontValue, durationDays, price are frontend-only — strip them.

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
  price:         data.price         ?? 0,      // ← add
  durationDays:  data.durationDays  ?? 1,      // ← add
  startsAt:      data.startsAt      ?? null,   // ← add
  expiresAt:     data.expiresAt     ?? null,   // ← add
  isActive:      false,
});

export const getAllAds = () =>
  apiClient.get("/ads");

export const getAdById = (id) =>
  apiClient.get(`/ads/${id}`);

export const getActiveAds = () =>
  apiClient.get("/ads");

export const getAdsByPharmacy = (pharmacyId) =>
  apiClient.get(`/ads/pharmacy/${pharmacyId}`);

export const createAd = (data) => {
  const dto = toAdDto(data);

  // ── Debug: confirm exactly what hits the wire ──────────────────────────────
  console.log("📤 createAd → wire payload:", JSON.stringify(dto, null, 2));

  return apiClient.post("/ads", dto, {
    headers: { "Content-Type": "application/json" },
  });
};

export const updateAd = (id, data) =>
  apiClient.put(`/ads/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteAd = (id) =>
  apiClient.delete(`/ads/${id}`);

export const toggleAdStatus = (id, isActive) =>
  apiClient.patch(`/ads/${id}/status`, { isActive }, {
    headers: { "Content-Type": "application/json" },
  });
