import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    phone: "",
    email_notifications: true,
  });

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);

      setForm({
        name: res.data.name || "",
        bio: res.data.bio || "",
        phone: res.data.phone || "",
        email_notifications:res.data.email_notifications ?? true,
      });
    } catch {
      alert("Unauthorized");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put("/users/update", form);
      alert("Profile updated");
      setEdit(false);
      fetchUser();
    } catch {
      alert("Update failed");
    }
  };

  const handlePassword = async () => {
    try {
      await api.put("/users/change-password", passwords);
      alert("Password changed");
      setPasswords({ old_password: "", new_password: "" });
    } catch {
      alert("Password change failed");
    }
  };

  const initial = user?.name?.charAt(0).toUpperCase();

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          {/* Avatar */}
          <div style={styles.avatar}>{initial}</div>

          {/* Name */}
          {!edit ? (
            <>
              <h2 style={styles.name}>{user.name}</h2>
              <p style={styles.email}>{user.email}</p>

              <div style={styles.infoBox}>
                <p>
                  <strong>Bio:</strong> {user.bio || "Not added"}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone || "Not added"}
                </p>
              </div>

              <button style={styles.primaryBtn} onClick={() => setEdit(true)}>
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                style={styles.input}
              />

              <input
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Bio"
                style={styles.input}
              />

              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                style={styles.input}
              />
              <label style={{ display: "block", marginTop: "15px" }}>
                <input
                  type="checkbox"
                  checked={form.email_notifications}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email_notifications: e.target.checked,
                    })
                  }
                />
                Receive Email Notifications 📧
              </label>

              <div style={styles.buttonRow}>
                <button style={styles.primaryBtn} onClick={handleUpdate}>
                  Save
                </button>
                <button style={styles.cancelBtn} onClick={() => setEdit(false)}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* Divider */}
          <hr style={styles.divider} />

          {/* Change Password */}
          <div style={styles.passwordBox}>
            <h3>Change Password 🔐</h3>

            <input
              type="password"
              placeholder="Old Password"
              value={passwords.old_password}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  old_password: e.target.value,
                })
              }
              style={styles.input}
            />

            <input
              type="password"
              placeholder="New Password"
              value={passwords.new_password}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  new_password: e.target.value,
                })
              }
              style={styles.input}
            />

            <button style={styles.successBtn} onClick={handlePassword}>
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "40px",
  },

  card: {
    maxWidth: "420px",
    margin: "0 auto",
    background: "#fff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",
    fontSize: "32px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
  },

  name: {
    marginBottom: "5px",
  },

  email: {
    color: "#666",
    marginBottom: "15px",
  },

  infoBox: {
    textAlign: "left",
    marginBottom: "20px",
    lineHeight: "1.6",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
  },

  primaryBtn: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },

  cancelBtn: {
    width: "100%",
    padding: "10px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },

  successBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },

  divider: {
    margin: "25px 0",
  },

  passwordBox: {
    textAlign: "left",
  },
};
