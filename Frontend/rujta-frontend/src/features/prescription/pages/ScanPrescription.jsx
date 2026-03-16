import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoCameraOutline } from "react-icons/io5";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import { motion } from "framer-motion";

export default function ScanPrescription() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select a prescription image first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch("/api/prescription/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log(data);

      alert("Prescription processed successfully");
    } catch (error) {
      console.error(error);
      alert("Error uploading prescription");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-lg"
      >

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Scan Prescription
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Take a photo or upload your prescription
        </p>

        {/* Upload Area */}
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

        {/* Preview */}
        {preview && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative"
          >

            <img
              src={preview}
              alt="Prescription preview"
              className="rounded-2xl shadow-md"
            />

            <button
              onClick={removeImage}
              className="absolute top-3 right-3 bg-white shadow p-2 rounded-full"
            >
              <MdOutlineDelete className="text-red-500 text-xl" />
            </button>

          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-6">

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-secondary text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <IoCameraOutline className="text-xl" />

            {loading ? "Processing..." : "Analyze Prescription"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 text-sm"
          >
            Back
          </button>

        </div>

      </motion.div>
    </div>
  );
}