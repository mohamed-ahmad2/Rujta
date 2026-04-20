import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { auth, provider } from "../../../../firebase";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useState } from "react";

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  error,
  loading,
  toggleForm,
}) => {
  const navigate = useNavigate();
  const { handleForgotPassword } = useAuth();
  const { googleFirebaseLogin } = useGoogleAuth();
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <motion.div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
          <Mail className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold md:text-5xl ...">Welcome Back</h2>
        <p className="text-lg text-muted-foreground">
          {" "}
          to continue your journey
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={onLogin} className="space-y-6">
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

          {/* Toggle Password Visibility */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-secondary"
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="-mt-3 text-right">
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="font-semibold text-secondary hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {error && <p className="text-center text-red-500">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full rounded-2xl bg-gradient-primary py-4 text-lg font-semibold text-white"
        >
          {loading ? "Signing In..." : "Sign In"}
        </motion.button>
      </form>

      {/* Social Login Buttons */}
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
