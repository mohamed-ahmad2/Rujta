import React from "react";

// Medicines user is searching for:
const requiredMedicines = [
  { name: "Panadol", qty: 2 },
  { name: "Augmentin", qty: 1 },
  { name: "Vitamin C", qty: 3 },
];

const pharmacies = [
  {
    id: 1,
    name: "Amana Pharmacy",
    location: "New Cairo – 600 meters",
    latitude: 30.058,
    longitude: 31.228,
    available: true,
    medicines: [
      { name: "Panadol", qty: 5 },
      { name: "Augmentin", qty: 2 },
      { name: "Vitamin C", qty: 10 },
    ],
  },
  {
    id: 2,
    name: "Karab Abbas Pharmacy",
    location: "6th of October – 1.2 kilometers",
    latitude: 29.976,
    longitude: 30.964,
    available: true,
    medicines: [
      { name: "Panadol", qty: 2 },
      { name: "Vitamin C", qty: 2 },
    ],
  },
  {
    id: 3,
    name: "Rejab Pharmacy",
    location: "Heliopolis – 3.5 kilometers",
    latitude: 30.093,
    longitude: 31.31,
    available: false,
    medicines: [],
  },
];

const Checkout = () => {
  return (
    <div className="w-screen h-screen p-6 bg-gray-100 flex justify-center items-center">
      <div className="w-[1150px] h-[700px] bg-white shadow-xl rounded-3xl overflow-hidden flex">

        {/* LEFT SIDE — MAP MOCKUP */}
        <div className="w-1/2 h-full relative">
          <div
            className="absolute inset-0 bg-cover bg-center brightness-95"
            style={{
              backgroundImage:
                "url('https://static1.makeuseofimages.com/wordpress/wp-content/uploads/2023/05/google-maps-icon-on-map.jpg')",
            }}
          ></div>

          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>

          {/* Zoom Buttons */}
          <div className="absolute top-4 left-4 flex flex-col shadow-lg z-20">
            <button className="w-10 h-10 bg-white border border-gray-300 text-xl font-bold">
              +
            </button>
            <button className="w-10 h-10 bg-white border border-gray-300 text-xl font-bold">
              –
            </button>
          </div>

          {/* Google logo */}
          <div className="absolute bottom-4 left-4 text-gray-600 text-xs font-semibold">
            Google
          </div>
        </div>

        {/* RIGHT SIDE — PHARMACY LIST */}
        <div className="w-1/2 h-full p-8 overflow-y-auto bg-white">
          <h1 className="text-2xl font-semibold mb-6">
            Pharmacy search & ranking
          </h1>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-3 border rounded-xl bg-gray-100 focus:outline-none"
            />
          </div>

          <div className="space-y-6">
            {pharmacies.map((p, i) => {
              const pharmacyStock = {};
              p.medicines.forEach((m) => {
                pharmacyStock[m.name] = m.qty;
              });

              const medicineResults = requiredMedicines.map((req) => ({
                name: req.name,
                neededQty: req.qty,
                availableQty: pharmacyStock[req.name] || 0,
                hasEnough: (pharmacyStock[req.name] || 0) >= req.qty,
              }));

              const matchedCount = medicineResults.filter((m) => m.hasEnough)
                .length;

              const fullMatch = matchedCount === requiredMedicines.length;
              const partialMatch = matchedCount > 0 && !fullMatch;

              return (
                <div
                  key={p.id}
                  className={`pb-6 border rounded-2xl p-4 shadow-sm transition 
                    ${
                      fullMatch
                        ? "border-green-300 bg-green-50"
                        : partialMatch
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-red-300 bg-red-50"
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold">
                        {i + 1}. {p.name}
                      </p>

                      <p className="text-gray-500 text-sm">{p.location}</p>

                      <p
                        className={`text-sm mt-1 ${
                          p.available ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {p.available ? "Available" : "Out of stock"}
                      </p>

                      {/* Medicine Comparison */}
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Medicine availability:
                        </p>

                        <ul className="ml-4 mt-1 text-sm space-y-1">
                          {medicineResults.map((m, idx) => (
                            <li
                              key={idx}
                              className={
                                m.hasEnough
                                  ? "text-green-700"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {m.name} — need {m.neededQty}, available{" "}
                              {m.availableQty} →{" "}
                              {m.hasEnough ? "OK" : "Not enough"}
                            </li>
                          ))}
                        </ul>

                        <p className="text-sm mt-3 font-medium">
                          Total matched:{" "}
                          <span
                            className={
                              fullMatch
                                ? "text-green-700"
                                : partialMatch
                                ? "text-yellow-700"
                                : "text-red-700"
                            }
                          >
                            {matchedCount}/{requiredMedicines.length}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button className="bg-secondary text-white px-5 py-2 rounded-xl font-medium">
                      Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
