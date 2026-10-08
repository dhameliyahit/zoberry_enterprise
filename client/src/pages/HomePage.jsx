import React from 'react';
import { Hero } from '../components/sections/Hero';
import { TrustBanner } from '../components/sections/TrustBanner';
import { CategorySlider } from '../components/sections/CategorySlider';
import { FeaturedProducts } from '../components/sections/FeaturedProducts';
import { SEO } from '../components/common/SEO';

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Zoberry Enterprise | Smart Living, Home & Kitchen Utility Products"
        description="Shop best home & kitchen utility products, organizers, daily problem solver essentials online at unbeatable prices on Zoberry Enterprise."
      />
      <Hero />
      <TrustBanner />
      <CategorySlider />
      <FeaturedProducts />
    </div>
  );
}

export default HomePage;
