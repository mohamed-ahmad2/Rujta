// src/features/auth/pages/AuthPage.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import AuthRightPanel from "../components/AuthRightPanel";
import { useNavigate } from "react-router-dom";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { handleLogin, handleRegister } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectByRole = (role) => {
    if (role === "Admin") navigate("/admin/dashboard");
    else if (role === "User") navigate("/user/");
    else navigate("/");
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
      // Log detailed error info
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
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* ✨ Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-48 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-48 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

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
