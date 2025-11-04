import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Sparkles, Phone, MapPin } from "lucide-react";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    createPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const apiBase = "https://localhost:44390/api/auth";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Handle Login
  const handleSignIn = async (e) => {
  e.preventDefault();

  const response = await fetch("https://localhost:44390/api/Auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.email,
      password: formData.createPassword
    }),
  });

  if (!response.ok) {
    alert("Invalid credentials");
    return;
  }

  const data = await response.json();
  const token = data.accessToken;

  localStorage.setItem("token", token);

  const decoded = jwtDecode(token);
  const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (role === "Admin") {
    window.location.href = "/admin/dashboard";
  } else if (role === "User") {
    window.location.href = "/user/";
  } else {
    window.location.href = "/";
  }
};



  // 🔹 Handle Register
 const handleSignUp = async (e) => {
  e.preventDefault();
  setError("");

  if (formData.createPassword !== formData.confirmPassword) {
    setError("Passwords do not match!");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${apiBase}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        createPassword: formData.createPassword,
        confirmPassword: formData.confirmPassword
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "Registration failed");
    }

    const data = await response.json();

    // save tokens locally
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    alert("Account created successfully!");
    setIsSignUp(false);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await fetch(`${apiBase}/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(refreshToken),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
  } else {
    console.error("Refresh token failed");
  }
}



  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* ✨ Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-48 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-48 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* ✨ Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-6xl"
      >
        <div className="relative bg-white/80 backdrop-blur-glass rounded-3xl shadow-glass overflow-hidden min-h-[700px]">
          <div className="relative flex flex-col md:flex-row min-h-[700px]">
            {/* 🔹 Form Section */}
            <motion.div
              animate={{ x: isSignUp ? ["0%", "100%"] : ["100%", "0%"] }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 z-20 order-2 md:order-1"
            >
              <AnimatePresence mode="wait">
                {!isSignUp ? (
                  /* ✨ Sign In Form */
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                  >
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4"
                      >
                        <Sparkles className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                        Welcome Back
                      </h2>
                      <p className="text-muted-foreground text-lg">Sign in to continue your journey</p>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-6">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          name="createPassword"
                          placeholder="Password"
                          value={formData.createPassword}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                        />
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

                    <p className="text-center text-muted-foreground mt-8">
                      Don’t have an account?{" "}
                      <button onClick={() => setIsSignUp(true)} className="text-primary font-semibold hover:underline">
                        Sign Up
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  /* ✨ Sign Up Form */
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                  >
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4"
                      >
                        <Sparkles className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                        Create Account
                      </h2>
                      <p className="text-muted-foreground text-lg">Join us and start your journey</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-6">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                        />
                      </div>

                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                        />
                      </div>

                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          name="phone"
                          placeholder="Phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                        />
                      </div>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          name="location"
                          placeholder="Location"
                          value={formData.location}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          name="createPassword"
                          placeholder="Create password"
                          value={formData.createPassword}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                        />
                      </div>

                      {error && <p className="text-red-500 text-center">{error}</p>}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        type="submit"
                        className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold"
                      >
                        {loading ? "Creating Account..." : "Sign Up"}
                      </motion.button>
                    </form>

                    <p className="text-center text-muted-foreground mt-8">
                      Already have an account?{" "}
                      <button onClick={() => setIsSignUp(false)} className="text-primary font-semibold hover:underline">
                        Sign In
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ✨ Right Panel */}
            <motion.div
              initial={false}
              animate={{ x: isSignUp ? "-100%" : "0%" }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="absolute md:relative top-0 left-0 md:left-auto w-full md:w-1/2 h-64 md:h-auto bg-gradient-primary text-white flex flex-col items-center justify-center text-center p-8 md:p-12 order-1 md:order-2"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? "signup-text" : "signin-text"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10"
                >
                  {isSignUp ? (
                    <>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4">Hello, Friend! 👋</h2>
                      <p className="max-w-sm text-lg md:text-xl mb-8 opacity-90">
                        Enter your details and join us today!
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSignUp(false)}
                        className="bg-white text-primary px-10 py-3 rounded-2xl text-lg font-semibold hover:bg-opacity-90 shadow-lg"
                      >
                        Sign In
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Rujta 🌿</h2>
                      <p className="max-w-sm text-lg md:text-xl mb-8 opacity-90">
                        Create your account and discover the possibilities that await you
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSignUp(true)}
                        className="bg-white text-primary px-10 py-3 rounded-2xl text-lg font-semibold hover:bg-opacity-90 shadow-lg"
                      >
                        Sign Up
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
