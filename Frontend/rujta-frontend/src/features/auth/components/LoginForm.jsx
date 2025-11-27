import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocialAuth } from "../hooks/useSocialAuth";

const LoginForm = ({ email, setEmail, password, setPassword, onLogin, error, loading, toggleForm }) => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const { loginWithGoogle, loginWithFacebook } = useSocialAuth(
   "193719164778-c28lcnosq5fbla477idghnvs5nc565er.apps.googleusercontent.com",
    "YOUR_FACEBOOK_APP_ID"
  );

  const handleForgotPassword = async () => {
  if (!email) return alert("Please enter your email first");

  try {
    const res = await forgotPassword(email);

    // Check if OTP was sent
    if (res.message === "OTP sent to your email.") {
     
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      // Could be "If the email exists, an OTP has been sent."
      alert(res.message);
      // Don't navigate
    }
  } catch (err) {
    alert(err.response?.data?.message || "Something went wrong.");
  }
};

  return (
    <motion.div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
          <Mail className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
          Welcome Back
        </h2>
        <p className="text-muted-foreground text-lg"> to continue your journey</p>
      </div>

      {/* Login Form */}
      <form onSubmit={onLogin} className="space-y-6">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
          />
        </div>

        <div className="text-right -mt-3">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-secondary font-semibold hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold"
        >
          {loading ? "Signing In..." : "Sign In"}
        </motion.button>
      </form>

      {/* Social Login Buttons */}
      <div className="flex flex-col space-y-3 mt-4">
        <button
          type="button"
          onClick={loginWithGoogle}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl shadow-md bg-white border border-gray-200"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" className="w-6 h-6" />
          <span className="text-gray-700 font-medium">Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={loginWithFacebook}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl shadow-md bg-blue-600 hover:bg-blue-700"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Facebook_icon.svg" className="w-6 h-6" />
          <span className="text-white font-medium">Continue with Facebook</span>
        </button>
      </div>
    </motion.div>
  );
};

export default LoginForm;
