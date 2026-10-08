import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useQuery } from '@apollo/client';
import { GET_ALL_CATEGORIES } from '../../graphql/products';

import 'swiper/css';
import 'swiper/css/navigation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const CategorySlider = () => {
  const { data, loading } = useQuery(GET_ALL_CATEGORIES);
  const categories = (data?.getAllCategories || []).filter((c) => c.isActive !== false);

  if (loading || categories.length === 0) return null;

  return (
    <section className="py-10 bg-white border-t border-gray-100 relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-secondary tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore by specialized utility collections</p>
          </div>
          <Link
            to="/products"
            className="text-primary hover:text-primary-hover font-bold text-xs tracking-wide uppercase transition-colors"
          >
            View All ({categories.length})
          </Link>
        </div>

        <div className="relative group">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={2.5}
            navigation={{
              nextEl: '.swiper-button-next-cat',
              prevEl: '.swiper-button-prev-cat',
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              480: { slidesPerView: 3.5, spaceBetween: 20 },
              768: { slidesPerView: 4.5, spaceBetween: 24 },
              1024: { slidesPerView: 6, spaceBetween: 24 },
            }}
            className="w-full pb-4"
          >
            {categories.map((category) => {
              const imgUrl = category.imageUrl
                ? (category.imageUrl.startsWith('http') ? category.imageUrl : `${API_URL}${category.imageUrl}`)
                : 'https://placehold.co/300x300?text=Category';

              return (
                <SwiperSlide key={category.id}>
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="group/item flex flex-col items-center gap-3 text-center p-2 rounded hover:bg-gray-50/80 transition-all"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-xs border border-gray-200 bg-gray-50 flex items-center justify-center transition-all duration-300 group-hover/item:border-primary group-hover/item:shadow-sm">
                      <img
                        src={imgUrl}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                      />
                    </div>
                    <span className="text-secondary font-bold text-xs sm:text-sm transition-colors group-hover/item:text-primary line-clamp-1">
                      {category.name}
                    </span>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Navigation Controls */}
          <button className="swiper-button-prev-cat absolute left-0 top-[45%] -translate-y-1/2 -ml-3 z-10 slider-arrow opacity-0 group-hover:opacity-100 disabled:hidden">
            <FiChevronLeft size={20} />
          </button>
          <button className="swiper-button-next-cat absolute right-0 top-[45%] -translate-y-1/2 -mr-3 z-10 slider-arrow opacity-0 group-hover:opacity-100 disabled:hidden">
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
