// src/features/prescription/ScanPrescription.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoCameraOutline } from "react-icons/io5";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import { motion } from "framer-motion";

const DEFAULT_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

export default function ScanPrescription({ cart, setCart }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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
    setResult(null);
    setError(null);
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
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
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select a prescription image first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch("/api/prescription/scan", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to process image");

      const data = await res.json();
      setResult(data); // Use response directly
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.message || "Error processing prescription. Please try again.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
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

        {/* Upload + Camera */}
        {!preview && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
            {/* Upload */}
            <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-4 transition hover:border-secondary sm:p-6">
              <FiUploadCloud className="mb-2 text-3xl text-gray-400 sm:text-4xl" />
              <p className="text-center text-xs text-gray-600 sm:text-sm">
                Upload from Gallery
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Camera */}
            <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-4 transition hover:border-secondary sm:p-6">
              <IoCameraOutline className="mb-2 text-3xl text-gray-400 sm:text-4xl" />
              <p className="text-center text-xs text-gray-600 sm:text-sm">
                Take a Photo
              </p>
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

        {/* Preview */}
        {preview && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative mb-6"
          >
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

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpload}
            disabled={loading || !image}
            className="hover:bg-secondary-dark flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-50 sm:py-3 sm:text-base"
          >
            {loading && (
              <span>
                <svg
                  className="h-4 w-4 animate-spin text-white sm:h-5 sm:w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              </span>
            )}

            <IoCameraOutline className="text-lg sm:text-xl" />

            {loading ? "Processing..." : "Analyze Prescription"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="text-xs text-gray-500 transition hover:text-gray-700 sm:text-sm"
          >
            ← Back
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-xs text-red-500 sm:text-sm">
            {error}
          </p>
        )}
      </motion.div>

      {/* ================= Medicines Section ================= */}
      {result && (
        <div className="w-full max-w-7xl">
          {/* Available */}
          {result.availableMedicines?.length > 0 && (
            <>
              <h2 className="mb-6 text-center text-xl font-bold text-gray-800 sm:mb-8 sm:text-2xl">
                Found Medicines
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {result.availableMedicines.map((med, idx) => {
                  const medicine =
                    typeof med === "string"
                      ? {
                          name: med,
                          price: 0,
                          description: "No description available",
                          imageUrl: DEFAULT_IMAGE,
                        }
                      : {
                          ...med,
                          imageUrl: med.imageUrl || DEFAULT_IMAGE,
                        };

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:rounded-3xl"
                    >
                      <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-[#E8F3E8] sm:h-36 sm:rounded-2xl md:h-40">
                        <img
                          src={medicine.imageUrl}
                          alt={medicine.name}
                          className="h-24 object-contain sm:h-28 md:h-32"
                          onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                        />
                      </div>

                      <h3 className="text-base font-bold text-secondary sm:text-lg">
                        {medicine.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 sm:text-sm">
                        {medicine.description}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-secondary sm:text-base">
                        {medicine.price} EGP
                      </p>

                      <button
                        onClick={() => addToCart(medicine)}
                        className="mt-3 w-full rounded-full bg-secondary py-2 text-sm text-white transition-all duration-200 hover:bg-green-600 active:scale-95 sm:mt-4 sm:text-base"
                      >
                        Add to Cart
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* Unavailable */}
          {result.unavailableMedicines?.length > 0 && (
            <div className="mx-auto mt-8 w-full max-w-3xl px-2 sm:mt-12">
              <h2 className="mb-4 text-center text-lg font-bold text-red-500 sm:text-2xl">
                Unavailable Medicines
              </h2>

              <ul className="list-inside list-disc space-y-2 text-sm text-gray-700 sm:text-base">
                {result.unavailableMedicines.map((med, idx) => {
                  const name = typeof med === "string" ? med : med.name;
                  return (
                    <li key={idx} className="font-medium">
                      {name}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
