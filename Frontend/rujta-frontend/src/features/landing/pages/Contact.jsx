import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your message has been sent.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <main className="bg-beige min-h-screen py-24">
      {/* HERO */}
      <section className="text-center mb-16 px-4">
        <h1 className="text-5xl font-bold mb-6">
          Contact <span className="text-secondary">Us</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Have a question or feedback? Reach out to our support team and we’ll respond promptly.
        </p>
      </section>

      {/* CONTACT INFO + FORM */}
      <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-10 shadow-md">
          <h2 className="text-3xl font-semibold mb-6 text-secondary">Get in Touch</h2>
          <p className="text-gray-700 mb-4">Email us at:</p>
          <p className="text-lg font-medium mb-6">support@rujta.com</p>
          <p className="text-gray-700 mb-4">Call us:</p>
          <p className="text-lg font-medium mb-6">+20 123 456 7890</p>
          <p className="text-gray-700">Our team is here to answer your questions and support you 24/7.</p>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-10 shadow-md space-y-6"
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows="5"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
          ></textarea>
          <button
            type="submit"
            className="bg-secondary text-white px-10 py-4 rounded-full hover:opacity-90 transition text-lg font-semibold"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
};

export default Contact;
