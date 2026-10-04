import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Drawer = ({ isOpen, onClose, title, children }) => {
  // Prevent body scrolling when the drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* Right Side Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl flex flex-col animate-slide-left">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50">
          <h2 className="text-xl font-bold text-secondary tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white shadow-sm border border-gray-200 rounded-full"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>
        
        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col">
          {children}
        </div>
      </div>
    </>
  );
};

export default Drawer;
