import axios from "axios";

const api = axios.create({
  baseURL: "https://hotel-booking-system-backend-1.onrender.com"
});

export default api;
