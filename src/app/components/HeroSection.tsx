// src/components/HeroSection.tsx

import HeroCarousel from './HeroCarousel1 copy';

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Learn Future Skills</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Master cutting-edge technologies with expert-led courses designed for the innovators of tomorrow
          </p>
        </div>
        <HeroCarousel />
      </div>
    </section>
  );
}