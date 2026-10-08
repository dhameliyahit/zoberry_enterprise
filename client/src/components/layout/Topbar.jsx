import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiShield, FiTruck, FiTag } from 'react-icons/fi';

const announcements = [
  { text: 'FREE Standard Shipping on eligible orders above ₹499', icon: FiTruck },
  { text: '100% Secure & Verified Payments via PhonePe', icon: FiShield },
  { text: 'Direct Warehouse Value — Smart Home & Kitchen Utilities', icon: FiTag },
];

export function Topbar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const CurrentIcon = announcements[currentIndex].icon;

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 relative flex items-center justify-between border-b border-slate-800 select-none">
      <div className="container mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous announcement"
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
        >
          <FiChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center justify-center gap-2 overflow-hidden text-center px-4 font-medium tracking-wide">
          <CurrentIcon className="w-3.5 h-3.5 text-blue-400 shrink-0 hidden sm:block" />
          <span key={currentIndex} className="animate-fade-in truncate">
            {announcements[currentIndex].text}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next announcement"
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
        >
          <FiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default Topbar;
