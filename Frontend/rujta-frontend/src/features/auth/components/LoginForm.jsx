import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useState } from "react";

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  onLogin, // (e, rememberMe) => void
  error,
  loading,
  toggleForm,
}) => {
  const navigate = useNavigate();
  const { handleForgotPassword } = useAuth();
  const { googleFirebaseLogin } = useGoogleAuth();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ rememberMe state هنا في LoginForm
  const [rememberMe, setRememberMe] = useState(false);

  const handleForgotPasswordClick = async () => {
    if (!email) return alert("Please enter your email first");
    try {
      const res = await handleForgotPassword(email);
      if (res.message === "OTP sent to your email.") {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // ✅ بنبعت rememberMe مع الـ submit event للـ parent
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(e, rememberMe);
  };

  return (
    <motion.div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
          <Mail className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold md:text-5xl">Welcome Back</h2>
        <p className="text-lg text-muted-foreground">
          to continue your journey
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-4 text-lg outline-none focus:border-primary"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-12 text-lg outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-secondary"
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* ✅ Remember Me + Forgot Password Row */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer select-none items-center gap-2">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              {/* ✅ Custom Checkbox */}
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

          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-sm font-semibold text-secondary hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full rounded-2xl bg-gradient-primary py-4 text-lg font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </motion.button>
      </form>

      {/* Social Login */}
      <div className="mt-4 flex flex-col space-y-3">
        <button
          type="button"
          onClick={googleFirebaseLogin}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-4 shadow-md transition-shadow duration-200 hover:shadow-lg"
        >
          <FcGoogle className="h-6 w-6" />
          <span className="font-medium text-gray-700">
            Continue with Google
          </span>
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="mt-6 text-center text-lg">
        <span className="text-muted-foreground">Don't have an account? </span>
        <button
          type="button"
          onClick={toggleForm}
          className="font-semibold text-secondary hover:underline"
        >
          Sign Up
        </button>
      </div>
    </motion.div>
  );
};

export default LoginForm;
