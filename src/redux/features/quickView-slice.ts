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

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action: PayloadAction<Product>) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: () => {
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;
