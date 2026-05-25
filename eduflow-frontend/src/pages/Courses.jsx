import { useEffect, useState } from "react";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";
import Navbar from "../components/Navbar";
import { getMyEnrollments } from "../api/enrollment";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [level, setLevel] = useState("All");

  const [rating, setRating] = useState(0);

  const [maxPrice, setMaxPrice] = useState(5000);

  const [sortBy, setSortBy] = useState("latest");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    category: "All",
    level: "All",
    rating: 0,
    maxPrice: 5000,
    sortBy: "latest",
  });
  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch {
      alert("Error fetching courses");
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await getMyEnrollments();
      const ids = res.data.map((e) => e.course_id);
      setEnrolledIds(ids);
    } catch {
      console.log("No enrollments");
    }
  };

  const applyFilters = () => {
    setAppliedFilters({
      search,
      category,
      level,
      rating,
      maxPrice,
      sortBy,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
    setRating(0);
    setMaxPrice(5000);
    setSortBy("latest");

    setAppliedFilters({
      search: "",
      category: "All",
      level: "All",
      rating: 0,
      maxPrice: 5000,
      sortBy: "latest",
    });
  };

  const handleEnrollSuccess = (courseId) => {
    setEnrolledIds((prev) => [...prev, courseId]);
  };
  const filteredCourses = [...courses]
    .filter((course) => {
      const matchesSearch =
        course.title
          .toLowerCase()
          .includes(appliedFilters.search.toLowerCase()) ||
        course.description
          .toLowerCase()
          .includes(appliedFilters.search.toLowerCase());

      const matchesCategory =
        appliedFilters.category === "All" ||
        course.category === appliedFilters.category;

      const matchesLevel =
        appliedFilters.level === "All" || course.level === appliedFilters.level;

      const matchesRating =
        (course.average_rating || 0) >= appliedFilters.rating;

      const matchesPrice = Number(course.price) <= appliedFilters.maxPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel &&
        matchesRating &&
        matchesPrice
      );
    })
    .sort((a, b) => {
      if (appliedFilters.sortBy === "price_low") {
        return a.price - b.price;
      }

      if (appliedFilters.sortBy === "price_high") {
        return b.price - a.price;
      }

      if (appliedFilters.sortBy === "rating") {
        return (b.average_rating || 0) - (a.average_rating || 0);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  const featuredCourses = courses.filter((course) => course.is_featured);

  const trendingCourses = [...courses]
    .sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
    .slice(0, 5);

  const recommendedCourses = [...courses]
    .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
    .slice(0, 4);

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>Explore Courses 🎓</h1>

        <div style={styles.topBar}>
          <input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.topBar}>
          <div style={styles.filters}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.select}
            >
              <option>All</option>
              <option>Web Development</option>
              <option>Programming</option>
              <option>Backend Development</option>
              <option>Data Science</option>
              <option>Database</option>
            </select>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={styles.select}
            >
              <option>All</option>
              <option>beginner</option>
              <option>intermediate</option>
              <option>advanced</option>
            </select>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={styles.select}
            >
              <option value={0}>All Ratings</option>
              <option value={1}>1+ ⭐</option>
              <option value={2}>2+ ⭐</option>
              <option value={3}>3+ ⭐</option>
              <option value={4}>4+ ⭐</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              <option value="latest">Latest</option>
              <option value="rating">Top Rated</option>
              <option value="price_low">Price Low → High</option>
              <option value="price_high">Price High → Low</option>
            </select>
          </div>

          <div style={styles.priceFilter}>
            <label>Max Price: ₹{maxPrice}</label>

            <input
              type="range"
              min="0"
              max="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
          <div style={styles.filterButtons}>
            <button style={styles.applyBtn} onClick={applyFilters}>
              Apply Filters
            </button>

            <button style={styles.resetBtn} onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>
        {featuredCourses.length > 0 && (
          <>
            <h2 style={styles.sectionTitle}>Featured Courses ⭐</h2>

            <div style={styles.grid}>
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={course.is_enrolled}
                />
              ))}
            </div>
          </>
        )}

        <h2 style={styles.sectionTitle}>Trending Courses 🔥</h2>

        <div style={styles.trendingRow}>
          {trendingCourses.map((course) => (
            <div key={course.id} style={styles.trendingCard}>
              <h4>{course.title}</h4>

              <p>{course.total_reviews || 0} reviews</p>
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Recommended Courses 🚀</h2>

        <div style={styles.grid}>
          {recommendedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={course.is_enrolled}
              hideWishlist
            />
          ))}
        </div>

        <h2 style={styles.sectionTitle}>All Courses 📚</h2>

        <div style={styles.grid}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={course.is_enrolled}
                onEnrollSuccess={handleEnrollSuccess}
              />
            ))
          ) : (
            <p style={styles.noData}>No courses found</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  filterButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
  },

  applyBtn: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  resetBtn: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  container: {
    padding: "40px",
    minHeight: "100vh",
    background: "#f8fafc",
  },

  heading: {
    marginBottom: "25px",
    fontSize: "28px",
    fontWeight: "600",
  },

  topBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  input: {
    padding: "12px",
    width: "260px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
  },

  button: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "500",
  },

  filters: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  select: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    minWidth: "180px",
  },

  priceFilter: {
    marginBottom: "25px",
  },

  sectionTitle: {
    margin: "30px 0 18px",
    fontSize: "24px",
    fontWeight: "600",
  },

  trendingRow: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    marginBottom: "30px",
  },

  trendingCard: {
    minWidth: "220px",
    background: "#fff",
    padding: "18px",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
  },

  noData: {
    marginTop: "20px",
    fontSize: "16px",
    color: "#666",
  },
};
