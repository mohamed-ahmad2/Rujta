import { motion } from "framer-motion";
import { Mail, KeyRound, Lock } from "lucide-react";

const ResetPasswordForm = ({ email, otp, setOtp, newPassword, setNewPassword, onReset }) => {
  return (
    <motion.div className="w-full max-w-md">
      <div className="text-center mb-10">
        <motion.div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
          <KeyRound className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
          Reset Password
        </h2>
        <p className="text-muted-foreground text-lg">Enter OTP and your new password</p>
      </div>

      <form onSubmit={onReset} className="space-y-6">

        {/* Email (readonly) */}
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
            placeholder="OTP code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
          />
        </div>

        {/* New Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold"
        >
          Reset Password
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordForm;
