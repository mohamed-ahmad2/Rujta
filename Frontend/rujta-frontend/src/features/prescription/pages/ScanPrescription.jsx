// src/features/prescription/ScanPrescription.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoCameraOutline } from "react-icons/io5";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import { motion } from "framer-motion";

const DEFAULT_IMAGE = "https://via.placeholder.com/300x200?text=No+Image"; // Change this to your real default image

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

  const addToCart = (product) => {
    if (!product?.name) return;

    setCart((prevCart = []) => {
      const existing = prevCart.find(
        (item) => item.id === product.id || item.name === product.name
      );

      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id || item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
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
      setResult(data);

    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Error processing prescription. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-lg mb-10"
      >
        <h1 className="text-3xl font-bold text-center mb-2">Scan Prescription</h1>
        <p className="text-gray-500 text-center mb-8">
          Take a photo or upload your prescription
        </p>

        {!preview && (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 cursor-pointer hover:border-secondary transition">
            <FiUploadCloud className="text-5xl text-gray-400 mb-3" />
            <p className="text-gray-600 text-sm text-center">
              Click or capture a photo of your prescription
            </p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}

        {preview && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative mb-6"
          >
            <img
              src={preview}
              alt="Prescription preview"
              className="rounded-2xl shadow-md w-full"
            />
            <button
              onClick={removeImage}
              className="absolute top-3 right-3 bg-white shadow p-2 rounded-full hover:bg-gray-100"
            >
              <MdOutlineDelete className="text-red-500 text-xl" />
            </button>
          </motion.div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpload}
            disabled={loading || !image}
            className="bg-secondary text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading && (
              <span className="mr-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              </span>
            )}
            <IoCameraOutline className="text-xl" />
            {loading ? "Processing..." : "Analyze Prescription"}
          </button>

          <button onClick={() => navigate(-1)} className="text-gray-500 text-sm hover:text-gray-700">
            ← Back
          </button>
        </div>

        {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
      </motion.div>

      {/* Medicines Cards Section */}
      {result && (
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Found Medicines
          </h2>

          {result.availableMedicines?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {result.availableMedicines.map((med, idx) => {
                const medicine = typeof med === "string" 
                  ? { 
                      name: med, 
                      price: 0, 
                      description: "No description available", 
                      imageUrl: DEFAULT_IMAGE 
                    }
                  : { 
                      ...med, 
                      imageUrl: med.imageUrl || DEFAULT_IMAGE 
                    };

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-3xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-center items-center h-40 bg-[#E8F3E8] rounded-2xl mb-4">
                      <img
                        src={medicine.imageUrl}
                        alt={medicine.name}
                        className="object-contain h-32"
                        onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                      />
                    </div>

                    <h3 className="text-lg font-bold text-secondary">{medicine.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {medicine.description}
                    </p>
                    <p className="text-secondary font-semibold mt-2">
                      {medicine.price} EGP
                    </p>

                    <button
                      onClick={() => addToCart(medicine)}
                      className="mt-4 bg-secondary text-white py-2 rounded-full w-full hover:bg-green-600 transition"
                    >
                      Add to Cart
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">
              No medicines were found in this prescription.
            </p>
          )}
        </div>
      )}
    </div>
  );
}