import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const messages = [
  "Free Express Shipping on orders over Rs. 1500",
  "ONLY PREPAYMENTS ACCEPTED",
  "Sign up today and get 10% off your first order"
];

const Topbar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + messages.length) % messages.length);
  };

  return (
    <div className="bg-primary-hover text-white text-xs py-2 px-4 relative flex justify-center items-center h-10 overflow-hidden">
      <button 
        onClick={prevSlide} 
        className="absolute left-4 md:left-8 p-1.5 bg-white/5 hover:bg-white/20 rounded cursor-pointer transition-colors flex items-center justify-center z-10"
        aria-label="Previous announcement"
      >
        <FiChevronLeft size={16} />
      </button>
      
      {/* 
        Using key={currentIndex} forces React to destroy and recreate the div,
        which perfectly retriggers our new 'animate-slide-up' CSS class!
      */}
      <div 
        key={currentIndex} 
        className="text-center font-medium tracking-wider uppercase w-full max-w-2xl animate-slide-up whitespace-nowrap"
      >
        {messages[currentIndex]}
      </div>

      <button 
        onClick={nextSlide} 
        className="absolute right-4 md:right-8 p-1.5 bg-white/5 hover:bg-white/20 rounded cursor-pointer transition-colors flex items-center justify-center z-10"
        aria-label="Next announcement"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};

export default Topbar;
