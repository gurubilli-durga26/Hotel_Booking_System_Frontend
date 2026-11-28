import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../services/api";
import { getUser } from "../services/auth";
import RoomCard from "../components/RoomCard";
import {
  addFavorite,
  removeFavorite
} from "../features/favoritesSlice";
import { addToCart } from "../features/cartSlice";
import { addDays, todayString, tomorrowString } from "../utils/dates";
import {
  formatINR,
  getDiscountPercent,
  getOriginalPrice
} from "../utils/pricing";
import "../styles/details.css";

function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [room, setRoom] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeTab, setActiveTab] = useState("amenities");

  // Stay options chosen by the guest
  const [checkIn, setCheckIn] = useState(tomorrowString());
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(1);

  const isFavorite = useSelector((state) =>
    state.favorites.items.some((item) => item.id === id)
  );

  const inCart = useSelector((state) =>
    state.cart.items.some((item) => item.id === id)
  );

  useEffect(() => {
    async function getRoom() {
      try {
        const response = await api.get(`/rooms/${id}`);
        setRoom(response.data);

        // Related rooms: same city or same category
        const all = await api.get("/rooms");

        setRelated(
          all.data
            .filter(
              (item) =>
                item.id !== response.data.id &&
                (item.location === response.data.location ||
                  item.category === response.data.category)
            )
            .slice(0, 3)
        );
      } catch (error) {
        console.log(error);
        toast.error("Room not found.");
        navigate("/rooms");
      }
    }

    getRoom();
  }, [id, navigate]);

  if (!room) {
    return <h2 className="page-loading">Loading...</h2>;
  }

  const originalPrice = getOriginalPrice(room);
  const discount = getDiscountPercent(room);

  function buildStay() {
    return { ...room, checkIn, nights, guests };
  }

  function handleAddToCart() {
    if (inCart) {
      toast.info("This room is already in your cart.");
      return;
    }

    dispatch(addToCart(buildStay()));
    toast.success(`"${room.name}" added to Cart 🛒`);
  }

  function handleBookNow() {
    const stay = buildStay();
    const user = getUser();

    // Same page we want to open after login
    const checkoutPage = {
      pathname: "/checkout",
      state: { directItem: stay }
    };

    if (!user) {
      toast.warning("Please log in to book this room.");
      navigate("/login", { state: { from: checkoutPage } });
      return;
    }

    navigate(checkoutPage.pathname, { state: checkoutPage.state });
  }

  function handleFavorite() {
    if (isFavorite) {
      dispatch(removeFavorite(room.id));
      toast.info("Removed from Favorites");
    } else {
      dispatch(addFavorite(room));
      toast.success("Added to Favorites ❤️");
    }
  }

  return (
    <div className="details-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> / <Link to="/rooms">Rooms</Link> /{" "}
        <span>{room.name}</span>
      </div>

      <div className="details-card">
        <div className="details-image">
          <img src={room.image} alt={room.name} />

          {room.badge && <span className="room-badge">{room.badge}</span>}
          {discount > 0 && (
            <span className="room-discount">-{discount}% OFF</span>
          )}
        </div>

        <div className="details-content">
          <div className="details-top">
            <span className="details-hotel">{room.hotel}</span>
            <span className="details-rating">
              ⭐ {room.rating} ({room.reviewsCount || 48} reviews)
            </span>
          </div>

          <h1>{room.name}</h1>

          <p className="details-location">
            📍 {room.location} • {room.category} • 👥 Up to {room.capacity} guests
          </p>

          <div className="details-price">
            <span className="final">{formatINR(room.price)}</span>
            {originalPrice > room.price && (
              <span className="old">{formatINR(originalPrice)}</span>
            )}
            <span className="per-night">/ night</span>
            <small>+ 12% GST at checkout</small>
          </div>

          <p className={room.available ? "status-ok" : "status-no"}>
            {room.available
              ? "● Available for booking"
              : "● Currently not available"}
          </p>

          <p className="details-desc">{room.description}</p>

          {room.available && (
            <>
              <div className="stay-picker">
                <div>
                  <label>Check-in Date</label>
                  <input
                    type="date"
                    min={todayString()}
                    value={checkIn}
                    onChange={(e) => e.target.value && setCheckIn(e.target.value)}
                  />
                </div>

                <div>
                  <label>Nights</label>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => setNights(Math.max(1, nights - 1))}
                    >
                      -
                    </button>
                    <span>{nights}</span>
                    <button
                      type="button"
                      onClick={() => setNights(Math.min(30, nights + 1))}
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
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                    >
                      -
                    </button>
                    <span>{guests}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setGuests(Math.min(room.capacity, guests + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <p className="stay-summary">
                Check-out: <strong>{addDays(checkIn, nights)}</strong> • Room
                total: <strong>{formatINR(room.price * nights)}</strong>
              </p>
            </>
          )}

          <div className="details-actions">
            {room.available && (
              <>
                <button className="cta-cart" onClick={handleAddToCart}>
                  {inCart ? "✓ In Cart" : "🛒 Add to Cart"}
                </button>

                <button className="cta-book" onClick={handleBookNow}>
                  ⚡ Book Now
                </button>
              </>
            )}

            <button className="cta-fav" onClick={handleFavorite}>
              {isFavorite ? "❤️ Saved" : "🤍 Save"}
            </button>
          </div>

          <div className="details-tabs">
            <div className="tabs-header">
              <button
                className={activeTab === "amenities" ? "active" : ""}
                onClick={() => setActiveTab("amenities")}
              >
                Amenities
              </button>
              <button
                className={activeTab === "policies" ? "active" : ""}
                onClick={() => setActiveTab("policies")}
              >
                Hotel Policies
              </button>
              <button
                className={activeTab === "cancel" ? "active" : ""}
                onClick={() => setActiveTab("cancel")}
              >
                Cancellation
              </button>
            </div>

            <div className="tabs-body">
              {activeTab === "amenities" && (
                <ul>
                  {room.amenities.map((item, index) => (
                    <li key={index}>✔ {item}</li>
                  ))}
                </ul>
              )}

              {activeTab === "policies" && (
                <ul>
                  <li>Check-in from 12:00 PM, check-out until 11:00 AM</li>
                  <li>A valid photo ID is required at check-in</li>
                  <li>Maximum {room.capacity} guests are allowed in this room</li>
                  <li>Smoking is not allowed inside the rooms</li>
                </ul>
              )}

              {activeTab === "cancel" && (
                <ul>
                  <li>Cancel any time from the My Bookings page</li>
                  <li>Cancelled dates become available for other guests</li>
                  <li>Refunds for online payments reach you in 5-7 working days</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <h2>You May Also Like</h2>

          <div className="rooms-grid">
            {related.map((item) => (
              <RoomCard key={item.id} room={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default RoomDetails;
