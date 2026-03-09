import React from "react";
import HeroImg from "../../../assets/HeroImg.png";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden bg-page">
      <div className="container mx-auto px-6 lg:px-0 grid grid-cols-1 lg:grid-cols-2 items-center min-h-[650px] gap-10">

        {/* Text Section */}
        <div className="flex flex-col justify-center animate-fade-in-up text-center lg:text-left">

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
              <span className="text-secondary relative inline-block">
                Read
                <span className="absolute left-0 -bottom-1 w-full h-1 bg-secondary opacity-30 animate-pulse"></span>
              </span>{" "}
              Prescriptions
            </h1>

            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold">
              Instantly —
            </h1>

            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold">
              Powered by{" "}
              <span className="text-secondary relative inline-block">
                AI
                <span className="absolute inset-0 bg-secondary/10 blur-lg rounded-full animate-pulse"></span>
              </span>
            </h1>
          </div>

          {/* Description */}
          <div className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 space-y-1">
            <p>Upload your handwritten prescription</p>
            <p>or medicine list, and let our smart</p>
            <p>system help pharmacists process it</p>
            <p>fast and accurately.</p>
          </div>

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
        <div className="flex justify-center lg:justify-end animate-fade-in">
          <img
            src={HeroImg}
            alt="Hero"
            className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[420px] lg:max-w-[500px] object-contain animate-float"
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