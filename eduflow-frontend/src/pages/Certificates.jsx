import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyCertificates, getMyBadges } from "../api/certificate";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const certRes = await getMyCertificates();
      setCertificates(certRes.data);

      const badgeRes = await getMyBadges();
      setBadges(badgeRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>🏆 Certificates & Achievements</h1>

        {/* CERTIFICATES */}
        <div style={styles.section}>
          <h2>Certificates</h2>

          {certificates.length === 0 ? (
            <p>No certificates earned yet</p>
          ) : (
            certificates.map((cert) => (
              <div key={cert.id} style={styles.card}>
                <div>
                  <h3>{cert.course_title}</h3>

                  <p>Issued: {new Date(cert.issued_at).toLocaleString()}</p>

                  
                </div>

                <div style={styles.actions}>
                  <button
                    onClick={() => {
                      const token = localStorage.getItem("token");

                      window.open(
                        `http://127.0.0.1:8000/certificates/download/${cert.id}?token=${token}`,
                        "_blank",
                      );
                    }}
                    style={styles.downloadBtn}
                  >
                    Download
                  </button>

                  <a
                    href={`http://127.0.0.1:8000/certificates/verify/${cert.certificate_code}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.verifyBtn}
                  >
                    Verify
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BADGES */}
        <div style={styles.section}>
          <h2>Badges</h2>

          <div style={styles.badgeGrid}>
            {badges.map((badge) => (
              <div key={badge.id} style={styles.badgeCard}>
                <div style={styles.badgeIcon}>🎖️</div>

                <h3>{badge.badge_name}</h3>

                <p>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    minHeight: "100vh",
    background: "#f1f5f9",
  },

  heading: {
    marginBottom: "30px",
  },

  section: {
    marginBottom: "50px",
  },

  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "18px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },

  actions: {
    display: "flex",
    gap: "12px",
  },

  downloadBtn: {
    padding: "12px 18px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
  },

  verifyBtn: {
    padding: "12px 18px",
    borderRadius: "10px",
    background: "#10b981",
    color: "#fff",
    textDecoration: "none",
  },

  badgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
    gap: "20px",
  },

  badgeCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },

  badgeIcon: {
    fontSize: "42px",
    marginBottom: "12px",
  },
};
