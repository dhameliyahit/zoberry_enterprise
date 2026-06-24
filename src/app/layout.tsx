import type { Metadata } from "next";
import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import Script from "next/script";

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
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        {children}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
