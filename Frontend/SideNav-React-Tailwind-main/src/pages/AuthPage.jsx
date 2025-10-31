import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Sparkles } from "lucide-react";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    alert("Account created successfully!");
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-48 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-48 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-6xl"
      >
        <div className="relative bg-white/80 backdrop-blur-glass rounded-3xl shadow-glass overflow-hidden min-h-[700px]">
          <div className="relative flex flex-col md:flex-row min-h-[700px]">
            {/* Form Section */}
            <motion.div
              animate={{ x: isSignUp ? ["0%", "100%"] : ["100%", "0%"] }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 z-20 order-2 md:order-1"
            >
              <AnimatePresence mode="wait">
                {!isSignUp ? (
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
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
                        <input
                          type="email"
                          placeholder="Email address"
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-12 pr-4 py-4 bg-background/50 border-2 border-border rounded-2xl text-lg focus:border-primary focus:bg-background outline-none transition-all"
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
                        <input
                          type="password"
                          placeholder="Password"
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-12 pr-4 py-4 bg-background/50 border-2 border-border rounded-2xl text-lg focus:border-primary focus:bg-background outline-none transition-all"
                          required
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold shadow-elegant hover:shadow-xl transition-all"
                      >
                        Sign In
                      </motion.button>
                    </form>
                    
                    <p className="text-center text-muted-foreground mt-8">
                      Don't have an account?{" "}
                      <button
                        onClick={() => setIsSignUp(true)}
                        className="text-primary font-semibold hover:underline transition-all"
                      >
                        Sign Up
                      </button>
                    </p>
                  </motion.div>
                ) : (
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
                          placeholder="Full name"
                          className="w-full pl-12 pr-4 py-4 bg-background/50 border-2 border-border rounded-2xl text-lg focus:border-primary focus:bg-background outline-none transition-all"
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="Email address"
                          className="w-full pl-12 pr-4 py-4 bg-background/50 border-2 border-border rounded-2xl text-lg focus:border-primary focus:bg-background outline-none transition-all"
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="Password"
                          className="w-full pl-12 pr-4 py-4 bg-background/50 border-2 border-border rounded-2xl text-lg focus:border-primary focus:bg-background outline-none transition-all"
                          required
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold shadow-elegant hover:shadow-xl transition-all"
                      >
                        Sign Up
                      </motion.button>
                    </form>
                    
                    <p className="text-center text-muted-foreground mt-8">
                      Already have an account?{" "}
                      <button
                        onClick={() => setIsSignUp(false)}
                        className="text-primary font-semibold hover:underline transition-all"
                      >
                        Sign In
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Sliding Info Panel */}
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
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                      >
                        <Sparkles className="w-16 h-16" />
                      </motion.div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4">Hello, Friend! 👋</h2>
                      <p className="max-w-sm text-lg md:text-xl mb-8 opacity-90">
                        Enter your details and embark on an amazing journey with Rujta
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSignUp(false)}
                        className="bg-white text-primary px-10 py-3 rounded-2xl text-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
                      >
                        Sign In
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                      >
                        <Sparkles className="w-16 h-16" />
                      </motion.div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Rujta 🌿</h2>
                      <p className="max-w-sm text-lg md:text-xl mb-8 opacity-90">
                        Create your account and discover the possibilities that await you
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSignUp(true)}
                        className="bg-white text-primary px-10 py-3 rounded-2xl text-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
                      >
                        Sign Up
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Decorative Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/10 blur-xl"
                />
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

