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

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dash = await api.get("/admin/dashboard");
      const usersRes = await api.get("/admin/users");
      const coursesRes = await api.get("/admin/courses");
      const paymentsRes = await api.get("/admin/payments");

      setDashboard(dash.data);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      alert("Admin access only");
    }
  };

  if (!dashboard) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "40px" }}>Loading...</div>
      </div>
    );
  }

  const chartData = payments.slice(0, 6).map((p) => ({
    name: `#${p.id}`,
    amount: p.amount,
  }));

  const roleData = [
    {
      name: "Students",
      value: dashboard.total_students,
    },
    {
      name: "Instructors",
      value: dashboard.total_instructors,
    },
  ];

  const COLORS = ["#3b82f6", "#10b981"];

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>Admin Dashboard 👑</h1>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <Card title="Users" value={dashboard.total_users} />

          <Card title="Courses" value={dashboard.total_courses} />

          <Card title="Revenue" value={`₹${dashboard.total_revenue}`} />

          <Card title="Subscriptions" value={dashboard.total_subscriptions} />
        </div>

        {/* CHARTS */}
        <div style={styles.chartGrid}>
          <div style={styles.chartCard}>
            <h3>Revenue Analytics 💰</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartCard}>
            <h3>User Roles 📊</h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={roleData} dataKey="value" outerRadius={100} label>
                  {roleData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* USERS */}
        <div style={styles.section}>
          <h2>Recent Users 👥</h2>

          <div style={styles.table}>
            {users.slice(0, 6).map((user) => (
              <div key={user.id} style={styles.row}>
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <span>{user.role}</span>

                  <button
                    style={styles.featureBtn}
                    onClick={async () => {
                      await api.put(`/admin/users/${user.id}/toggle-status`);

                      loadData();
                    }}
                  >
                    {user.is_active ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COURSES */}
        <div style={styles.section}>
          <h2>All Courses 📚</h2>

          <div style={styles.courseGrid}>
            {courses.slice(0, 6).map((course) => (
              <div key={course.id} style={styles.courseCard}>
                <h3>{course.title}</h3>

                <p>{course.category}</p>

                <p>₹{course.price}</p>

                <p>Status: {course.status}</p>

                <button
                  style={styles.featureBtn}
                  onClick={async () => {
                    await api.put(`/admin/courses/${course.id}/feature`);

                    alert("Featured");
                  }}
                >
                  Feature
                </button>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.section}>
          <h2>Payment Transactions 💳</h2>

          <div style={styles.table}>
            {payments.map((payment) => (
              <div key={payment.id} style={styles.row}>
                <div>
                  <strong>Payment #{payment.id}</strong>
                  <p>₹{payment.amount}</p>
                </div>

                <div>
                  <p>{payment.payment_status}</p>

                  {payment.payment_status === "paid" && (
                    <button
                      style={styles.featureBtn}
                      onClick={async () => {
                        await api.post(`/admin/payments/${payment.id}/refund`);

                        alert("Refund successful");

                        loadData();
                      }}
                    >
                      Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  heading: {
    marginBottom: "30px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "30px",
  },

  chartCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  section: {
    marginBottom: "40px",
  },

  table: {
    background: "#fff",
    borderRadius: "18px",
    overflow: "hidden",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "18px",
    borderBottom: "1px solid #eee",
  },

  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: "20px",
  },

  courseCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  featureBtn: {
    marginTop: "10px",
    padding: "10px 16px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
  },
};
