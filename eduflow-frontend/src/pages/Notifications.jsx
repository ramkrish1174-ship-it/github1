import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../api/notification";

export default function Notifications() {

  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {

    try {

      const res = await getNotifications();

      setNotifications(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id) => {

    await markAsRead(id);

    loadNotifications();
  };

  const handleReadAll = async () => {

    await markAllAsRead();

    loadNotifications();
  };

  return (
    <div>

      <Navbar />

      <div style={styles.container}>

        <div style={styles.header}>

          <h1>Notifications 🔔</h1>

          <button
            style={styles.readAllBtn}
            onClick={handleReadAll}
          >
            Mark All As Read
          </button>

        </div>

        {notifications.length === 0 ? (

          <div style={styles.empty}>
            No notifications yet
          </div>

        ) : (

          notifications.map((n) => (

            <div
              key={n.id}
              style={{
                ...styles.card,
                background: n.is_read
                  ? "#fff"
                  : "#eff6ff",
              }}
            >

              <div style={styles.top}>

                <h3 style={styles.title}>
                  {n.title}
                </h3>

                {!n.is_read && (
                  <div style={styles.unreadDot}></div>
                )}

              </div>

              <p style={styles.message}>
                {n.message}
              </p>

              <div style={styles.footer}>

                <span style={styles.time}>
                  {new Date(
                    n.created_at
                  ).toLocaleString()}
                </span>

                {!n.is_read && (
                  <button
                    style={styles.readBtn}
                    onClick={() => handleRead(n.id)}
                  >
                    Mark Read
                  </button>
                )}

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

const styles = {

  container: {
    padding: "40px",
    minHeight: "100vh",
    background: "#f8fafc",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  readAllBtn: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  empty: {
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
  },

  card: {
    padding: "22px",
    borderRadius: "18px",
    marginBottom: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    transition: "0.3s",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "18px",
  },

  unreadDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#ef4444",
  },

  message: {
    marginTop: "12px",
    color: "#555",
    lineHeight: "1.5",
  },

  footer: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  time: {
    fontSize: "13px",
    color: "#777",
  },

  readBtn: {
    border: "none",
    background: "#10b981",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};