import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import RoomCard from "../components/RoomCard";
import "../styles/home.css";

const categories = [
  {
    name: "Standard",
    tagline: "Simple, clean and affordable",
    image: "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Deluxe",
    tagline: "Extra space and comfort",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Suite",
    tagline: "Premium luxury stays",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"
  }
];

function Home() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    async function getTrending() {
      try {
        const response = await api.get("/rooms");

        // Top 4 rooms by rating
        const top = [...response.data]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        setTrending(top);
      } catch (error) {
        console.log("Error fetching rooms:", error);
      }
    }

    getTrending();
  }, []);

  return (
    <div className="home-page">
      <div className="announcement-bar">
        ✨ <strong>Limited Offer:</strong> Use code <code>HOTEL20</code> in
        your cart for 20% OFF your stay
      </div>

      <section className="hero-banner">
        <span className="hero-tag">🔥 Winter Holiday Deals Are Live</span>

        <h1>
          Comfort In Every Stay, <br />
          <span>Memories In Every Trip</span>
        </h1>

        <p>
          Explore handpicked hotels, deluxe rooms and luxury suites.
          Compare prices, save your favourites and book in seconds.
        </p>

        <div className="hero-buttons">
          <Link to="/rooms" className="hero-primary">
            Explore Rooms 🏨
          </Link>

          <button
            type="button"
            className="hero-secondary"
            onClick={() => navigate("/rooms?category=Suite")}
          >
            View Luxury Suites →
          </button>
        </div>

        <div className="hero-stats">
          <div><strong>500+</strong><span>Hotels</span></div>
          <div><strong>50+</strong><span>Cities</span></div>
          <div><strong>4.8 ⭐</strong><span>Guest Rating</span></div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <span className="subtag">Room Types</span>
          <h2>Browse By Category</h2>
        </div>

        <div className="category-grid">
          {categories.map((item) => (
            <div
              key={item.name}
              className="category-card"
              onClick={() => navigate(`/rooms?category=${item.name}`)}
            >
              <img src={item.image} alt={item.name} />

              <div className="category-overlay">
                <h3>{item.name}</h3>
                <p>{item.tagline}</p>
                <span>Explore →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head row">
          <div>
            <span className="subtag">Guest Favourites</span>
            <h2>Top Rated Rooms</h2>
          </div>

          <Link to="/rooms" className="view-all">
            View All Rooms →
          </Link>
        </div>

        <div className="rooms-grid">
          {trending.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      <section className="promo-banner">
        <span className="promo-tag">EXCLUSIVE OFFER</span>
        <h2>Flat 20% OFF On Your Next Stay</h2>
        <p>Add rooms to your cart and apply this code before checkout:</p>
        <div className="coupon-box">HOTEL20</div>
        <Link to="/rooms" className="promo-btn">
          Claim Your Discount
        </Link>
      </section>

      <section className="home-section">
        <div className="section-head">
          <span className="subtag">Our Promise</span>
          <h2>Why Book With Us?</h2>
        </div>

        <div className="perks-grid">
          <div className="perk-box">
            <div>🏨</div>
            <h3>Verified Hotels</h3>
            <p>Every hotel is checked for quality, cleanliness and safety.</p>
          </div>

          <div className="perk-box">
            <div>💰</div>
            <h3>Best Prices</h3>
            <p>Transparent pricing with GST shown before you pay.</p>
          </div>

          <div className="perk-box">
            <div>⚡</div>
            <h3>Instant Confirmation</h3>
            <p>Your booking is confirmed the moment you complete payment.</p>
          </div>

          <div className="perk-box">
            <div>🔄</div>
            <h3>Easy Cancellation</h3>
            <p>Change of plans? Cancel from My Bookings in one click.</p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <span className="subtag">Sample Reviews</span>
          <h2>Loved By Travellers</h2>
        </div>

        <div className="testimonials">
          <div className="testimonial">
            <div>⭐⭐⭐⭐⭐</div>
            <p>"Spotless room, great view and a super smooth booking process."</p>
            <h4>Aanya • Mumbai</h4>
          </div>

          <div className="testimonial">
            <div>⭐⭐⭐⭐⭐</div>
            <p>"Paid with UPI in seconds and the confirmation came instantly."</p>
            <h4>Rahul • Bengaluru</h4>
          </div>

          <div className="testimonial">
            <div>⭐⭐⭐⭐⭐</div>
            <p>"Booked a family suite for the weekend. The kids loved it!"</p>
            <h4>Pooja • Hyderabad</h4>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
