"use client";

import { useState } from 'react';
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram, FaLinkedin, FaGithub, FaMailBulk, FaPhone, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { motion } from 'framer-motion';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const footerLinks = {
    services: [
      { name: 'STEM / Robotics / AI Lab Setup', href: '#' },
      { name: 'STEM Classes with Kits', href: '#' },
      { name: 'Workshops & Events', href: '#' },
      { name: 'Internships', href: '#' },
      { name: 'Customised Automation', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Our Team', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Contact Us', href: '/contact' },
    ],
  };

  const socialLinks = [
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FaGithub, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="bg-gradient-to-br from-[#de5252] via-[#d63838] to-[#c41e1e] text-white relative overflow-hidden mt-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Maathiyosi</h2>
                  <p className="text-white/80 text-sm">Education for Tomorrow</p>
                </div>
              </div>
              
              <p className="text-white/90 leading-relaxed text-lg">
                Empowering students with cutting-edge courses in AI, IoT, Robotics, and Coding. 
                Shaping future innovators for a smarter tomorrow.
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-white" />
                  </div>
                  <span className="text-base">123 Innovation Street, Tech City</span>
                </div>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-white" />
                  </div>
                  <span className="text-base">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaMailBulk className="text-white" />
                  </div>
                  <span className="text-base">info@maathiyosi.com</span>
                </div>
              </div>
            </motion.div>

            {/* Services Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-6 relative inline-block">
                  Our Services
                  <span className="absolute -bottom-2 left-0 w-16 h-1 bg-white rounded-full"></span>
                </h3>
              </div>
              <ul className="space-y-4">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-white/90 hover:text-white transition-all duration-200 flex items-center group text-lg"
                    >
                      <FaArrowRight className="w-4 h-4 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-6 relative inline-block">
                  Company
                  <span className="absolute -bottom-2 left-0 w-16 h-1 bg-white rounded-full"></span>
                </h3>
              </div>
              <ul className="space-y-4">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-white/90 hover:text-white transition-all duration-200 flex items-center group text-lg"
                    >
                      <FaArrowRight className="w-4 h-4 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-6 relative inline-block">
                  Stay Updated
                  <span className="absolute -bottom-2 left-0 w-16 h-1 bg-white rounded-full"></span>
                </h3>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                Subscribe to our newsletter for the latest courses and updates.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:border-white/50 transition-all duration-200 text-lg"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-white text-[#de5252] py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Subscribe Now
                </button>
              </form>

              {/* Social Links */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 transform hover:scale-110 border border-white/30"
                    >
                      <social.icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              <div className="text-white/90 text-lg">
                © {new Date().getFullYear()}{' '}
                <span className="font-bold text-white">Maathiyosi</span>. 
                All rights reserved.
              </div>
              
              <div className="flex space-x-8 text-lg">
                <a href="/privacy" className="text-white/90 hover:text-white transition-colors duration-200 font-medium">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-white/90 hover:text-white transition-colors duration-200 font-medium">
                  Terms & Conditions
                </a>
                <a href="/return" className="text-white/90 hover:text-white transition-colors duration-200 font-medium">
                  Return Policy
                </a>
                <a href="/contact" className="text-white/90 hover:text-white transition-colors duration-200 font-medium">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}