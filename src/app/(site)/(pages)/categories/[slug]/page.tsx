"use client";
import React from "react";
import { useParams } from "next/navigation";
import CategoryProductsClient from "@/components/CategoryProductsClient";

const CategoryPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  return <CategoryProductsClient slug={slug} />;
};

export default CategoryPage;
