import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function QuizResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get("/quizzes/results/me");

      setResults(res.data);
    } catch (err) {
      alert("Failed to load quiz results");
    } finally {
      setLoading(false);
    }
  };

  const averageScore =
    results.length > 0
      ? (
          results.reduce((acc, item) => acc + item.percentage, 0) /
          results.length
        ).toFixed(1)
      : 0;

  const highestScore =
    results.length > 0
      ? Math.max(...results.map((r) => r.percentage)).toFixed(1)
      : 0;

  const passedCount = results.filter((r) => r.percentage >= 50).length;

  if (loading) {
    return (
      <div>
        <Navbar />

        <div style={styles.loader}>
          Loading Quiz Analytics...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Quiz Performance Analytics 🧠</h1>

            <p style={styles.subheading}>
              Track all your quiz attempts and learning progress.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statTitle}>Total Attempts</p>

            <h2 style={styles.statValue}>{results.length}</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statTitle}>Average Score</p>

            <h2 style={styles.statValue}>{averageScore}%</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statTitle}>Highest Score</p>

            <h2 style={styles.statValue}>{highestScore}%</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statTitle}>Passed</p>

            <h2 style={styles.statValue}>
              {passedCount} / {results.length}
            </h2>
          </div>
        </div>

        {/* RESULTS */}
        <div style={styles.resultsWrapper}>
          <h2 style={styles.sectionTitle}>Attempt History</h2>

          {results.length === 0 ? (
            <div style={styles.emptyCard}>
              No quiz attempts found
            </div>
          ) : (
            results.map((attempt, index) => (
              <div key={attempt.id} style={styles.resultCard}>
                <div style={styles.resultTop}>
                  <div>
                    <h3 style={styles.quizName}>
                      Attempt #{index + 1}
                    </h3>

                    <p style={styles.date}>
                      {new Date(
                        attempt.submitted_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div
                    style={{
                      ...styles.badge,
                      background:
                        attempt.percentage >= 50
                          ? "#dcfce7"
                          : "#fee2e2",

                      color:
                        attempt.percentage >= 50
                          ? "#166534"
                          : "#991b1b",
                    }}
                  >
                    {attempt.percentage >= 50
                      ? "PASSED"
                      : "FAILED"}
                  </div>
                </div>

                <div style={styles.scoreRow}>
                  <div style={styles.scoreBox}>
                    <p style={styles.scoreLabel}>Score</p>

                    <h2 style={styles.scoreValue}>
                      {attempt.score}
                    </h2>
                  </div>

                  <div style={styles.scoreBox}>
                    <p style={styles.scoreLabel}>Percentage</p>

                    <h2 style={styles.scoreValue}>
                      {attempt.percentage.toFixed(2)}%
                    </h2>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${attempt.percentage}%`,
                      background:
                        attempt.percentage >= 50
                          ? "linear-gradient(90deg,#10b981,#22c55e)"
                          : "linear-gradient(90deg,#ef4444,#f97316)",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom,#f8fafc,#eef2ff)",
  },

  container: {
    padding: "40px",
  },

  loader: {
    padding: "100px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "600",
  },

  header: {
    marginBottom: "35px",
  },

  heading: {
    fontSize: "40px",
    fontWeight: "800",
    marginBottom: "10px",
  },

  subheading: {
    color: "#64748b",
    fontSize: "16px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "22px",
    marginBottom: "40px",
  },

  statCard: {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(14px)",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  statTitle: {
    color: "#64748b",
    marginBottom: "12px",
    fontWeight: "600",
  },

  statValue: {
    fontSize: "34px",
    fontWeight: "800",
  },

  resultsWrapper: {
    marginTop: "10px",
  },

  sectionTitle: {
    fontSize: "28px",
    marginBottom: "20px",
  },

  emptyCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    color: "#64748b",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },

  resultCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  resultTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  },

  quizName: {
    fontSize: "24px",
    marginBottom: "6px",
  },

  date: {
    color: "#64748b",
    fontSize: "14px",
  },

  badge: {
    padding: "10px 18px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
  },

  scoreRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "24px",
  },

  scoreBox: {
    background: "#f8fafc",
    borderRadius: "18px",
    padding: "22px",
  },

  scoreLabel: {
    color: "#64748b",
    marginBottom: "10px",
    fontWeight: "600",
  },

  scoreValue: {
    fontSize: "30px",
    fontWeight: "800",
  },

  progressTrack: {
    width: "100%",
    height: "16px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "0.4s",
  },
};