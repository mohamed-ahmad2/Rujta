import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate("/dashboard/home"); // Redirect to dashboard/home
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    alert("Account created successfully!");
    setIsSignUp(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
      {/* 🔹 Main white rectangle container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">

          {/* 🔹 Form Section */}
          <div className="flex items-center justify-center p-10">
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                // ✳️ Sign In Form
                <motion.div
                  key="signin"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full max-w-sm"
                >
                  <h2 className="text-4xl font-bold text-[#96C66C] mb-6 text-center">
                    Welcome Back
                  </h2>
                  <form className="space-y-5" onSubmit={handleSignIn}>
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#96C66C]"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#96C66C]"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#96C66C] text-white p-3 rounded-lg font-semibold hover:bg-[#7fb85b] transition"
                    >
                      Sign In
                    </button>
                  </form>
                  <p className="text-center text-gray-600 mt-6">
                    Don’t have an account?{" "}
                    <span
                      className="text-[#96C66C] font-semibold cursor-pointer hover:underline"
                      onClick={() => setIsSignUp(true)}
                    >
                      Sign Up
                    </span>
                  </p>
                </motion.div>
              ) : (
                // ✳️ Sign Up Form
                <motion.div
                  key="signup"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full max-w-sm"
                >
                  <h2 className="text-4xl font-bold text-[#96C66C] mb-6 text-center">
                    Create Account
                  </h2>
                  <form className="space-y-5" onSubmit={handleSignUp}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#96C66C]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#96C66C]"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#96C66C]"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#96C66C] text-white p-3 rounded-lg font-semibold hover:bg-[#7fb85b] transition"
                    >
                      Sign Up
                    </button>
                  </form>
                  <p className="text-center text-gray-600 mt-6">
                    Already have an account?{" "}
                    <span
                      className="text-[#96C66C] font-semibold cursor-pointer hover:underline"
                      onClick={() => setIsSignUp(false)}
                    >
                      Sign In
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🔹 Right Green Rectangle */}
          <div className="hidden md:flex flex-col items-center justify-center bg-[#96C66C] text-white text-center p-10">
            <h2 className="text-3xl font-bold mb-4">
              {isSignUp ? "Join Rujta Today!" : "Welcome to Rujta"}
            </h2>
            <p className="text-lg opacity-90 max-w-xs">
              {isSignUp
                ? "Start your journey with smarter prescriptions and instant AI reading."
                : "Sign in to explore your AI-powered medical tools."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
