import { motion, AnimatePresence } from "framer-motion";

const AuthRightPanel = ({ isSignUp, setIsSignUp }) => {
  return (
    <motion.div
      initial={false}
      animate={{ x: isSignUp ? "-100%" : "0%" }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      className="absolute md:relative top-0 left-0 md:left-auto w-full md:w-1/2 h-64 md:h-auto bg-gradient-primary text-white flex flex-col items-center justify-center text-center p-8 md:p-12 order-1 md:order-2"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isSignUp ? "signup-text" : "signin-text"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          {isSignUp ? (
            <>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Hello, Friend! 👋</h2>
              <p className="max-w-sm text-lg md:text-xl mb-8 opacity-90">Enter your details and join us today!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSignUp(false)}
                className="bg-white text-primary px-10 py-3 rounded-2xl text-lg font-semibold hover:bg-opacity-90 shadow-lg"
              >
                Sign In
              </motion.button>
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Rujta 🌿</h2>
              <p className="max-w-sm text-lg md:text-xl mb-8 opacity-90">Create your account and discover the possibilities that await you</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSignUp(true)}
                className="bg-white text-primary px-10 py-3 rounded-2xl text-lg font-semibold hover:bg-opacity-90 shadow-lg"
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