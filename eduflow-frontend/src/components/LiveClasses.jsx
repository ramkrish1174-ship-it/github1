import { useEffect, useState } from "react";
import {
  createLiveClass,
  getCourseLiveClasses,
  updateLiveClass,
  cancelLiveClass,
  uploadRecording,
} from "../api/liveClass";

export default function LiveClasses({ courseId }) {
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    meeting_link: "",
    start_time: "",
    end_time: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await getCourseLiveClasses(courseId);

      setClasses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreate = async () => {
    try {
      await createLiveClass(courseId, form);

      setForm({
        title: "",
        description: "",
        meeting_link: "",
        start_time: "",
        end_time: "",
      });

      loadClasses();

      alert("Live class scheduled");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateLiveClass(id, form);

      setEditingId(null);

      setForm({
        title: "",
        description: "",
        meeting_link: "",
        start_time: "",
        end_time: "",
      });

      loadClasses();

      alert("Updated");
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleRecording = async (id, recording_link) => {
    try {
      await uploadRecording(id, {
        recording_link,
      });

      loadClasses();
    } catch (err) {
      alert("Upload failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await cancelLiveClass(id);

      loadClasses();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Live Classes 🎥</h2>

      <div style={styles.card}>
        <input
          placeholder="Class title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          style={styles.input}
        />

        <textarea
          placeholder="Class description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          style={styles.input}
        />

        <input
          type="datetime-local"
          value={form.start_time}
          onChange={(e) =>
            setForm({
              ...form,
              start_time: e.target.value,
            })
          }
          style={styles.input}
        />

        <input
          type="datetime-local"
          value={form.end_time}
          onChange={(e) =>
            setForm({
              ...form,
              end_time: e.target.value,
            })
          }
          style={styles.input}
        />

        <input
          placeholder="Meeting link"
          value={form.meeting_link}
          onChange={(e) =>
            setForm({
              ...form,
              meeting_link: e.target.value,
            })
          }
          style={styles.input}
        />

        <button style={styles.button} onClick={handleCreate}>
          Schedule Class
        </button>
      </div>

      {classes.map((c) => (
        <div key={c.id} style={styles.classCard}>
          <h3>{c.title}</h3>
          🕒 {new Date(c.start_time).toLocaleString()}
          <a href={c.meeting_link} target="_blank">
            Join Meeting
          </a>
          {c.recording_link && <p>🎬 Recording Available</p>}
          <input
            placeholder="Recording URL"
            style={styles.input}
            onBlur={(e) => handleRecording(c.id, e.target.value)}
          />
          <div style={styles.actions}>
            <button
              style={styles.editBtn}
              onClick={() => {
                setEditingId(c.id);

                setForm({
                  title: c.title,
                  description: c.description,
                  start_time: c.start_time.slice(0, 16),
                  end_time: c.end_time.slice(0, 16),
                  meeting_link: c.meeting_link,
                });
              }}
            >
              Edit
            </button>

            {editingId === c.id && (
              <button style={styles.saveBtn} onClick={() => handleUpdate(c.id)}>
                Save
              </button>
            )}

            <button style={styles.deleteBtn} onClick={() => handleDelete(c.id)}>
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    marginTop: "20px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "25px",
  },

  classCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  button: {
    marginTop: "15px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  editBtn: {
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#f59e0b",
    color: "#fff",
  },

  saveBtn: {
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#10b981",
    color: "#fff",
  },

  deleteBtn: {
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#fff",
  },
};
