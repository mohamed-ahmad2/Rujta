
import { useState, useEffect } from "react";
import { IoCameraOutline } from "react-icons/io5";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { usePrescription } from "../hook/usePrescription";

const DEFAULT_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

// ── Normalize whatever shape the backend returns into { availableMedicines, unavailableMedicines }
function normalizeResult(result) {
  if (!result) return null;

  // Shape 1: { availableMedicines, unavailableMedicines }
  if (Array.isArray(result.availableMedicines)) {
    return {
      availableMedicines: result.availableMedicines,
      unavailableMedicines: result.unavailableMedicines ?? [],
    };
  }

  // Shape 2: { data: { availableMedicines, unavailableMedicines } }
  if (result.data && Array.isArray(result.data.availableMedicines)) {
    return {
      availableMedicines: result.data.availableMedicines,
      unavailableMedicines: result.data.unavailableMedicines ?? [],
    };
  }

  // Shape 3: camelCase variants — available / unavailable (no "Medicines" suffix)
  if (Array.isArray(result.available)) {
    return {
      availableMedicines: result.available,
      unavailableMedicines: result.unavailable ?? [],
    };
  }

  console.warn("⚠️ Unknown result shape:", result);
  return { availableMedicines: [], unavailableMedicines: [] };
}

// Helper to extract the medicine name regardless of whether the item is a string or object
function getMedName(med) {
  if (!med) return "Unknown";
  if (typeof med === "string") return med;
  return med.name || med.medicineName || med.title || JSON.stringify(med);
}

