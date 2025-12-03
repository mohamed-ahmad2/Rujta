import React, { useState, useEffect } from "react";
import HeroImg3 from "../../../assets/pro/m1.png";
import useMedicines from "../../medicines/hook/useMedicines";

const Hero = () => {
  const { medicines, fetchAll, loading, error } = useMedicines();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const heroSlides = (medicines || []).slice(0, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        heroSlides.length ? (prev + 1) % heroSlides.length : 0
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  if (loading)
    return <p className="text-center text-white">Loading products...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!heroSlides.length) return null;

  const slide = heroSlides[current];

  return (
    <section
      className="relative overflow-hidden min-h-[550px] sm:min-h-[650px] flex justify-center items-center transition-all duration-700"
      style={{ backgroundColor: "#9DC873" }}
    >
      {/* Decorative Blurs */}
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-2xl -z-10"></div>

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 items-center gap-8 text-white transition-all duration-700">
        {/* Text Section */}
        <div className="text-center md:text-left space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            {slide.name}
          </h1>
          <p className="text-gray-100 max-w-md mx-auto md:mx-0">
            {slide.description}
          </p>
          <button
            className="bg-white text-secondary font-semibold py-3 px-8 rounded-full shadow-md 
                       hover:bg-white transition-all duration-300"
          >
            {`Buy for ${slide.price} EGP`}
          </button>
        </div>

        {/* Image Section */}
        <div className="flex justify-center md:justify-end relative transition-transform duration-700">
          <img
            src={slide.imageUrl || HeroImg3}
            alt={slide.name}
            className="w-[420px] md:w-[520px] lg:w-[600px] drop-shadow-2xl object-contain"
            onError={(e) => (e.currentTarget.src = HeroImg3)}
          />
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 flex gap-3">
        {heroSlides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              index === current ? "bg-white" : "bg-white/20"
            }`}
            onClick={() => setCurrent(index)}
          ></div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
