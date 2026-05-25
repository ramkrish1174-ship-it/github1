import { useState, useEffect } from "react";
import { createPaymentOrder } from "../api/payment";
import { useNavigate } from "react-router-dom";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../api/wishlist";
import api from "../api/axios";
const categoryColors = {
  "Web Development": "#3b82f6",
  Programming: "#10b981",
  "Backend Development": "#6366f1",
  "Data Science": "#f59e0b",
  Database: "#ef4444",
  default: "#6b7280",
};

export default function CourseCard({
  course,
  onEnrollSuccess,
  onWishlistRemove,
  hideWishlist = false,
}) {
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const res = await getWishlist();

      const exists = res.data.find((item) => item.id === course.id);

      setWishlisted(!!exists);
    } catch {
      console.log("Failed to load wishlist");
    }
  };
  const applyCoupon = async () => {
    try {
      const res = await api.get(
        `/coupons/validate-course/${course.id}/${coupon}`,
      );

      setDiscount(res.data);

      alert("Coupon Applied");
    } catch (err) {
      setDiscount(null);

      alert(err.response?.data?.detail || "Invalid coupon");
    }
  };
  const getFinalPrice = () => {
    if (!discount) return course.price;

    let finalPrice = course.price;

    if (discount.discount_type === "percentage") {
      finalPrice =
        course.price - (course.price * discount.discount_value) / 100;
    }

    if (discount.discount_type === "fixed") {
      finalPrice = course.price - discount.discount_value;
    }

    return Math.max(finalPrice, 0);
  };

  const color = categoryColors[course.category] || categoryColors.default;
  const isFree = Number(course.price) === 0;

  const handleWishlist = async () => {
    try {
      if (wishlisted) {
        await removeFromWishlist(course.id);

        setWishlisted(false);

        if (onWishlistRemove) {
          onWishlistRemove(course.id);
        }
      } else {
        await addToWishlist(course.id);
        setWishlisted(true);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Wishlist failed");
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const res = await createPaymentOrder(course.id, getFinalPrice());

      const options = {
        key: res.data.razorpay_key,

        amount: res.data.amount,

        currency: res.data.currency,

        name: "EduFlow",

        description: course.title,

        order_id: res.data.order_id,

        handler: async function (response) {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert("Payment Successful");

            window.location.reload();
          } catch (err) {
            alert(err.response?.data?.detail || "Payment verification failed");
          }
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (err) {
      alert(err.response?.data?.detail || "Payment failed");
    } finally {
      setLoading(false);
    }
  };
  const goToCourse = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div
      style={{
        ...styles.card,
        borderTop: `4px solid ${color}`,
        ...(hover ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ ...styles.badge, background: color }}>
        {course.category}
      </div>
      {!hideWishlist && (
        <button style={styles.wishlistBtn} onClick={handleWishlist}>
          {wishlisted ? "❤️" : "🤍"}
        </button>
      )}

      <h3 style={styles.title}>{course.title}</h3>

      <p style={styles.desc}>{course.description}</p>
      <div style={styles.ratingRow}>
        <span style={styles.star}>⭐ {course.average_rating || 0}</span>

        <span style={styles.reviewCount}>
          ({course.total_reviews || 0} reviews)
        </span>
      </div>
      {!course.is_enrolled && (
        <div style={{ marginBottom: "12px" }}>
          <input
            placeholder="Coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "8px",
            }}
          />

          <button
            onClick={applyCoupon}
            style={{
              width: "100%",
              padding: "8px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Apply Coupon
          </button>
        </div>
      )}
      <div style={styles.footer}>
        <div>
          {discount ? (
            <>
              <div
                style={{
                  textDecoration: "line-through",
                  color: "#888",
                  fontSize: "14px",
                }}
              >
                ₹{course.price}
              </div>

              <span style={{ ...styles.price, color }}>₹{getFinalPrice()}</span>
            </>
          ) : (
            <span style={{ ...styles.price, color }}>₹{course.price}</span>
          )}
        </div>
        {course.is_enrolled ? (
          <button
            style={{ ...styles.button, background: "#10b981" }}
            onClick={goToCourse}
          >
            Go to Course →
          </button>
        ) : course.has_subscription_access ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{ ...styles.button, background: "#10b981" }}
              onClick={goToCourse}
            >
              Go to Course →
            </button>

            <button
              style={{ ...styles.button, background: color }}
              onClick={handlePurchase}
              disabled={loading}
            >
              Buy Permanently
            </button>
          </div>
        ) : isFree ? (
          <button
            style={{ ...styles.button, background: "#10b981" }}
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? "Processing..." : "Enroll Free"}
          </button>
        ) : (
          <button
            style={{ ...styles.button, background: color }}
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? "Redirecting..." : `Buy ₹${getFinalPrice()}`}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    minHeight: "220px",
  },
  wishlistBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    border: "none",
    background: "#fff",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    cursor: "pointer",
    fontSize: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px",
  },

  star: {
    color: "#f59e0b",
    fontWeight: "600",
  },

  reviewCount: {
    color: "#6b7280",
    fontSize: "14px",
    paddingTop: "4px",
  },

  cardHover: {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
  },

  badge: {
    alignSelf: "flex-start",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    marginBottom: "10px",
  },

  title: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  desc: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "16px",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },

  price: {
    fontSize: "18px",
    fontWeight: "bold",
  },

  button: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
};
