import React from "react";
import Image from "next/image";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Free Shipping",
    description: "For all orders above ₹2000",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "Easy 7-Day Returns",
    description: "Hassle-free return process",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "100% Secure Payments",
    description: "Prepaid online payments only",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "24/7 Dedicated Support",
    description: "Anywhere & anytime",
  },
];

const HeroFeature = () => {
  return (
    <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-0 lg:divide-x divide-gray-3 py-2">
        {featureData.map((item, key) => (
          <div
            className="group flex items-center gap-3.5 px-0 lg:px-6 xl:px-8 py-5 first:pl-0 last:pr-0 hover:bg-transparent transition-all duration-200"
            key={key}
          >
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-blue/8 border border-blue/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-blue/12 group-hover:scale-105 group-hover:shadow-sm">
              <Image
                src={item.img}
                alt={item.title}
                width={22}
                height={22}
                className="object-contain"
              />
            </div>

            {/* Text */}
            <div>
              <h3 className="font-bold text-[13px] text-dark leading-snug group-hover:text-blue transition-colors duration-200">
                {item.title}
              </h3>
              <p className="text-[11px] text-dark-4 mt-0.5 leading-snug">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
