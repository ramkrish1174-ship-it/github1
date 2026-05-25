import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import {
  getAssignments,
  submitAssignment,
  getMySubmissions,
} from "../api/assignment";
import Reviews from "../components/Reviews";
import { getCourseLiveClasses } from "../api/liveClass";

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [selectedLesson, setSelectedLesson] = useState(null);

  const [progressMap, setProgressMap] = useState({});
  const [courseProgress, setCourseProgress] = useState(0);
  const [watchMap, setWatchMap] = useState({});

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [submissionData, setSubmissionData] = useState({});
  const [mySubmissions, setMySubmissions] = useState([]);
  const [certificateEarned, setCertificateEarned] = useState(false);

  const [liveClasses, setLiveClasses] = useState([]);

  useEffect(() => {
    loadModules();
    loadProgress();
    loadLiveClasses();
  }, []);

  const loadModules = async () => {
    try {
      const res = await api.get(`/modules/${id}`);

      setModules(res.data);

      if (res.data.length > 0) {
        setSelectedModule(res.data[0]);
        loadLessons(res.data[0].id);
      }
    } catch (err) {
      alert("Access denied or not enrolled");
    }
  };

  const loadLessons = async (moduleId) => {
    try {
      const res = await api.get(`/lessons/${moduleId}`);

      setLessons(res.data);

      await loadAssignments(moduleId);

      if (res.data.length > 0) {
        setSelectedLesson(res.data[0]);

        loadQuiz(res.data[0].id);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const loadAssignments = async (moduleId) => {
    try {
      const res = await getAssignments(moduleId);

      setAssignments(res.data);

      const sub = await getMySubmissions();

      setMySubmissions(sub.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadProgress = async () => {
    try {
      const res = await api.get(`/progress/course/${id}`);

      setCourseProgress(res.data.completion_percentage);

      if (res.data.completion_percentage === 100) {
        setCertificateEarned(true);
      } else {
        setCertificateEarned(false);
      }

      const lessonProgress = res.data.lesson_progress || {};
      const completedMap = {};
      const watchProgressMap = {};

      Object.keys(lessonProgress).forEach((lessonId) => {
        completedMap[lessonId] = lessonProgress[lessonId].completed;

        watchProgressMap[lessonId] = lessonProgress[lessonId].watch_percentage;
      });

      setProgressMap(completedMap);
      setWatchMap(watchProgressMap);
    } catch (err) {
      console.log(err);
    }
  };

  const updateWatchProgress = async (lessonId, value) => {
    try {
      await api.post(`/progress/${lessonId}`, {
        completed: value >= 100,
        watch_percentage: value,
      });

      setWatchMap((prev) => ({
        ...prev,
        [lessonId]: value,
      }));

      if (value >= 100) {
        setProgressMap((prev) => ({
          ...prev,
          [lessonId]: true,
        }));
      }

      await loadProgress();
    } catch (err) {
      console.log(err);
    }
  };

  const markCompleted = async (lessonId) => {
    try {
      await api.post(`/progress/${lessonId}`, {
        completed: true,
        watch_percentage: 100,
      });

      await loadProgress();
    } catch (err) {
      alert("Failed to update progress");
    }
  };

  const loadQuiz = async (lessonId) => {
    try {
      setLoadingQuiz(true);

      const res = await api.get(`/quizzes/lesson/${lessonId}`);

      setQuiz(res.data);
    } catch (err) {
      setQuiz(null);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };
  const loadLiveClasses = async () => {
    try {
      const res = await getCourseLiveClasses(id);

      setLiveClasses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const submitQuiz = async () => {
    try {
      const formattedAnswers = {};

      Object.keys(answers).forEach((key) => {
        formattedAnswers[key] = answers[key];
      });

      const res = await api.post(`/quizzes/submit/${quiz.quiz_id}`, {
        answers: formattedAnswers,
      });

      setQuizResult(res.data);
    } catch (err) {
      alert("Quiz submission failed");
    }
  };

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>EduFlow LMS 🎓</div>

        <div style={styles.sidebarTitle}>Course Modules</div>

        {modules.map((m) => (
          <div
            key={m.id}
            style={{
              ...styles.moduleCard,
              background:
                selectedModule?.id === m.id
                  ? "linear-gradient(135deg,#2563eb,#4f46e5)"
                  : "rgba(255,255,255,0.08)",
            }}
            onClick={() => {
              setSelectedModule(m);
              loadLessons(m.id);
            }}
          >
            <div style={styles.moduleTitle}>{m.title}</div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* TOP */}
        <div style={styles.topSection}>
          <div>
            <h1 style={styles.heading}>Continue Learning 🚀</h1>
            <p style={styles.subheading}>
              Track your progress and complete lessons.
            </p>
          </div>

          <div style={styles.progressCard}>
            <div style={styles.progressLabel}>
              <span>Overall Progress</span>
              <span>{courseProgress}%</span>
            </div>

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${courseProgress}%`,
                }}
              />
            </div>
          </div>
          {certificateEarned && (
            <div style={styles.certificateCard}>
              <h2>🎉 Course Completed!</h2>

              <p>Your certificate and badge have been unlocked.</p>

              <button
                style={styles.downloadCertificateBtn}
                onClick={() => (window.location.href = "/certificates")}
              >
                View Certificates
              </button>
            </div>
          )}
        </div>

        {/* LESSON CONTENT */}
        <div style={styles.contentArea}>
          {/* LESSON LIST */}
          <div style={styles.lessonPanel}>
            <h2 style={styles.sectionTitle}>Lessons</h2>

            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                style={{
                  ...styles.lessonCard,
                  border:
                    selectedLesson?.id === lesson.id
                      ? "2px solid #2563eb"
                      : "2px solid transparent",
                }}
                onClick={() => {
                  setSelectedLesson(lesson);

                  setQuiz(null);

                  setQuizResult(null);

                  setAnswers({});

                  loadQuiz(lesson.id);
                }}
              >
                <div style={styles.lessonTop}>
                  <div>
                    <h4>{lesson.title}</h4>
                    <p style={styles.lessonType}>{lesson.type}</p>
                  </div>

                  {progressMap[lesson.id] && (
                    <div style={styles.completedBadge}>Completed</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PLAYER */}
          <div style={styles.playerPanel}>
            {selectedLesson ? (
              <>
                <div style={styles.playerCard}>
                  <div style={styles.playerHeader}>
                    <div>
                      <h2>{selectedLesson.title}</h2>
                      <p style={styles.lessonType}>{selectedLesson.type}</p>
                    </div>

                    {progressMap[selectedLesson.id] && (
                      <div style={styles.completedBadge}>Completed</div>
                    )}
                  </div>
                  <button
                    style={styles.forumBtn}
                    onClick={() => navigate(`/forum/${id}`)}
                  >
                    💬 Open Discussion Forum
                  </button>

                  {/* VIDEO MOCK */}
                  {selectedLesson.type === "video" && (
                    <div style={styles.videoMock}>
                      ▶ Video Player Placeholder
                    </div>
                  )}

                  <div style={styles.lessonContent}>
                    {selectedLesson.content}
                  </div>

                  {/* WATCH TRACKER */}
                  <div style={{ marginTop: "25px" }}>
                    <div style={styles.watchHeader}>
                      <span>Watch Progress</span>
                      <span>0% - 100%</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={watchMap[selectedLesson.id] || 0}
                      style={styles.slider}
                      onChange={(e) =>
                        updateWatchProgress(
                          selectedLesson.id,
                          Number(e.target.value),
                        )
                      }
                    />
                  </div>

                  <button
                    style={styles.completeBtn}
                    onClick={() => markCompleted(selectedLesson.id)}
                  >
                    Mark Lesson Complete
                  </button>
                  {/* QUIZ SECTION */}

                  {loadingQuiz ? (
                    <div style={styles.quizLoading}>Loading Quiz...</div>
                  ) : quiz ? (
                    <div style={styles.quizContainer}>
                      <div style={styles.quizHeader}>🧠 {quiz.title}</div>

                      {quiz.questions.map((q, index) => (
                        <div key={q.id} style={styles.questionCard}>
                          <h3 style={styles.question}>
                            {index + 1}. {q.question}
                          </h3>

                          {[
                            { key: "a", value: q.option_a },
                            { key: "b", value: q.option_b },
                            { key: "c", value: q.option_c },
                            { key: "d", value: q.option_d },
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              style={{
                                ...styles.optionBtn,
                                background:
                                  answers[q.id] === opt.key
                                    ? "#2563eb"
                                    : "#f3f4f6",
                                color:
                                  answers[q.id] === opt.key ? "#fff" : "#111",
                              }}
                              onClick={() => handleAnswer(q.id, opt.key)}
                            >
                              {opt.key.toUpperCase()}. {opt.value}
                            </button>
                          ))}
                        </div>
                      ))}

                      <button style={styles.submitQuizBtn} onClick={submitQuiz}>
                        Submit Quiz
                      </button>

                      {quizResult && (
                        <div style={styles.resultCard}>
                          <h2>Quiz Result 🎉</h2>

                          <p>
                            Score:{" "}
                            <strong>
                              {quizResult.score} / {quizResult.total_questions}
                            </strong>
                          </p>

                          <p>
                            Percentage:{" "}
                            <strong>{quizResult.percentage.toFixed(2)}%</strong>
                          </p>

                          <div
                            style={{
                              ...styles.resultBadge,
                              background:
                                quizResult.percentage >= 50
                                  ? "#dcfce7"
                                  : "#fee2e2",
                              color:
                                quizResult.percentage >= 50
                                  ? "#166534"
                                  : "#991b1b",
                            }}
                          >
                            {quizResult.percentage >= 50 ? "PASSED" : "FAILED"}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={styles.noQuiz}>
                      No Quiz Available for this lesson
                    </div>
                  )}
                  <div style={styles.assignmentSection}>
                    <h2>Assignments 📝</h2>

                    {assignments.map((a) => {
                      const existingSubmission = mySubmissions.find(
                        (s) => s.assignment_id === a.id,
                      );

                      return (
                        <div key={a.id} style={styles.assignmentCard}>
                          <h3>{a.title}</h3>

                          <p>{a.description}</p>

                          <p style={{ color: "#666", marginTop: "10px" }}>
                            Due:{" "}
                            {a.due_date
                              ? new Date(a.due_date).toLocaleString()
                              : "No due date"}
                          </p>

                          {existingSubmission ? (
                            <div style={styles.submittedBox}>
                              <p>
                                Status: <b>{existingSubmission.status}</b>
                              </p>

                              <p>
                                Grade:{" "}
                                <b>{existingSubmission.grade ?? "Pending"}</b>
                              </p>

                              <p>
                                Feedback:{" "}
                                {existingSubmission.feedback || "Not graded"}
                              </p>
                            </div>
                          ) : (
                            <>
                              <textarea
                                placeholder="Write assignment submission..."
                                style={styles.assignmentTextarea}
                                value={
                                  submissionData[a.id]?.submission_text || ""
                                }
                                onChange={(e) =>
                                  setSubmissionData((prev) => ({
                                    ...prev,
                                    [a.id]: {
                                      ...prev[a.id],
                                      submission_text: e.target.value,
                                    },
                                  }))
                                }
                              />

                              <input
                                placeholder="File URL (optional)"
                                style={styles.assignmentInput}
                                value={submissionData[a.id]?.file_url || ""}
                                onChange={(e) =>
                                  setSubmissionData((prev) => ({
                                    ...prev,
                                    [a.id]: {
                                      ...prev[a.id],
                                      file_url: e.target.value,
                                    },
                                  }))
                                }
                              />

                              <button
                                style={styles.submitAssignmentBtn}
                                onClick={async () => {
                                  try {
                                    await submitAssignment(a.id, {
                                      submission_text:
                                        submissionData[a.id]?.submission_text ||
                                        "",

                                      file_url:
                                        submissionData[a.id]?.file_url || "",
                                    });

                                    alert("Assignment submitted");

                                    loadAssignments(selectedModule.id);

                                    setSubmissionData((prev) => ({
                                      ...prev,
                                      [a.id]: {
                                        submission_text: "",
                                        file_url: "",
                                      },
                                    }));
                                  } catch (err) {
                                    alert(
                                      err.response?.data?.detail ||
                                        "Submission failed",
                                    );
                                  }
                                }}
                              >
                                Submit Assignment
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.assignmentSection}>
                    <h2>Upcoming Live Classes 🔴</h2>

                    {liveClasses.length === 0 ? (
                      <p>No live classes scheduled</p>
                    ) : (
                      liveClasses.map((c) => (
                        <div key={c.id} style={styles.assignmentCard}>
                          <h3>{c.title}</h3>

                          <p>🕒 {new Date(c.scheduled_at).toLocaleString()}</p>

                          <a href={c.meeting_link} target="_blank">
                            Join Meeting
                          </a>

                          {c.recording_url && (
                            <div style={{ marginTop: "10px" }}>
                              <a href={c.recording_url} target="_blank">
                                ▶ Watch Recording
                              </a>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <Reviews courseId={id} />
                </div>
              </>
            ) : (
              <div>Select a lesson</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  assignmentSection: {
    marginTop: "40px",
  },
  forumBtn: {
    marginBottom: "20px",
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

  assignmentCard: {
    marginTop: "20px",
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "16px",
  },

  assignmentTextarea: {
    width: "100%",
    minHeight: "120px",
    marginTop: "15px",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #ddd",
  },

  assignmentInput: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  submitAssignmentBtn: {
    marginTop: "15px",
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  certificateCard: {
    marginTop: "20px",
    background: "#ecfeff",
    padding: "24px",
    borderRadius: "18px",
    border: "2px solid #06b6d4",
  },

  downloadCertificateBtn: {
    marginTop: "15px",
    padding: "14px 18px",
    border: "none",
    borderRadius: "12px",
    background: "#0891b2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },

  submittedBox: {
    marginTop: "15px",
    background: "#dcfce7",
    padding: "15px",
    borderRadius: "12px",
  },
  quizContainer: {
    marginTop: "35px",
    background: "#fff",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },

  quizHeader: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "25px",
  },

  questionCard: {
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    marginBottom: "20px",
  },

  question: {
    marginBottom: "18px",
  },

  optionBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    marginBottom: "12px",
    textAlign: "left",
    fontWeight: "500",
    transition: "0.25s",
  },

  submitQuizBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
    color: "white",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },

  resultCard: {
    marginTop: "30px",
    padding: "25px",
    borderRadius: "18px",
    background: "#f9fafb",
    textAlign: "center",
  },

  resultBadge: {
    marginTop: "15px",
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: "999px",
    fontWeight: "700",
  },

  noQuiz: {
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    textAlign: "center",
    color: "#6b7280",
  },

  quizLoading: {
    marginTop: "25px",
    textAlign: "center",
    color: "#6b7280",
  },
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f4f6",
  },

  sidebar: {
    width: "280px",
    background: "linear-gradient(180deg,#111827,#1f2937)",
    color: "white",
    padding: "25px",
  },

  logo: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "40px",
  },

  sidebarTitle: {
    marginBottom: "18px",
    color: "#cbd5e1",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  moduleCard: {
    padding: "14px",
    borderRadius: "14px",
    cursor: "pointer",
    marginBottom: "14px",
    transition: "0.25s",
  },

  moduleTitle: {
    fontWeight: "600",
  },

  main: {
    flex: 1,
    padding: "30px",
  },

  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "20px",
    flexWrap: "wrap",
  },

  heading: {
    fontSize: "34px",
    marginBottom: "8px",
  },

  subheading: {
    color: "#6b7280",
  },

  progressCard: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    width: "340px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },

  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontWeight: "600",
  },

  progressBar: {
    width: "100%",
    height: "14px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#10b981,#2563eb)",
    transition: "0.4s",
  },

  contentArea: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: "25px",
  },

  lessonPanel: {
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    height: "fit-content",
  },

  playerPanel: {
    flex: 1,
  },

  sectionTitle: {
    marginBottom: "20px",
  },

  lessonCard: {
    background: "#f9fafb",
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "14px",
    cursor: "pointer",
    transition: "0.25s",
  },

  lessonTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  lessonType: {
    color: "#6b7280",
    fontSize: "13px",
    marginTop: "4px",
  },

  completedBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  playerCard: {
    background: "white",
    padding: "28px",
    borderRadius: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },

  playerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  videoMock: {
    height: "320px",
    borderRadius: "18px",
    background: "linear-gradient(135deg,#1e293b,#111827)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "25px",
  },

  lessonContent: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#374151",
  },

  watchHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontWeight: "600",
  },

  slider: {
    width: "100%",
  },

  completeBtn: {
    marginTop: "25px",
    padding: "14px 20px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },
};
