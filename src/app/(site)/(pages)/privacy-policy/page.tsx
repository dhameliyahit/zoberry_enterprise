import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Zoberry Enterprise",
  description: "Zoberry Enterprise Privacy Policy. Learn how we collect, protect, and use your personal information.",
};

const PrivacyPolicyPage = () => {
  return (
    <main>
      <Breadcrumb title="Privacy Policy" pages={["Privacy Policy"]} />
      
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="prose prose-blue max-w-none text-dark-4 leading-relaxed space-y-6">
            <h2 className="text-2xl font-bold text-dark mb-4">Information Collection</h2>
            <p>
              We collect information from you when you register on our site, place an order, subscribe to our newsletter, or fill out a form. This information may include your name, email address, mailing address, phone number, or payment details.
            </p>

            <h2 className="text-2xl font-bold text-dark mt-8 mb-4">How We Use Your Information</h2>
            <p>
              Any of the information we collect from you may be used in one of the following ways:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To personalize your experience (your information helps us better respond to your individual needs).</li>
              <li>To improve our website (we continually strive to improve our website offerings based on the information and feedback we receive from you).</li>
              <li>To process transactions securely. Your information will not be sold, exchanged, transferred, or given to any other company for any reason whatsoever.</li>
            </ul>

            <h2 className="text-2xl font-bold text-dark mt-8 mb-4">Information Protection</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicyPage;
