import { useLocation, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleResetPassword } = useAuth(); // ✅ FIX

  const params = new URLSearchParams(location.search);
  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Email is missing.");
      return;
    }

    if (!otp.trim()) {
      alert("OTP code is required.");
      return;
    }

    if (!newPassword.trim()) {
      alert("Please enter a new password.");
      return;
    }

    try {
      await handleResetPassword({ email, otp, newPassword }); // ✅ FIX

      alert("Password reset successfully!");
      navigate("/auth");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ResetPasswordForm
        email={email}
        otp={otp}
        setOtp={setOtp}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onReset={handleReset}
      />
    </div>
  );
};

export default ResetPasswordPage;
