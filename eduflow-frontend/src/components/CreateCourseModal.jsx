import { useState } from "react";
import api from "../api/axios";

export default function CreateCourseModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
  });

  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.price) {
      alert("Fill required fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/courses", {
        ...form,
        price: Number(form.price),
      });

      await onSuccess();

      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.title}>Create Course</h2>
          <span style={styles.close} onClick={onClose}>
            ✖
          </span>
        </div>

        {/* FORM */}
        <div style={styles.form}>
          <Input
            label="Course Title"
            name="title"
            placeholder="React Mastery"
            value={form.title}
            onChange={handleChange}
            focus={focus}
            setFocus={setFocus}
          />

          <TextArea
            label="Description"
            name="description"
            placeholder="Learn React from scratch..."
            value={form.description}
            onChange={handleChange}
            focus={focus}
            setFocus={setFocus}
          />

          <Input
            label="Category"
            name="category"
            placeholder="Web Development"
            value={form.category}
            onChange={handleChange}
            focus={focus}
            setFocus={setFocus}
          />
          <Input
            label="Level"
            name="level"
            placeholder="beginner"
            value={form.level}
            onChange={handleChange}
            focus={focus}
            setFocus={setFocus}
          />

          <Input
            label="Price"
            name="price"
            type="number"
            placeholder="499"
            value={form.price}
            onChange={handleChange}
            focus={focus}
            setFocus={setFocus}
          />
        </div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button style={styles.createBtn} onClick={handleSubmit}>
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- INPUT COMPONENT ---------- */

function Input({ label, name, value, onChange, focus, setFocus, ...rest }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(name)}
        onBlur={() => setFocus("")}
        style={{
          ...styles.input,
          ...(focus === name && styles.inputFocus),
        }}
        {...rest}
      />
    </div>
  );
}

/* ---------- TEXTAREA ---------- */

function TextArea({ label, name, value, onChange, focus, setFocus }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(name)}
        onBlur={() => setFocus("")}
        style={{
          ...styles.textarea,
          ...(focus === name && styles.inputFocus),
        }}
      />
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    width: "420px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.3s ease",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "600",
  },

  close: {
    cursor: "pointer",
    fontSize: "18px",
    color: "#666",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "13px",
    marginBottom: "5px",
    color: "#555",
  },

  input: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
    transition: "0.2s",
  },

  textarea: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    minHeight: "70px",
    outline: "none",
  },

  inputFocus: {
    border: "1px solid #6366f1",
    boxShadow: "0 0 0 2px rgba(99,102,241,0.2)",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },

  cancelBtn: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#e5e7eb",
    cursor: "pointer",
  },

  createBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "#fff",
    fontWeight: "500",
    cursor: "pointer",
  },
};
