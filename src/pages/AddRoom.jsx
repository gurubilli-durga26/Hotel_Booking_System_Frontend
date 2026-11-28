
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

function AddRoom() {
  const navigate = useNavigate();

  const [room, setRoom] = useState({
    name: "",
    hotel: "",
    location: "",
    category: "",
    price: "",
    rating: "",
    image: "",
    description: "",
    capacity: "",
    available: true,
    amenities: ""
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setRoom({
      ...room,
      [name]: value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const newRoom = {
        ...room,
        price: Number(room.price),
        rating: Number(room.rating),
        capacity: Number(room.capacity),
        amenities: room.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      };

      await api.post("/rooms", newRoom);

      toast.success("Room added successfully!");

      navigate("/rooms");
    } catch (error) {
      console.log("Error adding room:", error);
      toast.error("Unable to add room.");
    }
  }

  return (
    <div className="form-container">
      <h1>Add New Room</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Room Name"
          value={room.name}
          onChange={handleChange}
          required
        />

        <input
          name="hotel"
          placeholder="Hotel Name"
          value={room.hotel}
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
          value={room.location}
          onChange={handleChange}
          required
        />

        <input
          name="category"
          placeholder="Category"
          value={room.category}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price per night"
          min="1"
          value={room.price}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="rating"
          placeholder="Rating (0 to 5)"
          min="0"
          max="5"
          step="0.1"
          value={room.rating}
          onChange={handleChange}
          required
        />

        <input
          name="image"
          placeholder="Image URL"
          value={room.image}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Room Description"
          value={room.description}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="capacity"
          placeholder="Guest Capacity"
          min="1"
          value={room.capacity}
          onChange={handleChange}
          required
        />

        <input
          name="amenities"
          placeholder="Amenities (Wi-Fi, AC, TV)"
          value={room.amenities}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Add Room
        </button>
      </form>
    </div>
  );
}

export default AddRoom;
