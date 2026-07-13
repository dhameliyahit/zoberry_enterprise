import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import { StorefrontProduct } from "@/lib/storefront-models/Product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.zoberryenterprise.shop";

  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/privacy-policy",
    "/refund-policy",
    "/shop-with-sidebar",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    await connectToDatabase();
    
    // Dynamically retrieve all active products to add to sitemap
    const products = await StorefrontProduct.find({ isActive: { $ne: false } }, "_id updatedAt").lean() as any[];

    const productRoutes = products.map((prod) => ({
      url: `${baseUrl}/shop-details?id=${prod._id}`,
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticRoutes;
  }
}
