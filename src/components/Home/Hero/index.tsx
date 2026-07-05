import React from "react";
import HeroVideoPlayer from "./HeroVideoPlayer";
import HeroFeature from "./HeroFeature";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-0 pt-28 sm:pt-32 lg:pt-26 xl:pt-28">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="w-full mt-6 sm:mt-8">
          <div className="relative z-1 rounded-[10px] overflow-hidden">
            <HeroVideoPlayer />
          </div>
        </div>
      </div>

      <HeroFeature />
    </section>
  );
};

export default Hero;
