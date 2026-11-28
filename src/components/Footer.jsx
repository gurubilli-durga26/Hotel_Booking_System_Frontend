import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/layout.css";

function Footer() {
  function handleSubscribe(e) {
    e.preventDefault();

    toast.success("Thank you for subscribing! Use coupon HOTEL20 for 20% off.");
    e.target.reset();
  }

  return (
    <footer className="site-footer">
      <div className="footer-perks">
        <div className="perk-item">
          <span>🛡️</span>
          <div>
            <h4>Best Price Guarantee</h4>
            <p>Find a lower price and we match it</p>
          </div>
        </div>

        <div className="perk-item">
          <span>🔄</span>
          <div>
            <h4>Easy Cancellation</h4>
            <p>Cancel any booking from My Bookings</p>
          </div>
        </div>

        <div className="perk-item">
          <span>🔒</span>
          <div>
            <h4>Secure Payments</h4>
            <p>Cards, UPI, Net Banking or Pay at Hotel</p>
          </div>
        </div>

        <div className="perk-item">
          <span>📞</span>
          <div>
            <h4>24/7 Support</h4>
            <p>We are here whenever you need us</p>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-col">
          <h2>StayEase</h2>
          <p>
            Discover comfortable rooms, premium suites and great deals in
            your favourite cities. Book in seconds and travel with peace
            of mind.
          </p>
        </div>

        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/rooms">All Rooms</Link></li>
            <li><Link to="/favorites">My Favorites</Link></li>
            <li><Link to="/cart">Booking Cart</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Room Types</h3>
          <ul>
            <li><Link to="/rooms?category=Standard">Standard Rooms</Link></li>
            <li><Link to="/rooms?category=Deluxe">Deluxe Rooms</Link></li>
            <li><Link to="/rooms?category=Suite">Luxury Suites</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Join Our Travel Club</h3>
          <p>Get early access to deals and 20% off your first booking.</p>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              required
            />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} StayEase. All rights reserved.</p>

        <div className="pay-badges">
          <span>💳 Visa</span>
          <span>💳 Mastercard</span>
          <span>⚡ UPI</span>
          <span>🏦 Net Banking</span>
          <span>🏨 Pay at Hotel</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
