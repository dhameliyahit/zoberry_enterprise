"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import { AuthModalProvider } from "../context/AuthModalContext";
import AuthModal from "@/components/Common/AuthModal";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const existingMac = localStorage.getItem("zoberry_mac_address");
      if (!existingMac) {
        const hexDigits = "0123456789ABCDEF";
        let generatedMac = "";
        for (let i = 0; i < 6; i++) {
          generatedMac += hexDigits.charAt(Math.floor(Math.random() * 16));
          generatedMac += hexDigits.charAt(Math.floor(Math.random() * 16));
          if (i < 5) generatedMac += ":";
        }
        localStorage.setItem("zoberry_mac_address", generatedMac);
      }
    }
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      {loading ? (
        <PreLoader />
      ) : (
        <>
          <ReduxProvider>
            <CartModalProvider>
              <ModalProvider>
                <PreviewSliderProvider>
                  <AuthModalProvider>
                    <Header />
                    {children}

                    <QuickViewModal />
                    <CartSidebarModal />
                    <PreviewSliderModal />
                    <AuthModal />
                  </AuthModalProvider>
                </PreviewSliderProvider>
              </ModalProvider>
            </CartModalProvider>
          </ReduxProvider>
          <ScrollToTop />
          <Footer />
        </>
      )}
    </>
  );
}
