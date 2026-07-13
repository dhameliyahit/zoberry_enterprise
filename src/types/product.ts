export type VariantOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  _id?: string;
  title?: string;
  sku?: string;
  price?: number;
  discountedPrice?: number;
  stock?: number;
  image?: string;
  barcode?: string;
  weight?: number;
  option1?: string;
  option2?: string;
  option3?: string;
  isActive?: boolean;
};

export type Specification = {
  key: string;
  value: string;
};

export type ProductImage = {
  url: string;
  alt?: string;
  isFeatured?: boolean;
};

export type Review = {
  _id?: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

export type ProductVideo = {
  url: string;
  title?: string;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  brand?: string;
  productType?: string;
  price: number;
  discountedPrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  images: ProductImage[] | string[];
  videos?: ProductVideo[];
  category: any;
  tags: string[];
  sku: string;
  barcode?: string;
  stock: number;
  trackQuantity?: boolean;
  continueSelling?: boolean;
  status: "active" | "draft" | "archived";
  ratings: { average: number; count: number };
  isActive: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  variantOptions?: VariantOption[];
  variants?: ProductVariant[];
  specifications?: Specification[];
  seo?: { metaTitle?: string; metaDescription?: string };
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
};
