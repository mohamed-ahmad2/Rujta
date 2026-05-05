import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export const RegisterForm = ({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  location,
  setLocation,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onRegister, // (e, rememberMe) => void
  error,
  loading,
  toggleForm,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ rememberMe state
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ بنبعت rememberMe مع الـ submit للـ parent
  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(e, rememberMe);
  };

  return (
    <motion.div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
          <User className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold md:text-5xl">Create Account</h2>
        <p className="text-lg text-muted-foreground">
          Join us and start your journey
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-4 text-lg outline-none focus:border-primary"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-4 text-lg outline-none focus:border-primary"
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-4 text-lg outline-none focus:border-primary"
          />
        </div>

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            autoComplete="address-line1"
            required
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-4 text-lg outline-none focus:border-primary"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-12 text-lg outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-secondary"
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-12 text-lg outline-none focus:border-primary"
          />
          {/* ✅ إضافة toggle للـ confirm password زي الـ password */}
          <button
            type="button"
            onClick={() => setShowConfirmPassword((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-secondary"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* ✅ Remember Me */}
        <div className="flex items-center">
          <label className="flex cursor-pointer select-none items-center gap-2">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              {/* ✅ Custom Checkbox نفس تصميم LoginForm */}
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors duration-200 ${
                  rememberMe
                    ? "border-primary bg-primary"
                    : "border-border bg-white"
                }`}
              >
                {rememberMe && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Remember me
            </span>
          </label>
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full rounded-2xl bg-gradient-primary py-4 text-lg font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </motion.button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center text-lg">
        <span className="text-muted-foreground">Already have an account? </span>
        <button
          type="button"
          onClick={toggleForm}
          className="font-semibold text-secondary hover:underline"
        >
          Login
        </button>
      </div>
    </motion.div>
  );
};
