"use client";
import React, { useState } from "react";
import {
  Plus,
  WhatsappLogo,
  InstagramLogo,
  FacebookLogo,
} from "@phosphor-icons/react";

export default function FloatingOrderWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Configuration for direct social order links (Customizable by user)
  const socialLinks = [
    {
      name: "WhatsApp Order",
      icon: <WhatsappLogo size={22} weight="fill" />,
      color: "bg-[#25D366] hover:bg-[#20ba59]",
      url: "https://wa.me/919876543210?text=Hi!%20I%20want%20to%20place%20an%20order%20for%20a%20product%20from%20your%20website.",
    },
    {
      name: "Instagram Order",
      icon: <InstagramLogo size={22} weight="bold" />,
      color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:brightness-110",
      url: "https://instagram.com/zoberry.official",
    },
    {
      name: "Facebook Order",
      icon: <FacebookLogo size={22} weight="fill" />,
      color: "bg-[#1877F2] hover:bg-[#1565cd]",
      url: "https://m.me/zoberry.enterprise",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 select-none">
      
      {/* Social Links Sub-Menu (Slides and fades up when active) */}
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 transform origin-bottom ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none scale-90"
        }`}
      >
        {socialLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5"
            style={{
              transitionDelay: isOpen ? `${idx * 50}ms` : "0ms",
            }}
          >
            {/* Sliding text label (Visible on hover on desktop) */}
            <span className="hidden sm:inline-block scale-95 opacity-0 translate-x-2 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 bg-[#0F172A]/95 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm pointer-events-none">
              {link.name}
            </span>
            
            {/* Circular Social Icon Button */}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 ${link.color}`}
            >
              {link.icon}
            </div>
          </a>
        ))}
      </div>

      {/* Main Floating Trigger Button (Rotates '+' into 'x' when opened) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_30px_rgba(59,130,246,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          isOpen
            ? "bg-dark hover:bg-blue rotate-45"
            : "bg-gradient-to-r from-blue to-blue-light hover:brightness-110"
        }`}
        aria-label="Toggle Order Options"
      >
        {isOpen ? (
          <Plus size={24} weight="bold" />
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Subtle pulsate border when closed */}
            <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-blue opacity-25"></span>
            <Plus size={24} weight="bold" className="relative z-10" />
          </div>
        )}
      </button>

    </div>
  );
}
