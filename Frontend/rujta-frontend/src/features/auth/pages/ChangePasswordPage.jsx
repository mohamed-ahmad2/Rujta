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

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await handleChangePassword({ newPassword });

      // ✅ Fix: navigate بس - مش reload
      // الـ context بالفعل بيعمل setUser مع isFirstLogin: false
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      // ✅ Fix: setLoading(false) في finally عشان يتنفذ دايماً
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <motion.div
        className="mx-auto w-full max-w-md px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary"
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
          >
            <KeyRound className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="mb-3 bg-gradient-primary bg-clip-text text-4xl font-bold text-transparent">
            Set New Password
          </h2>

          <p className="text-lg text-muted-foreground">
            Welcome! Please set a new password to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-12 text-lg outline-none focus:border-primary"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-12 text-lg outline-none focus:border-primary"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-primary py-4 text-lg font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {loading ? "Saving..." : "Set Password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;
