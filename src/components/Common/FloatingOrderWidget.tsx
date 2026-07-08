"use client";
import React, { useState } from "react";
import {
  Plus,
  X,
  WhatsappLogo,
  InstagramLogo,
  FacebookLogo,
  Envelope,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function FloatingOrderWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.data?.message || "Successfully subscribed!");
        setEmail("");
        setShowNewsletter(false);
      } else {
        toast.error(data.error || "Subscription failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to subscribe.");
    } finally {
      setSubmitting(false);
    }
  };

  // Configuration for direct social order links & actions using user's phone number
  const socialLinks = [
    {
      name: "WhatsApp Order",
      icon: <WhatsappLogo size={22} weight="fill" />,
      color: "bg-[#25D366] hover:bg-[#20ba59]",
      url: "https://wa.me/919638601192?text=Hi!%20I%20want%20to%20place%20an%20order%20for%20a%20product%20from%20your%20website.",
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
    {
      name: "Newsletter",
      icon: <Envelope size={22} weight="fill" />,
      color: "bg-[#FF5A5F] hover:bg-[#e04f53]",
      onClick: () => {
        setShowNewsletter(true);
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-3.5 select-none">
        
        {/* Social Links Sub-Menu (Slides and fades up when active) */}
        <div
          className={`flex flex-col items-center gap-3 transition-all duration-300 ${
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none scale-90"
          }`}
        >
          {socialLinks.map((link, idx) => {
            const buttonClasses = `flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${link.color}`;
            
            if (link.onClick) {
              return (
                <button
                  key={idx}
                  onClick={link.onClick}
                  className="outline-none cursor-pointer border-none bg-transparent"
                >
                  <div className={buttonClasses}>
                    {link.icon}
                  </div>
                </button>
              );
            }

            return (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="outline-none cursor-pointer border-none bg-transparent"
              >
                <div className={buttonClasses}>
                  {link.icon}
                </div>
              </a>
            );
          })}
        </div>

        {/* Main Floating Trigger Button (White bg, dark icon) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-slate-200/80 outline-none"
          aria-label="Toggle Order Options"
        >
          {isOpen ? (
            <X size={22} weight="bold" />
          ) : (
            <Plus size={22} weight="bold" />
          )}
        </button>

      </div>

      {/* Newsletter Subscription Modal */}
      {showNewsletter && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full relative border border-gray-3 animate-fade-in">
            <button
              onClick={() => setShowNewsletter(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-dark transition-colors border-none bg-transparent cursor-pointer outline-none"
            >
              <X size={20} weight="bold" />
            </button>
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center text-blue mb-3.5">
                <Envelope size={24} weight="fill" />
              </div>
              <h3 className="font-semibold text-lg text-dark">Subscribe to Newsletter</h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                Get the latest updates, special deals, and exclusive offers delivered directly to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
                className="w-full bg-gray-2 border border-gray-3 outline-none rounded-md placeholder:text-gray-400 py-2.5 px-4 text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue hover:bg-blue-dark text-white font-medium py-2.5 rounded-md text-sm transition-all disabled:opacity-50 cursor-pointer border-none"
              >
                {submitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
