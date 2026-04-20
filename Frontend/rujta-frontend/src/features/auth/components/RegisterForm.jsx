import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
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
  onRegister,
  error,
  loading,
  toggleForm,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <motion.div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
          <User className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold md:text-5xl ...">Create Account</h2>
        <p className="text-lg text-muted-foreground">
          Join us and start your journey
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={onRegister} className="space-y-6">
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
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-4 text-lg outline-none focus:border-primary"
          />
        </div>

        {error && <p className="text-center text-red-500">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full rounded-2xl bg-gradient-primary py-4 text-lg font-semibold text-white"
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
