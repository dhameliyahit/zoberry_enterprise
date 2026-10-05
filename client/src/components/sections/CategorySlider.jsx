import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { gql, useQuery } from '@apollo/client';

import 'swiper/css';
import 'swiper/css/navigation';

const GET_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories { id name slug imageUrl }
  }
`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const CategorySlider = () => {
  const { data, loading } = useQuery(GET_CATEGORIES);
  const categories = data?.getAllCategories || [];

  if (loading || categories.length === 0) return null;

  return (
    <section className="pt-12 pb-4 bg-white border-t border-gray-100 relative">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-secondary tracking-tight">Shop by Category</h2>
          <button className="text-primary hover:text-primary-hover font-bold text-sm tracking-wide uppercase transition-colors">
            View All
          </button>
        </div>

        <div className="relative group">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={3}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              480: { slidesPerView: 4, spaceBetween: 20 },
              768: { slidesPerView: 5, spaceBetween: 30 },
              1024: { slidesPerView: 7, spaceBetween: 30 },
            }}
            className="w-full px-4"
          >
            {categories.map((category) => {
              const imgUrl = category.imageUrl 
                ? (category.imageUrl.startsWith('http') ? category.imageUrl : `${API_URL}${category.imageUrl}`) 
                : 'https://placehold.co/400x400?text=No+Image';

              return (
                <SwiperSlide key={category.id} className="flex justify-center pb-8 pt-4">
                  <div className="group/item cursor-pointer flex flex-col items-center gap-4 w-full">
                    
                    {/* The Circular Image Container */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-[140px] md:h-[140px] rounded-full overflow-hidden shadow-sm border border-gray-100 bg-gray-50 transition-all duration-300 group-hover/item:shadow-md">
                      <img 
                        src={imgUrl} 
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                      />
                    </div>

                    {/* Name BELOW the circle */}
                    <span className="text-secondary font-bold text-sm sm:text-base text-center transition-colors duration-300 group-hover/item:text-primary">
                      {category.name}
                    </span>

                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Buttons - Positioned slightly outside */}
          <button className="swiper-button-prev-custom absolute left-0 top-[40%] -translate-y-1/2 -ml-4 z-10 slider-arrow opacity-0 group-hover:opacity-100 disabled:hidden">
            <FiChevronLeft size={24} />
          </button>
          <button className="swiper-button-next-custom absolute right-0 top-[40%] -translate-y-1/2 -mr-4 z-10 slider-arrow opacity-0 group-hover:opacity-100 disabled:hidden">
            <FiChevronRight size={24} />
          </button>

        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
