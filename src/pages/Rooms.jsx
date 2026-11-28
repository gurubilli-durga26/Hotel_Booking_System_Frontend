import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { isAdmin } from "../services/auth";
import RoomCard from "../components/RoomCard";
import "../styles/catalog.css";

function Rooms() {
  // Footer / Home links open this page like /rooms?category=Suite
  // (AppRoutes gives this page a new key when the URL changes)
  const [searchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(
    searchParams.get("location") || "All"
  );
  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [budget, setBudget] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    async function getRooms() {
      try {
        const response = await api.get("/rooms");
        setRooms(response.data);
      } catch (error) {
        console.log("Error fetching rooms:", error);
        toast.error("Unable to load rooms. Is JSON Server running?");
      }
    }

    getRooms();
  }, []);

  async function deleteRoom(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/rooms/${id}`);

      setRooms((previousRooms) =>
        previousRooms.filter((room) => room.id !== id)
      );

      toast.success("Room deleted successfully!");
    } catch (error) {
      console.log("Error deleting room:", error);
      toast.error("Unable to delete room.");
    }
  }

  // Dropdown options and category pills are created from the real data
  const locations = [...new Set(rooms.map((room) => room.location))];
  const categories = [
    "All",
    ...new Set(rooms.map((room) => room.category))
  ];

  // Step 1: Search + Filters
  const filteredRooms = rooms.filter((room) => {
    const text = `${room.name} ${room.hotel} ${room.location} ${room.category}`.toLowerCase();

    const matchesSearch = text.includes(search.trim().toLowerCase());

    const matchesLocation =
      location === "All" || room.location === location;

    const matchesCategory =
      category === "All" || room.category === category;

    const matchesBudget =
      budget === "All" ||
      (budget === "Low" && room.price < 2000) ||
      (budget === "Medium" && room.price >= 2000 && room.price <= 4000) ||
      (budget === "High" && room.price > 4000);

    const matchesAvailability = !availableOnly || room.available;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesCategory &&
      matchesBudget &&
      matchesAvailability
    );
  });

  // Step 2: Sorting (filter() already gave us a new array)
  if (sortBy === "priceLow") {
    filteredRooms.sort((a, b) => a.price - b.price);
  } else if (sortBy === "priceHigh") {
    filteredRooms.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filteredRooms.sort((a, b) => b.rating - a.rating);
  }

  const hasFilters =
    search ||
    location !== "All" ||
    category !== "All" ||
    budget !== "All" ||
    availableOnly ||
    sortBy !== "default";

  function clearFilters() {
    setSearch("");
    setLocation("All");
    setCategory("All");
    setBudget("All");
    setAvailableOnly(false);
    setSortBy("default");
  }

  return (
    <div className="catalog-page">
      <div className="catalog-hero">
        <div>
          <span className="subtag">Curated Stays</span>
          <h1>Find Your Perfect Room</h1>
          <p>Compare hotels, suites and deals across your favourite cities.</p>
        </div>

        {isAdmin() && (
          <Link to="/add-room" className="admin-cta">
            + Add New Room
          </Link>
        )}
      </div>

      <div className="pills-bar">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "pill active" : "pill"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by room, hotel or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="All">All Locations</option>
          {locations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        >
          <option value="All">Any Budget</option>
          <option value="Low">Below ₹2,000</option>
          <option value="Medium">₹2,000 - ₹4,000</option>
          <option value="High">Above ₹4,000 (Luxury)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Featured</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="rating">Top Rated ⭐</option>
        </select>

        <label className="check-label">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Available only
        </label>
      </div>

      <div className="results-bar">
        <span>
          Showing <strong>{filteredRooms.length}</strong> of {rooms.length} rooms
          {category !== "All" && ` in ${category}`}
        </span>

        {hasFilters && (
          <button type="button" onClick={clearFilters}>
            Reset All Filters ✕
          </button>
        )}
      </div>

      {filteredRooms.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">🔍</div>
          <h3>No rooms found</h3>
          <p>We could not find any room matching your filters.</p>
          <button type="button" onClick={clearFilters}>
            Clear Filters &amp; Show All
          </button>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onDelete={deleteRoom}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Rooms;
