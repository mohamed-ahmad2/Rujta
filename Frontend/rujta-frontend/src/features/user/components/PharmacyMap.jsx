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

// === PharmacyBoundsUpdater - يظهر كل الصيدليات + العنوان ===
const PharmacyBoundsUpdater = ({
  pharmacies,
  userLocation,
  selectedPharmacy,
  route,
  deliveryAddressLocation,
}) => {
  const map = useMap();

  useEffect(() => {
    // لو فيه صيدلية مختارة أو route → نسيب الـ RouteBoundsUpdater يشتغل
    if (selectedPharmacy || route) return;

    if (!pharmacies || pharmacies.length === 0) return;

    const bounds = L.latLngBounds(
      pharmacies.map((p) => [p.latitude, p.longitude]),
    );

    if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
    if (deliveryAddressLocation) {
      bounds.extend([deliveryAddressLocation.lat, deliveryAddressLocation.lng]);
    }

    map.fitBounds(bounds, { padding: [60, 60] });
  }, [
    pharmacies,
    userLocation,
    selectedPharmacy,
    route,
    deliveryAddressLocation,
    map,
  ]);

  return null;
};

const RouteBoundsUpdater = ({ route }) => {
  const map = useMap();

  useEffect(() => {
    if (!route) return;
    if (!route.from || !route.to) return;

    const bounds = L.latLngBounds(
      [route.from.lat, route.from.lng],
      [route.to.latitude, route.to.longitude],
    );

    map.fitBounds(bounds, { padding: [60, 60] });
  }, [route]);

  return null;
};

const PharmacyMap = ({
  userLocation,
  pharmacies,
  selectedPharmacy,
  route,
  deliveryAddressLocation,
  deliveryAddress, // ← لعرض نص العنوان في الـ popup
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
          route={route}
          deliveryAddressLocation={deliveryAddressLocation}
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} />
        )}

        {/* العلامة الزرقاء للعنوان المختار */}
        {deliveryAddressLocation && (
          <Marker
            position={[
              deliveryAddressLocation.lat,
              deliveryAddressLocation.lng,
            ]}
            icon={blueIcon}
          >
            <Popup>
              <strong>📍 My Delivery Address</strong>
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

        {route && (
          <>
            <Polyline
              positions={[
                [route.from.lat, route.from.lng],
                [route.to.latitude, route.to.longitude],
              ]}
              color="blue"
              weight={4}
            />
            <RouteBoundsUpdater route={route} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default PharmacyMap;
