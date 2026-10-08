import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-auto border-t border-slate-800 text-xs">
      <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column (White Logo on Dark Background) */}
          <div className="lg:col-span-2 space-y-3.5">
            <Link to="/" className="inline-block">
              <img
                src="/zoberry_logo.png"
                alt="Zoberry Enterprise"
                className="h-8 object-contain"
                onError={(e) => {
                  e.target.src = '/logo.svg';
                }}
              />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Zoberry Enterprise provides curated home utilities, kitchen gadgets, smart storage, and daily problem-solver essentials delivered across India.
            </p>
            <div className="space-y-1.5 text-slate-400 text-xs pt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>+91 96386 01192 (Mon - Sat, 10 AM - 7 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>support@zoberryenterprise.shop</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Surat, Gujarat, India - 395004</span>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">Catalog</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Shop by Category
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Help */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">Customer Care</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link to="/account?tab=orders" className="hover:text-white transition-colors">
                  Track Orders & Shipments
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Help & Contact Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Zoberry Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">Secure Checkout</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              100% encrypted online payments powered by PhonePe Standard Gateway (UPI, Cards & NetBanking).
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-800/80 py-4 bg-slate-950 text-slate-500 text-[11px]">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} Zoberry Enterprise. All rights reserved.</span>
          <span>Smart Living, Home & Kitchen Utilities</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
