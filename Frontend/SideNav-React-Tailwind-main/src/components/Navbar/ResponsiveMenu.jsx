import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ResponsiveMenu = ({ open }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-[80px] left-0 w-full h-screen bg-white/95 backdrop-blur-lg shadow-lg z-40"
        >
          <div className="flex flex-col justify-center items-center h-full space-y-8 text-gray-800 font-semibold text-2xl">
            {/* Menu Links */}
            <motion.li
              whileHover={{ scale: 1.1, color: "#96C66C" }}
              className="cursor-pointer list-none transition duration-300"
              onClick={() => navigate("/")}
            >
              Home
            </motion.li>

            <motion.li
              whileHover={{ scale: 1.1, color: "#96C66C" }}
              className="cursor-pointer list-none transition duration-300"
            >
              Features
            </motion.li>

            <motion.li
              whileHover={{ scale: 1.1, color: "#96C66C" }}
              className="cursor-pointer list-none transition duration-300"
            >
              How It Works
            </motion.li>

            <motion.li
              whileHover={{ scale: 1.1, color: "#96C66C" }}
              className="cursor-pointer list-none transition duration-300"
            >
              Contact
            </motion.li>

            {/* Sign Up Button */}
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "#7fb85b",
                boxShadow: "0 0 20px rgba(150,198,108,0.4)",
              }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate("/auth")}
              className="mt-6 px-10 py-3 text-lg font-semibold rounded-full text-white bg-[#96C66C] shadow-md"
            >
              Sign Up
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ResponsiveMenu.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default ResponsiveMenu;
