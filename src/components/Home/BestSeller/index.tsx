"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import type { Product } from "@/types";

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getAll({ limit: 6, sort: "popular" }).then((res) => {
      setProducts(res.data?.slice(0, 6) || []);
    }).catch(() => {});
  }, []);

  return (
    <section className="overflow-hidden py-16 bg-gray-1 border-y border-gray-2 my-12">
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
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Best Sellers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5 w-full">
          {products.length > 0 ? products.map((item, key) => (
            <div key={key} className="w-full">
              <SingleItem item={item} />
            </div>
          )) : (
            <p className="text-gray-500 col-span-full text-center py-8">No products yet</p>
          )}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-lg border-gray-3 border bg-white text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
