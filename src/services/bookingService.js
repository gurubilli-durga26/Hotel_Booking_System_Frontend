import api from "./api";
import { datesOverlap } from "../utils/dates";

// true when the room is available and has no confirmed booking
// that overlaps with the given dates
export async function isRoomFree(roomId, checkIn, checkOut) {
  const roomResponse = await api.get(`/rooms/${roomId}`);

  if (!roomResponse.data.available) {
    return false;
  }

  const bookingsResponse = await api.get("/bookings", {
    params: { roomId, status: "confirmed" }
  });

  return !bookingsResponse.data.some((booking) =>
    datesOverlap(
      checkIn,
      checkOut,
      booking.checkIn,
      booking.checkOut
    )
  );
}
