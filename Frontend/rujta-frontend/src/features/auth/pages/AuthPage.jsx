import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import AuthRightPanel from "../components/AuthRightPanel";
import { useNavigate, useSearchParams } from "react-router-dom";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { handleLogin, handleRegister } = useAuth();

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [isSignUp, setIsSignUp] = useState(mode === "signup");

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ مسح الـ error لما المستخدم يبدل بين login و register
  useEffect(() => {
    setError("");
  }, [isSignUp]);

  const redirectByRole = (userData) => {
    const role = userData.role || "User";

    // ✅ Fix: بس PharmacyAdmin هو اللي محتاج يغير الـ password في أول login
    if (userData.isFirstLogin && role === "PharmacyAdmin") {
      navigate("/change-password");
      return;
    }

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

  // ✅ بياخد rememberMe من LoginForm
  const onLogin = async (e, rememberMe = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userData = await handleLogin(email, password, rememberMe);
      redirectByRole(userData);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ بياخد rememberMe من RegisterForm
  const onRegister = async (e, rememberMe = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const userData = await handleRegister({
        name,
        email,
        phoneNumber: phone,
        location,
        createPassword: password,
        confirmPassword,
        rememberMe,
      });

      redirectByRole(userData);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
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
                x: isMobile ? "0%" : isSignUp ? "100%" : "0%",
              }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="z-20 order-2 flex w-full items-center justify-center p-8 md:order-1 md:w-1/2 md:p-12"
            >
              <AnimatePresence mode="wait">
                {!isSignUp ? (
                  <LoginForm
                    key="login"
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
                    key="register"
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
