import React, { useState, useEffect } from "react";
import HeroImg1 from "../../../assets/change/HeroImg1.png";
import HeroImg2 from "../../../assets/change/HeroImg2.png";
import HeroImg3 from "../../../assets/change/HeroImg3.png"; // Lek Moisturizer
import HeroImg4 from "../../../assets/change/HeroImg4.png";
import HeroImg5 from "../../../assets/change/HeroImg5.png"; // Hyaluronic Acid

const heroSlides = [
  {
    id: 1,
    img: HeroImg1,
    title: "Your Prescription for Affordable Health Solutions!",
    description:
      "Elevate your health journey with exclusive discounts and unparalleled convenience.",
    btnText: "Shop Now",
  },
  {
    id: 2,
    img: HeroImg2,
    title: "Trusted Medicines, Delivered to Your Door",
    description:
      "Discover reliable healthcare products with fast delivery and great prices.",
    btnText: "Explore Now",
  },
  {
    id: 3,
    img: HeroImg3,
    title: "Lek Moisturizer — Deep Hydration for Your Skin",
    description:
      "Nourish and protect your skin with Lek Moisturizer. Keeps your face soft, fresh, and radiant all day long.",
    btnText: "Shop Lek Moisturizer",
  },
  {
    id: 4,
    img: HeroImg4,
    title: "Your Health, Our Priority",
    description:
      "Providing the best pharmacy essentials to keep your family safe and healthy.",
    btnText: "View Products",
  },
  {
    id: 5,
    img: HeroImg5,
    title: "Hyaluronic Acid — The Secret to Glowing Skin",
    description:
      "Revitalize your skin with intense hydration and youthful glow using our pure Hyaluronic Acid serum.",
    btnText: "Get Hyaluronic Acid",
  },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slide = heroSlides[current];

  return (
    <section
      className="relative overflow-hidden min-h-[550px] sm:min-h-[650px] flex justify-center items-center transition-all duration-700"
      style={{ backgroundColor: "#3C623C" }}
    >
      {/* Decorative Blurs */}
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-2xl -z-10"></div>

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 items-center gap-8 text-white transition-all duration-700">
        {/* Text Section */}
        <div className="text-center md:text-left space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            {slide.title}
          </h1>
          <p className="text-gray-100 max-w-md mx-auto md:mx-0">
            {slide.description}
          </p>
          <button
            className="bg-yellow-400 text-green-900 font-semibold py-3 px-8 rounded-full shadow-md 
                       hover:bg-yellow-300 transition-all duration-300"
          >
            {slide.btnText}
          </button>
        </div>

        {/* Image Section */}
        <div className="flex justify-center md:justify-end relative transition-transform duration-700">
          <img
            src={slide.img}
            alt={slide.title}
            className="w-[420px] md:w-[520px] lg:w-[600px] drop-shadow-2xl object-contain"
          />
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 flex gap-3">
        {heroSlides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              index === current ? "bg-yellow-400" : "bg-white/40"
            }`}
            onClick={() => setCurrent(index)}
          ></div>
        ))}
      </div>
    </section>
  );
};

export default Hero;