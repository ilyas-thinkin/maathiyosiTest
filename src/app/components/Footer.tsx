"use client";

import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#fff7f7] to-[#fdf2f2] text-gray-700 border-t border-red-200">
      {/* ✅ Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ✅ Logo & About */}
        <div className="transition-transform hover:scale-[1.02] duration-300">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-wide">
            <span className="text-[#b91c1c]">Maathiyosi</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 max-w-sm">
            Maathiyosi is an edtech platform empowering students with cutting-edge
            courses in AI, IoT, Robotics, and Coding.
            <span className="block mt-1">Shaping future innovators for a smarter tomorrow.</span>
          </p>
        </div>

        {/* ✅ Services Section */}
        <div className="transition-transform hover:translate-y-[-2px] duration-300">
          <h3 className="text-lg font-semibold text-[#b91c1c] relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-[#b91c1c] after:mt-1">
            Our Services
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="hover:text-[#b91c1c] transition-colors duration-300 cursor-pointer">STEM / Robotics / AI Lab Setup</li>
            <li className="hover:text-[#b91c1c] transition-colors duration-300 cursor-pointer">STEM Classes with Kits</li>
            <li className="hover:text-[#b91c1c] transition-colors duration-300 cursor-pointer">Workshops & Events</li>
            <li className="hover:text-[#b91c1c] transition-colors duration-300 cursor-pointer">Internships</li>
            <li className="hover:text-[#b91c1c] transition-colors duration-300 cursor-pointer">Customised Automation</li>
          </ul>
        </div>

        {/* ✅ Important Links */}
        <div className="transition-transform hover:translate-y-[-2px] duration-300">
          <h3 className="text-lg font-semibold text-[#b91c1c] relative after:content-[''] after:block after:w-12 after:h-[2px] after:bg-[#b91c1c] after:mt-1">
            Important Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="/privacy-policy" className="hover:text-[#b91c1c] transition-colors duration-300">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms-and-conditions" className="hover:text-[#b91c1c] transition-colors duration-300">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ✅ Bottom Section */}
      <div className="border-t border-red-200 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm">
          <p className="text-gray-600 mb-3 md:mb-0">
            © {new Date().getFullYear()} <span className="font-semibold text-[#b91c1c]">Maathiyosi</span>. All rights reserved.
          </p>

          {/* ✅ Social Icons */}
          <div className="flex space-x-5 text-[#b91c1c] text-2xl">
            <a href="#" aria-label="Facebook" className="hover:text-[#7f1d1d] transform hover:scale-110 transition duration-300">
              <FaFacebook />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-[#7f1d1d] transform hover:scale-110 transition duration-300">
              <FaTwitter />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-[#7f1d1d] transform hover:scale-110 transition duration-300">
              <FaYoutube />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-[#7f1d1d] transform hover:scale-110 transition duration-300">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}