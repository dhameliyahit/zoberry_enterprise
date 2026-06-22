import BlogDetails from "@/components/BlogDetails";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog Details Page | Zoberry Enterprise",
  description: "Zoberry Enterprise - Blog Details",
  // other metadata
};

const BlogDetailsPage = () => {
  return (
    <main>
      <BlogDetails />
    </main>
  );
};

export default BlogDetailsPage;