export default function ScanPrescription({ cart, setCart }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  const [expanded, setExpanded] = useState({});
  const [showUnavailable, setShowUnavailable] = useState(false);

  const { result, loading, error, scan } = usePrescription();

  const data = normalizeResult(result);
  const availableMedicines = data?.availableMedicines ?? [];
  const unavailableMedicines = data?.unavailableMedicines ?? [];

  // Show the unavailable banner whenever we get a new result that has unavailable items
  useEffect(() => {
    if (unavailableMedicines.length > 0) {
      setShowUnavailable(true);
    }
  }, [result]); // re-trigger on every new scan result

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select a prescription image first");
      return;
    }
    setShowUnavailable(false); // reset while scanning
    await scan(image);
  };

  const addToCart = (product) => {
    if (!product?.name) return;
    setCart((prevCart = []) => {
      const existing = prevCart.find(
        (item) => item.id === product.id || item.name === product.name,
      );
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id || item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    const key = product.id || product.name;
    setAddedIds((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-6 sm:px-6 lg:px-10">

      {/* ================= Upload Section ================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 w-full max-w-md rounded-3xl bg-white p-5 shadow-xl sm:mb-10 sm:max-w-lg sm:p-6 md:max-w-xl md:p-8"
      >
        <h1 className="mb-2 text-center text-xl font-bold sm:text-2xl md:text-3xl">
          Scan Prescription
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500 sm:mb-8 sm:text-base">
          Take a photo or upload your prescription
        </p>

        {!preview && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-4 transition hover:border-secondary sm:p-6">
              <FiUploadCloud className="mb-2 text-3xl text-gray-400 sm:text-4xl" />
              <p className="text-center text-xs text-gray-600 sm:text-sm">Upload from Gallery</p>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-4 transition hover:border-secondary sm:p-6">
              <IoCameraOutline className="mb-2 text-3xl text-gray-400 sm:text-4xl" />
              <p className="text-center text-xs text-gray-600 sm:text-sm">Take a Photo</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {preview && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative mb-6">
            <img
              src={preview}
              alt="Prescription preview"
              className="max-h-[300px] w-full rounded-2xl object-contain shadow-md"
            />
            <button
              onClick={removeImage}
              className="absolute right-2 top-2 rounded-full bg-white p-2 shadow transition hover:bg-gray-100"
            >
              <MdOutlineDelete className="text-lg text-red-500 sm:text-xl" />
            </button>
          </motion.div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || !image}
          className="hover:bg-secondary-dark flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-50 sm:py-3 sm:text-base"
        >
          {loading && (
            <svg
              className="h-4 w-4 animate-spin text-white sm:h-5 sm:w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          <IoCameraOutline className="text-lg sm:text-xl" />
          {loading ? "Processing..." : "Analyze Prescription"}
        </button>

        {error && (
          <p className="mt-4 text-center text-xs text-red-500 sm:text-sm">{error}</p>
        )}
      </motion.div>

      {/* ================= Results Section ================= */}
      {data && (
        <div className="w-full max-w-7xl">

          {/* ── Unavailable Medicines Modal/Banner ── */}
          <AnimatePresence>
            {showUnavailable && unavailableMedicines.length > 0 && (
              <>
                {/* Dark overlay */}
                <motion.div
                  key="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowUnavailable(false)}
                />

                {/* Modal */}
                <motion.div
                  key="modal"
                  initial={{ opacity: 0, scale: 0.9, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 40 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
                    {/* Red header strip */}
                    <div className="bg-red-50 px-6 pt-6 pb-5 border-b border-red-100">
                      <div className="flex items-start gap-4">
                        {/* Warning icon */}
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                          <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-red-800">
                            {unavailableMedicines.length} Medicine{unavailableMedicines.length > 1 ? "s" : ""} Not Available
                          </h3>
                          <p className="mt-0.5 text-sm text-red-500">
                            The following items from your prescription are currently out of stock.
                          </p>
                        </div>
                        {/* Close button */}
                        <button
                          onClick={() => setShowUnavailable(false)}
                          className="flex-shrink-0 p-1.5 rounded-xl text-red-400 hover:bg-red-100 hover:text-red-600 transition"
                          aria-label="Dismiss"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Medicine list */}
                    <div className="px-6 py-5">
                      <ul className="space-y-2.5">
                        {unavailableMedicines.map((med, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 border border-gray-100"
                          >
                            {/* Red dot */}
                            <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-red-400" />
                            <span className="flex-1 text-sm font-medium text-gray-700">
                              {getMedName(med)}
                            </span>
                            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                              Out of Stock
                            </span>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-4 text-xs text-center text-gray-400">
                        Please contact your pharmacist or check back later for availability.
                      </p>

                      <button
                        onClick={() => setShowUnavailable(false)}
                        className="mt-4 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 active:scale-95"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Inline collapsed badge (after modal is dismissed) ── */}
          {!showUnavailable && unavailableMedicines.length > 0 && (
            <div className="mx-auto mb-6 w-full max-w-3xl">
              <button
                onClick={() => setShowUnavailable(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-left transition hover:bg-red-100"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </span>
                <span className="flex-1 text-sm font-semibold text-red-700">
                  {unavailableMedicines.length} medicine{unavailableMedicines.length > 1 ? "s" : ""} not available — tap to view
                </span>
                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Available Medicines Grid ── */}
          {availableMedicines.length > 0 && (
            <>
              <h2 className="mb-6 text-center text-xl font-bold text-gray-800 sm:mb-8 sm:text-2xl">
                Found Medicines
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8 xl:grid-cols-4">
                {availableMedicines.map((med, idx) => {
                  const medicine =
                    typeof med === "string"
                      ? {
                          name: med,
                          price: 0,
                          description: "No description available",
                          imageUrl: DEFAULT_IMAGE,
                        }
                      : { ...med, imageUrl: med.imageUrl || DEFAULT_IMAGE };

                  const key = medicine.id || medicine.name;
                  const isAdded = addedIds[key];
                  const desc = medicine.description || "No description available";
                  const isLong = desc.length > 70;
                  const isExpanded = expanded[idx];

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex flex-col overflow-hidden bg-white transition-all duration-300"
                      style={{
                        borderRadius: 24,
                        border: "1.5px solid #e8eee2",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 20px 50px rgba(90,138,31,0.15)";
                        e.currentTarget.style.borderColor = "rgba(90,138,31,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                        e.currentTarget.style.borderColor = "#e8eee2";
                      }}
                    >
                      {/* Image zone */}
                      <div
                        className="flex items-center justify-center overflow-hidden"
                        style={{ background: "#EAF3DE", position: "relative", height: 170 }}
                      >
                        <img
                          src={medicine.imageUrl}
                          alt={medicine.name}
                          className="object-contain transition-transform duration-500 group-hover:scale-110"
                          style={{ height: 120, width: 120 }}
                          onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                        />
                        <div
                          className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                          style={{
                            background: "linear-gradient(to top, rgba(234,243,222,0.6), transparent)",
                          }}
                        />
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <h3
                          className="font-semibold"
                          style={{ color: "#3e6013", fontSize: 16, letterSpacing: "-0.1px" }}
                        >
                          {medicine.name}
                        </h3>

                        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-gray-400">
                          {isExpanded || !isLong ? desc : desc.slice(0, 70) + "…"}
                        </p>

                        {isLong && (
                          <button
                            onClick={() => setExpanded((p) => ({ ...p, [idx]: !p[idx] }))}
                            className="mt-1 text-left text-[13px] font-semibold hover:underline"
                            style={{ color: "#5a8a1f", background: "none", border: "none", cursor: "pointer" }}
                          >
                            {isExpanded ? "↑ Show Less" : "↓ Show More"}
                          </button>
                        )}

                        {/* Footer */}
                        <div
                          className="mt-5 flex items-center justify-between pt-4"
                          style={{ borderTop: "1px solid #e8eee2" }}
                        >
                          <span className="text-sm font-semibold" style={{ color: "#5a8a1f" }}>
                            {medicine.price} EGP
                          </span>

                          <button
                            onClick={() => addToCart(medicine)}
                            className="flex items-center gap-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
                            style={{
                              background: isAdded ? "#3e6013" : "#5a8a1f",
                              padding: "10px 20px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {isAdded ? (
                              "✓ Added"
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Empty state: scanned but nothing found ── */}
          {availableMedicines.length === 0 && unavailableMedicines.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-400">No medicines were detected in this prescription.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
