import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [form, setForm] = useState({
    email: "",
    otp: "",
    new_password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = async () => {
    try {
      await api.post("/auth/reset-password", form);

      alert("Password reset successful");

      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Reset failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Reset Password 🔒</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="otp"
          placeholder="Enter OTP"
          value={form.otp}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="new_password"
          type="password"
          placeholder="New Password"
          value={form.new_password}
          onChange={handleChange}
          style={styles.input}
        />

        <button
          onClick={handleReset}
          style={styles.button}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#4facfe,#00f2fe)",
  },

  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "16px",
    background: "#fff",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
  },
};