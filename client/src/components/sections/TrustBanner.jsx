import React from 'react';
import { Truck, ShieldCheck, Tag, Phone } from 'lucide-react';

export function TrustBanner() {
  const items = [
    {
      icon: Truck,
      title: 'Free Shipping Available',
      desc: 'Free standard delivery on orders above ₹499 across India',
    },
    {
      icon: ShieldCheck,
      title: 'PhonePe Encrypted Checkout',
      desc: '100% digital prepaid security with instant confirmation',
    },
    {
      icon: Tag,
      title: 'Direct Warehouse Value',
      desc: 'Smart utilities & home essentials at transparent pricing',
    },
    {
      icon: Phone,
      title: 'Direct Customer Support',
      desc: '+91 96386 01192 • Mon to Sat (10 AM to 7 PM)',
    },
  ];

  return (
    <section className="py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-[2px] bg-[#f8fafc] border border-slate-200"
              >
                <div className="w-8 h-8 rounded-[2px] bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
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
