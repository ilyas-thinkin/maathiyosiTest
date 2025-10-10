"use client";

import { useEffect } from "react";
import HeroCarousel from "./HeroCarousel1 copy";

// ✅ Local type workaround (without needing global.d.ts)
type SplineViewerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & { url?: string };

// ✅ Tell TypeScript to ignore JSX type checking for this tag name
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": SplineViewerProps;
    }
  }
}

export default function HeroSection() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.10.77/build/spline-viewer.js";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="relative w-full h-[90vh] md:h-[100vh] overflow-hidden">
          {/* ✅ TypeScript now recognizes this tag */}
          <spline-viewer
            url="https://prod.spline.design/rTrnaZjpBlGzEDP8/scene.splinecode"
            style={{
              width: "100%",
              height: "120%",
              position: "absolute",
              top: "-10%",
              left: 0,
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/60 -z-10"></div>

      <div className="relative z-10 text-center mt-12 px-6 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60a5fa] via-[#a855f7] to-[#ec4899]">
            Learn Future Skills
          </span>
        </h1>

        <p className="text-lg md:text-2xl italic text-gray-200 max-w-2xl mx-auto mb-6 leading-relaxed drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">
          “The future belongs to those who learn, unlearn, and relearn.”
        </p>

        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">
          Master cutting-edge technologies with expert-led courses designed for
          the innovators of tomorrow.
        </p>
      </div>
    </section>
  );
}
