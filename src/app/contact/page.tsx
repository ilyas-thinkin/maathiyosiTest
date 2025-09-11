'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  MessageSquare,
  ArrowRight,
  Clock,
  ChevronDown
} from 'lucide-react';

export default function ContactPage() {
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleWhatsAppSend = () => {
    if (!whatsappMessage.trim()) return;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/919894919993?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center pt-16 px-4 relative overflow-hidden">
      {/* Floating Background Orbs */}
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-72 h-72 bg-green-200 rounded-full blur-3xl top-[-80px] left-[-100px] opacity-30"
      />
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-80 h-80 bg-blue-200 rounded-full blur-3xl bottom-[-100px] right-[-100px] opacity-30"
      />

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Let's <span className="text-green-600">Connect</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Have questions, feedback, or just want to say hello? We're here to listen and assist you!
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-10 max-w-7xl w-full relative z-10">
        {/* Contact Info + Map */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Contact Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Relations</p>
                  <p className="text-lg font-medium text-gray-800">+91 98949 19993</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">General Inquiries</p>
                  <p className="text-lg font-medium text-gray-800">thinklab@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Support</p>
                  <p className="text-lg font-medium text-gray-800">info@thinkinlab.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-red-100 rounded-xl group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Visit Us</p>
                  <p className="text-lg font-medium text-gray-800 leading-snug">
                    64/1 Anna Salai, Hakeem Nagar,
                    <br />
                    Melvisharam, Ranipet 632 509
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-yellow-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Office Hours</p>
                  <p className="text-lg font-medium text-gray-800">
                    Mon - Sat: 9:00 AM - 7:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed */}
          {/* Map Embed — no API key, Google will show its own pin for Thinkin Lab */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.3 }}
  className="overflow-hidden rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all relative group"
>
  {/* Subtle hover glow */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-t from-green-200 via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity rounded-3xl pointer-events-none"
  />

  <iframe
    title="Thinkin Lab Location"
    src="https://www.google.com/maps?q=Thinkin%20Lab%2C%2064%20Anna%20Salai%20Main%20Rd%2C%20Melvisharam%2C%20Tamil%20Nadu%20632509&output=embed"
    className="w-full h-80 border-0 transition-transform duration-500 group-hover:scale-[1.03]"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
  ></iframe>
</motion.div>

{/* Get Directions CTA (keeps working as before) */}
<motion.a
  href="https://www.google.com/maps/dir/?api=1&destination=Thinkin+Lab%2C+64+Anna+Salai+Main+Rd%2C+Melvisharam%2C+Tamil+Nadu+632509"
  target="_blank"
  rel="noopener noreferrer"
  whileHover={{ scale: 1.05 }}
  className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
>
  Get Directions
</motion.a>

        </motion.div>

        {/* WhatsApp Chat Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-green-50 rounded-3xl shadow-lg p-8 flex flex-col border border-green-100 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-800">WhatsApp Us</h2>
          </div>

          <p className="text-gray-600 mb-4">
            Send us a message directly on WhatsApp. We'll respond as quickly as possible.
          </p>

          <textarea
            placeholder="Type your message here..."
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none min-h-[140px] mb-4 text-gray-800"
          />

          <motion.button
            onClick={handleWhatsAppSend}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-md"
          >
            <Send className="w-5 h-5" />
            Send Message
          </motion.button>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="max-w-4xl w-full mt-16 mb-20 relative z-10"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What courses do you offer?",
              a: "We offer a variety of courses focused on technology, education, and skill development. You can explore them on our courses page."
            },
            {
              q: "How can I enroll in a course?",
              a: "You can enroll online by creating an account and completing the payment securely through our platform."
            },
            {
              q: "Do you provide customer support?",
              a: "Yes, we have a dedicated support team available via WhatsApp, email, and phone."
            }
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="text-gray-800 font-medium">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFAQ === index && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-gray-600 mt-3 text-sm"
                >
                  {faq.a}
                </motion.p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/919894919993"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.a>
    </div>
  );
}
