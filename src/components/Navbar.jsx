import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getUser, isAdmin, removeUser } from "../services/auth";
import "../styles/layout.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getUser();
  const admin = isAdmin();

  const favoritesCount = useSelector(
    (state) => state.favorites.items.length
  );

  const cartCount = useSelector(
    (state) => state.cart.items.length
  );

  function isActive(path) {
    return location.pathname === path ? "active" : "";
  }

  function handleLogout() {
    removeUser();
    toast.info("You have been logged out.");
    navigate("/login");
  }

  return (
    <header className="main-navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🏨</span>
          <span className="brand-text">
            <strong>STAYEASE</strong>
            <small>HOTEL BOOKING</small>
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>

          <Link to="/rooms" className={isActive("/rooms")}>
            Explore Rooms
          </Link>

          <Link to="/favorites" className={isActive("/favorites")}>
            Favorites
            {favoritesCount > 0 && (
              <span className="nav-badge">{favoritesCount}</span>
            )}
          </Link>

          {user && (
            <Link to="/my-bookings" className={isActive("/my-bookings")}>
              My Bookings
            </Link>
          )}

          {admin && (
            <Link to="/admin" className={`admin-link ${isActive("/admin")}`}>
              📊 Dashboard
            </Link>
          )}

          {admin && (
            <Link to="/add-room" className={`admin-link ${isActive("/add-room")}`}>
              ➕ Add Room
            </Link>
          )}
        </div>

        <div className="nav-right">
          <Link to="/cart" className={`cart-pill ${isActive("/cart")}`}>
            🛒 Cart
            <span className="cart-count">{cartCount}</span>
          </Link>

          {user ? (
            <>
              <span className={admin ? "user-badge admin" : "user-badge"}>
                {admin ? "👑 Admin" : `👤 ${user.name}`}
              </span>

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Log In
              </Link>

              <Link to="/register" className="nav-register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
