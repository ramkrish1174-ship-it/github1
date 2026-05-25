import { useEffect, useState } from "react";

import {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  getCourseRating,
} from "../api/review";

import StarRating from "./StarRating";

import api from "../api/axios";

export default function Reviews({ courseId }) {
  const [reviews, setReviews] = useState([]);

  const [ratingData, setRatingData] = useState(null);

  const [rating, setRating] = useState(0);

  const [comment, setComment] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadUser = async () => {
    const res = await api.get("/users/me");

    setUser(res.data);
  };

  const loadData = async () => {
    const reviewRes = await getCourseReviews(courseId);

    setReviews(reviewRes.data);

    const ratingRes = await getCourseRating(courseId);

    setRatingData(ratingRes.data);
  };

  const submitReview = async () => {
    try {
      if (editingId) {
        await updateReview(editingId, {
          rating,
          comment,
        });

        alert("Review updated");
      } else {
        await createReview(courseId, {
          rating,
          comment,
        });

        alert("Review submitted");
      }

      setRating(0);

      setComment("");

      setEditingId(null);

      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Review failed");
    }
  };

  const editReview = (review) => {
    setEditingId(review.id);

    setRating(review.rating);

    setComment(review.comment);
  };

  const removeReview = async (id) => {
    try {
      await deleteReview(id);

      alert("Review deleted");

      loadData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Student Reviews ⭐</h2>

      {ratingData && (
        <div style={styles.ratingCard}>
          <h1>{ratingData.average_rating} ⭐</h1>

          <p>{ratingData.total_reviews} Reviews</p>
        </div>
      )}

      <div style={styles.form}>
        <StarRating
          rating={rating}
          setRating={setRating}
        />

        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={styles.textarea}
        />

        <button
          onClick={submitReview}
          style={styles.button}
        >
          {editingId ? "Update Review" : "Submit Review"}
        </button>
      </div>

      <div style={styles.reviewList}>
        {reviews.map((review) => (
          <div key={review.id} style={styles.reviewCard}>
            <div style={styles.reviewTop}>
              <div>
                <h3>{review.reviewer_name}</h3>

                <StarRating
                  rating={review.rating}
                  readonly
                />
              </div>

              {user?.id === review.user_id && (
                <div style={styles.actionBtns}>
                  <button
                    style={styles.editBtn}
                    onClick={() => editReview(review)}
                  >
                    Edit
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => removeReview(review.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <p style={styles.comment}>
              {review.comment}
            </p>

            <div style={styles.date}>
              {new Date(review.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: "40px",
  },

  heading: {
    marginBottom: "20px",
    fontSize: "30px",
  },

  ratingCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "20px",
    marginBottom: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },

  form: {
    background: "#fff",
    padding: "24px",
    borderRadius: "20px",
    marginBottom: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    marginTop: "18px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "14px",
  },

  button: {
    marginTop: "18px",
    padding: "14px 22px",
    border: "none",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },

  reviewList: {
    display: "grid",
    gap: "20px",
  },

  reviewCard: {
    background: "#fff",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },

  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actionBtns: {
    display: "flex",
    gap: "10px",
  },

  editBtn: {
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    background: "#ef4444",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  comment: {
    marginTop: "16px",
    lineHeight: "1.7",
    color: "#374151",
  },

  date: {
    marginTop: "12px",
    color: "#6b7280",
    fontSize: "13px",
  },
};