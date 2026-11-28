import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "../features/favoritesSlice";
import cartReducer from "../features/cartSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    cart: cartReducer
  }
});

// Save favorites and cart to localStorage every time the store changes
store.subscribe(() => {
  const state = store.getState();

  localStorage.setItem(
    "favorites",
    JSON.stringify(state.favorites.items)
  );

  localStorage.setItem("cart", JSON.stringify(state.cart));
});
