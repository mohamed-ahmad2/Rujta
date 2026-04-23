import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { handleChangePassword } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

  try {
  setLoading(true);
  await handleChangePassword({ newPassword });
  localStorage.setItem("IsFirstLogin", "false"); // 👈 make sure it's false
  navigate("/dashboard");
  window.location.reload(); // 👈 force fresh state
} catch (err) {
  setError(err.response?.data?.message || "Failed to change password.");
}
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-page">
      <motion.div
        className="w-full max-w-md mx-auto px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4"
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
          >
            <KeyRound className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
            Set New Password
          </h2>

          <p className="text-muted-foreground text-lg">
            Welcome! Please set a new password to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* New Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold shadow-lg disabled:opacity-60"
          >
            {loading ? "Saving..." : "Set Password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;