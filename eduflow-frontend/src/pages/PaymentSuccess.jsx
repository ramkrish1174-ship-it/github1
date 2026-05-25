import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifySubscription } from "../api/subscription";
import { verifyPayment } from "../api/payment";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    verifyStripePayment();
  }, []);

  const verifyStripePayment = async () => {
    try {
      if (!sessionId) {
        return;
      }

      try {
        await verifyPayment(sessionId);
      } catch {
        await verifySubscription(sessionId);
      }

      setLoading(false);
    } catch (err) {
      console.log(err);

      alert("Payment verification failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {loading ? (
          <>
            <h1>Verifying Payment...</h1>

            <p>Please wait while we confirm your payment.</p>
          </>
        ) : (
          <>
            <h1>🎉 Payment Successful</h1>

            <p>
              Your payment has been completed successfully. The course has been
              unlocked.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/dashboard")}
            >
              Go To Dashboard
            </button>
          </>
        )}
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
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};
