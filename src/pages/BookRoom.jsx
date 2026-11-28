import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { calculateNights, todayString } from "../utils/dates";
import "../styles/booking.css";

function BookRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);

  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1
  });

  useEffect(() => {
    async function getRoom() {
      try {
        const response = await api.get(`/rooms/${id}`);

        if (!response.data.available) {
          toast.error("This room is not available for booking.");
          navigate("/rooms");
          return;
        }

        setRoom(response.data);
      } catch (error) {
        console.log("Error fetching room:", error);
        toast.error("Room not found.");
        navigate("/rooms");
      }
    }

    getRoom();
  }, [id, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  }

  if (!room) {
    return <h2>Loading room...</h2>;
  }

  // Calculated on every render, so the summary updates instantly
  const nights = calculateNights(form.checkIn, form.checkOut);
  const totalPrice = nights * room.price;

  function handleSubmit(e) {
    e.preventDefault();

    if (nights < 1) {
      toast.error("Check-out date must be after check-in date.");
      return;
    }

    if (Number(form.guests) > room.capacity) {
      toast.error(`This room allows a maximum of ${room.capacity} guests.`);
      return;
    }

    // Payment and the final availability check happen on the Checkout page
    navigate("/checkout", {
      state: {
        directItem: {
          ...room,
          checkIn: form.checkIn,
          nights,
          guests: Number(form.guests)
        }
      }
    });
  }

  return (
    <div className="booking-container">
      <div className="booking-room">
        <img src={room.image} alt={room.name} />

        <h2>{room.name}</h2>
        <p>{room.hotel} - {room.location}</p>
        <p>₹ {room.price} / night</p>
        <p>Maximum guests: {room.capacity}</p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <h2>Book This Room</h2>

        <label>Check-in Date</label>
        <input
          type="date"
          name="checkIn"
          min={todayString()}
          value={form.checkIn}
          onChange={handleChange}
          required
        />

        <label>Check-out Date</label>
        <input
          type="date"
          name="checkOut"
          min={form.checkIn || todayString()}
          value={form.checkOut}
          onChange={handleChange}
          required
        />

        <label>Number of Guests</label>
        <input
          type="number"
          name="guests"
          min="1"
          max={room.capacity}
          value={form.guests}
          onChange={handleChange}
          required
        />

        <div className="price-summary">
          <p>
            ₹ {room.price} x {nights} night(s)
          </p>
          <h3>Total: ₹ {totalPrice}</h3>
        </div>

        <button type="submit">Continue to Payment</button>
      </form>
    </div>
  );
}

export default BookRoom;
