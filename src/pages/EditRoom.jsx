
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

function EditRoom() {
  const { id } = useParams();
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
    amenities: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoom();
  }, [id]);

  async function getRoom() {
    try {
      const response = await api.get(`/rooms/${id}`);

      setRoom({
        ...response.data,
        amenities: response.data.amenities.join(", ")
      });
    } catch (error) {
      console.log("Error fetching room:", error);
      toast.error("Room not found.");
      navigate("/rooms");
    } finally {
      setLoading(false);
    }
  }

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
      const updatedRoom = {
        ...room,
        price: Number(room.price),
        rating: Number(room.rating),
        capacity: Number(room.capacity),
        amenities: room.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      };

      await api.put(`/rooms/${id}`, updatedRoom);

      toast.success("Room updated successfully!");

      navigate("/rooms");
    } catch (error) {
      console.log("Error updating room:", error);
      toast.error("Unable to update room.");
    }
  }

  if (loading) {
    return <h2>Loading room...</h2>;
  }

  return (
    <div className="form-container">
      <h1>Edit Room</h1>

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
          placeholder="Rating"
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
          Update Room
        </button>
      </form>
    </div>
  );
}

export default EditRoom;
