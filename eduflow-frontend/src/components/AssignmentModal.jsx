import { useState } from "react";
import { createAssignment } from "../api/assignment";

export default function AssignmentModal({
  moduleId,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const handleCreate = async () => {
    try {
      await createAssignment(moduleId, form);

      alert("Assignment created");

      onSuccess();

      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Create Assignment 📝</h2>

        <input
          placeholder="Assignment title"
          style={styles.input}
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Assignment description"
          style={styles.textarea}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          type="datetime-local"
          style={styles.input}
          value={form.due_date}
          onChange={(e) =>
            setForm({
              ...form,
              due_date: e.target.value,
            })
          }
        />

        <button style={styles.createBtn} onClick={handleCreate}>
          Create Assignment
        </button>

        <button style={styles.closeBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "500px",
    background: "#fff",
    borderRadius: "20px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  textarea: {
    minHeight: "120px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  createBtn: {
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },

  closeBtn: {
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
  },
};