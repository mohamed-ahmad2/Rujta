import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const greenIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green.png",
  iconSize: [32, 32],
});
const redIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
  iconSize: [32, 32],
});
const blueIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png",
  iconSize: [32, 32],
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
  }, [center, map]);
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

const PharmacyMap = ({
  userLocation,
  pharmacies,
  selectedPharmacy,
  deliveryAddressLocation,
  deliveryAddress,
  selectedPharmacies = [],
  routeLines = {},
}) => {
  const defaultLocation = { lat: 30.0444, lng: 31.2357 };
  const center = selectedPharmacy
    ? [selectedPharmacy.latitude, selectedPharmacy.longitude]
    : [
        userLocation?.lat ?? defaultLocation.lat,
        userLocation?.lng ?? defaultLocation.lng,
      ];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        <PharmacyBoundsUpdater
          pharmacies={pharmacies}
          userLocation={userLocation}
          selectedPharmacy={selectedPharmacy}
          deliveryAddressLocation={deliveryAddressLocation}
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} />
        )}
        {deliveryAddressLocation && (
          <Marker
            position={[
              deliveryAddressLocation.lat,
              deliveryAddressLocation.lng,
            ]}
            icon={blueIcon}
          >
            <Popup>
              📍 My Delivery Address
              <br />
              {deliveryAddress?.street}, {deliveryAddress?.buildingNo},{" "}
              {deliveryAddress?.city}, {deliveryAddress?.governorate}
            </Popup>
          </Marker>
        )}

        {pharmacies.map((p, index) => (
          <Marker
            key={p.pharmacyId}
            position={[p.latitude, p.longitude]}
            icon={index === 0 ? greenIcon : redIcon}
          >
            <Popup>
              <strong>
                #{index + 1} {p.name}
              </strong>
              <br />
              Distance: {p.distanceKm.toFixed(2)} km
              {index === 0 && <div>⭐ Best Choice</div>}
            </Popup>
          </Marker>
        ))}

        {/* ================== REAL ROAD PATHS (يظهر فقط للـ Selected + الأفضل) ================== */}
        {(deliveryAddressLocation || userLocation) &&
          pharmacies.length > 0 &&
          pharmacies.map((p) => {
            const start = deliveryAddressLocation || userLocation;
            if (!start) return null;

            const isTop = pharmacies[0]?.pharmacyId === p.pharmacyId;
            const isSelected = selectedPharmacies.includes(p.pharmacyId);

            // يظهر فقط لو مختارة أو أفضل صيدلية
            if (!isTop && !isSelected) return null;

            const positions = routeLines[p.pharmacyId];
            if (!positions) return null;

            let color = "#8B5CF6"; // بنفسجي للـ Selected
            let weight = 5;
            let opacity = 0.9;

            if (isTop) {
              color = "#10B981"; // أخضر قوي للأفضل
              weight = 6;
              opacity = 0.95;
            }

            return (
              <Polyline
                key={`route-${p.pharmacyId}`}
                positions={positions}
                color={color}
                weight={weight}
                opacity={opacity}
                dashArray={isSelected ? "8, 4" : null}
              />
            );
          })}
      </MapContainer>
    </div>
  );
};

export default PharmacyMap;
