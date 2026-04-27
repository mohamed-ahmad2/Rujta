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
import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Palette ─────────────────────────────────────────────────────────────────── */
const ROUTE_PALETTE = [
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
  "#06B6D4",
  "#A855F7",
];
const getPharmacyColor = (i) => ROUTE_PALETTE[i % ROUTE_PALETTE.length];

/* ── Uniform Pin Icon ────────────────────────────────────────────────────────── */
const makePinIcon = (color, { selected = false, hovered = false } = {}) => {
  const size = hovered ? 40 : selected ? 36 : 30;
  const h = Math.round(size * 1.43);
  const innerR = hovered ? 8 : selected ? 7 : 6;
  const sw = selected || hovered ? 2.5 : 1.8;
  const glow = hovered ? 14 : selected ? 10 : 5;

  return new L.DivIcon({
    className: "",
    html: `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="${size}" height="${h}" viewBox="0 0 28 40"
           style="filter:drop-shadow(0 2px ${glow}px rgba(0,0,0,.42));
                  transition:all .18s ease">
        <path
          d="M14 .6C6.6.6.6 6.6.6 14 .6 24.7 14 39.4 14 39.4S27.4 24.7 27.4 14C27.4 6.6 21.4.6 14 .6z"
          fill="${color}" stroke="white" stroke-width="${sw}"
        />
        <circle cx="14" cy="14" r="${innerR}" fill="white" opacity=".94"/>
        ${
          selected
            ? `<path d="M10 14l3 3 5-5.5"
                   stroke="${color}" stroke-width="2.2"
                   stroke-linecap="round" stroke-linejoin="round"
                   fill="none"/>`
            : ""
        }
      </svg>`,
    iconSize: [size, h],
    iconAnchor: [size / 2, h],
    popupAnchor: [0, -h],
  });
};

