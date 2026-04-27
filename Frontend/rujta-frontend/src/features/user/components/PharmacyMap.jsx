// src/features/pharmacies/components/PharmacyMap.jsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Icons ──────────────────────────────────────────────────────────────────────
const greenIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green.png",
  iconSize: [32, 32],
});
const blueIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png",
  iconSize: [32, 32],
});
const redIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
  iconSize: [32, 32],
});

// ── Palette ────────────────────────────────────────────────────────────────────
const ROUTE_PALETTE = [
  "#10B981", // emerald  ← الأفضل دايمًا
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#EF4444", // red
  "#3B82F6", // blue
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
  "#84CC16", // lime
  "#06B6D4", // cyan
  "#A855F7", // purple
];

const getPharmacyColor = (index) => ROUTE_PALETTE[index % ROUTE_PALETTE.length];

// ── Sub-components ─────────────────────────────────────────────────────────────
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
};

const MapInvalidator = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
};

const PharmacyBoundsUpdater = ({
  pharmacies,
  userLocation,
  selectedPharmacy,
  deliveryAddressLocation,
}) => {
  const map = useMap();
  useEffect(() => {
    if (selectedPharmacy || !pharmacies?.length) return;
    const bounds = L.latLngBounds(
      pharmacies.map((p) => [p.latitude, p.longitude]),
    );
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
    if (deliveryAddressLocation)
      bounds.extend([deliveryAddressLocation.lat, deliveryAddressLocation.lng]);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [
    pharmacies,
    userLocation,
    selectedPharmacy,
    deliveryAddressLocation,
    map,
  ]);
  return null;
};

// ── Main ───────────────────────────────────────────────────────────────────────
const PharmacyMap = ({
  userLocation,
  pharmacies,
  selectedPharmacy,
  deliveryAddressLocation,
  deliveryAddress,
  hoveredPharmacyId,
  selectedPharmacies = [], // ← array of pharmacyId strings من useCheckout
  routeData = {},
}) => {
  const defaultLocation = { lat: 30.0444, lng: 31.2357 };

  const center = selectedPharmacy
    ? [selectedPharmacy.latitude, selectedPharmacy.longitude]
    : [
        userLocation?.lat ?? defaultLocation.lat,
        userLocation?.lng ?? defaultLocation.lng,
      ];

  // ── Color map ثابت لكل صيدلية ─────────────────────────────────────────────
  const colorMap = useMemo(() => {
    const m = {};
    pharmacies.forEach((p, i) => {
      m[p.pharmacyId] = getPharmacyColor(i);
    });
    return m;
  }, [pharmacies]);

  // ── Set سريع للـ lookup ────────────────────────────────────────────────────
  const selectedSet = useMemo(
    () => new Set(selectedPharmacies),
    [selectedPharmacies],
  );

  return (
    <div style={{ height: "100%", width: "100%", minHeight: "400px" }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        key={`${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInvalidator />
        <MapUpdater center={center} />
        <PharmacyBoundsUpdater
          pharmacies={pharmacies}
          userLocation={userLocation}
          selectedPharmacy={selectedPharmacy}
          deliveryAddressLocation={deliveryAddressLocation}
        />

        {/* ── User Marker ───────────────────────────────────────── */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>📌 Your Location</Popup>
          </Marker>
        )}

        {/* ── Delivery Address Marker ───────────────────────────── */}
        {deliveryAddressLocation && (
          <Marker
            position={[
              deliveryAddressLocation.lat,
              deliveryAddressLocation.lng,
            ]}
            icon={blueIcon}
          >
            <Popup>
              📍 Delivery Address
              <br />
              {deliveryAddress?.street}, {deliveryAddress?.buildingNo},{" "}
              {deliveryAddress?.city}, {deliveryAddress?.governorate}
            </Popup>
          </Marker>
        )}

        {/* ── Pharmacy Markers ──────────────────────────────────── */}
        {pharmacies.map((p, index) => {
          const isTop = index === 0;
          const isSelected = selectedSet.has(p.pharmacyId);
          const isHovered = p.pharmacyId === hoveredPharmacyId;
          const baseColor = colorMap[p.pharmacyId];

          // أيقونة مخصصة: أول صيدلية خضرا، المحددة/hovered بلون مميز، الباقي أحمر
          const icon = isTop
            ? greenIcon
            : isSelected || isHovered
              ? new L.DivIcon({
                  className: "",
                  html: `
                  <div style="
                    width:32px; height:32px;
                    background:${baseColor};
                    border:3px solid white;
                    border-radius:50% 50% 50% 0;
                    transform:rotate(-45deg);
                    box-shadow:0 2px 8px rgba(0,0,0,0.35);
                  "></div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                })
              : redIcon;

          return (
            <Marker
              key={p.pharmacyId}
              position={[p.latitude, p.longitude]}
              icon={icon}
            >
              <Popup>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: baseColor,
                      flexShrink: 0,
                    }}
                  />
                  <strong>
                    #{index + 1} {p.name}
                  </strong>
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: "#6B7280" }}>
                  📏 {p.distanceKm?.toFixed(2)} km
                </div>
                {isTop && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#10B981",
                    }}
                  >
                    ⭐ Best Match
                  </div>
                )}
                {isSelected && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: baseColor,
                    }}
                  >
                    ✓ Selected
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}

        {/* ── Routes / Polylines ────────────────────────────────── */}
        {pharmacies.map((p, index) => {
          const start = deliveryAddressLocation || userLocation;
          if (!start) return null;

          const isTop = index === 0;
          const isSelected = selectedSet.has(p.pharmacyId);
          const isHovered = p.pharmacyId === hoveredPharmacyId;

          // ✅ اعرض الـ route لو:
          //    1. أفضل صيدلية (دايمًا)
          //    2. محددة (checkbox أو order)   ← الجديد يثبت الـ path
          //    3. hover مؤقت
          const shouldShow = isTop || isSelected || isHovered;
          if (!shouldShow) return null;

          const route = routeData[p.pharmacyId];
          if (!route?.coordinates) return null;

          const baseColor = colorMap[p.pharmacyId];

          // ── Visual priority ──
          let weight = 4;
          let opacity = 0.6;
          let dash = undefined;

          if (isHovered && isSelected) {
            // محددة + hover → أقوى حالة
            weight = 9;
            opacity = 1;
            dash = undefined;
          } else if (isHovered) {
            // hover فقط (مش محددة)
            weight = 8;
            opacity = 0.9;
            dash = "12, 4";
          } else if (isTop && isSelected) {
            // أفضل صيدلية + محددة
            weight = 7;
            opacity = 1;
            dash = undefined;
          } else if (isTop) {
            // أفضل صيدلية فقط
            weight = 6;
            opacity = 0.95;
            dash = undefined;
          } else if (isSelected) {
            // محددة فقط (مش hover)
            weight = 5;
            opacity = 0.85;
            dash = "8, 4"; // dashed تشير إن دي selected
          }

          return (
            <Polyline
              key={`route-${p.pharmacyId}`}
              positions={route.coordinates}
              color={baseColor}
              weight={weight}
              opacity={opacity}
              dashArray={dash}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PharmacyMap;
