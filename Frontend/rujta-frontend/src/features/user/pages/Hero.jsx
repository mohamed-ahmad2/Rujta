import React, { useEffect, useState } from "react";

// ===== IMAGES =====
import productImg1 from "../../../assets/hero/pantin.png";
import modelImg1 from "../../../assets/hero/model.png";
import bg1 from "../../../assets/hero/bg1.png";

import productImg2 from "../../../assets/hero/i2.png";
import modelImg2 from "../../../assets/hero/bbb.png";
import bg2 from "../../../assets/hero/bg22.png";

import productImg3 from "../../../assets/hero/i1.png";
import modelImg3 from "../../../assets/hero/mod.png";
import bg3 from "../../../assets/hero/bg3.png";

// ===== ADS CONFIG =====
const ads = [
   {
    text1: "بشرة اجمل مع ",
    text2: "ordenary",
    textColor1: "text-gray-900",
    textColor2: "text-red-900",
    textSize1: "text-3xl sm:text-5xl md:text-8xl",
    textSize2: "text-5xl sm:text-6xl md:text-9xl",
    bgType: "image",
    bgImage: bg3,
    showBrand: false,
    productImg: productImg3,
    productSize: "w-[260px] sm:w-[420px] md:w-[900px]",
    productPosition: `
      left-1/2 -translate-x-1/2 bottom-[-80px]
      sm:bottom-[-200px]
      md:left-[-500px] md:translate-x-0 md:bottom-[-350px]
    `,
    modelImg: modelImg3,
    modelSize: "md:w-[450px]",
    modelPosition: "hidden md:block md:right-[-100px] md:bottom-[-280px]",
  },
  {
    text1: "يعالج ويحمي",
    text2: "من تلف الماء",
    textColor1: "text-gray-900",
    textColor2: "text-yellow-600",
    textSize1: "text-4xl sm:text-5xl md:text-8xl",
    textSize2: "text-5xl sm:text-5xl md:text-8xl",
    bgType: "image",
    bgImage: bg1,
    showBrand: true,
    productImg: productImg1,
    productSize: "w-[240px] sm:w-[500px] md:w-[700px]",
    productPosition: `
      left-1/2 -translate-x-1/2 bottom-[-80px]
      sm:bottom-[-200px]
      md:left-[-500px] md:translate-x-0 md:bottom-[-400px]
    `,
    modelImg: modelImg1,
    modelSize: "md:w-[650px]",
    modelPosition: "hidden md:block md:right-[-100px] md:bottom-[-380px]",
  },
  {
    text1: "سعادة طفلك مع",
    text2: "SMARTH",
    textColor1: "text-gray-900",
    textColor2: "text-[#8124B9]",
    textSize1: "text-3xl sm:text-4xl md:text-7xl",
    textSize2: "text-4xl sm:text-5xl md:text-8xl",
    bgType: "image",
    bgImage: bg2,
    showBrand: false,
    productImg: productImg2,
    productSize: "w-[260px] sm:w-[320px] md:w-[900px]",
    productPosition: `
      left-1/2 -translate-x-1/2 bottom-[-80px]
      sm:bottom-[-200px]
      md:left-[-500px] md:translate-x-0 md:bottom-[-400px]
    `,
    modelImg: modelImg2,
    modelSize: "md:w-[450px]",
    modelPosition: "hidden md:block md:right-[-100px] md:bottom-[-280px]",
  },
 
];

const HeroPanteneStyle = () => {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const ad = ads[currentAd];

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex items-center"
      style={{
        backgroundImage: `url(${ad.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2">
        {/* TEXT */}
        <div className="-mt-10 sm:-mt-20 md:-mt-64 space-y-9 md:space-y-11">
          <p className={`font-medium ${ad.textColor1} ${ad.textSize1}`}>
            {ad.text1}
          </p>
          <p className={`font-extrabold ${ad.textColor2} ${ad.textSize2}`}>
            {ad.text2}
          </p>
        </div>

        {/* VISUAL */}
        <div className="relative flex items-center justify-center mt-20 md:mt-16">
          <img
            src={ad.productImg}
            alt="Product"
            className={`absolute ${ad.productPosition} ${ad.productSize} z-10`}
          />
          <img
            src={ad.modelImg}
            alt="Model"
            className={`absolute ${ad.modelPosition} ${ad.modelSize} z-10`}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroPanteneStyle;
