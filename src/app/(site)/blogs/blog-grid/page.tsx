import React from "react";
import BlogGrid from "@/components/BlogGrid";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog Grid Page | Zoberry Enterprise E-commerce",
  description: "This is Blog Grid Page for Zoberry Enterprise Template",
  // other metadata
};

const BlogGridPage = () => {
  return (
    <main>
      <BlogGrid />
    </main>
  );
};

export default BlogGridPage;
