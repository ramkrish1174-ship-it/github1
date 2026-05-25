import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { getMyEnrollments } from "../api/enrollment";
import { useNavigate } from "react-router-dom";
import CreateCourseModal from "../components/CreateCourseModal";
import LiveClasses from "../components/LiveClasses";
import UpcomingClasses from "../components/UpcomingClasses";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get("/users/me");
      setUser(userRes.data);
      if (userRes.data.role === "admin") {
        navigate("/admin");
        return;
      }

      //  student enrollments
      const enrollRes = await getMyEnrollments();
      setCourses(enrollRes.data);

      //  instructor courses
      if (userRes.data.role === "instructor") {
        const my = await api.get("/courses/my");
        setMyCourses(my.data);
      }
    } catch (err) {
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const initial = user?.name?.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loader}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.avatar}>{initial}</div>

          <div>
            <h1 style={styles.welcome}>Welcome back, {user.name} 👋</h1>
            <p style={styles.email}>{user.email}</p>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <StatCard
            title="Courses"
            value={
              user.role === "instructor" ? myCourses.length : courses.length
            }
          />

          <StatCard
            title="Progress"
            value={
              user.role === "instructor" ? `${myCourses.length} Created` : "--"
            }
          />

          <StatCard
            title="Active"
            value={
              user.role === "instructor"
                ? myCourses.length > 0
                  ? "Yes"
                  : "No"
                : courses.length > 0
                  ? "Yes"
                  : "No"
            }
          />
          {user.role === "student" && (
            <button
              style={styles.certificateBtn}
              onClick={() => navigate("/certificates")}
            >
              🏆 View Certificates
            </button>
          )}
        </div>
        {user.role === "student" && (
          <Section title="Upcoming Live Classes 🔴">
            <UpcomingClasses />
          </Section>
        )}

        {/* CONTINUE LEARNING */}
        {user.role === "student" && (
          <Section title="Continue Learning 🚀">
            <div style={styles.grid}>
              {courses.slice(0, 3).map((course) => (
                <CoursePremium key={course.id} course={course} highlight />
              ))}
            </div>
          </Section>
        )}

        {/* STUDENT COURSES */}
        {user.role === "student" && (
          <Section title="My Courses 📚">
            <div style={styles.grid}>
              {courses.map((course) => (
                <CoursePremium key={course.id} course={course} />
              ))}
            </div>
          </Section>
        )}

        {/*  INSTRUCTOR PANEL (NEW) */}
        {user.role === "instructor" && (
          <Section title="Instructor Panel 🎯">
            <button onClick={() => setShowModal(true)} style={styles.createBtn}>
              + Create Course
            </button>
            <div style={styles.grid}>
              {myCourses.map((course) => (
                <InstructorCard
                  key={course.id}
                  course={course}
                  reload={loadData}
                  navigate={navigate}
                />
              ))}
            </div>
          </Section>
        )}
      </div>
      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

/* ---------------- NEW COMPONENT ---------------- */

