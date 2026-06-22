export type VariantOption = {
  label: string;
  price?: number;
  discountedPrice?: number;
  sku?: string;
  stock: number;
  image?: string;
};

export type Variant = {
  name: string;
  options: VariantOption[];
};

export type Specification = {
  key: string;
  value: string;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice: number;
  images: string[];
  category: any;
  tags: string[];
  sku: string;
  stock: number;
  ratings: { average: number; count: number };
  isActive: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  variants?: Variant[];
  specifications?: Specification[];
  createdAt: string;
  updatedAt: string;
};
