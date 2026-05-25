import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSend = async () => {
    try {
      await api.post("/auth/forgot-password", {
        email,
      });

      alert("OTP sent successfully");

      navigate("/reset-password");
    } catch {
      alert("Failed to send email");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Forgot Password 🔑</h2>

        <input
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleSend} style={styles.button}>
          Send Reset Email
        </button>

        <p style={styles.link} onClick={() => navigate("/login")}>
          Back to Login
        </p>
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
    background: "linear-gradient(135deg,#4facfe,#00f2fe)",
  },

  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "16px",
    background: "#fff",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginTop: "20px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  button: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  link: {
    marginTop: "20px",
    color: "#2563eb",
    cursor: "pointer",
  },
};
