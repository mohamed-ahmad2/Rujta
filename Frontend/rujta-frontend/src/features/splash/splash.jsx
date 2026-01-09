import React, { useEffect, useState } from "react";
import logo from "../../assets/Logo2.png";

const text = "Rujta";

const Splash = ({ onFinish }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  // كتابة الكلمة
  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 180); // سرعة الكتابة
      return () => clearTimeout(timeout);
    }
  }, [index]);

  // إخفاء السبلاش
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-8">

        {/* Logo */}
        <img
          src={logo}
          alt="Logo"
          className="w-44 h-44 object-contain animate-float"
        />

        {/* Handwriting Text */}
        <h1 className="relative font-extrabold text-5xl sm:text-6xl text-secondary tracking-wide">
          {displayedText}
          <span className="absolute right-[-8px] top-0 h-full w-[2px] bg-secondary animate-blink" />
        </h1>

        {/* Loader */}
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default Splash;
