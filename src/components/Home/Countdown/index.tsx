"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const CounDown = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const deadline = "December, 31, 2026";

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    // @ts-ignore
    const interval = setInterval(() => getTime(deadline), 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-lg bg-gradient-to-r from-[#D0E9F3] via-[#D8ECF5] to-[#E8F4FA] p-4 sm:p-7.5 lg:p-10 xl:p-15">
          <div className="max-w-[520px] w-full relative z-10">
            <span className="inline-block font-semibold text-sm text-blue bg-blue/10 rounded-full px-4 py-1.5 mb-2.5">
              Flash Sale of the Week
            </span>

            <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3">
              Deal of the Day &mdash; Kitchen Hero
            </h2>

            <p className="text-gray-600 mb-1">
              Premium multi-purpose kitchen gadget at a steep promotional discount. Limited stock &mdash; grab it before it&apos;s gone!
            </p>

            <p className="font-semibold text-blue text-lg mb-3">
              ₹299 <span className="text-dark-4 line-through font-normal text-base">₹799</span>{" "}
              <span className="text-sm text-red font-medium">63% OFF</span>
            </p>

            {/* Countdown timer */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {days < 10 ? "0" + days : days}
                </span>
                <span className="block text-custom-sm text-dark text-center">Days</span>
              </div>

              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {hours < 10 ? "0" + hours : hours}
                </span>
                <span className="block text-custom-sm text-dark text-center">Hours</span>
              </div>

              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {minutes < 10 ? "0" + minutes : minutes}
                </span>
                <span className="block text-custom-sm text-dark text-center">Minutes</span>
              </div>

              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {seconds < 10 ? "0" + seconds : seconds}
                </span>
                <span className="block text-custom-sm text-dark text-center">Seconds</span>
              </div>
            </div>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-3 px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Shop the Deal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounDown;
