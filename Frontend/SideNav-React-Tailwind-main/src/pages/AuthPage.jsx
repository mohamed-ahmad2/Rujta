import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AuthPage({ onAuthSuccess }) {

  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
  e.preventDefault();
  // 🔹 Call parent function to switch to dashboard
  if (typeof onAuthSuccess === "function") {
    onAuthSuccess();
  }
};


  const handleSignUp = (e) => {
    e.preventDefault();
    alert("Account created successfully!");
    setIsSignUp(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#96C66C] to-green-600 p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        
        {/* 🔹 Sign In Form */}
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: isSignUp ? "-100%" : "0%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-1/2 p-10 flex flex-col justify-center"
        >
          <h2 className="text-3xl font-bold text-[#96C66C] mb-6">Welcome Back</h2>
          <form className="space-y-4" onSubmit={handleSignIn}>
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
              className="w-full bg-[#96C66C] text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Sign In
            </button>
          </form>
        </motion.div>

        {/* 🔹 Sign Up Form */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isSignUp ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-1/2 p-10 flex flex-col justify-center"
        >
          <h2 className="text-3xl font-bold text-[#96C66C] mb-6">Create Account</h2>
          <form className="space-y-4" onSubmit={handleSignUp}>
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
              className="w-full bg-[#96C66C] text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Sign Up
            </button>
          </form>
        </motion.div>

        {/* 🔹 Overlay Section */}
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: isSignUp ? "-100%" : "0%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 w-1/2 h-full bg-[#96C66C] text-white flex flex-col items-center justify-center text-center p-10"
        >
          {isSignUp ? (
            <>
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="mb-6 text-lg opacity-90">
                Already have an account? Sign in to continue.
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="bg-white text-[#96C66C] font-semibold px-6 py-2 rounded-full hover:bg-gray-100 transition"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
              <p className="mb-6 text-lg opacity-90">
                Don’t have an account? Create one now to join us.
              </p>
              <button
                onClick={() => setIsSignUp(true)}
                className="bg-white text-[#96C66C] font-semibold px-6 py-2 rounded-full hover:bg-gray-100 transition"
              >
                Sign Up
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
