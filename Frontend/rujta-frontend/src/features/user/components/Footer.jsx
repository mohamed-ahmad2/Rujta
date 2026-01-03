import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

const FooterLinks = [
  { title: "Home", link: "/user" },
  { title: "Orders", link: "/user/orders" },
  { title: "Profile", link: "/user/profile" },
  { title: "Contact", link: "/contact" },
];

const Footer = () => {
  return (
    <div className="text-white py-10 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Company Info */}
          <div className="py-4 px-4">
            <h1 className="text-2xl font-bold mb-3">Rujta</h1>
            <p className="text-gray-400 text-sm leading-6">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Cum in beatae ea recusandae blanditiis veritatis.
            </p>
          </div>

          {/* Links */}
          <div className="py-4 px-4 md:col-span-2">
            <h1 className="text-xl font-semibold mb-3">Important Links</h1>

            <ul className="flex flex-col sm:flex-row flex-wrap gap-4">
              {FooterLinks.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.link}
                    className="text-gray-300 hover:text-secondary hover:translate-x-1 duration-300 inline-block"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="hover:text-secondary">
                <FaInstagram className="text-2xl" />
              </a>
              <a href="#" className="hover:text-secondary">
                <FaFacebook className="text-2xl" />
              </a>
              <a href="#" className="hover:text-secondary">
                <FaLinkedin className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="text-center text-gray-500 text-sm mt-8 border-t border-gray-700 pt-4">
          © {new Date().getFullYear()} Rujta. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;
