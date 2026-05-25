import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../utils/auth";
import { useEffect, useState } from "react";

import api from "../api/axios";
import { getNotifications, getUnreadCount } from "../api/notification";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subscription, setSubscription] = useState(null);

  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get("/users/me");

      setUser(res.data);
      const notifRes = await getNotifications();

      setNotifications(notifRes.data.slice(0, 5));

      const unreadRes = await getUnreadCount();

      setUnreadCount(unreadRes.data.unread_count);

      try {
        const sub = await api.get("/subscriptions/me");

        setSubscription(sub.data);
      } catch {
        setSubscription(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.nav}>
      {/* Logo */}
      <div style={styles.leftSection}>
        <h2 style={styles.logo} onClick={() => navigate("/dashboard")}>
          EduFlow 🎓
        </h2>

        {subscription && <div style={styles.premiumBadge}>👑 Premium</div>}
      </div>

      {/* Links */}
      <div style={styles.links}>
        {user?.role !== "admin" && (
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              ...styles.link,
              ...(isActive("/dashboard") && styles.active),
            }}
          >
            Dashboard
          </button>
        )}
        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            style={{
              ...styles.link,
              ...(isActive("/admin") && styles.active),
            }}
          >
            Admin 👑
          </button>
        )}

        {/* STUDENT ONLY */}
        {user?.role === "student" && (
          <>
            <button
              onClick={() => navigate("/courses")}
              style={{
                ...styles.link,
                ...(isActive("/courses") && styles.active),
              }}
            >
              Courses
            </button>

            <button
              onClick={() => navigate("/quiz-results")}
              style={{
                ...styles.link,
                ...(isActive("/quiz-results") && styles.active),
              }}
            >
              Quiz Results
            </button>

            <button
              onClick={() => navigate("/payments")}
              style={{
                ...styles.link,
                ...(isActive("/payments") && styles.active),
              }}
            >
              Payments
            </button>
            <button
              onClick={() => navigate("/wishlist")}
              style={{
                ...styles.link,
                ...(isActive("/wishlist") && styles.active),
              }}
            >
              Wishlist ❤️
            </button>

            <button
              onClick={() => navigate("/subscriptions")}
              style={{
                ...styles.link,
                ...(isActive("/subscriptions") && styles.active),
              }}
            >
              Premium 👑
            </button>
          </>
        )}
        {user?.role !== "admin" && (
          <button
            onClick={() => navigate("/analytics")}
            style={{
              ...styles.link,
              ...(isActive("/analytics") && styles.active),
            }}
          >
            Analytics 📊
          </button>
        )}
        {user?.role !== "admin" && (
          <div style={styles.notificationWrapper}>
            <button
              style={styles.notificationBtn}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount}</span>
              )}
            </button>

            {showDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>Notifications</div>

                {notifications.length === 0 ? (
                  <div style={styles.emptyNotif}>No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={styles.notificationItem}>
                      <strong>{n.title}</strong>

                      <p style={styles.notificationText}>{n.message}</p>
                    </div>
                  ))
                )}

                <button
                  style={styles.viewAllBtn}
                  onClick={() => {
                    navigate("/notifications");
                    setShowDropdown(false);
                  }}
                >
                  View All
                </button>
              </div>
            )}
          </div>
        )}

        {/* COMMON */}
        <button
          onClick={() => navigate("/profile")}
          style={{
            ...styles.link,
            ...(isActive("/profile") && styles.active),
          }}
        >
          Profile
        </button>

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    background: "#2563eb",
    color: "white",
  },
  notificationWrapper: {
    position: "relative",
  },

  notificationBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "22px",
    cursor: "pointer",
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: "-6px",
    right: "-10px",
    background: "#ef4444",
    color: "#fff",
    borderRadius: "50%",
    fontSize: "11px",
    minWidth: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: "42px",
    width: "340px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 1000,
  },

  dropdownHeader: {
    padding: "14px",
    fontWeight: "bold",
    borderBottom: "1px solid #eee",
    color: "#111",
  },

  notificationItem: {
    padding: "14px",
    borderBottom: "1px solid #f1f5f9",
    color: "#111",
  },

  notificationText: {
    fontSize: "13px",
    marginTop: "5px",
    color: "#555",
  },

  emptyNotif: {
    padding: "20px",
    textAlign: "center",
    color: "#777",
  },

  viewAllBtn: {
    width: "100%",
    border: "none",
    padding: "14px",
    background: "#eff6ff",
    cursor: "pointer",
    fontWeight: "600",
  },

  logo: {
    cursor: "pointer",
  },

  links: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  premiumBadge: {
    background: "#f59e0b",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },

  link: {
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    padding: "6px 10px",
    borderRadius: "6px",
  },

  active: {
    background: "rgba(255,255,255,0.2)",
  },

  logout: {
    background: "#ef4444",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};
