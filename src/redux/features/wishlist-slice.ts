import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: string[];
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    initializeWishlist: (state) => {
      if (typeof window !== "undefined") {
        const saveWishlist = localStorage.getItem("zoberry_wishlist");
        if (saveWishlist) {
          state.items = JSON.parse(saveWishlist);
        }
      }
    },
    addItemToWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.items.includes(id)) {
        state.items.push(id);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("zoberry_wishlist", JSON.stringify(state.items));
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.filter((itemId) => itemId !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("zoberry_wishlist", JSON.stringify(state.items));
      }
    },
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("zoberry_wishlist");
      }
    },
  },
});

export const selectWishlistItems = (state: RootState) => state.wishlistReducer.items;

export const {
  initializeWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;

export default wishlist.reducer;