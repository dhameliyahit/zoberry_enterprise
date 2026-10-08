import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

export function TrustBanner() {
  const items = [
    {
      icon: Truck,
      title: 'Free Shipping Threshold',
      desc: 'Free standard delivery on orders above ₹999 across India',
    },
    {
      icon: ShieldCheck,
      title: 'Verified PhonePe Payments',
      desc: '100% digital prepaid security with instant confirmation',
    },
    {
      icon: RefreshCw,
      title: 'Direct Warehouse Value',
      desc: 'Authentic items sourced without distributor markups',
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      desc: 'Fast customer assistance via phone and email support',
    },
  ];

  return (
    <section className="py-10 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/75 border border-slate-100"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustBanner;
