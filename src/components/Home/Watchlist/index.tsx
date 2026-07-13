"use client";
import React from "react";
import SingleItem from "../BestSeller/SingleItem";
import Image from "next/image";
import { usePopulatedWishlist } from "@/hooks/usePopulatedWishlist";

const Watchlist = () => {
  const { items: wishlistItems, loading } = usePopulatedWishlist();

  if (loading || wishlistItems.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden py-10">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Your Watchlist
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Watchlist Items
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {wishlistItems.map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Watchlist;
