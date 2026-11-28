import { Routes, Route, useLocation } from "react-router-dom";

import Home from "../pages/Home";
import Rooms from "../pages/Rooms";
import RoomDetails from "../pages/RoomDetails";
import AddRoom from "../pages/AddRoom";
import EditRoom from "../pages/EditRoom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Favorites from "../pages/Favorites";
import BookRoom from "../pages/BookRoom";
import MyBookings from "../pages/MyBookings";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import BookingSuccess from "../pages/BookingSuccess";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  // A new key re-creates the Rooms page when /rooms?category=... changes
  const { search } = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/rooms" element={<Rooms key={search} />} />

      <Route
        path="/rooms/:id"
        element={<RoomDetails />}
      />

      <Route path="/register" element={<Register />} />

      <Route path="/login" element={<Login />} />

      <Route path="/favorites" element={<Favorites />} />

      <Route path="/cart" element={<Cart />} />

      {/* Admin only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-room"
        element={
          <ProtectedRoute adminOnly={true}>
            <AddRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-room/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <EditRoom />
          </ProtectedRoute>
        }
      />

      {/* Logged-in users */}
      <Route
        path="/book/:id"
        element={
          <ProtectedRoute>
            <BookRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-success/:reservationId"
        element={
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
