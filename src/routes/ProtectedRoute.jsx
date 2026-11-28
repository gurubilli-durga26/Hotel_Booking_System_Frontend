import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser, isAdmin } from "../services/auth";

function AccessDenied() {
  useEffect(() => {
    toast.error("Access denied: only admins can manage rooms.");
  }, []);

  return <Navigate to="/rooms" replace />;
}

function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();
  const user = getUser();

  if (!user) {
    // Send the whole location (path + state) so Login can return here
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (adminOnly && !isAdmin()) {
    return <AccessDenied />;
  }

  return children;
}

export default ProtectedRoute;
