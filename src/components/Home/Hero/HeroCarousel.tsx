"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css/pagination";
import "swiper/css";

import Link from "next/link";

const HeroCarousal = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center justify-center py-16 sm:py-20 lg:py-28 px-6 sm:pl-12.5 text-center sm:text-left">
          <div className="max-w-[480px]">
            <span className="inline-block font-bold text-sm text-white bg-blue rounded-full px-4 py-1.5 mb-5">
              50% OFF
            </span>
            <h1 className="font-bold text-dark text-2xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
              Smart Tools for Smarter Homes
            </h1>
            <p className="text-gray-500 text-base sm:text-lg mb-8 leading-relaxed">
              Premium kitchen &amp; home gadgets that simplify your daily life. Discover trending utilities now.
            </p>
            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-semibold text-white text-sm rounded-lg bg-blue py-3.5 px-10 ease-out duration-200 hover:bg-blue-dark shadow-lg shadow-blue/25"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div className="flex items-center justify-center py-16 sm:py-20 lg:py-28 px-6 sm:pl-12.5 text-center sm:text-left">
          <div className="max-w-[480px]">
            <span className="inline-block font-bold text-sm text-white bg-teal rounded-full px-4 py-1.5 mb-5">
              40% OFF
            </span>
            <h1 className="font-bold text-dark text-2xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
              Trending Daily Utilities
            </h1>
            <p className="text-gray-500 text-base sm:text-lg mb-8 leading-relaxed">
              Problem-solving gadgets you didn&apos;t know you needed. Transform your home today.
            </p>
            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-semibold text-white text-sm rounded-lg bg-teal py-3.5 px-10 ease-out duration-200 hover:bg-teal-dark shadow-lg shadow-teal/25"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div className="flex items-center justify-center py-16 sm:py-20 lg:py-28 px-6 sm:pl-12.5 text-center sm:text-left">
          <div className="max-w-[480px]">
            <span className="inline-block font-bold text-sm text-white bg-orange rounded-full px-4 py-1.5 mb-5">
              30% OFF
            </span>
            <h1 className="font-bold text-dark text-2xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
              Kitchen Organizers &amp; Smart Storage
            </h1>
            <p className="text-gray-500 text-base sm:text-lg mb-8 leading-relaxed">
              Declutter your space with intelligent home solutions. Maximize every inch.
            </p>
            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-semibold text-white text-sm rounded-lg bg-orange py-3.5 px-10 ease-out duration-200 hover:bg-orange-dark shadow-lg shadow-orange/25"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
