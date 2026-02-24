import React from "react";
import HeroImg from "../../../assets/HeroImg.png";
import { useNavigate } from "react-router-dom";
import HowItWorks from "./HowItWorks";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden">
      <div className="container grid grid-col-1 md:grid-col-2 min-h-[650px] relative bg-page">

        {/* Brand Info */}
        <div className="flex flex-col justify-center py-14 md:py-0 animate-fade-in-up">
          <div className="text-center md:text-left space-y-6">

            {/* Heading */}
            <div className="text-4xl lg:text-6xl font-bold leading-relaxed xl:leading-normal relative">
              <h2 className="animate-slide-up delay-100">
                <span className="text-secondary relative inline-block">
                  Read
                  <span className="absolute left-0 -bottom-1 w-full h-1 bg-secondary opacity-30 animate-pulse"></span>
                </span>{" "}
                Prescriptions
              </h2>

              <h2 className="animate-slide-up delay-200">
                Instantly —
              </h2>

              <h2 className="animate-slide-up delay-300">
                Powered by{" "}
                <span className="text-secondary relative inline-block">
                  AI
                  <span className="absolute inset-0 bg-secondary/10 blur-lg rounded-full animate-pulse"></span>
                </span>
                !
              </h2>
            </div>

            {/* Description */}
            <div className="text-3xl xl:max-w-[500px] space-y-1 animate-fade-in delay-500">
              <p>Upload your handwritten prescription</p>
              <p>or medicine list, and let our smart</p>
              <p>system help pharmacists process it</p>
              <p>fast and accurately.</p>
            </div>
          </div>

          {/* Button section */}
          <div className="flex justify-center gap-8 md:justify-start !mt-4">
            <button
              className="primary-btn flex items-center gap-4 mt-10 text-2xl md:text-3xl 
              transition-all duration-300 ease-in-out 
              hover:scale-105 hover:shadow-xl active:scale-95"
              onClick={() => navigate("/how-it-works")}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex justify-center md:justify-end items-center relative">
          <img
            src={HeroImg}
            alt="Hero"
            className="w-[80%] md:w-[60%] lg:w-[50%] object-contain 
            translate-y-[-60px] md:translate-y-[-80px] lg:translate-y-[-550px]
            animate-float transition-transform duration-500"
          />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeUp 0.9s ease forwards;
        }

        .animate-slide-up {
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }

        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1s ease forwards;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes float {
          0% { transform: translateY(-550px); }
          50% { transform: translateY(-535px); }
          100% { transform: translateY(-550px); }
        }
      `}</style>
    </section>
  );
};

export default Hero;