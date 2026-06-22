import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog Grid Page | Zoberry Enterprise E-commerce",
  description: "This is Blog Grid Page for Zoberry Enterprise Template",
  // other metadata
};

const BlogGridWithSidebarPage = () => {
  return (
    <>
      <BlogGridWithSidebar />
    </>
  );
};

export default BlogGridWithSidebarPage;
