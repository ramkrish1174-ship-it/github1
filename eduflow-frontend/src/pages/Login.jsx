import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.access_token);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Welcome Back 👋</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>
        <p
          style={{
            cursor: "pointer",
            color: "#ffd700",
            marginTop: "10px",
          }}
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

        <p>
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} style={styles.link}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, rgb(79, 172, 254), rgb(0, 242, 254))",
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "30px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    textAlign: "center",
    width: "300px",
    color: "white",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
  link: {
    color: "#ffd700",
    cursor: "pointer",
  },
};
