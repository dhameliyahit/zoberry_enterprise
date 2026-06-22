import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
};

type WishListItem = {
  _id: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  image: string;
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { _id, title, price, quantity, image, discountedPrice, status } =
        action.payload;
      const existingItem = state.items.find((item) => item._id === _id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id,
          title,
          price,
          quantity,
          image,
          discountedPrice,
          status,
        });
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
