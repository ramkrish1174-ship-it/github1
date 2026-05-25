export default function StarRating({
  rating,
  setRating,
  readonly = false,
}) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && setRating(star)}
          style={{
            fontSize: "28px",
            cursor: readonly ? "default" : "pointer",
            color: star <= rating ? "#f59e0b" : "#d1d5db",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}