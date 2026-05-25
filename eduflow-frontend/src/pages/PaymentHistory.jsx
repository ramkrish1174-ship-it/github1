import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import { getSubscriptionHistory } from "../api/subscription";
import { getPaymentHistory } from "../api/payment";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const [courseRes, subRes] = await Promise.all([
        getPaymentHistory(),
        getSubscriptionHistory(),
      ]);

      const coursePayments = courseRes.data.map((p) => ({
        ...p,
        type: "course",
        title: p.course_title || "Course Purchase",
      }));

      const subscriptionPayments = subRes.data.map((s) => ({
        ...s,
        payment_status: s.status,
        currency: "inr",
        title: s.plan_name,
        type: "subscription",
      }));

      const merged = [...coursePayments, ...subscriptionPayments];

      merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setPayments(merged);
    } catch (err) {
      console.log(err);

      alert("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>💳 Payment History</h1>

            <p style={styles.subheading}>Track all your course purchases</p>
          </div>

          <div style={styles.totalCard}>
            <div>Total Spent</div>

            <h2>₹{totalSpent}</h2>
          </div>
        </div>

        {loading ? (
          <div style={styles.loader}>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={styles.emptyCard}>
            <h2>No Payments Yet</h2>

            <p>Your course purchases will appear here.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {payments.map((payment) => (
              <div key={payment.id} style={styles.card}>
                <div style={styles.top}>
                  <div>
                    <h2 style={styles.course}>{payment.title}</h2>

                    <div style={styles.typeBadge}>
                      {payment.type === "subscription"
                        ? "Premium Subscription"
                        : "Course Purchase"}
                    </div>

                    <p style={styles.date}>
                      {new Date(payment.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div
                    style={{
                      ...styles.status,
                      background:
                        payment.payment_status === "paid"
                          ? "#dcfce7"
                          : "#fee2e2",

                      color:
                        payment.payment_status === "paid"
                          ? "#166534"
                          : "#991b1b",
                    }}
                  >
                    {payment.payment_status}
                  </div>
                </div>

                <div style={styles.amountRow}>
                  <div>Amount Paid</div>

                  <h2>₹{payment.amount}</h2>
                </div>

                <div style={styles.bottom}>
                  <div>
                    Currency:
                    <b> {payment.currency}</b>
                  </div>

                  <div>
                    {payment.type === "course" ? (
                      <b>{payment.payment_intent_id?.slice(0, 18)}</b>
                    ) : (
                      <b>Subscription Payment</b>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    minHeight: "100vh",
    background: "linear-gradient(to bottom,#f8fafc,#eef2ff)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "20px",
  },
  typeBadge: {
    marginTop: "8px",
    display: "inline-block",
    background: "#ede9fe",
    color: "#6d28d9",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },

  heading: {
    fontSize: "36px",
    marginBottom: "10px",
  },

  subheading: {
    color: "#64748b",
  },

  totalCard: {
    background: "#2563eb",
    color: "#fff",
    padding: "24px",
    borderRadius: "20px",
    minWidth: "220px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
  },

  loader: {
    textAlign: "center",
    padding: "80px",
    fontSize: "20px",
  },

  emptyCard: {
    background: "#fff",
    padding: "60px",
    borderRadius: "24px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  grid: {
    display: "grid",
    gap: "24px",
  },

  card: {
    background: "#fff",
    padding: "28px",
    borderRadius: "22px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },

  course: {
    marginBottom: "6px",
  },

  date: {
    color: "#64748b",
    fontSize: "14px",
  },

  status: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  amountRow: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bottom: {
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    fontSize: "14px",
    color: "#475569",
  },
};
