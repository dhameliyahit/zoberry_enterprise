import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { getProductById } from "@/lib/catalog-storefront";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

function getImageUrl(img: any): string {
  if (!img) return "https://www.zoberryenterprise.shop/images/zb_header.png";
  if (typeof img === "string") return img;
  return img.url || "https://www.zoberryenterprise.shop/images/zb_header.png";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id } = await searchParams;
  
  if (!id) {
    return {
      title: "Product Details | Zoberry Enterprise",
      description: "Buy high quality products online at Zoberry Enterprise.",
    };
  }

  try {
    await connectToDatabase();
    const product = await getProductById(id);

    if (!product) {
      return {
        title: "Product Not Found | Zoberry Enterprise",
      };
    }

    const title = `${product.title} | Zoberry Enterprise`;
    const description = product.description || `Buy ${product.title} at Zoberry Enterprise. Best prices, fast shipping.`;
    const firstImage = getImageUrl(product.images?.[0]);
    const absoluteImageUrl = firstImage.startsWith("http") ? firstImage : `https://www.zoberryenterprise.shop${firstImage}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://www.zoberryenterprise.shop/shop-details?id=${id}`,
        siteName: "Zoberry Enterprise",
        type: "website",
        images: [
          {
            url: absoluteImageUrl,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [absoluteImageUrl],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for product details:", error);
    return {
      title: "Product Details | Zoberry Enterprise",
    };
  }
}

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
