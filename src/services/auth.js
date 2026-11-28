// Small helper functions for the logged-in user (stored in localStorage)

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem("user");
}

// true only when the logged-in user has the "admin" role
export function isAdmin() {
  const user = getUser();
  return user?.role === "admin";
}
