import React from "react";

import { UploadCloud, Cpu, CheckCircle, Clock } from "lucide-react";

const steps = [
  {
    icon: <UploadCloud size={40} className="text-secondary" />,
    title: "Upload Prescription",
    desc: "Simply upload your handwritten prescription or medicine list securely to our platform.",
  },
  {
    icon: <Cpu size={40} className="text-secondary" />,
    title: "AI Analysis",
    desc: "Our smart AI engine scans and reads your prescription with high accuracy, recognizing medicine names, dosage, and instructions.",
  },
  {
    icon: <CheckCircle size={40} className="text-secondary" />,
    title: "Fast Processing",
    desc: "The system quickly converts handwritten notes into digital format, ready for pharmacists to review.",
  },
  {
    icon: <Clock size={40} className="text-secondary" />,
    title: "Ready to Use",
    desc: "The processed prescription is now ready for pharmacists to dispense safely and efficiently.",
  },
];

const HowItWorks = () => {
  return (
    <main className="bg-beige min-h-screen py-24">
      {/* HERO */}
      <section className="text-center mb-16 px-4">
        <h1 className="text-5xl font-bold mb-6">
          How <span className="text-secondary">It Works</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Our AI-powered prescription system is designed to simplify the workflow 
          for pharmacists and improve patient safety.
        </p>
      </section>

      {/* STEPS GRID */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition text-center"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mt-24 px-4">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Try It Yourself?
        </h2>
        <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
          Upload your prescription and see how fast and accurate our AI system works!
        </p>
        <button className="bg-secondary text-white px-10 py-4 text-xl rounded-full hover:opacity-90 transition">
          Upload Now
        </button>
      </section>
    </main>
  );
};

export default HowItWorks;
