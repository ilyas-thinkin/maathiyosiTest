// src/components/HeroSection.tsx

import HeroCarousel from './HeroCarousel';

export default function HeroSection() {
  return (
    <div className="pt-2">
      <div className="mt-2 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <HeroCarousel />
      </div>
    </div>
  );
}
