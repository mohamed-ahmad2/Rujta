import React from 'react'
import HeroImag from"../../assets/HeroImg.png";
import imge1 from"../../assets/hero/img1.png";
import imge2 from"../../assets/hero/img2.png";
import imge3 from"../../assets/hero/img3.png";
import imge4 from"../../assets/hero/img4.png";

const Hero = () => {
  return (
    <div
      className="relative overflow-hidden min-h-[550px] sm:min-h-[650px] 
                 bg-page flex justify-center items-center 
                 dark:bg-gray-950 dark:text-white duration-200"
    >
      {/* background pattern */}
      <div
        className="h-[700px] w-[700px] bg-whitebg-primary/40 absolute 
                   -top-1/2 right-0 rounded-3xl rotate-45 -z-10"
      ></div>

      {/* hero section */}
      <div className="container pb-8 sm:pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
          
          {/* text content section */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Your Prescription for <br /> Affordable Health <br/>Solutions!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Elevate your health journey with exclusive discounts and unparalleled convenience. Your path to well-being starts here, where every purchase is a prescription for savings.
            </p>
            <div>
              <button
                onClick={() => alert("Ordering not available yet")}
                className="bg-gradient-to-r from-primary to-secondary 
                           hover:scale-105 transition-transform duration-200 
                           text-white py-2 px-5 rounded-full shadow-md"
              >
                Order Now
              </button>
            </div>
          </div>

          {/* image section */}
          <div className="flex justify-center sm:justify-end">
            <img
              src={HeroImag}
              alt=""
              className="w-[1000px] sm:w-[1000px] drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;


