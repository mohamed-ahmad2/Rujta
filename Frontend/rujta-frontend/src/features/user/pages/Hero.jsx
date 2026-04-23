import React, { useEffect, useState } from "react";
import useCampaigns from "../../campaigns/hook/useCampaigns";

// --- Static Asset Imports ---
import productImg1 from "../../../assets/hero/pantin.png";
import modelImg1   from "../../../assets/hero/model.png";
import bg1         from "../../../assets/hero/bg1.png";

import productImg2 from "../../../assets/hero/i2.png";
import modelImg2   from "../../../assets/hero/bbb.png";
import bg2         from "../../../assets/hero/bg22.png";

import productImg3 from "../../../assets/hero/i1.png";
import modelImg3   from "../../../assets/hero/mod.png";
import bg3         from "../../../assets/hero/bg3.png";

// --- Configuration: Static Slides ---
const staticAds = [
  {
    id: "static-1",
    type: "static",
    text1: "بشرة اجمل مع ",
    text2: "ordenary",
    textColor1: "text-gray-900",
    textColor2: "text-red-900",
    textSize1: "text-3xl sm:text-5xl md:text-8xl",
    textSize2: "text-5xl sm:text-6xl md:text-9xl",
    bgImage: bg3,
    productImg: productImg3,
    productSize: "w-[260px] sm:w-[420px] md:w-[900px]",
    productPosition: "left-1/2 -translate-x-1/2 bottom-[-80px] sm:bottom-[-200px] md:left-[-500px] md:translate-x-0 md:bottom-[-350px]",
    modelImg: modelImg3,
    modelSize: "md:w-[450px]",
    modelPosition: "hidden md:block md:right-[-100px] md:bottom-[-280px]",
  },
  {
    id: "static-2",
    type: "static",
    text1: "يعالج ويحمي",
    text2: "من تلف الماء",
    textColor1: "text-gray-900",
    textColor2: "text-yellow-600",
    textSize1: "text-4xl sm:text-5xl md:text-8xl",
    textSize2: "text-5xl sm:text-5xl md:text-8xl",
    bgImage: bg1,
    productImg: productImg1,
    productSize: "w-[240px] sm:w-[500px] md:w-[700px]",
    productPosition: "left-1/2 -translate-x-1/2 bottom-[-80px] sm:bottom-[-200px] md:left-[-500px] md:translate-x-0 md:bottom-[-400px]",
    modelImg: modelImg1,
    modelSize: "md:w-[650px]",
    modelPosition: "hidden md:block md:right-[-100px] md:bottom-[-380px]",
  },
];

const DynamicSlide = ({ ad }) => (
  <section
    className="relative w-full min-h-screen overflow-hidden flex items-center justify-center transition-all duration-700"
    style={{
      background: `radial-gradient(circle at top left, ${ad.colorTo || "#0369a1"}, ${ad.colorFrom || "#0ea5e9"})`,
    }}
  >
    {/* Animated Background Elements */}
    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-black/20 blur-[100px]" />

    <div className="relative z-10 w-full max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
      
      {/* LEFT SIDE: Content (Text) */}
      <div className="order-2 md:order-1 space-y-8 text-center md:text-left">
        <div className="space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase bg-white text-gray-900 shadow-xl">
            {ad.badge || "NEW ARRIVAL"}
          </span>
          
          <h1 className="text-white font-extrabold leading-[1.1] drop-shadow-md" style={{ fontSize: "clamp(3rem, 5vw, 5.5rem)" }}>
            {ad.headline}
          </h1>
          
          <div className="h-1 w-24 bg-white/40 md:mr-0 inline-block rounded-full" />
          
          <p className="text-white/90 text-lg md:text-xl font-light max-w-lg leading-relaxed md:mr-auto">
            {ad.subtext}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
          <button 
            className="group relative bg-white text-gray-900 px-12 py-5 rounded-full font-black text-lg overflow-hidden transition-all hover:pl-16 active:scale-95 shadow-2xl"
          >
            <span className="relative z-10">SHOP NOW</span>
            {/* Arrow moves to the left on hover */}
            <span className="absolute left-6 opacity-0 transition-all group-hover:opacity-100 group-hover:left-8">→</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Product Visuals (Image) */}
      <div className="relative order-1 md:order-2 flex justify-center items-center group">
        {/* Floating Ring Effect */}
        <div 
          className="absolute w-[80%] h-[80%] rounded-full border-2 border-white/20 animate-[spin_10s_linear_infinite]" 
          style={{ boxShadow: `0 0 50px ${ad.colorFrom}44` }}
        />
        
        {/* Main Product Image with Floating Animation */}
        <div className="relative z-10 animate-[bounce_4s_ease-in-out_infinite]">
          <img 
            src={ad.medicineImage || ad.imageDataUrl} 
            alt={ad.headline} 
            className="w-[280px] sm:w-[350px] md:w-[500px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105" 
          />
        </div>

        {/* Shadow underneath */}
        <div className="absolute bottom-[-20px] w-1/2 h-10 bg-black/30 blur-2xl rounded-[100%]" />
      </div>

    </div>
  </section>
);

// --- UI Component: Static Slide ---
const StaticSlide = ({ ad }) => (
  <section 
    className="relative w-full min-h-screen overflow-hidden flex items-center"
    style={{ backgroundImage: `url(${ad.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
  >
    <div className="relative z-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2">
      <div className="-mt-20 space-y-8">
        <p className={`font-medium ${ad.textColor1} ${ad.textSize1}`}>{ad.text1}</p>
        <p className={`font-extrabold ${ad.textColor2} ${ad.textSize2}`}>{ad.text2}</p>
      </div>
      <div className="relative flex items-center justify-center">
        <img src={ad.productImg} className={`absolute ${ad.productPosition} ${ad.productSize} z-10`} alt="prod" />
        <img src={ad.modelImg} className={`absolute ${ad.modelPosition} ${ad.modelSize} z-10`} alt="mod" />
      </div>
    </div>
  </section>
);

// --- Main Hero Page ---
const Hero = () => {
  const { fetchAll, ads: backendAds } = useCampaigns();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSlides, setAllSlides] = useState(staticAds);

  // Initial Data Fetch
  useEffect(() => {
    fetchAll(); // Hits the [HttpGet] GetAll method on your backend
  }, [fetchAll]);

  // Merge backend data with static slides
  useEffect(() => {
    if (backendAds && Array.isArray(backendAds) && backendAds.length > 0) {
      const dynamicSlides = backendAds.map(ad => ({
        ...ad,
        id: `dynamic-${ad.id}`,
        type: "dynamic"
      }));
      
      // We keep the static ones first, followed by dynamic ones
      setAllSlides([...staticAds, ...dynamicSlides]);
    }
  }, [backendAds]);

  // Autoplay Logic
  useEffect(() => {
    if (allSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [allSlides.length]);

  const activeSlide = allSlides[currentIndex];

  if (!activeSlide) return null;

  return (
    <div className="relative w-full min-h-screen">
      {activeSlide.type === "dynamic" ? (
        <DynamicSlide ad={activeSlide} />
      ) : (
        <StaticSlide ad={activeSlide} />
      )}

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {allSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex ? "w-10 h-3 bg-white" : "w-3 h-3 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;