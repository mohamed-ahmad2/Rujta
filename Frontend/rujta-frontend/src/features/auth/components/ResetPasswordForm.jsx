import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, KeyRound, Lock, Eye, EyeOff, TimerReset } from "lucide-react";

const TIMER_DURATION = 300; // 5 minutes

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
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);

  // ✅ Fix: استخدام useRef عشان نحتفظ بـ interval واحد بس
  const intervalRef = useRef(null);

  // ✅ Fix: interval واحد بدل ما نعمل interval جديد كل ثانية
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []); // ✅ بيشتغل مرة واحدة بس

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // ✅ Fix: إضافة error handling للـ resend
  const [resendError, setResendError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    setResendError("");
    setResendLoading(true);

    try {
      await onResendOtp(email);

      // ✅ Reset timer
      setTimer(TIMER_DURATION);
      setCanResend(false);

      // ✅ Start new interval
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResendError(
        err.response?.data?.message || "Failed to resend OTP. Try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-md"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div
          className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary"
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
        >
          <KeyRound className="h-8 w-8 text-white" />
        </motion.div>

        <h2 className="mb-3 bg-gradient-primary bg-clip-text text-4xl font-bold text-transparent">
          Reset Password
        </h2>

        <p className="text-lg text-muted-foreground">
          Enter the OTP sent to your email and choose a new password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onReset} className="space-y-6">
        {/* Email - readonly */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded-2xl border-2 border-border bg-gray-100 py-4 pl-12 pr-4 text-lg text-gray-500 outline-none"
          />
        </div>

        {/* OTP */}
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="OTP Code"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-4 text-lg tracking-widest outline-none focus:border-primary"
          />
        </div>

        {/* Timer + Resend */}
        <div className="flex items-center justify-between text-sm">
          <p className="flex items-center gap-1 text-muted-foreground">
            <TimerReset size={16} />
            {canResend ? (
              <span className="font-semibold text-green-600">
                You can resend OTP
              </span>
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
            disabled={!canResend || resendLoading}
            className={`font-semibold text-primary transition-opacity ${
              !canResend || resendLoading
                ? "cursor-not-allowed opacity-40"
                : "hover:underline"
            }`}
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        {/* ✅ Resend Error */}
        {resendError && (
          <p className="text-center text-sm text-red-500">{resendError}</p>
        )}

        {/* New Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full rounded-2xl border-2 border-border py-4 pl-12 pr-12 text-lg outline-none focus:border-primary"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full rounded-2xl bg-gradient-primary py-4 text-lg font-semibold text-white shadow-lg"
        >
          Reset Password
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordForm;
