import { motion, AnimatePresence } from "framer-motion";

const AuthRightPanel = ({ isSignUp, setIsSignUp }) => {
  return (
    <motion.div
      initial={false}
      animate={{ x: isSignUp ? "-100%" : "0%" }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      className="order-1 hidden w-full flex-col items-center justify-center bg-gradient-primary p-12 text-center text-white md:relative md:order-2 md:flex md:w-1/2"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isSignUp ? "signup-text" : "signin-text"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {isSignUp ? (
            <>
              <h2 className="mb-4 text-5xl font-bold">Hello, Friend! 👋</h2>
              <p className="mb-8 text-xl opacity-90">
                Enter your details and join us today!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSignUp(false)}
                className="rounded-2xl bg-white px-10 py-3 text-lg font-semibold text-primary shadow-lg"
              >
                Sign In
              </motion.button>
            </>
          ) : (
            <>
              <h2 className="mb-4 text-5xl font-bold">Welcome to Rujta 🌿</h2>
              <p className="mb-8 text-xl opacity-90">
                Create your account and discover the possibilities
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSignUp(true)}
                className="rounded-2xl bg-white px-10 py-3 text-lg font-semibold text-primary shadow-lg"
              >
                Sign Up
              </motion.button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AuthRightPanel;
