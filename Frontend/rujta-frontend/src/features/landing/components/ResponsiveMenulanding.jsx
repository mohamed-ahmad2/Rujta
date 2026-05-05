import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { NavbarMenu } from "../../../mockData/data";

const ResponsiveMenulanding = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const authBtnClass =
    "rounded-md border-2 border-secondary px-6 py-2 font-semibold text-secondary transition duration-200 hover:bg-secondary hover:text-white";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-page shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
            }}
          >
            {/* Close Button */}
            <div className="flex justify-end p-6">
              <MdClose
                className="cursor-pointer text-4xl"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Menu Items */}
            <ul className="mt-10 flex flex-col items-center gap-8 text-2xl">
              {NavbarMenu.map((item) => (
                <li key={item.id} onClick={() => setOpen(false)}>
                  <Link to={item.link}>{item.title}</Link>
                </li>
              ))}

              {/* Auth Buttons */}
              <div className="mt-8 flex flex-col gap-4">
                <button
                  onClick={() => {
                    navigate("/auth?mode=login");
                    setOpen(false);
                  }}
                  className={authBtnClass}
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    navigate("/auth?mode=signup");
                    setOpen(false);
                  }}
                  className={authBtnClass}
                >
                  SignUp
                </button>
              </div>
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ResponsiveMenulanding;
