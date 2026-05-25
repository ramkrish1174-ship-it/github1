import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>❌ Payment Cancelled</h1>

        <p>
          Your payment was cancelled or failed.
          Please try again.
        </p>

        <button
          style={styles.button}
          onClick={() => navigate("/courses")}
        >
          Back To Courses
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
    background: "#f8fafc",
  },

  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "500px",
  },

  button: {
    marginTop: "20px",
    padding: "14px 22px",
    border: "none",
    borderRadius: "12px",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};