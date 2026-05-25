import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { verifySubscription } from "../api/subscription";
import {
  getPlans,
  createSubscriptionCheckout,
  validateCoupon,
  getMySubscription,
  cancelSubscription,
} from "../api/subscription";

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);

  const [coupon, setCoupon] = useState("");

  const [discount, setDiscount] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadPlans();
    loadSubscription();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await getPlans();

      setPlans(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const loadSubscription = async () => {
    try {
      const res = await getMySubscription();

      setSubscription(res.data);
    } catch {
      setSubscription(null);
    }
  };
  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();

      alert("Subscription cancelled");

      setSubscription(null);
    } catch (err) {
      alert(err.response?.data?.detail || "Cancellation failed");
    }
  };

  const applyCoupon = async () => {
    try {
      const res = await validateCoupon(coupon);

      setDiscount(res.data);

      alert("Coupon applied successfully");
    } catch (err) {
      setDiscount(null);

      alert(err.response?.data?.detail || "Invalid coupon");
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      const res = await createSubscriptionCheckout(planId, coupon);

      const options = {
        key: res.data.razorpay_key,

        amount: res.data.amount,

        currency: res.data.currency,

        name: "EduFlow",

        description: "Premium Subscription",

        order_id: res.data.order_id,

        handler: async function (response) {
          try {
            await verifySubscription({
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,
            });

            alert("Subscription Activated");

            await loadSubscription();

            window.location.reload();
          } catch (err) {
            alert(err.response?.data?.detail || "Verification failed");
          }
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (err) {
      alert(err.response?.data?.detail || "Checkout failed");
    }
  };
  const getDiscountedPrice = (price) => {
    if (!discount) return price;

    let finalPrice = price;

    if (discount.discount_type === "percentage") {
      finalPrice = price - (price * discount.discount_value) / 100;
    }

    if (discount.discount_type === "fixed") {
      finalPrice = price - discount.discount_value;
    }

    return Math.max(finalPrice, 0);
  };

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>Upgrade To Premium 🚀</h1>

        <p style={styles.sub}>
          Unlock premium courses, advanced content, certificates, and exclusive
          learning paths.
        </p>

        <div style={styles.couponBox}>
          <input
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            style={styles.input}
          />

          <button onClick={applyCoupon} style={styles.applyBtn}>
            Apply Coupon
          </button>
        </div>

        {discount && (
          <div style={styles.discountCard}>
            Coupon Applied 🎉{" "}
            {discount.discount_type === "percentage"
              ? `${discount.discount_value}% OFF`
              : `₹${discount.discount_value} OFF`}
          </div>
        )}

        <div style={styles.grid}>
          {plans.map((plan) => (
            <div key={plan.id} style={styles.card}>
              <h2>{plan.name}</h2>

              <div>
                {discount ? (
                  <>
                    <p style={styles.oldPrice}>₹{plan.price}</p>

                    <p style={styles.price}>
                      ₹{getDiscountedPrice(plan.price)}
                    </p>
                  </>
                ) : (
                  <p style={styles.price}>₹{plan.price}</p>
                )}
              </div>

              <p style={styles.desc}>{plan.description}</p>

              {subscription && subscription.plan_id === plan.id ? (
                <button
                  style={styles.cancelBtn}
                  onClick={handleCancelSubscription}
                >
                  Cancel Subscription
                </button>
              ) : (
                <button
                  style={styles.button}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  Subscribe Now
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "50px",
    minHeight: "100vh",
    background: "#f8fafc",
  },
  cancelBtn: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },

  heading: {
    fontSize: "38px",
    marginBottom: "10px",
  },
  oldPrice: {
    textDecoration: "line-through",
    color: "#999",
    fontSize: "18px",
  },

  sub: {
    color: "#666",
    marginBottom: "30px",
  },

  couponBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  input: {
    padding: "14px",
    width: "280px",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },

  applyBtn: {
    padding: "14px 18px",
    border: "none",
    borderRadius: "12px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },

  discountCard: {
    marginBottom: "30px",
    background: "#dcfce7",
    color: "#166534",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: "25px",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  price: {
    fontSize: "38px",
    fontWeight: "700",
    margin: "20px 0",
  },

  desc: {
    color: "#666",
    marginBottom: "25px",
  },

  button: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};
