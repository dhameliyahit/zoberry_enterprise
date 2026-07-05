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
    description: "Prepaid online payments only (No COD)",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 xl:gap-10 mt-10">
        {featureData.map((item, key) => (
          <div className="flex items-center gap-4" key={key}>
            <Image src={item.img} alt="icons" width={40} height={41} />

            <div>
              <h3 className="font-semibold text-base text-dark leading-snug">{item.title}</h3>
              <p className="text-xs text-gray-6 mt-0.5 leading-snug">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
