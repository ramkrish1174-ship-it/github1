import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Analytics() {
  const [user, setUser] = useState(null);

  const [instructorData, setInstructorData] = useState(null);

  const [studentData, setStudentData] = useState(null);

  const [revenueData, setRevenueData] = useState([]);

  const [quizData, setQuizData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const userRes = await api.get("/users/me");

      setUser(userRes.data);

      if (userRes.data.role === "instructor") {
        const instructor = await api.get("/analytics/instructor");

        const revenue = await api.get("/analytics/revenue-chart");

        setInstructorData(instructor.data);

        setRevenueData(revenue.data);
      }

      if (userRes.data.role === "student") {
        const student = await api.get("/analytics/student");

        const quiz = await api.get("/analytics/quiz-performance");

        setStudentData(student.data);

        setQuizData(quiz.data);
      }
    } catch (err) {
      alert("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loader}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>Analytics Dashboard 📊</h1>

        {/* INSTRUCTOR */}
        {user?.role === "instructor" && instructorData && (
          <>
            <div style={styles.statsGrid}>
              <Card
                title="Courses"
                value={instructorData.total_courses}
              />

              <Card
                title="Students"
                value={instructorData.total_students}
              />

              <Card
                title="Revenue"
                value={`₹${instructorData.total_revenue}`}
              />

              <Card
                title="Rating"
                value={`${instructorData.average_rating} ⭐`}
              />
            </div>

            <div style={styles.chartCard}>
              <h2>Revenue Analytics 💰</h2>

              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="course" />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.courseGrid}>
              {instructorData.courses.map((course) => (
                <div key={course.id} style={styles.courseCard}>
                  <h3>{course.title}</h3>

                  <p>👨‍🎓 Students: {course.students}</p>

                  <p>💰 Revenue: ₹{course.revenue}</p>

                  <p>⭐ Rating: {course.rating}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STUDENT */}
        {user?.role === "student" && studentData && (
          <>
            <div style={styles.statsGrid}>
              <Card
                title="Courses"
                value={studentData.total_courses}
              />

              <Card
                title="Completed Lessons"
                value={studentData.completed_lessons}
              />

              <Card
                title="Quiz Attempts"
                value={studentData.quiz_attempts}
              />

              <Card
                title="Average Score"
                value={`${studentData.average_quiz_score}%`}
              />
            </div>

            <div style={styles.chartGrid}>
              <div style={styles.chartCard}>
                <h2>Quiz Performance 🧠</h2>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quizData}>
                    <XAxis dataKey="quiz" />

                    <YAxis />

                    <Tooltip />

                    <Bar dataKey="percentage" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.chartCard}>
                <h2>Learning Progress 🚀</h2>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Completed",
                          value: studentData.completed_lessons,
                        },
                        {
                          name: "Remaining",
                          value:
                            studentData.total_courses * 10 -
                            studentData.completed_lessons,
                        },
                      ]}
                      dataKey="value"
                      outerRadius={100}
                      label
                    >
                      <Cell />

                      <Cell />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.courseGrid}>
              {studentData.courses.map((course) => (
                <div key={course.id} style={styles.courseCard}>
                  <h3>{course.title}</h3>

                  <p>📈 Progress: {course.progress}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>

      <p style={styles.cardValue}>{value}</p>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    minHeight: "100vh",
    background: "linear-gradient(to bottom,#f8fafc,#eef2ff)",
  },

  heading: {
    fontSize: "34px",
    marginBottom: "30px",
    fontWeight: "700",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginBottom: "35px",
  },

  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  cardValue: {
    fontSize: "32px",
    fontWeight: "700",
    marginTop: "12px",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))",
    gap: "24px",
    marginBottom: "35px",
  },

  chartCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },

  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "20px",
  },

  courseCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  loader: {
    padding: "80px",
    textAlign: "center",
    fontSize: "22px",
  },
};