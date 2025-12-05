import React, { useEffect, useState } from "react";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import { useOrders } from "../../orders/hooks/useOrders";
import { useAuth } from "../../auth/hooks/useAuth";
import apiClient from "../../../shared/api/apiClient";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const { pharmacies, loading, error, fetchPharmacies } = usePharmacies();
  const { create } = useOrders();
  const { user } = useAuth();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Show location prompt if needed
  useEffect(() => {
    const errorMessage = typeof error === "string" ? error : error?.message || "";
    if (errorMessage.includes("User location not set") || errorMessage.includes("location not set")) {
      setShowLocationPrompt(true);
    }
  }, [error]);

  useEffect(() => {
  if (!user) return;

  const key = `cart_${user.email}`;
  const stored = JSON.parse(localStorage.getItem(key)) || [];
  setCart(stored);

  if (stored.length > 0) {
    const dtoItems = cart.map((item) => ({
  id: item.id,
  quantity: item.quantity,
}));


    console.log("DTO Items being sent to fetchPharmacies:", dtoItems);
    fetchPharmacies(dtoItems);
  }
}, [user]);

const handleSetLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await apiClient.put("/users/location", { latitude, longitude });
          setShowLocationPrompt(false);

          const dtoItems = cart.map((item) => ({
            medicineId: item.id,
            quantity: item.quantity,
          }));

          // مرر مصفوفة مباشرة
          fetchPharmacies(dtoItems);
        } catch (updateErr) {
          console.error("Failed to update location:", updateErr);
        }
      },
      (geoErr) => {
        console.error("Geolocation error:", geoErr);
      }
    );
  }
};


  const handleOrder = async (pharmacyId) => {
    await create({
      pharmacyId,
      medicines: cart,
    });

    alert("Order created successfully!");
  };

  const errorMessage = typeof error === "string" ? error : error?.message || "";

  return (
    <div className="w-screen h-screen p-6 bg-gray-100 flex justify-center items-center">
      <div className="w-[1150px] h-[700px] bg-white shadow-xl rounded-3xl overflow-hidden flex">
        {/* LEFT SIDE: Mock Map */}
        <div className="w-1/2 h-full relative">
          <div
            className="absolute inset-0 bg-cover bg-center brightness-95"
            style={{
              backgroundImage:
                "url('https://static1.makeuseofimages.com/wordpress/wp-content/uploads/2023/05/google-maps-icon-on-map.jpg')",
            }}
          ></div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 h-full p-8 overflow-y-auto bg-white">
          <h1 className="text-2xl font-semibold mb-6">Pharmacy search & ranking</h1>

          {loading && <p>Loading pharmacies...</p>}
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

          {showLocationPrompt && (
            <div className="mb-6">
              <p className="text-yellow-600 mb-2">
                Your location is not set. Allow access to set it automatically.
              </p>
              <button
                onClick={handleSetLocation}
                className="bg-blue-500 text-white px-5 py-2 rounded-xl font-medium"
              >
                Set My Location
              </button>
            </div>
          )}

          <div className="space-y-6">
            {pharmacies.map((p, i) => (
              <div
                key={p.pharmacyId}
                className="pb-6 border rounded-2xl p-4 shadow-sm transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold">
                      {i + 1}. {p.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Lat: {p.latitude.toFixed(4)}, Lng: {p.longitude.toFixed(4)}, Distance:{" "}
                      {p.distanceKm.toFixed(2)} km
                    </p>
                    <p className="text-sm mt-2">
                      Matched Drugs: {p.matchedDrugs} / {p.totalRequestedDrugs} (
                      {p.matchPercentage.toFixed(2)}%)
                    </p>
                  </div>

                  <button
                    onClick={() => handleOrder(p.pharmacyId)}
                    className="bg-secondary text-white px-5 py-2 rounded-xl font-medium"
                  >
                    Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
