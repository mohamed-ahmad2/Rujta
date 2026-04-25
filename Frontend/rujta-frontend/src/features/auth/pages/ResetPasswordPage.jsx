import { useLocation, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleResetPassword, handleForgotPassword } = useAuth();

  const params = new URLSearchParams(location.search);
  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is missing.");
      return;
    }

    if (!otp.trim()) {
      setError("OTP code is required.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      await handleResetPassword({ email, otp, newPassword });
      navigate("/auth");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (email) => {
    await handleForgotPassword(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <ResetPasswordForm
        email={email}
        otp={otp}
        setOtp={setOtp}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onReset={handleReset}
        onResendOtp={handleResendOtp} 
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default ResetPasswordPage;
