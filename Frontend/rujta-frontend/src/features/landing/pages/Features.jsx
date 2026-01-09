import React from "react";
import {
  Cpu,
  ScanLine,
  ShieldCheck,
  Clock,
  FileText,
  Users,
} from "lucide-react";

const featuresData = [
  {
    icon: <ScanLine size={36} />,
    title: "AI Prescription Reading",
    desc: "Advanced AI technology accurately reads handwritten prescriptions, even with unclear writing.",
  },
  {
    icon: <Clock size={36} />,
    title: "Fast Processing",
    desc: "Convert prescriptions into digital data within seconds, saving pharmacists valuable time.",
  },
  {
    icon: <FileText size={36} />,
    title: "Medicine Recognition",
    desc: "Automatically detects medicine names, dosage, and instructions with high precision.",
  },
  {
    icon: <ShieldCheck size={36} />,
    title: "Secure & Reliable",
    desc: "All uploaded prescriptions are processed securely with full data privacy protection.",
  },
  {
    icon: <Users size={36} />,
    title: "Pharmacist Friendly",
    desc: "Designed specifically for pharmacists to simplify daily workflow and reduce errors.",
  },
  {
    icon: <Cpu size={36} />,
    title: "Smart AI Engine",
    desc: "Powered by modern AI models trained on medical handwriting patterns.",
  },
];

const Features = () => {
  return (
    <main className="bg-beige min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            Powerful <span className="text-secondary">Features</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Our AI-powered system is built to help pharmacists read prescriptions
            faster, reduce mistakes, and improve patient safety.
          </p>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuresData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition"
              >
                <div className="text-secondary mb-4">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT HELPS DOCTORS & PHARMACISTS ===== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Why Doctors & Pharmacists Trust Us
            </h2>
            <ul className="space-y-4 text-lg text-gray-700">
              <li>✔ Reduces prescription interpretation errors</li>
              <li>✔ Saves time during busy pharmacy hours</li>
              <li>✔ Improves patient safety and confidence</li>
              <li>✔ Supports digital transformation in healthcare</li>
            </ul>
          </div>

          <div className="bg-beige rounded-2xl p-10">
            <h3 className="text-3xl font-semibold mb-4 text-secondary">
              Real Healthcare Impact
            </h3>
            <p className="text-gray-700 leading-relaxed">
              By combining artificial intelligence with healthcare expertise,
              our platform helps medical professionals focus on patient care
              instead of struggling with unclear handwriting.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Experience Smart Prescription Reading?
          </h2>
          <p className="text-xl text-gray-700 mb-10">
            Join the future of digital healthcare powered by AI.
          </p>
          <button className="bg-secondary text-white px-10 py-4 text-xl rounded-full hover:opacity-90 transition">
            Get Started Now
          </button>
        </div>
      </section>
    </main>
  );
};

export default Features;
