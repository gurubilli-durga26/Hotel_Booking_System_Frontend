import { createSlice } from "@reduxjs/toolkit";

// Load saved favorites when the app starts
function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    return [];
  }
}

const initialState = {
  items: loadFavorites()
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.items.some(
        (item) => item.id === action.payload.id
      );

      if (!exists) {
        state.items.push(action.payload);
      }
    },

    removeFavorite: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    clearFavorites: (state) => {
      state.items = [];
    }
  }
});

export const {
  addFavorite,
  removeFavorite,
  clearFavorites
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
