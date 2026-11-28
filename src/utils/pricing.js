// Prices, discounts, coupons and taxes in one place

export const TAX_PERCENT = 12;

// Valid coupon codes and their discount percentage
export const COUPONS = {
  HOTEL20: 20
};

// "₹ 7,500"
export function formatINR(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

// If a room has no originalPrice, we show a 35% higher "old" price
export function getOriginalPrice(room) {
  return room.originalPrice || Math.round(room.price * 1.35);
}

export function getDiscountPercent(room) {
  const original = getOriginalPrice(room);

  return Math.max(
    0,
    Math.round(((original - room.price) / original) * 100)
  );
}

// items: [{ price, nights }]   (price = price per night)
export function calculateTotals(items, discountPercent = 0) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.nights,
    0
  );

  const discount = Math.round((subtotal * discountPercent) / 100);
  const taxable = subtotal - discount;
  const tax = Math.round((taxable * TAX_PERCENT) / 100);

  return {
    subtotal,
    discount,
    tax,
    total: taxable + tax
  };
}

// Bookings made at checkout share a reservationId. This groups them and
// calculates the totals of one reservation.
// (Bookings made before Day 8 have no reservationId - each one is its own group)
export function groupReservations(bookings) {
  const groups = {};

  bookings.forEach((booking) => {
    const key = booking.reservationId || booking.id;

    if (!groups[key]) {
      groups[key] = { reservationId: key, isLegacy: !booking.reservationId, bookings: [] };
    }

    groups[key].bookings.push(booking);
  });

  return Object.values(groups);
}

export function getReservationTotals(group) {
  const first = group.bookings[0];

  // Day 5 bookings were saved without taxes: show their saved price
  if (group.isLegacy) {
    const total = first.totalPrice;
    return { subtotal: total, discount: 0, tax: 0, total };
  }

  // Cancelled rooms are not charged
  const active = group.bookings.filter((b) => b.status !== "cancelled");

  return calculateTotals(
    active.map((b) => ({ price: b.pricePerNight, nights: b.nights })),
    first.discountPercent || 0
  );
}
