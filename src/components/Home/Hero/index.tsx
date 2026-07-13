import React from "react";
import HeroVideoPlayer from "./HeroVideoPlayer";
import HeroFeature from "./HeroFeature";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-0 pt-28 sm:pt-32 lg:pt-[106px] xl:pt-[106px]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="w-full mt-6 sm:mt-8 lg:mt-6 lg:h-[calc(100vh-162px)] lg:min-h-[480px]">
          <div className="relative z-1 lg:h-full">
            <HeroVideoPlayer />
          </div>
        </div>
      </div>

      <HeroFeature />
    </section>
  );
};

export default Hero;
