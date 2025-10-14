import Image from "next/image";

// Do NOT import a path from public folder. Use path string instead.

export default function HeroSection() {
  return (
    <section className="relative flex items-center justify-center min-h-screen text-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/heroimgs/Class bg.jpg"  // Correct usage: as a string path
        alt="Background"
        fill
        priority
        className="object-cover object-center absolute inset-0 -z-10"
        style={{ filter: "brightness(0.7)" }}
      />

      {/* Overlay for color effect and text visibility */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(120deg, #fdb5b5cc 70%, #9dbdeccc 100%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Glassmorphism Hero Content */}
      <div className="relative z-10 px-6 py-12 bg-white/20 backdrop-blur-md rounded-xl shadow-xl max-w-xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-white drop-shadow">
          Dream. Learn. Achieve.
        </h1>
        <p className="text-lg md:text-xl text-white mb-6 font-medium italic drop-shadow">
          <span style={{ color: "#6d2424ff" }}>maathiyosi.io</span> — Ignite your passion for learning.
        </p>
        <button
          className="px-8 py-3 text-lg font-semibold text-white rounded-full shadow-lg hover:scale-105 transition"
          style={{
            background: "linear-gradient(90deg,#de5252,#fa7070)",
            boxShadow: "0 4px 20px 0 #de525299"
          }}
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
