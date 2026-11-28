import { createSlice } from "@reduxjs/toolkit";
import { tomorrowString } from "../utils/dates";

// Load the saved cart when the app starts
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("cart"));

    if (saved && Array.isArray(saved.items)) {
      return { items: saved.items, coupon: saved.coupon || "" };
    }
  } catch {
    // ignore broken data
  }

  return { items: [], coupon: "" };
}

const cartSlice = createSlice({
  name: "cart",
  initialState: loadCart(),
  reducers: {
    // payload: a room (optionally with checkIn, nights, guests)
    addToCart: (state, action) => {
      const room = action.payload;

      const exists = state.items.some((item) => item.id === room.id);

      if (exists) {
        return;
      }

      state.items.push({
        id: room.id,
        name: room.name,
        hotel: room.hotel,
        location: room.location,
        image: room.image,
        price: room.price,
        capacity: room.capacity,
        checkIn: room.checkIn || tomorrowString(),
        nights: room.nights || 1,
        guests: room.guests || 1
      });
    },

    // payload: { id, checkIn?, nights?, guests? }
    updateStay: (state, action) => {
      const { id, ...changes } = action.payload;
      const item = state.items.find((room) => room.id === id);

      if (item) {
        Object.assign(item, changes);
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    applyCoupon: (state, action) => {
      state.coupon = action.payload;
    },

    clearCart: (state) => {
      state.items = [];
      state.coupon = "";
    }
  }
});

export const {
  addToCart,
  updateStay,
  removeFromCart,
  applyCoupon,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
