import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, KeyRound, Lock, Eye, EyeOff, TimerReset } from "lucide-react";

const ResetPasswordForm = ({
  email,
  otp,
  setOtp,
  newPassword,
  setNewPassword,
  onReset,
  onResendOtp,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // TIMER → 5 minutes (300 seconds)
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);

  // COUNTDOWN EFFECT
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // FORMAT TIMER
  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // HANDLE RESEND OTP
  const handleResend = async () => {
    if (!canResend) return;

    await onResendOtp(email); // call parent

    setTimer(300);
    setCanResend(false);
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4"
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
        >
          <KeyRound className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
          Reset Password
        </h2>

        <p className="text-muted-foreground text-lg">
          Enter the OTP sent to your email and choose a new password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onReset} className="space-y-6">
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="email"
            value={email}
            readOnly
            className="w-full pl-12 pr-4 py-4 border-2 border-border bg-gray-100 text-gray-500 rounded-2xl text-lg outline-none"
          />
        </div>

        {/* OTP */}
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="OTP Code"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
            className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none tracking-widest"
          />
        </div>

        {/* Timer + Resend */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground flex items-center gap-1">
            <TimerReset size={16} />
            {canResend ? (
              <span className="text-green-600 font-semibold">You can resend OTP</span>
            ) : (
              <>
                Resend available in:{" "}
                <span className="font-semibold">{formatTime()}</span>
              </>
            )}
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`text-primary font-semibold ${
              canResend ? "" : "opacity-40 cursor-not-allowed"
            }`}
          >
            Resend OTP
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full pl-12 pr-12 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
          />

          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold shadow-lg"
        >
          Reset Password
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordForm;
