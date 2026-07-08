import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./css/style.css";
import Script from "next/script";
import FloatingOrderWidget from "@/components/Common/FloatingOrderWidget";
import SmoothScroll from "@/components/Common/SmoothScroll";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-josefin",
});

export const metadata: Metadata = {
  title: "Zoberry Enterprise",
  description: "Zoberry Enterprise",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body suppressHydrationWarning={true} className={`${josefin.className} ${josefin.variable}`}>
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <FloatingOrderWidget />
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
