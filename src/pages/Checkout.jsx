import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../services/api";
import { getUser } from "../services/auth";
import { isRoomFree } from "../services/bookingService";
import { clearCart } from "../features/cartSlice";
import { addDays, todayString } from "../utils/dates";
import {
  COUPONS,
  TAX_PERCENT,
  calculateTotals,
  formatINR
} from "../utils/pricing";
import "../styles/checkout.css";

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // "Book Now" sends one room in the navigation state,
  // otherwise we book everything in the cart
  const directItem = location.state?.directItem;
  const cartItems = useSelector((state) => state.cart.items);
  const coupon = useSelector((state) => state.cart.coupon);

  const items = directItem ? [directItem] : cartItems;
  const discountPercent = directItem ? 0 : COUPONS[coupon] || 0;
  const totals = calculateTotals(items, discountPercent);

  const [guest, setGuest] = useState({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || ""
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [card, setCard] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: ""
  });

  const [upiMethod, setUpiMethod] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("HDFC Bank");

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  function handleGuestChange(e) {
    setGuest({ ...guest, [e.target.name]: e.target.value });
  }

  function handleCardNumber(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");

    setCard({ ...card, number: formatted });
  }

  function handleExpiry(e) {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    setCard({ ...card, expiry: value });
  }

  // Returns an error message, or "" when everything is valid
  function validate() {
    if (!guest.fullName.trim() || !guest.email.trim()) {
      return "Please fill in all guest details.";
    }

    if (items.some((item) => item.checkIn < todayString())) {
      return "A check-in date is in the past. Please update your dates.";
    }

    if (guest.phone.length !== 10) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (paymentMethod === "card") {
      if (card.number.replace(/\s/g, "").length < 16) {
        return "Please enter a valid 16-digit card number.";
      }
      if (!card.holder.trim()) {
        return "Please enter the cardholder name.";
      }
      if (card.expiry.length < 5) {
        return "Please enter a valid expiry date (MM/YY).";
      }
      if (card.cvv.length < 3) {
        return "Please enter a valid 3-digit CVV.";
      }
    }

    if (paymentMethod === "upi" && upiMethod === "id" && !upiId.includes("@")) {
      return "Please enter a valid UPI ID (for example name@okhdfcbank).";
    }

    return "";
  }

  function getPaymentLabel() {
    if (paymentMethod === "card") {
      // Only the last 4 digits are ever kept
      return `Card (ending ${card.number.slice(-4)})`;
    }

    if (paymentMethod === "upi") {
      return `UPI (${upiMethod === "id" ? upiId : upiMethod.toUpperCase()})`;
    }

    if (paymentMethod === "netbanking") {
      return `Net Banking (${bank})`;
    }

    return "Pay at Hotel";
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function handlePlaceBooking(e) {
    e.preventDefault();

    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Check availability again - somebody may have booked meanwhile
      setProcessingStep("Checking room availability...");

      for (const item of items) {
        const checkOut = addDays(item.checkIn, item.nights);
        const free = await isRoomFree(item.id, item.checkIn, checkOut);

        if (!free) {
          toast.error(
            `"${item.name}" is no longer available for ${item.checkIn} to ${checkOut}.`
          );
          setIsProcessing(false);
          return;
        }
      }

      // 2. Simulated payment (demo only - no real payment happens)
      setProcessingStep("Connecting to secure payment gateway...");
      await wait(800);

      setProcessingStep("Authorizing transaction...");
      await wait(800);

      // 3. Save one booking per room, all sharing a reservationId
      setProcessingStep("Confirming your booking...");

      const reservationId = `HB-${Date.now().toString().slice(-6)}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      const paymentLabel = getPaymentLabel();

      for (const item of items) {
        await api.post("/bookings", {
          reservationId,
          roomId: item.id,
          roomName: item.name,
          hotel: item.hotel,
          location: item.location,
          image: item.image,
          userId: user.id,
          userName: user.name,
          guestName: guest.fullName.trim(),
          guestPhone: guest.phone,
          guestEmail: guest.email.trim(),
          checkIn: item.checkIn,
          checkOut: addDays(item.checkIn, item.nights),
          guests: item.guests,
          nights: item.nights,
          pricePerNight: item.price,
          totalPrice: item.price * item.nights,
          discountPercent,
          taxPercent: TAX_PERCENT,
          paymentMethod: paymentLabel,
          paymentStatus:
            paymentMethod === "cod" ? "Pay at hotel" : "Paid",
          status: "confirmed",
          createdAt: new Date().toISOString()
        });
      }

      if (!directItem) {
        dispatch(clearCart());
      }

      toast.success("Booking confirmed! 🎉");

      navigate(`/booking-success/${reservationId}`, { replace: true });
    } catch (err) {
      console.log("Error creating booking:", err);
      toast.error("Unable to complete the booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="empty-box">
        <h2>Nothing to check out</h2>
        <p>Select a room or add rooms to your cart first.</p>
        <Link to="/rooms" className="primary-link">
          Explore Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-modal">
            <div className="spinner"></div>
            <h3>Processing Booking</h3>
            <p>{processingStep}</p>
            <small>🔒 Please do not refresh this page</small>
          </div>
        </div>
      )}

      <h1>Checkout &amp; Payment</h1>

      <form onSubmit={handlePlaceBooking} className="checkout-layout">
        <div className="checkout-main">
          <div className="checkout-card">
            <h2><span className="step">1</span> Guest Details</h2>

            <div className="form-grid">
              <div className="full">
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={guest.fullName}
                  onChange={handleGuestChange}
                  placeholder="Name as on your ID"
                  required
                />
              </div>

              <div>
                <label>Mobile Number *</label>
                <input
                  name="phone"
                  maxLength="10"
                  value={guest.phone}
                  onChange={(e) =>
                    setGuest({
                      ...guest,
                      phone: e.target.value.replace(/\D/g, "")
                    })
                  }
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              <div>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={guest.email}
                  onChange={handleGuestChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="checkout-card">
            <h2><span className="step">2</span> Payment Method</h2>

            <div className="payment-tabs">
              {[
                ["card", "💳 Card"],
                ["upi", "⚡ UPI"],
                ["netbanking", "🏦 Net Banking"],
                ["cod", "🏨 Pay at Hotel"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={paymentMethod === value ? "active" : ""}
                  onClick={() => setPaymentMethod(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="form-grid">
                <div className="full">
                  <label>Card Number</label>
                  <input
                    value={card.number}
                    onChange={handleCardNumber}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>

                <div className="full">
                  <label>Cardholder Name</label>
                  <input
                    value={card.holder}
                    onChange={(e) =>
                      setCard({ ...card, holder: e.target.value })
                    }
                    placeholder="Name printed on card"
                  />
                </div>

                <div>
                  <label>Expiry</label>
                  <input
                    value={card.expiry}
                    onChange={handleExpiry}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>

                <div>
                  <label>CVV</label>
                  <input
                    type="password"
                    maxLength="3"
                    value={card.cvv}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        cvv: e.target.value.replace(/\D/g, "")
                      })
                    }
                    placeholder="3 digits"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div>
                <div className="upi-options">
                  {[
                    ["gpay", "Google Pay"],
                    ["phonepe", "PhonePe"],
                    ["paytm", "Paytm"],
                    ["id", "Enter UPI ID"]
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className={upiMethod === value ? "selected" : ""}
                    >
                      <input
                        type="radio"
                        name="upiMethod"
                        checked={upiMethod === value}
                        onChange={() => setUpiMethod(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {upiMethod === "id" && (
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                  />
                )}
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div>
                <label>Choose Bank</label>
                <select value={bank} onChange={(e) => setBank(e.target.value)}>
                  <option>HDFC Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === "cod" && (
              <div className="info-box">
                🏨 Pay the full amount at the hotel reception when you
                check in. Your room is confirmed now.
              </div>
            )}

            <p className="demo-note">
              Demo only: no real payment is made and card details are never
              saved.
            </p>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="summary-card">
            <h2>Your Stay ({items.length})</h2>

            {items.map((item) => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.name} />

                <div>
                  <h4>{item.name}</h4>
                  <p>{item.hotel}</p>
                  <p>
                    {item.checkIn} → {addDays(item.checkIn, item.nights)}
                  </p>
                  <p>{item.nights} night(s) • {item.guests} guest(s)</p>
                </div>

                <strong>{formatINR(item.price * item.nights)}</strong>
              </div>
            ))}

            <hr />

            <div className="summary-row">
              <span>Room charges</span>
              <span>{formatINR(totals.subtotal)}</span>
            </div>

            {totals.discount > 0 && (
              <div className="summary-row discount">
                <span>Discount ({discountPercent}%)</span>
                <span>-{formatINR(totals.discount)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Taxes (GST {TAX_PERCENT}%)</span>
              <span>{formatINR(totals.tax)}</span>
            </div>

            <hr />

            <div className="summary-row total">
              <span>Total Payable</span>
              <span>{formatINR(totals.total)}</span>
            </div>

            <button type="submit" className="pay-btn" disabled={isProcessing}>
              {paymentMethod === "cod"
                ? `Confirm Booking (${formatINR(totals.total)})`
                : `Pay ${formatINR(totals.total)} & Confirm`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
