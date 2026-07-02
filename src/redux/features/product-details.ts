import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState: InitialState = {
  value: {
    _id: "",
    title: "",
    slug: "",
    description: "",
    price: 0,
    discountedPrice: 0,
    images: [],
    category: null,
    tags: [],
    sku: "",
    stock: 0,
    ratings: { average: 0, count: 0 },
    isActive: true,
    isFeatured: false,
    hasVariants: false,
    status: "active",
    createdAt: "",
    updatedAt: "",
  },
};

export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (_, action: PayloadAction<Product>) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;
