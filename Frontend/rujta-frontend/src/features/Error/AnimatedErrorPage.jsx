import React, { useMemo } from "react";
import logo from "../../assets/qq.png";

const AnimatedErrorPage = () => {
  // نجوم عشوائية (أكبر وباللون الأخضر)
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 3 + 6, // ⭐ تكبير النجوم
      opacity: Math.random() * 0.5 + 0.5, // أوضح شوية
    }));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-white text-white">
      
      {/* Stars */}
      <div className="absolute inset-0 animate-moveStars">
        {stars.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#83b74e]"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-6 animate-float">
        <img
          src={logo}
          alt="Logo"
          className="w-[400px] sm:w-[400px] drop-shadow-lg"
        />
      </div>

      
     {/* Message */}
<div className="relative z-10 text-center -mt-24">
  <h1 className="text-[96px] sm:text-[140px] font-bold mb-2 text-[#83b74e]">
    404
  </h1>
  <p className="text-[24px] sm:text-[28px] text-[#83b74e] mb-6">
    Oops! The page you're looking for floated away.
  </p>

  <a
    href="/"
    className="inline-block px-6 py-3 rounded-full font-bold transition-colors duration-300 bg-[#83b74e] hover:bg-primary"
  >
    Go Home
  </a>
</div>

    </div>
  );
};

export default AnimatedErrorPage;
