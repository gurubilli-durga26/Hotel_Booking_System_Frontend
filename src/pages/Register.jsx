import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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

      // 1. Check whether this email is already registered
      const existing = await api.get("/users", {
        params: { email }
      });

      if (existing.data.length > 0) {
        toast.warning("This email is already registered. Please login.");
        return;
      }

      // 2. Save the new user in db.json
      await api.post("/users", {
        name: form.name.trim(),
        email,
        password: form.password,
        role: "user"
      });

      toast.success("Registration successful! Please login.");

      navigate("/login");
    } catch (error) {
      console.log("Error registering user:", error);
      toast.error("Unable to register. Is JSON Server running?");
    }
  }

  return (
    <div className="auth-container">
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

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
          placeholder="Password (min 6 characters)"
          minLength="6"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
