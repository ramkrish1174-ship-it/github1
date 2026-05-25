import { useEffect, useState } from "react";
import { getUpcomingClasses } from "../api/liveClass";

export default function UpcomingClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await getUpcomingClasses();

      setClasses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (classes.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* <h2>Upcoming Live Classes 🔴</h2> */}

      {classes.map((c) => (
        <div key={c.id} style={styles.card}>
          <h3>{c.title}</h3>

          <p>
            📚 {c.course_title}
          </p>

          <p>
            🕒 {new Date(c.start_time).toLocaleString()}
          </p>

          <a href={c.meeting_link} target="_blank">
            Join Live Class
          </a>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: "40px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    marginTop: "15px",
  },
};