import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { getUser } from "../services/auth";
import { formatDate } from "../utils/dates";
import {
  TAX_PERCENT,
  formatINR,
  getReservationTotals,
  groupReservations
} from "../utils/pricing";
import "../styles/checkout.css";

function BookingSuccess() {
  const { reservationId } = useParams();
  const user = getUser();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getReservation() {
      try {
        // Only this user's bookings with this reservation id
        const response = await api.get("/bookings", {
          params: { reservationId, userId: user.id }
        });

        if (response.data.length > 0) {
          setGroup(groupReservations(response.data)[0]);
        }
      } catch (error) {
        console.log("Error fetching reservation:", error);
      } finally {
        setLoading(false);
      }
    }

    getReservation();
  }, [reservationId, user.id]);

  if (loading) {
    return <h2 className="page-loading">Loading your booking...</h2>;
  }

  if (!group) {
    return (
      <div className="empty-box">
        <h2>Booking not found</h2>
        <p>We could not find the details for #{reservationId}.</p>
        <Link to="/rooms" className="primary-link">
          Back to Rooms
        </Link>
      </div>
    );
  }

  const first = group.bookings[0];
  const totals = getReservationTotals(group);

  return (
    <div className="success-page">
      <div className="success-banner">
        <div className="success-icon">✓</div>
        <h1>Booking Confirmed!</h1>
        <p>
          Thank you for booking with StayEase. A confirmation has been
          sent to {first.guestEmail || user.email}.
        </p>

        <div className="success-meta">
          <span><strong>Booking ID:</strong> #{group.reservationId}</span>
          <span><strong>Payment:</strong> {first.paymentMethod}</span>
          <span><strong>Status:</strong> {first.paymentStatus}</span>
        </div>
      </div>

      <div className="success-grid">
        <div className="info-card">
          <h3>👤 Guest Details</h3>
          <p><strong>{first.guestName}</strong></p>
          <p>{first.guestEmail}</p>
          <p>+91 {first.guestPhone}</p>
          <p className="muted">Please carry a valid photo ID at check-in.</p>
        </div>

        <div className="info-card">
          <h3>🏨 Your Stay ({group.bookings.length})</h3>

          {group.bookings.map((booking) => (
            <div key={booking.id} className="receipt-row">
              <img src={booking.image} alt={booking.roomName} />

              <div>
                <h4>{booking.roomName}</h4>
                <p>{booking.hotel} • {booking.location}</p>
                <p>
                  {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                </p>
                <p>{booking.nights} night(s) • {booking.guests} guest(s)</p>
              </div>

              <strong>{formatINR(booking.totalPrice)}</strong>
            </div>
          ))}

          <hr />

          <div className="summary-row">
            <span>Room charges</span>
            <span>{formatINR(totals.subtotal)}</span>
          </div>

          {totals.discount > 0 && (
            <div className="summary-row discount">
              <span>Discount ({first.discountPercent}%)</span>
              <span>-{formatINR(totals.discount)}</span>
            </div>
          )}

          {!group.isLegacy && (
            <div className="summary-row">
              <span>Taxes (GST {first.taxPercent || TAX_PERCENT}%)</span>
              <span>{formatINR(totals.tax)}</span>
            </div>
          )}

          <hr />

          <div className="summary-row total">
            <span>Total</span>
            <span>{formatINR(totals.total)}</span>
          </div>
        </div>
      </div>

      <div className="success-actions">
        <Link to="/my-bookings" className="primary-link">
          View My Bookings
        </Link>
        <Link to="/rooms" className="secondary-link">
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}

export default BookingSuccess;
