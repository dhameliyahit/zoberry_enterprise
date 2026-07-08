import { StorefrontProduct as Product } from "@/lib/storefront-models/Product";
import { StorefrontCategory as Category } from "@/lib/storefront-models/Category";
import { StorefrontReview as Review } from "@/lib/storefront-models/Review";
import { StorefrontHeroSlide as HeroSlide } from "@/lib/storefront-models/HeroSlide";
import "@/lib/storefront-models/User";
import { cacheProducts, cacheProductById, cacheProductBySlug, cacheCategories, cacheCategoryById, cacheCategoryBySlug, cacheHeroSlides, cacheHeroSlideById } from "@/lib/cache";
import mongoose from "mongoose";

type ProductQueryParams = {
  brand?: string;
  category?: string;
  isFeatured?: string | null;
  limit?: string | null;
  maxPrice?: string | null;
  minPrice?: string | null;
  page?: string | null;
  productType?: string;
  search?: string;
  sort?: string | null;
  status?: string;
};

type ProductSort = Record<string, 1 | -1>;

function getProductSort(sort?: string | null): ProductSort {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "name_asc":
      return { title: 1 };
    case "name_desc":
      return { title: -1 };
    case "stock_asc":
      return { stock: 1 };
    case "stock_desc":
      return { stock: -1 };
    case "popular":
      return { isFeatured: -1, "ratings.count": -1, "ratings.average": -1, createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

function buildProductFilter(params: ProductQueryParams) {
  const filter: Record<string, unknown> = {};

  if (params.category) filter.category = params.category;
  if (params.isFeatured !== undefined && params.isFeatured !== null) {
    filter.isFeatured = params.isFeatured === "true";
  }
  if (params.status) filter.status = params.status;
  else filter.status = "active";
  if (params.brand) filter.brand = { $regex: params.brand, $options: "i" };
  if (params.productType) filter.productType = params.productType;
  if (params.search) {
    filter.$or = [
      { title: { $regex: params.search, $options: "i" } },
      { sku: { $regex: params.search, $options: "i" } },
      { barcode: { $regex: params.search, $options: "i" } },
      { brand: { $regex: params.search, $options: "i" } },
    ];
  }

  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) {
      (filter.price as Record<string, number>).$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      (filter.price as Record<string, number>).$lte = maxPrice;
    }
  }

  return filter;
}

async function attachReviews(product: any) {
  const reviews = await Review.find({ product: product._id })
    .populate("user", "name email")
    .lean();

  return {
    ...product,
    reviews: reviews.map((review: any) => ({
      name: review.user?.name || "Anonymous",
      email: review.user?.email || "",
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    })),
  };
}

export const getProducts = cacheProducts(async (params: ProductQueryParams) => {
  const page = Math.max(Number(params.page || "1"), 1);
  const limit = Math.max(Number(params.limit || "20"), 1);
  const skip = (page - 1) * limit;
  const filter = buildProductFilter(params);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(getProductSort(params.sort))
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    success: true as const,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
});

export const getProductById = cacheProductById(async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  const product = await Product.findById(id)
    .populate("category", "name slug")
    .lean();

  if (!product) {
    return null;
  }

  return attachReviews(product);
});

export const getProductBySlug = cacheProductBySlug(async (slug: string) => {
  const product = await Product.findOne({ slug, status: "active" })
    .populate("category", "name slug")
    .lean();

  if (!product) {
    return null;
  }

  return attachReviews(product);
});

export const getCategories = cacheCategories(async (isActive?: boolean) => {
  const filter: Record<string, unknown> = {};

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const categories = await Category.find(filter).sort({ name: 1 }).lean();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat: any) => {
      const count = await Product.countDocuments({
        category: cat._id,
        status: "active",
      });
      return {
        ...cat,
        count,
      };
    })
  );

  return {
    success: true as const,
    data: categoriesWithCounts,
  };
});

export const getCategoryById = cacheCategoryById(async (id: string) => {
  return Category.findById(id).lean();
});

export const getCategoryBySlug = cacheCategoryBySlug(async (slug: string) => {
  return Category.findOne({ slug }).lean();
});

export const getHeroSlides = cacheHeroSlides(async (isActive?: boolean) => {
  const filter: Record<string, boolean> = {};
  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const slides = await HeroSlide.find(filter).sort({ order: 1, createdAt: -1 }).lean();

  return {
    success: true as const,
    data: slides,
  };
});

export const getHeroSlideById = cacheHeroSlideById(async (id: string) => {
  return HeroSlide.findById(id).lean();
});
