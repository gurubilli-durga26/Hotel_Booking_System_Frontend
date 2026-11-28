import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addFavorite,
  removeFavorite
} from "../features/favoritesSlice";
import { addToCart } from "../features/cartSlice";
import { isAdmin } from "../services/auth";
import {
  formatINR,
  getDiscountPercent,
  getOriginalPrice
} from "../utils/pricing";
import "../styles/catalog.css";

function RoomCard({ room, onDelete }) {
  const dispatch = useDispatch();

  // Edit / Delete are shown only to admins, and only on pages
  // that pass an onDelete function (Rooms page)
  const canManage = isAdmin() && onDelete;

  const isFavorite = useSelector((state) =>
    state.favorites.items.some((item) => item.id === room.id)
  );

  const inCart = useSelector((state) =>
    state.cart.items.some((item) => item.id === room.id)
  );

  const originalPrice = getOriginalPrice(room);
  const discount = getDiscountPercent(room);

  function toggleFavorite() {
    if (isFavorite) {
      dispatch(removeFavorite(room.id));
      toast.info(`"${room.name}" removed from Favorites`);
    } else {
      dispatch(addFavorite(room));
      toast.success(`"${room.name}" added to Favorites ❤️`);
    }
  }

  function handleAddToCart() {
    if (inCart) {
      toast.info("This room is already in your cart.");
      return;
    }

    dispatch(addToCart(room));
    toast.success(`"${room.name}" added to Cart 🛒`);
  }

  return (
    <div className="room-card">
      <div className="room-media">
        <Link to={`/rooms/${room.id}`}>
          <img src={room.image} alt={room.name} loading="lazy" />
        </Link>

        {room.badge && (
          <span className="room-badge">{room.badge}</span>
        )}

        {discount > 0 && (
          <span className="room-discount">-{discount}%</span>
        )}

        <button
          type="button"
          className="heart-btn"
          onClick={toggleFavorite}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="room-body">
        <div className="room-meta-top">
          <span className="room-hotel">{room.hotel}</span>
          <span className="room-rating">
            ⭐ {room.rating} ({room.reviewsCount || 48})
          </span>
        </div>

        <h3 className="room-title">
          <Link to={`/rooms/${room.id}`}>{room.name}</Link>
        </h3>

        <p className="room-info">
          📍 {room.location} • {room.category} • 👥 {room.capacity} guests
        </p>

        <div className="room-price-row">
          <span className="room-price">{formatINR(room.price)}</span>
          {originalPrice > room.price && (
            <span className="room-old-price">{formatINR(originalPrice)}</span>
          )}
          <span className="room-night">/ night</span>
        </div>

        {room.available ? (
          <div className="room-actions">
            <button
              type="button"
              className="btn-cart"
              onClick={handleAddToCart}
            >
              {inCart ? "✓ In Cart" : "🛒 Add to Cart"}
            </button>

            <Link to={`/book/${room.id}`} className="btn-book">
              ⚡ Book Now
            </Link>
          </div>
        ) : (
          <p className="room-sold-out">Currently not available</p>
        )}

        <div className="room-secondary">
          <Link to={`/rooms/${room.id}`}>View Details</Link>

          {canManage && (
            <>
              <Link to={`/edit-room/${room.id}`} className="edit-link">
                ✏️ Edit
              </Link>

              <button
                type="button"
                className="delete-link"
                onClick={() => onDelete(room.id)}
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