function InstructorCard({ course, reload, navigate }) {
  const [editOpen, setEditOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [showLiveClasses, setShowLiveClasses] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const handlePublish = async () => {
    await api.put(`/courses/${course.id}/publish`);
    reload();
  };
  const loadStudents = async () => {
    try {
      const res = await api.get(`/enrollments/course/${course.id}`);
      setStudents(res.data);
      setShowStudents(true);
    } catch (err) {
      alert("Failed to load students");
    }
  };

  const handleArchive = async () => {
    await api.put(`/courses/${course.id}/archive`);
    reload();
  };

  const handleDelete = async () => {
    await api.delete(`/courses/${course.id}`);
    reload();
  };
  const sendAnnouncement = async () => {
    if (!announcement.trim()) {
      alert("Enter announcement");
      return;
    }

    try {
      await api.post(`/courses/${course.id}/announcement`, {
        message: announcement,
      });

      alert("Announcement email sent");

      setAnnouncement("");
    } catch {
      alert("Failed");
    }
  };

  return (
    <div style={styles.courseCard}>
      <h3>{course.title}</h3>
      <p style={styles.desc}>{course.description}</p>

      <div style={styles.footer}>
        <span style={styles.badge}>{course.category}</span>
        <span style={styles.price}>₹{course.price}</span>
      </div>

      <p style={{ fontSize: "12px", marginBottom: "8px" }}>
        Status: <b>{course.status}</b>
      </p>

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => setEditOpen(true)}>
          Edit
        </button>

        {course.status === "draft" && (
          <button style={styles.button} onClick={handlePublish}>
            Publish
          </button>
        )}

        {course.status === "published" && (
          <button style={styles.button} onClick={handleArchive}>
            Archive
          </button>
        )}
        <button
          style={styles.button}
          onClick={() => navigate(`/builder/${course.id}`)}
        >
          Manage
        </button>
        <button
          style={styles.button}
          onClick={() => navigate(`/forum/${course.id}`)}
        >
          Forum
        </button>
        <button style={styles.button} onClick={sendAnnouncement}>
          Send Announcement
        </button>
        <button style={styles.button} onClick={loadStudents}>
          Students
        </button>
        <button
          style={styles.button}
          onClick={() => setShowLiveClasses(!showLiveClasses)}
        >
          Live Classes
        </button>
        <input
          placeholder="Course announcement..."
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            width: "100%",
          }}
        />

        <button
          style={{ ...styles.button, background: "#ef4444" }}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
      {showStudents && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Enrolled Students</h3>

            {students.length === 0 ? (
              <p>No students enrolled</p>
            ) : (
              students.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Student ID: {s.user_id}
                </div>
              ))
            )}

            <button onClick={() => setShowStudents(false)}>Close</button>
          </div>
        </div>
      )}
      {showLiveClasses && <LiveClasses courseId={course.id} />}

      {editOpen && (
        <EditCourseModal
          course={course}
          onClose={() => setEditOpen(false)}
          reload={reload}
        />
      )}
    </div>
  );
}

function EditCourseModal({ course, onClose, reload }) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    category: course.category,
    price: course.price,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/courses/${course.id}`, {
        ...form,
        price: Number(form.price),
      });

      reload();
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Edit Course</h3>

        <input name="title" value={form.title} onChange={handleChange} />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />
        <input name="category" value={form.category} onChange={handleChange} />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
        />

        <button onClick={handleUpdate}>Update</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
function StatCard({ title, value }) {
  return (
    <div style={styles.statCard}>
      <h4>{title}</h4>
      <p style={styles.statValue}>{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function CoursePremium({ course, highlight }) {
  const navigate = useNavigate();

  const openCourse = () => {
    navigate(`/course/${course.course_id || course.id}`);
  };

  return (
    <div
      style={{
        ...styles.courseCard,
        ...(highlight && styles.highlightCard),
      }}
    >
      <h3>{course.title}</h3>

      <p style={styles.desc}>{course.description}</p>

      <div style={styles.footer}>
        <span style={styles.badge}>{course.category}</span>

        <span style={styles.price}>₹{course.price}</span>
      </div>

      <button style={styles.button} onClick={openCourse}>
        {highlight ? "Continue →" : "Open Course"}
      </button>
    </div>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = {
  container: {
    padding: "40px",
    background: "linear-gradient(to bottom, #f8fafc, #eef2ff)",
    minHeight: "100vh",
  },
  buttonGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  certificateBtn: {
    marginBottom: "30px",
    padding: "14px 20px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "#fff",
    fontSize: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  welcome: { fontSize: "26px", fontWeight: "600" },
  email: { color: "#666" },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  statValue: { fontSize: "28px", fontWeight: "bold", marginTop: "10px" },
  section: { marginBottom: "40px" },
  sectionTitle: { fontSize: "22px", marginBottom: "15px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    alignItems: "start",
  },
  createBtn: {
    marginBottom: "15px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#10b981",
    color: "#fff",
    cursor: "pointer",
  },
  courseCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  highlightCard: {
    border: "2px solid #6366f1",
    transform: "scale(1.02)",
  },
  desc: { fontSize: "14px", color: "#555", margin: "10px 0" },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  badge: {
    fontSize: "12px",
    background: "#e0e7ff",
    padding: "4px 10px",
    borderRadius: "10px",
  },
  price: { fontWeight: "bold" },
  button: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  loader: { padding: "50px", textAlign: "center", fontSize: "18px" },
};
