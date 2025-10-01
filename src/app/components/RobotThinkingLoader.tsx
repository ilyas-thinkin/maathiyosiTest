"use client";

import { motion } from "framer-motion";

export default function ThinkingRobotLoader() {
  const eyeMovement = {
    lookLeft: { x: -2 },
    lookRight: { x: 2 },
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      {/* Robot Head */}
      <motion.div
        className="w-44 h-44 bg-gray-800 rounded-3xl relative flex flex-col items-center justify-center shadow-2xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        {/* Antenna + Gear */}
        <div className="absolute -top-10 flex flex-col items-center">
          <div className="w-1 h-6 bg-gray-700 rounded-full relative">
            <motion.div
              className="absolute -top-5 w-5 h-5 border-2 border-gray-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full absolute top-1 left-1" />
            </motion.div>
          </div>
          <motion.div
            className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg mt-1"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
          />
        </div>

        {/* Eyes */}
        <div className="flex gap-8 mb-6">
          <motion.div
            className="w-10 h-10 bg-white rounded-full relative"
            animate="lookLeft"
            variants={eyeMovement}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div className="w-4 h-4 bg-black rounded-full absolute top-3 left-3" />
          </motion.div>
          <motion.div
            className="w-10 h-10 bg-white rounded-full relative"
            animate="lookRight"
            variants={eyeMovement}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div className="w-4 h-4 bg-black rounded-full absolute top-3 left-3" />
          </motion.div>
        </div>

        {/* Mouth */}
        <motion.div
          className="w-20 h-2 bg-red-500 rounded-full"
          animate={{ scaleX: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
