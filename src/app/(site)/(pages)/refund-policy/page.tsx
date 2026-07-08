import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Zoberry Enterprise",
  description: "Zoberry Enterprise Refund & Return Policy. Understand return windows, unboxing video requirements, and processing times.",
};

const RefundPolicyPage = () => {
  return (
    <main>
      <Breadcrumb title="Refund Policy" pages={["Refund Policy"]} />
      
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="prose prose-blue max-w-none text-dark-4 leading-relaxed space-y-6">
            <h2 className="text-2xl font-bold text-red mb-4">7-Day Return Window</h2>
            <p>
              We want you to be fully satisfied with your purchase. You can request a return or exchange for eligible products within **7 days** of delivery. 
            </p>
            <p className="font-semibold text-dark">
              Please note: No return or refund requests will be accepted after the 7-day return window has expired.
            </p>

            <h2 className="text-2xl font-bold text-dark mt-8 mb-4">Unboxing Video Requirement</h2>
            <div className="p-4 bg-yellow/10 border-l-4 border-yellow rounded-r-md">
              <p className="font-medium text-dark">
                <strong>IMPORTANT:</strong> In the event that you receive a wrong package, wrong product, damaged item, or missing contents, an **unboxing video is mandatory**.
              </p>
              <p className="mt-2 text-sm text-dark-4">
                The video must be uncut, showing the package labels clearly and the opening of the package from start to finish. Without a valid unboxing video, we will not be able to process returns or refunds for wrong packages.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-dark mt-8 mb-4">Return Conditions</h2>
            <p>
              To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.
            </p>

            <h2 className="text-2xl font-bold text-dark mt-8 mb-4">How to Initiate a Return</h2>
            <p>
              Please contact our support team at **support@zoberry.in** or through our contact page with your order details, reason for return, and the required unboxing video.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RefundPolicyPage;
