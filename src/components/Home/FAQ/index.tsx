"use client";
import React, { useState } from "react";
import { CaretDown, Star } from "@phosphor-icons/react";
import Image from "next/image";

// ==========================================
// FAQ DATA - EDIT OR CHANGE QUESTIONS HERE
// ==========================================
const faqData = [
  {
    question: "What is your return policy?",
    answer: "You can request a return or exchange within 7 days of receiving your package. Returns are not accepted after this 7-day period.",
  },
  {
    question: "Is an unboxing video mandatory for wrong items?",
    answer: "Yes, an uncut unboxing video showing the shipping label and the actual unboxing is mandatory to claim a return/refund for a wrong package, damaged item, or missing items.",
  },
  {
    question: "How long does shipping take?",
    answer: "We typically dispatch orders within 24-48 hours. Shipping usually takes 3 to 7 business days depending on your delivery location.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, you will receive a tracking link via email or SMS to track the real-time status of your delivery.",
  },
  {
    question: "What payment methods do you support?",
    answer: "We support multiple secure payment options, including Visa, MasterCard, Apple Pay, Google Pay, UPI, and net banking.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="overflow-hidden py-16 sm:py-20 bg-gray-2 border-t border-gray-3">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
            <Image
              src="/images/icons/icon-07.svg"
              alt="icon"
              width={17}
              height={17}
            />
            Need Help?
          </span>
          <h2 className="font-semibold text-2xl xl:text-heading-4 text-dark">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-[800px] w-full mx-auto flex flex-col gap-4">
          {faqData.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-3 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-medium text-dark hover:text-blue transition-colors focus:outline-none"
                >
                  <span className="text-base sm:text-lg">{item.question}</span>
                  <CaretDown
                    size={20}
                    weight="bold"
                    className={`text-gray-4 transform transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-blue" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100 border-t border-gray-1" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="p-5 text-dark-4 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
