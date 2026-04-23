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
import "leaflet/dist/leaflet.css";

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
    map.invalidateSize();
    map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
};

const MapInvalidator = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
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
        <MapInvalidator /> {/* ✅ أضفه */}
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
        {(deliveryAddressLocation || userLocation) &&
          pharmacies.length > 0 &&
          pharmacies.map((p) => {
            const start = deliveryAddressLocation || userLocation;
            if (!start) return null;

            const isTop = pharmacies[0]?.pharmacyId === p.pharmacyId;
            const isSelected = selectedPharmacies.includes(p.pharmacyId);
            const isHovered = p.pharmacyId === hoveredPharmacyId;

            if (!isTop && !isSelected && !isHovered) return null;

            const route = routeData[p.pharmacyId];
            if (!route?.coordinates) return null;

            let color = "#9CA3AF";
            let weight = 3;
            let opacity = 0.6;

            if (isTop) {
              color = "#10B981";
              weight = 6;
              opacity = 0.95;
            } else if (isHovered) {
              color = "#3B82F6";
              weight = 7;
              opacity = 1;
            } else if (isSelected) {
              color = "#8B5CF6";
              weight = 5;
              opacity = 0.85;
            }

            return (
              <Polyline
                key={`route-${p.pharmacyId}`}
                positions={route.coordinates}
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
