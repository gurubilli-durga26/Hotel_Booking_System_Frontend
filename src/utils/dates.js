// Helper functions for booking dates

// Today's date as "YYYY-MM-DD" (used for the min attribute of date inputs)
export function todayString() {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return local.toISOString().split("T")[0];
}

// Add days to a "YYYY-MM-DD" date and return "YYYY-MM-DD"
export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().split("T")[0];
}

// Tomorrow's date - the default check-in for rooms added to the cart
export function tomorrowString() {
  return addDays(todayString(), 1);
}

// Number of nights between check-in and check-out
export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const oneDay = 1000 * 60 * 60 * 24;
  const difference = new Date(checkOut) - new Date(checkIn);

  return Math.max(0, Math.round(difference / oneDay));
}

// Two stays overlap when each starts before the other one ends.
// ISO dates ("YYYY-MM-DD") can be compared as plain strings.
export function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

// "2026-12-25" -> "25 Dec 2026"
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
