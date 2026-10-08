import React from 'react';
import SEO from '../components/common/SEO';
import { ShieldCheck, Truck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardBody } from '../components/ui';

const AboutPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO
        title="About Us | Zoberry Enterprise"
        description="Learn more about Zoberry Enterprise, your trusted source for smart living, innovative home & kitchen utility gadgets, and easy decor."
        url="/about"
      />
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <Card className="p-8 md:p-12 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
            About Zoberry Enterprise
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Smart Living, Delivered to Your Doorstep
          </h1>

          <div className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
            <p>
              Welcome to <strong>Zoberry Enterprise</strong>! We are dedicated to bringing you the most innovative, functional, and aesthetic home and kitchen utility products. Our mission is to make daily household tasks simpler, faster, and more enjoyable through smart design.
            </p>
            <p>
              From clever kitchen organizers and space-saving gadgets to easy home decor and daily essentials, we carefully source and curate products that solve real everyday problems at honest prices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-10 border-t border-slate-100">
            <div className="p-5 bg-slate-50 rounded-xl text-center border border-slate-100">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Quality Guaranteed</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Every product is tested and verified for long-lasting durability.</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl text-center border border-slate-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Fast Ground Shipping</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Quick dispatch with reliable doorstep delivery across India.</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl text-center border border-slate-100">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Customer First</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Dedicated support via WhatsApp and phone for complete peace of mind.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
