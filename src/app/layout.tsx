import type { Metadata } from "next";
import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import Script from "next/script";
import FloatingOrderWidget from "@/components/Common/FloatingOrderWidget";

export const metadata: Metadata = {
  title: "Zoberry Enterprise - Smart Living, Delivered",
  description: "Zoberry Enterprise offers high-quality products at competitive prices. Shop smart with Zoberry.",
  metadataBase: new URL("https://www.zoberryenterprise.shop"),
  alternates: {
    canonical: "https://www.zoberryenterprise.shop",
  },
  openGraph: {
    title: "Zoberry Enterprise - Smart Living, Delivered",
    description: "Explore premium products at Zoberry Enterprise. Easy guest shopping, cart, wishlist, and fast support.",
    url: "https://www.zoberryenterprise.shop",
    siteName: "Zoberry Enterprise",
    images: [
      {
        url: "https://www.zoberryenterprise.shop/images/zb_header.png",
        width: 1200,
        height: 630,
        alt: "Zoberry Enterprise Smart Living",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zoberry Enterprise - Smart Living, Delivered",
    description: "Explore premium products at Zoberry Enterprise. Easy guest shopping, cart, wishlist, and fast support.",
    images: ["https://www.zoberryenterprise.shop/images/zb_header.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <head>
        {/* google adsense */}
        <meta name="google-site-verification" content="sCKkEWiWbTZSbAgU3SI_ORWmv7njv-zK09zR9kgX41w" />
        {/* Google Structured Data / JSON-LD for Sitelinks & Searchbox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Zoberry Enterprise",
                "url": "https://www.zoberryenterprise.shop",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://www.zoberryenterprise.shop/shop-with-sidebar?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Zoberry Enterprise",
                "url": "https://www.zoberryenterprise.shop",
                "logo": "https://www.zoberryenterprise.shop/images/logo/logo.svg",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+91-9638601192",
                  "contactType": "customer service"
                }
              }
            ])
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        {/* Google Analytics Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y5Q62FEF4P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y5Q62FEF4P');
          `}
        </Script>

        {children}
        <FloatingOrderWidget />
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
