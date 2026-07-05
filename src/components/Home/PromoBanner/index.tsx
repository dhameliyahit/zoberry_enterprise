import React from "react";
import Link from "next/link";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Wide Problem-Solver Spotlight banner */}
        <div className="relative z-1 overflow-hidden rounded-lg bg-gradient-to-r from-[#FFF3E6] via-[#FFF8F0] to-[#FFFDF9] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full relative z-10">
            <span className="inline-block font-semibold text-sm text-orange bg-orange/10 rounded-full px-4 py-1.5 mb-4">
              Problem-Solver Spotlight
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
              Smart Solutions for Everyday Chores
            </h2>

            <p className="text-gray-600 leading-relaxed">
              From kitchen innovators to home organization must-haves &mdash;
              discover trending utilities that simplify your daily routine.
              Buy 1 Get 1 Free on select items!
            </p>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-medium text-custom-sm text-white bg-orange py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
            >
              Explore Deals
            </Link>
          </div>
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* Value Combo Deal */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-gradient-to-br from-[#DBF4F3] to-[#E8FAF9] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <div className="relative z-10">
              <span className="inline-block text-sm font-semibold text-teal bg-teal/10 rounded-full px-3 py-1 mb-3">
                Value Combo
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Kitchen Must-Haves
              </h2>

              <p className="max-w-[285px] text-custom-sm text-gray-600 mb-1.5">
                Buy 2 kitchen gadgets and save flat 30%. Perfect combo deals for every home.
              </p>

              <p className="font-semibold text-custom-1 text-teal">
                Flat 30% off on Combos
              </p>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
              >
                Shop Combos
              </Link>
            </div>
          </div>

          {/* Daily Utility Deal */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-gradient-to-br from-[#E8E6FF] to-[#F0EEFF] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <div className="relative z-10">
              <span className="inline-block text-sm font-semibold text-purple bg-purple/10 rounded-full px-3 py-1 mb-3">
                Daily Essentials
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Home Organization Essentials
              </h2>

              <p className="max-w-[285px] text-custom-sm text-gray-600 mb-1.5">
                Transform cluttered spaces into organized havens. Storage solutions starting at just ₹199.
              </p>

              <p className="font-semibold text-custom-1 text-purple">
                Starting at ₹199
              </p>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex font-medium text-custom-sm text-white bg-purple py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-purple-dark mt-7.5"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
