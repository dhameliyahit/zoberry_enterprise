import React from "react";
import HeroVideoPlayer from "./HeroVideoPlayer";
import HeroFeature from "./HeroFeature";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-[106px] xl:pt-[106px] pb-0 bg-white">
      {/* Subtle radial background accent */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.04]"
        style={{
          background: "radial-gradient(ellipse at top right, #293681 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Hero Content */}
        <div className="w-full mt-6 sm:mt-8 lg:mt-6">
          <HeroVideoPlayer />
        </div>
      </div>

      {/* Feature strip — full width with top border */}
      <div className="mt-14 border-t border-gray-2">
        <HeroFeature />
      </div>
    </section>
  );
};

export default Hero;
