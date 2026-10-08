import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      {/* 1. Value / Trust Prop Section */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-950/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Fast Dispatch</h4>
                <p className="text-xs text-slate-400">Free standard shipping over ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">PhonePe Verified</h4>
                <p className="text-xs text-slate-400">100% secure encrypted payment</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Direct Warehouse</h4>
                <p className="text-xs text-slate-400">Smart utility & daily essentials</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Customer Support</h4>
                <p className="text-xs text-slate-400">+91-9638601192 (Mon-Sat)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/zoberry_logo.png"
                alt="Zoberry Enterprise"
                className="h-8 object-contain brightness-0 invert opacity-95"
                onError={(e) => {
                  e.target.src = '/logo.svg';
                }}
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Zoberry Enterprise delivers curated home & kitchen utility gadgets, smart lifestyle
              organizers, and daily problem-solver essentials directly to Indian homes.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                support@zoberryenterprise.shop
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                Surat, Gujarat, India - 395004
              </span>
            </div>
          </div>

          {/* Quick Shop */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Categories
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

          {/* Support & Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Account & Help</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link to="/account?tab=orders" className="hover:text-white transition-colors">
                  Track My Orders
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Help Center / Contact
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Zoberry
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Payment Security</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              We process 100% digital prepaid orders via PhonePe Standard Gateway supporting UPI, RuPay, Visa, Mastercard & NetBanking.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-slate-800 text-[11px] font-semibold text-emerald-400 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              256-Bit SSL Encrypted
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright */}
      <div className="border-t border-slate-800 py-6 bg-slate-950/60 text-xs text-slate-500 text-center">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Zoberry Enterprise. All rights reserved.</span>
          <span className="text-slate-600">Smart Living, Home & Kitchen Utility Products</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