/* ── User Dot ────────────────────────────────────────────────────────────────── */
const USER_ICON = new L.DivIcon({
  className: "",
  html: `
    <div style="position:relative;width:22px;height:22px">
      <div style="position:absolute;inset:-8px;border-radius:50%;
                  background:rgba(59,130,246,.15)"></div>
      <div style="position:absolute;inset:0;border-radius:50%;
                  background:#3B82F6;border:3px solid white;
                  box-shadow:0 0 0 4px rgba(59,130,246,.25),0 2px 8px rgba(0,0,0,.3)">
      </div>
    </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -15],
});

/* ── Delivery Icon ───────────────────────────────────────────────────────────── */
const DELIVERY_ICON = new L.DivIcon({
  className: "",
  html: `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="34" height="48" viewBox="0 0 28 40"
         style="filter:drop-shadow(0 3px 10px rgba(0,0,0,.45))">
      <path d="M14 .6C6.6.6.6 6.6.6 14 .6 24.7 14 39.4 14 39.4S27.4 24.7 27.4 14C27.4 6.6 21.4.6 14 .6z"
            fill="#6366F1" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="7.5" fill="white" opacity=".94"/>
      <path d="M14 8l-6 5.5h1.8v7.2h4.2v-4h2v4h4.2v-7.2H22L14 8z"
            fill="#6366F1" opacity=".85"/>
    </svg>`,
  iconSize: [34, 48],
  iconAnchor: [17, 48],
  popupAnchor: [0, -48],
});

/* ── Sub-components ──────────────────────────────────────────────────────────── */
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

/* ── Main ────────────────────────────────────────────────────────────────────── */
const PharmacyMap = ({
  userLocation,
  pharmacies,
  selectedPharmacy,
  deliveryAddressLocation,
  deliveryAddress,
  hoveredPharmacyId,
  selectedPharmacies = [],
  routeData = {},
}) => {
  const defaultLocation = { lat: 30.0444, lng: 31.2357 };

  const center = selectedPharmacy
    ? [selectedPharmacy.latitude, selectedPharmacy.longitude]
    : [
        userLocation?.lat ?? defaultLocation.lat,
        userLocation?.lng ?? defaultLocation.lng,
      ];

  /* ── Color map ───────────────────────────────────────────── */
  const colorMap = useMemo(() => {
    const m = {};
    pharmacies.forEach((p, i) => {
      m[String(p.pharmacyId)] = getPharmacyColor(i);
    });
    return m;
  }, [pharmacies]);

  /* ── Icon cache ──────────────────────────────────────────── */
  const iconCache = useMemo(() => {
    const cache = {};
    pharmacies.forEach((p, i) => {
      const color = getPharmacyColor(i);
      const key = String(p.pharmacyId);
      cache[key] = {
        normal: makePinIcon(color),
        selected: makePinIcon(color, { selected: true }),
        hovered: makePinIcon(color, { hovered: true }),
        selectedHovered: makePinIcon(color, { selected: true, hovered: true }),
      };
    });
    return cache;
  }, [pharmacies]);

  /*
   * ✅ FIX: نحول كل ID لـ String عشان نضمن مطابقة صحيحة
   *    سواء الـ backend بعت number أو string
   */
  const selectedSet = useMemo(
    () => new Set(selectedPharmacies.map(String)),
    [selectedPharmacies],
  );

  /* ── Helper ──────────────────────────────────────────────── */
  const isPharmacySelected = (pharmacyId) =>
    selectedSet.has(String(pharmacyId));
  const isPharmacyHovered = (pharmacyId) =>
    String(pharmacyId) === String(hoveredPharmacyId);

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

        {/* ── Routes — قبل الـ Markers عشان يكونوا تحتهم ─────
            ✅ يظهر الـ route لكل صيدلية selected أو hovered    */}
        {pharmacies.map((p) => {
          const isSelected = isPharmacySelected(p.pharmacyId);
          const isHovered = isPharmacyHovered(p.pharmacyId);

          if (!isSelected && !isHovered) return null;

          const route =
            routeData[p.pharmacyId] ?? routeData[String(p.pharmacyId)]; // ← type-safe lookup

          if (!route?.coordinates?.length) return null;

          const color = colorMap[String(p.pharmacyId)];

          // ── Visual tiers ──────────────────────────────────
          let colorW = 6;
          let outlineW = 10;
          let opacity = 0.95;
          let dash = undefined;

          if (isHovered && isSelected) {
            colorW = 8;
            outlineW = 13;
            opacity = 1;
          } else if (isHovered) {
            colorW = 7;
            outlineW = 12;
            opacity = 0.92;
            dash = "12,5";
          }
          // selected فقط → خط صلب واضح (default values أعلاه)

          return (
            <React.Fragment key={`route-${p.pharmacyId}`}>
              {/* White halo — يضمن الوضوح على أي خلفية للخريطة */}
              <Polyline
                positions={route.coordinates}
                color="white"
                weight={outlineW}
                opacity={0.8}
                dashArray={dash}
              />
              {/* Colored line */}
              <Polyline
                positions={route.coordinates}
                color={color}
                weight={colorW}
                opacity={opacity}
                dashArray={dash}
              />
            </React.Fragment>
          );
        })}

        {/* ── User Location ─────────────────────────────────── */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={USER_ICON}
            zIndexOffset={1000}
          >
            <Popup>📌 Your Location</Popup>
          </Marker>
        )}

        {/* ── Delivery Address ──────────────────────────────── */}
        {deliveryAddressLocation && (
          <Marker
            position={[
              deliveryAddressLocation.lat,
              deliveryAddressLocation.lng,
            ]}
            icon={DELIVERY_ICON}
            zIndexOffset={900}
          >
            <Popup>
              📍 Delivery Address
              <br />
              {deliveryAddress?.street}, {deliveryAddress?.buildingNo},{" "}
              {deliveryAddress?.city}, {deliveryAddress?.governorate}
            </Popup>
          </Marker>
        )}

        {/* ── Pharmacy Markers ──────────────────────────────── */}
        {pharmacies.map((p, index) => {
          const isSelected = isPharmacySelected(p.pharmacyId);
          const isHovered = isPharmacyHovered(p.pharmacyId);
          const key = String(p.pharmacyId);
          const color = colorMap[key];
          const icons = iconCache[key];

          const icon =
            isHovered && isSelected
              ? icons.selectedHovered
              : isHovered
                ? icons.hovered
                : isSelected
                  ? icons.selected
                  : icons.normal;

          const zOffset = isHovered ? 800 : isSelected ? 600 : index * -1;

          return (
            <Marker
              key={p.pharmacyId}
              position={[p.latitude, p.longitude]}
              icon={icon}
              zIndexOffset={zOffset}
            >
              <Popup>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: color,
                      display: "inline-block",
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
                {index === 0 && (
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
                      color,
                    }}
                  >
                    ✓ Selected
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PharmacyMap;
