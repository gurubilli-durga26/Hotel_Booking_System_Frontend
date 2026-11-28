import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { getUser } from "../services/auth";
import { formatDate } from "../utils/dates";
import {
  formatINR,
  getReservationTotals,
  groupReservations
} from "../utils/pricing";
import "../styles/booking.css";

function MyBookings() {
  const user = getUser();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getBookings() {
      try {
        // Only this user's bookings
        const response = await api.get("/bookings", {
          params: { userId: user.id }
        });

        // Newest booking first
        const sorted = response.data.sort(
          (a, b) => b.createdAt.localeCompare(a.createdAt)
        );

        setBookings(sorted);
      } catch (error) {
        console.log("Error fetching bookings:", error);
        toast.error("Unable to load your bookings.");
      } finally {
        setLoading(false);
      }
    }

    getBookings();
  }, [user.id]);

  async function cancelBooking(id) {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this room booking?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      await api.patch(`/bookings/${id}`, {
        status: "cancelled"
      });

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === id
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      toast.success("Booking cancelled.");
    } catch (error) {
      console.log("Error cancelling booking:", error);
      toast.error("Unable to cancel booking.");
    }
  }

  if (loading) {
    return <h2 className="page-loading">Loading bookings...</h2>;
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-box">
        <div className="empty-icon">📦</div>
        <h1>My Bookings</h1>
        <p>You have no bookings yet.</p>
        <Link to="/rooms" className="primary-link">
          Find a Room
        </Link>
      </div>
    );
  }

  const groups = groupReservations(bookings);

  return (
    <div className="bookings-page">
      <h1>My Bookings</h1>

      {groups.map((group) => {
        const first = group.bookings[0];
        const totals = getReservationTotals(group);

        return (
          <div className="reservation-card" key={group.reservationId}>
            <div className="reservation-header">
              <div>
                <strong>Booking #{group.reservationId}</strong>
                <span>
                  Booked on{" "}
                  {new Date(first.createdAt).toLocaleDateString("en-IN", {
                    dateStyle: "medium"
                  })}
                </span>
              </div>

              <div className="reservation-total">
                <span>{formatINR(totals.total)}</span>
                {first.paymentMethod && <small>{first.paymentMethod}</small>}
              </div>
            </div>

            {group.bookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <img src={booking.image} alt={booking.roomName} />

                <div className="booking-info">
                  <h3>{booking.roomName}</h3>
                  <p>{booking.hotel} - {booking.location}</p>

                  <p>
                    {formatDate(booking.checkIn)} to{" "}
                    {formatDate(booking.checkOut)} ({booking.nights} nights)
                  </p>

                  <p>Guests: {booking.guests}</p>
                  <p><strong>Room price: {formatINR(booking.totalPrice)}</strong></p>

                  <span className={`status ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>

                {booking.status === "confirmed" && (
                  <button
                    className="cancel-btn"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    Cancel Room
                  </button>
                )}
              </div>
            ))}

            {!group.isLegacy && (
              <Link
                to={`/booking-success/${group.reservationId}`}
                className="receipt-link"
              >
                View Receipt →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MyBookings;
