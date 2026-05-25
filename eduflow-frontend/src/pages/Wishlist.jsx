import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";

import { getWishlist, removeFromWishlist } from "../api/wishlist";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const res = await getWishlist();

      setWishlist(res.data);
    } catch {
      alert("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (courseId) => {
  setWishlist((prev) =>
    prev.filter((course) => course.id !== courseId)
  );
};

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>My Wishlist ❤️</h1>

            <p style={styles.subtitle}>Save courses and learn later</p>
          </div>

          <div style={styles.countBadge}>{wishlist.length} Courses</div>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading wishlist...</div>
        ) : wishlist.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyEmoji}>💔</div>

            <h2>No wishlist courses</h2>

            <p>Start adding courses to your wishlist</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {wishlist.map((course) => (
              <div key={course.id} style={styles.cardWrapper}>
                <CourseCard
                  course={course}
                  isEnrolled={false}
                  onWishlistRemove={handleRemove}
                />

                <button
                  style={styles.removeBtn}
                  onClick={() => handleRemove(course.id)}
                >
                  Remove
                </button>
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
    minHeight: "100vh",
    background: "linear-gradient(to bottom,#f8fafc,#eef2ff)",
    padding: "40px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
    flexWrap: "wrap",
    gap: "20px",
  },

  heading: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "8px",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "16px",
  },

  countBadge: {
    background: "#2563eb",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "15px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: "24px",
  },

  cardWrapper: {
    position: "relative",
  },

  removeBtn: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  empty: {
    textAlign: "center",
    padding: "80px",
    fontSize: "18px",
  },

  emptyCard: {
    background: "#fff",
    maxWidth: "500px",
    margin: "80px auto",
    padding: "50px",
    borderRadius: "24px",
    textAlign: "center",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  },

  emptyEmoji: {
    fontSize: "60px",
    marginBottom: "20px",
  },
};
