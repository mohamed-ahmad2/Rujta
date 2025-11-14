import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { NavbarMenu } from "../../../mockData/data";

const ResponsiveMenulanding = ({ open, setOpen }) => {
  const handleClick = () => setOpen(false);

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-40 z-50 flex justify-center items-start pt-20"
        >
          <div className="text-xl font-semibold uppercase bg-secondary text-white py-10 m-6 rounded-3xl w-11/12 max-w-sm">
            <ul className="flex flex-col justify-center items-center gap-10">
              {NavbarMenu.map((item) => (
                <li key={item.id} onClick={handleClick}>
                  <a href={item.link} className="hover:text-gray-200 duration-200">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ResponsiveMenulanding.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default ResponsiveMenulanding;
