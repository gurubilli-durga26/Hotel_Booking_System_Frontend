import axios from "axios";

// Uses the live API when VITE_API_URL is set (Netlify),
// otherwise uses JSON Server running on your laptop.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000"
});

export default api;
