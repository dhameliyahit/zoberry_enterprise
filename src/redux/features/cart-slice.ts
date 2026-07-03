import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  _id: string;
  quantity: number;
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // 1. LocalStorage से कार्ट लोड करने के लिए (zoberry_cart स्पेलिंग ठीक की गई है)
    initializeCart: (state) => {
      if (typeof window !== "undefined") {
        const savedCart = localStorage.getItem("zoberry_cart");
        if (savedCart) {
          state.items = JSON.parse(savedCart);
        }
      }
    },
    // 2. कार्ट में आइटम जोड़ें
    addItemToCart: (state, action: PayloadAction<{ _id: string; quantity?: number }>) => {
      const { _id, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item._id === _id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id,
          quantity,
        });
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("zoberry_cart", JSON.stringify(state.items));
      }
    },
    // 3. कार्ट से हटाएं
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);

      if (typeof window !== "undefined") {
        localStorage.setItem("zoberry_cart", JSON.stringify(state.items));
      }
    },
    // 4. क्वांटिटी बदलें
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number }>
    ) => {
      const { _id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item._id === _id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("zoberry_cart", JSON.stringify(state.items));
      }
    },
    // 5. क्लियर कार्ट
    removeAllItemsFromCart: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("zoberry_cart");
      }
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const {
  initializeCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;

export default cart.reducer;
