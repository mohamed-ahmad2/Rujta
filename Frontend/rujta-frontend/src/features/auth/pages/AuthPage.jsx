// src/features/auth/pages/AuthPage.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import AuthRightPanel from "../components/AuthRightPanel";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { handleLogin, handleRegister } = useAuth();

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [isSignUp, setIsSignUp] = useState(mode === "signup");

  // ✅ Fix: Detect mobile to disable the x-slide animation
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSignUp(mode === "signup");
  }, [mode]);

  // ✅ Fix: Track window resize to update isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const redirectByRole = (role) => {
    if (role === "SuperAdmin") {
      navigate("/superadmin");
    } else if (role === "Pharmacist" || role === "PharmacyAdmin") {
      navigate("/dashboard");
    } else if (role === "User") {
      navigate("/user/");
    } else {
      navigate("/");
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userData = await handleLogin(email, password);
      const role = userData.role || "User";
      redirectByRole(role);
    } catch (err) {
      const message =
        (err && err.message) ||
        (typeof err === "string" ? err : "Login failed");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const userData = await handleRegister({
        name,
        email,
        phone,
        location,
        createPassword: password,
        confirmPassword,
      });

      const role = userData.role || "User";
      redirectByRole(role);
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Error message:", err.message);
      }

      const message =
        (err.response && err.response.data?.message) ||
        (err && err.message) ||
        (typeof err === "string" ? err : "Registration failed");

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-background p-4">
      {/* ✨ Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-6xl"
      >
        <div className="relative min-h-[700px] overflow-hidden rounded-3xl bg-white/80 shadow-glass backdrop-blur-glass">
          <div className="relative flex min-h-[700px] flex-col md:flex-row">
            {/* Form Section */}
            <motion.div
              animate={{
                // ✅ Fix: على الموبايل x دايمًا 0 — الـ slide animation للـ desktop بس
                x: isMobile ? "0%" : isSignUp ? "100%" : "0%",
              }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="z-20 order-2 flex w-full items-center justify-center p-8 md:order-1 md:w-1/2 md:p-12"
            >
              <AnimatePresence mode="wait">
                {!isSignUp ? (
                  <LoginForm
                    key={"login"}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    onLogin={onLogin}
                    error={error}
                    loading={loading}
                    toggleForm={() => setIsSignUp(true)}
                  />
                ) : (
                  <RegisterForm
                    key={"register"}
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    location={location}
                    setLocation={setLocation}
                    password={password}
                    setPassword={setPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    onRegister={onRegister}
                    error={error}
                    loading={loading}
                    toggleForm={() => setIsSignUp(false)}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right Panel */}
            <AuthRightPanel isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
