import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// Icons مخصصة
const greenIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green.png",
  iconSize: [32, 32],
});

const redIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
  iconSize: [32, 32],
});

// Component لتحريك الخريطة عند اختيار صيدلية
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
};

const PharmacyMap = ({ userLocation, pharmacies, selectedPharmacy, route }) => {
  const defaultLocation = { lat: 30.0444, lng: 31.2357 }; // القاهرة

  const center = selectedPharmacy
    ? [selectedPharmacy.latitude, selectedPharmacy.longitude]
    : [userLocation?.lat ?? defaultLocation.lat, userLocation?.lng ?? defaultLocation.lng];

  // === RouteBoundsUpdater ===
  const RouteBoundsUpdater = ({ route }) => {
    const map = useMap();

    useEffect(() => {
      if (!route) return;
      if (!route.from || !route.to) return;

      const bounds = L.latLngBounds(
        [route.from.lat, route.from.lng],
        [route.to.latitude, route.to.longitude]
      );

      map.fitBounds(bounds, { padding: [60, 60] });
    }, [route]);

    return null;
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={center} />

        {/* Marker الخاص بموقع المستخدم */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} />
        )}

        {/* Markers الخاصة بالصيدليات */}
        {pharmacies.map((p, index) => (
          <Marker
            key={p.pharmacyId}
            position={[p.latitude, p.longitude]}
            icon={index === 0 ? greenIcon : redIcon}
          >
            <Popup>
              <strong>#{index + 1} {p.name}</strong>
              <br />
              Distance: {p.distanceKm.toFixed(2)} km
              {index === 0 && <div>⭐ Best Choice</div>}
            </Popup>
          </Marker>
        ))}

        {/* رسم المسار + Zoom على المسار */}
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