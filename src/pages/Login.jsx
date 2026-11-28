import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { saveUser } from "../services/auth";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // If the user was sent here by a protected page, go back there after login
  // (we also restore the page state, for example a room chosen with Book Now)
  const from = location.state?.from;
  // Admins land on the dashboard, other users on the rooms page
  const redirectTo = from?.pathname || null;

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const email = form.email.trim().toLowerCase();

      const response = await api.get("/users", {
        params: { email, password: form.password }
      });

      if (response.data.length === 0) {
        toast.error("Invalid email or password.");
        return;
      }

      const user = response.data[0];

      // Never store the password in localStorage
      saveUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user"
      });

      toast.success(`Welcome back, ${user.name}!`);

      navigate(
        redirectTo || (user.role === "admin" ? "/admin" : "/rooms"),
        { replace: true, state: from?.state }
      );
    } catch (error) {
      console.log("Error logging in:", error);
      toast.error("Unable to login. Is JSON Server running?");
    }
  }

  return (
    <div className="auth-container">
      <h1>Welcome Back</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}

export default Login;
