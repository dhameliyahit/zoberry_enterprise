import React from 'react';
import Hero from '../components/sections/Hero';
import CategorySlider from '../components/sections/CategorySlider';
import FeaturedProducts from '../components/sections/FeaturedProducts';

const HomePage = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <CategorySlider />
      <FeaturedProducts />
    </div>
  );
};

export default HomePage;
