import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  applyCoupon,
  clearCart,
  removeFromCart,
  updateStay
} from "../features/cartSlice";
import { getUser } from "../services/auth";
import { addDays, todayString } from "../utils/dates";
import {
  COUPONS,
  TAX_PERCENT,
  calculateTotals,
  formatINR
} from "../utils/pricing";
import "../styles/cart.css";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((state) => state.cart.items);
  const coupon = useSelector((state) => state.cart.coupon);

  const [couponCode, setCouponCode] = useState("");

  const discountPercent = COUPONS[coupon] || 0;
  const totals = calculateTotals(items, discountPercent);

  function handleApplyCoupon(e) {
    e.preventDefault();

    const code = couponCode.trim().toUpperCase();

    if (COUPONS[code]) {
      dispatch(applyCoupon(code));
      toast.success(`Coupon ${code} applied! You saved ${COUPONS[code]}% 🎉`);
    } else {
      dispatch(applyCoupon(""));
      toast.error("Invalid coupon code. Try HOTEL20.");
    }
  }

  function handleClearCart() {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
      toast.success("Cart cleared!");
    }
  }

  function handleRemove(item) {
    dispatch(removeFromCart(item.id));
    toast.info(`"${item.name}" removed from Cart`);
  }

  function handleCheckout() {
    if (!getUser()) {
      toast.warning("Please log in to continue to checkout.");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    navigate("/checkout");
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <span className="subtag">Your Trip</span>
        <h1>Booking Cart ({items.length})</h1>
      </div>

      {items.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add a few rooms to plan your trip.</p>
          <Link to="/rooms" className="primary-link">
            Explore Rooms
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-top">
              <span>
                {items.length} {items.length === 1 ? "room" : "rooms"} in your cart
              </span>

              <button type="button" onClick={handleClearCart}>
                Clear All
              </button>
            </div>

            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />

                <div className="cart-item-info">
                  <h3>
                    <Link to={`/rooms/${item.id}`}>{item.name}</Link>
                  </h3>

                  <p>{item.hotel} • {item.location}</p>
                  <p>{formatINR(item.price)} per night</p>

                  <div className="cart-controls">
                    <div>
                      <label>Check-in</label>
                      <input
                        type="date"
                        min={todayString()}
                        value={item.checkIn}
                        onChange={(e) =>
                          e.target.value &&
                          dispatch(
                            updateStay({ id: item.id, checkIn: e.target.value })
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Nights</label>
                      <div className="stepper">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateStay({
                                id: item.id,
                                nights: Math.max(1, item.nights - 1)
                              })
                            )
                          }
                        >
                          -
                        </button>
                        <span>{item.nights}</span>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateStay({
                                id: item.id,
                                nights: Math.min(30, item.nights + 1)
                              })
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label>Guests</label>
                      <div className="stepper">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateStay({
                                id: item.id,
                                guests: Math.max(1, item.guests - 1)
                              })
                            )
                          }
                        >
                          -
                        </button>
                        <span>{item.guests}</span>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateStay({
                                id: item.id,
                                guests: Math.min(item.capacity, item.guests + 1)
                              })
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="cart-dates">
                    {item.checkIn} → {addDays(item.checkIn, item.nights)}
                  </p>
                </div>

                <div className="cart-item-side">
                  <strong>{formatINR(item.price * item.nights)}</strong>

                  <button type="button" onClick={() => handleRemove(item)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="coupon-card">
              <h4>Have a promo code?</h4>
              <p>
                Use <strong>HOTEL20</strong> for an instant 20% discount!
              </p>

              <form onSubmit={handleApplyCoupon}>
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit">Apply</button>
              </form>

              {coupon && (
                <p className="coupon-ok">✔ {coupon} applied ({discountPercent}% off)</p>
              )}
            </div>
          </div>

          <div className="summary-card">
            <h2>Price Summary</h2>

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
              <span>Total Amount</span>
              <span>{formatINR(totals.total)}</span>
            </div>

            <button
              type="button"
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout 🔒
            </button>

            <Link to="/rooms" className="continue-link">
              ← Continue Browsing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
