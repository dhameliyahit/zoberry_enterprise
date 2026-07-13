import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Zoberry Enterprise",
  description: "Learn more about Zoberry Enterprise, our journey, values, and dedication to serving you.",
};

const AboutPage = () => {
  return (
    <main>
      <Breadcrumb title="About Us" pages={["About Us"]} />
      
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="prose prose-blue max-w-none text-dark-4 leading-relaxed space-y-6">
            <h2 className="text-2xl font-bold text-dark mb-4">Who We Are</h2>
            <p>
              Welcome to <strong>Zoberry Enterprise</strong>! We are a forward-thinking e-commerce platform dedicated to bringing high-quality products directly to your doorstep. We curate a selection of trending, innovative, and essential everyday products to make your shopping experience simple and satisfying.
            </p>
            
            <h2 className="text-2xl font-bold text-dark mt-8 mb-4">Our Mission</h2>
            <p>
              Our mission is to bridge the gap between quality manufacturing and consumer convenience. We believe in transparency, reliability, and excellent customer service. Whether you are looking for the latest household essentials, gadgets, or custom designs, Zoberry is committed to delivering excellence.
            </p>
            
            <h2 className="text-2xl font-bold text-dark mt-8 mb-4">Why Choose Us?</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Premium Curation:</strong> We vet every single item listed on our platform for durability and value.</li>
              <li><strong>Secure Shopping:</strong> Your security is our priority. We offer completely encrypted checkout systems.</li>
              <li><strong>Dedicated Support:</strong> Have questions? Our contact channels are open, and our response rates are incredibly fast.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
