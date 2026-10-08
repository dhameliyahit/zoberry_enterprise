import React from 'react';
import { Hero } from '../components/sections/Hero';
import { CategorySlider } from '../components/sections/CategorySlider';
import { FeaturedProducts } from '../components/sections/FeaturedProducts';
import { TrustBanner } from '../components/sections/TrustBanner';
import { SEO } from '../components/common/SEO';

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEO
        title="Zoberry Enterprise | Smart Living, Home & Kitchen Utility Products"
        description="Shop best home & kitchen utility products, organizers, daily problem solver essentials online at unbeatable prices on Zoberry Enterprise."
      />
      <Hero />
      <CategorySlider />
      <FeaturedProducts />
      <TrustBanner />
    </div>
  );
}

export default HomePage;
