import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";

export const RegisterForm = ({ name, setName, email, setEmail, phone, setPhone, location, setLocation, password, setPassword, confirmPassword, setConfirmPassword, onRegister, error, loading, toggleForm }) => {
    return (
        <motion.div className="w-full max-w-md">
            <div className="text-center mb-10">
                <motion.div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
                    <User className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">Create Account</h2>
                <p className="text-muted-foreground text-lg">Join us and start your journey</p>
            </div>

            <form onSubmit={onRegister} className="space-y-6">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none" />
                </div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none" />
                </div>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none" />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none" />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none" />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-2xl text-lg focus:border-primary outline-none" />
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="w-full bg-gradient-primary text-white py-4 text-lg rounded-2xl font-semibold">
                    {loading ? "Creating Account..." : "Sign Up"}
                </motion.button>
            </form>

            <p className="text-center text-muted-foreground mt-8">
                Already have an account?{" "}
                <button onClick={toggleForm} className="text-primary font-semibold hover:underline">Sign In</button>
            </p>
        </motion.div>
    );
};
