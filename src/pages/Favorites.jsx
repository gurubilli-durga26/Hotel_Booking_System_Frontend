import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  clearFavorites,
  removeFavorite
} from "../features/favoritesSlice";
import { addToCart } from "../features/cartSlice";
import { getUser } from "../services/auth";
import { tomorrowString } from "../utils/dates";
import { formatINR } from "../utils/pricing";
import "../styles/catalog.css";

function Favorites() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const favorites = useSelector((state) => state.favorites.items);

  function handleMoveToCart(room) {
    dispatch(addToCart(room));
    dispatch(removeFavorite(room.id));
    toast.success(`"${room.name}" moved to your Cart 🛒`);
  }

  function handleBookNow(room) {
    const checkoutPage = {
      pathname: "/checkout",
      state: {
        directItem: { ...room, checkIn: tomorrowString(), nights: 1, guests: 1 }
      }
    };

    if (!getUser()) {
      toast.warning("Please log in to book this room.");
      navigate("/login", { state: { from: checkoutPage } });
      return;
    }

    navigate(checkoutPage.pathname, { state: checkoutPage.state });
  }

  function handleRemove(room) {
    dispatch(removeFavorite(room.id));
    toast.info(`"${room.name}" removed from Favorites`);
  }

  if (favorites.length === 0) {
    return (
      <div className="empty-box">
        <div className="empty-icon">💖</div>
        <h1>Your Favorites</h1>
        <p>Tap the heart on any room to save it here for later.</p>
        <Link to="/rooms" className="primary-link">
          Explore Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-hero">
        <div>
          <span className="subtag">Saved For Later</span>
          <h1>My Favorites ({favorites.length})</h1>
        </div>

        <button
          type="button"
          className="admin-cta danger"
          onClick={() => dispatch(clearFavorites())}
        >
          Clear All
        </button>
      </div>

      <div className="rooms-grid">
        {favorites.map((room) => (
          <div key={room.id} className="room-card">
            <div className="room-media">
              <Link to={`/rooms/${room.id}`}>
                <img src={room.image} alt={room.name} />
              </Link>

              <button
                type="button"
                className="heart-btn"
                onClick={() => handleRemove(room)}
                title="Remove from Favorites"
              >
                ✕
              </button>
            </div>

            <div className="room-body">
              <span className="room-hotel">{room.hotel}</span>

              <h3 className="room-title">
                <Link to={`/rooms/${room.id}`}>{room.name}</Link>
              </h3>

              <p className="room-info">📍 {room.location} • {room.category}</p>

              <div className="room-price-row">
                <span className="room-price">{formatINR(room.price)}</span>
                <span className="room-night">/ night</span>
              </div>

              <div className="room-actions">
                <button
                  type="button"
                  className="btn-cart"
                  onClick={() => handleMoveToCart(room)}
                >
                  🛒 Move to Cart
                </button>

                <button
                  type="button"
                  className="btn-book"
                  onClick={() => handleBookNow(room)}
                >
                  ⚡ Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
