import React from "react";
import HeroImg from "../../../assets/HeroImg.png";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden bg-page">
      <div className="container mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 items-center min-h-[650px] gap-6 lg:gap-0 py-12 lg:py-0">

        {/* Text Section */}
        <div className="flex flex-col justify-center animate-fade-in-up text-center lg:text-left order-2 lg:order-1">

          {/* Heading */}
          <div className="space-y-1 lg:space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span className="text-secondary relative inline-block">
                Read
                <span className="absolute left-0 -bottom-1 w-full h-1 bg-secondary opacity-30 animate-pulse"></span>
              </span>{" "}
              Prescriptions
            </h1>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold">
              Instantly —
            </h1>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold">
              Powered by{" "}
              <span className="text-secondary relative inline-block">
                AI
                <span className="absolute inset-0 bg-secondary/10 blur-lg rounded-full animate-pulse"></span>
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Upload your handwritten prescription or medicine list, and let our smart
            system help pharmacists process it fast and accurately.
          </p>

          {/* Button */}
          <div className="mt-8 flex justify-center lg:justify-start">
            <button
              className="primary-btn px-8 py-3 text-lg sm:text-xl 
              transition-all duration-300 
              hover:scale-105 hover:shadow-xl active:scale-95"
              onClick={() => navigate("/how-it-works")}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex justify-center lg:justify-end items-center animate-fade-in order-1 lg:order-2">
          <img
            src={HeroImg}
            alt="Hero"
            className="w-[75vw] max-w-[320px] sm:max-w-[380px] lg:max-w-none lg:w-[90%] xl:w-[85%] object-contain animate-float"
          />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeUp 0.9s ease forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1.2s ease forwards;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(-10px);
          }
          50% {
            transform: translateY(10px);
          }
          100% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
