import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";

const LoginForm = ({ email, setEmail, password, setPassword, onLogin, error, loading, toggleForm }) => {
    return (
        <motion.div className="w-full max-w-md">
            <div className="text-center mb-10">
                <motion.div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
                    <Mail className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">Welcome Back</h2>
                <p className="text-muted-foreground text-lg">Sign in to continue your journey</p>
            </div>

            <form onSubmit={onLogin} className="space-y-6">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none"
                    />
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold"
                >
                    {loading ? "Signing In..." : "Sign In"}
                </motion.button>
            </form>

            <p className="text-center text-muted-foreground mt-8">
                Don’t have an account?{" "}
                <button onClick={toggleForm} className="text-secondary font-semibold hover:underline">Sign Up</button>
            </p>
        </motion.div>
    );
};

export default LoginForm;
