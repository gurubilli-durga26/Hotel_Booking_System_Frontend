import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { formatDate } from "../utils/dates";
import {
  formatINR,
  getReservationTotals,
  groupReservations
} from "../utils/pricing";
import "../styles/admin.css";

function AdminDashboard() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("bookings");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        // Load everything at the same time
        const [roomsResponse, bookingsResponse, usersResponse] =
          await Promise.all([
            api.get("/rooms"),
            api.get("/bookings"),
            api.get("/users")
          ]);

        setRooms(roomsResponse.data);

        setBookings(
          bookingsResponse.data.sort((a, b) =>
            (b.createdAt || "").localeCompare(a.createdAt || "")
          )
        );

        setUsers(usersResponse.data);
      } catch (error) {
        console.log("Error loading dashboard:", error);
        toast.error("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ---------- Statistics ----------

  const reservations = groupReservations(bookings);

  const revenue = reservations.reduce((sum, group) => {
    // Old (Day 5) bookings that were cancelled are not counted
    if (group.isLegacy && group.bookings[0].status === "cancelled") {
      return sum;
    }

    return sum + getReservationTotals(group).total;
  }, 0);

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const cancelledCount = bookings.length - confirmedCount;

  // ---------- Actions ----------

  async function cancelBooking(id) {
    if (!window.confirm("Cancel this booking?")) {
      return;
    }

    try {
      await api.patch(`/bookings/${id}`, { status: "cancelled" });

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === id ? { ...booking, status: "cancelled" } : booking
        )
      );

      toast.success("Booking cancelled.");
    } catch (error) {
      console.log(error);
      toast.error("Unable to cancel booking.");
    }
  }

  async function toggleAvailability(room) {
    try {
      await api.patch(`/rooms/${room.id}`, {
        available: !room.available
      });

      setRooms((previous) =>
        previous.map((item) =>
          item.id === room.id
            ? { ...item, available: !item.available }
            : item
        )
      );

      toast.success(
        room.available
          ? `"${room.name}" is now hidden from booking.`
          : `"${room.name}" is now available.`
      );
    } catch (error) {
      console.log(error);
      toast.error("Unable to update room.");
    }
  }

  async function deleteRoom(room) {
    if (!window.confirm(`Delete "${room.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/rooms/${room.id}`);

      setRooms((previous) =>
        previous.filter((item) => item.id !== room.id)
      );

      toast.success("Room deleted.");
    } catch (error) {
      console.log(error);
      toast.error("Unable to delete room.");
    }
  }

  if (loading) {
    return <h2 className="page-loading">Loading dashboard...</h2>;
  }

  const visibleBookings = bookings.filter(
    (booking) => statusFilter === "all" || booking.status === statusFilter
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="subtag">Admin Panel</span>
          <h1>Dashboard</h1>
        </div>

        <Link to="/add-room" className="admin-add">
          + Add New Room
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span>🏨</span>
          <strong>{rooms.length}</strong>
          <p>Total Rooms</p>
        </div>

        <div className="stat-card">
          <span>📅</span>
          <strong>{confirmedCount}</strong>
          <p>Confirmed Bookings</p>
        </div>

        <div className="stat-card">
          <span>❌</span>
          <strong>{cancelledCount}</strong>
          <p>Cancelled Bookings</p>
        </div>

        <div className="stat-card">
          <span>💰</span>
          <strong>{formatINR(revenue)}</strong>
          <p>Total Revenue</p>
        </div>

        <div className="stat-card">
          <span>👥</span>
          <strong>{users.length}</strong>
          <p>Registered Users</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === "bookings" ? "active" : ""}
          onClick={() => setActiveTab("bookings")}
        >
          Bookings ({bookings.length})
        </button>

        <button
          className={activeTab === "rooms" ? "active" : ""}
          onClick={() => setActiveTab("rooms")}
        >
          Rooms ({rooms.length})
        </button>

        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
        </button>
      </div>

      {activeTab === "bookings" && (
        <div className="admin-card">
          <div className="admin-toolbar">
            <label>Status:</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {visibleBookings.length === 0 ? (
            <p className="admin-empty">No bookings found.</p>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Stay</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.reservationId || booking.id}</td>
                      <td>
                        {booking.guestName || booking.userName}
                        {booking.guestPhone && (
                          <small>{booking.guestPhone}</small>
                        )}
                      </td>
                      <td>
                        {booking.roomName}
                        <small>{booking.hotel}</small>
                      </td>
                      <td>
                        {formatDate(booking.checkIn)} →{" "}
                        {formatDate(booking.checkOut)}
                        <small>
                          {booking.nights} night(s), {booking.guests} guest(s)
                        </small>
                      </td>
                      <td>
                        {formatINR(booking.totalPrice)}
                        <small>{booking.paymentMethod || "-"}</small>
                      </td>
                      <td>
                        <span className={`status ${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status === "confirmed" && (
                          <button
                            className="row-btn danger"
                            onClick={() => cancelBooking(booking.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "rooms" && (
        <div className="admin-card">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Price / night</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      {room.name}
                      <small>{room.hotel}</small>
                    </td>
                    <td>{room.location}</td>
                    <td>{room.category}</td>
                    <td>{formatINR(room.price)}</td>
                    <td>
                      <button
                        className={
                          room.available ? "toggle on" : "toggle off"
                        }
                        onClick={() => toggleAvailability(room)}
                      >
                        {room.available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="action-cell">
                      <Link
                        to={`/edit-room/${room.id}`}
                        className="row-btn"
                      >
                        Edit
                      </Link>

                      <button
                        className="row-btn danger"
                        onClick={() => deleteRoom(room)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="admin-card">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Bookings</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={
                          user.role === "admin" ? "role admin" : "role"
                        }
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td>
                      {
                        bookings.filter(
                          (booking) => booking.userId === user.id
                        ).length
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
