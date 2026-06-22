import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  _id: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  image: string;
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { _id, title, price, quantity, discountedPrice, image } =
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
          discountedPrice,
          image,
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number }>
    ) => {
      const { _id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item._id === _id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
