import React from "react";
import doctorImg from "../../../assets/change/HeroImg1.png"; // صورة الدكتور عندك
import vitaminImg from "../../../assets/pro/m3.png"; // صورة الدواء أو المنتج

const OffersSection = () => {
  return (
    <div className="bg-white py-14 px-4">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-[#FFE7C4] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Get 30% OFF
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Save big on your favorite vitamins and supplements.
            </p>
          </div>
          <button className="mt-auto text-[#1A3E1A] font-semibold hover:underline">
            Shop Now →
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-[#D8F3DC] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Free Home Delivery
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Order medicines and get them delivered safely to your door.
            </p>
          </div>
          <button className="mt-auto text-[#1A3E1A] font-semibold hover:underline">
            Learn More →
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-[#EDE7F6] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Doctor's Appointment
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Schedule online consultations anytime.
              </p>
            </div>
            <img
              src={doctorImg}
              alt="Doctor"
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#FFF9C4] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Vitamin D3 Supplement
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Boost your immunity and stay healthy.
              </p>
            </div>
            <img
              src={vitaminImg}
              alt="Vitamin"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-[#FCE4EC] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Operational Optimization
          </h3>
          <p className="text-sm text-gray-600">
            Improve your workflow and save time.
          </p>
        </div>

        {/* Card 6 */}
        <div className="bg-[#C8E6C9] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Exclusive Health Tips
          </h3>
          <p className="text-sm text-gray-600">
            Stay updated with daily healthcare guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OffersSection;