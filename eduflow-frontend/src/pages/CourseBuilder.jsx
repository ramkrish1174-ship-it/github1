import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import AssignmentModal from "../components/AssignmentModal";
import {
  getAssignments,
  getAssignmentSubmissions,
  gradeSubmission
} from "../api/assignment";

export default function CourseBuilder() {
  const { courseId } = useParams();

  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState("");

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    const res = await api.get(`/modules/${courseId}`);
    setModules(res.data);
  };

  const createModule = async () => {
    if (!newModule) return;

    await api.post(`/modules/${courseId}`, {
      title: newModule,
      order: modules.length,
    });

    setNewModule("");
    fetchModules();
  };

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h2>📚 Course Curriculum Builder</h2>

        {/* CREATE MODULE */}
        <div style={styles.createBox}>
          <input
            placeholder="New Module Title"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            style={styles.input}
          />
          <button style={styles.button} onClick={createModule}>
            + Add Module
          </button>
        </div>

        {/* MODULE LIST */}
        {modules.map((mod) => (
          <ModuleCard key={mod.id} module={mod} refresh={fetchModules} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- MODULE CARD ---------------- */

function ModuleCard({ module, refresh }) {
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState("");
  const [quizModal, setQuizModal] = useState(false);

  const [selectedLesson, setSelectedLesson] = useState(null);

  const [quizTitle, setQuizTitle] = useState("");

  const [createdQuiz, setCreatedQuiz] = useState(null);

  const [question, setQuestion] = useState("");

  const [optionA, setOptionA] = useState("");

  const [optionB, setOptionB] = useState("");

  const [optionC, setOptionC] = useState("");

  const [optionD, setOptionD] = useState("");
  const [assignments, setAssignments] = useState([]);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const [submissions, setSubmissions] = useState([]);

  const [showSubmissions, setShowSubmissions] = useState(false);

  const [correctAnswer, setCorrectAnswer] = useState("a");
  const [gradingData, setGradingData] = useState({});

  useEffect(() => {
    fetchLessons();
    fetchAssignments();
  }, []);

  const fetchLessons = async () => {
    const res = await api.get(`/lessons/${module.id}`);
    setLessons(res.data);
  };
  const fetchAssignments = async () => {
    try {
      const res = await getAssignments(module.id);

      setAssignments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addLesson = async () => {
    if (!newLesson) return;

    await api.post(`/lessons/${module.id}`, {
      title: newLesson,
      content: "Content here",
      type: "text",
      order: lessons.length,
    });

    setNewLesson("");
    fetchLessons();
  };

  const createQuiz = async () => {
    try {
      const res = await api.post(`/quizzes/${selectedLesson.id}`, {
        title: quizTitle,
      });

      setCreatedQuiz(res.data);

      console.log("Created Quiz:", res.data);

      alert("Quiz created");
    } catch (err) {
      console.log(err.response.data);

      if (err.response.data.detail === "Quiz already exists for this lesson") {
        const existingQuiz = await api.get(
          `/quizzes/lesson/${selectedLesson.id}`,
        );

        setCreatedQuiz({
          id: existingQuiz.data.quiz_id,
        });

        alert("Using existing quiz");
      } else {
        alert("Failed to create quiz");
      }
    }
  };

  const addQuestion = async () => {
    try {
      console.log(createdQuiz);
      console.log(createdQuiz.id);
      await api.post(`/quizzes/question/${createdQuiz.id}`, {
        question: question,

        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,

        correct_answer: correctAnswer,
      });

      setQuestion("");

      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");

      setCorrectAnswer("a");

      alert("Question added");
    } catch (err) {
      alert("Failed to add question");
    }
  };

  const deleteModule = async () => {
    await api.delete(`/modules/${module.id}`);
    refresh();
  };

  return (
    <div style={styles.moduleCard}>
      <div style={styles.moduleHeader}>
        <h3>{module.title}</h3>
        <button style={styles.deleteBtn} onClick={deleteModule}>
          Delete
        </button>
      </div>

      {/* ADD LESSON */}
      <div style={styles.lessonInput}>
        <input
          placeholder="New Lesson"
          value={newLesson}
          onChange={(e) => setNewLesson(e.target.value)}
          style={styles.input}
        />
        <button onClick={addLesson}>Add</button>

        <button
          style={styles.assignmentBtn}
          onClick={() => setShowAssignmentModal(true)}
        >
          + Assignment
        </button>
      </div>

      {/* LESSON LIST */}
      {lessons.map((lesson) => (
        <div key={lesson.id} style={styles.lessonCardAdvanced}>
          <div>
            <h4 style={{ marginBottom: "5px" }}>{lesson.title}</h4>

            <p style={styles.lessonType}>{lesson.type}</p>
          </div>

          <button
            style={styles.quizBtn}
            onClick={() => {
              setSelectedLesson(lesson);

              setQuizModal(true);

              setCreatedQuiz(null);

              setQuizTitle("");
            }}
          >
            + Quiz
          </button>
        </div>
      ))}
      <div style={{ marginTop: "20px" }}>
        <h4>Assignments</h4>

        {assignments.map((a) => (
          <div key={a.id} style={styles.assignmentCard}>
            <div>
              <h4>{a.title}</h4>

              <p style={{ color: "#666" }}>
                Due:{" "}
                {a.due_date
                  ? new Date(a.due_date).toLocaleString()
                  : "No due date"}
              </p>
            </div>

            <button
              style={styles.quizBtn}
              onClick={async () => {
                const res = await getAssignmentSubmissions(a.id);

                setSubmissions(res.data);

                setShowSubmissions(true);
              }}
            >
              View Submissions
            </button>
          </div>
        ))}
      </div>
      {quizModal && (
        <div style={styles.overlay}>
          <div style={styles.quizModal}>
            <h2 style={styles.quizHeading}>Quiz Builder 🧠</h2>

            <p style={styles.quizSub}>Lesson: {selectedLesson?.title}</p>

            {!createdQuiz ? (
              <>
                <input
                  placeholder="Quiz Title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  style={styles.input}
                />

                <button style={styles.createQuizBtn} onClick={createQuiz}>
                  Create Quiz
                </button>
              </>
            ) : (
              <>
                <div style={styles.questionBuilder}>
                  <textarea
                    placeholder="Question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    style={styles.questionInput}
                  />

                  <input
                    placeholder="Option A"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    style={styles.input}
                  />

                  <input
                    placeholder="Option B"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    style={styles.input}
                  />

                  <input
                    placeholder="Option C"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    style={styles.input}
                  />

                  <input
                    placeholder="Option D"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    style={styles.input}
                  />

                  <select
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    style={styles.select}
                  >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </select>

                  <button style={styles.addQuestionBtn} onClick={addQuestion}>
                    + Add Question
                  </button>
                </div>
              </>
            )}

            <button style={styles.closeBtn} onClick={() => setQuizModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {showAssignmentModal && (
        <AssignmentModal
          moduleId={module.id}
          onClose={() => setShowAssignmentModal(false)}
          onSuccess={fetchAssignments}
        />
      )}
      {showSubmissions && (
        <div style={styles.overlay}>
          <div style={styles.quizModal}>
            <h2 style={styles.quizHeading}>Assignment Submissions 📄</h2>

            {submissions.length === 0 ? (
              <p>No submissions yet</p>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} style={styles.submissionCard}>
                  <h4>Student ID: {sub.student_id}</h4>

                  <p>
                    <b>Status:</b> {sub.status}
                  </p>

                  <p>
                    <b>Answer:</b>
                  </p>

                  <div style={styles.answerBox}>{sub.submission_text}</div>

                  {sub.file_url && (
                    <a href={sub.file_url} target="_blank" rel="noreferrer">
                      Open Submission Link
                    </a>
                  )}

                  <p style={{ marginTop: "10px" }}>
                    <b>Submitted:</b>{" "}
                    {new Date(sub.submitted_at).toLocaleString()}
                  </p>
                  <input
                    placeholder="Grade"
                    style={styles.gradeInput}
                    value={gradingData[sub.id]?.grade || ""}
                    onChange={(e) =>
                      setGradingData((prev) => ({
                        ...prev,
                        [sub.id]: {
                          ...prev[sub.id],
                          grade: e.target.value,
                        },
                      }))
                    }
                  />

                  <textarea
                    placeholder="Feedback"
                    style={styles.feedbackInput}
                    value={gradingData[sub.id]?.feedback || ""}
                    onChange={(e) =>
                      setGradingData((prev) => ({
                        ...prev,
                        [sub.id]: {
                          ...prev[sub.id],
                          feedback: e.target.value,
                        },
                      }))
                    }
                  />

                  <select
                    style={styles.statusSelect}
                    value={gradingData[sub.id]?.status || "reviewed"}
                    onChange={(e) =>
                      setGradingData((prev) => ({
                        ...prev,
                        [sub.id]: {
                          ...prev[sub.id],
                          status: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="reviewed">Reviewed</option>
                    <option value="graded">Graded</option>
                  </select>

                  <button
                    style={styles.gradeBtn}
                    onClick={async () => {
                      try {
                        await gradeSubmission(sub.id, {
                          grade: gradingData[sub.id]?.grade,
                          feedback: gradingData[sub.id]?.feedback,
                          status: gradingData[sub.id]?.status || "graded",
                        });

                        alert("Submission graded");

                        const res = await getAssignmentSubmissions(
                          sub.assignment_id,
                        );

                        setSubmissions(res.data);
                      } catch (err) {
                        alert("Failed to grade");
                      }
                    }}
                  >
                    Save Review
                  </button>
                </div>
              ))
            )}

            <button
              style={styles.closeBtn}
              onClick={() => setShowSubmissions(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  gradeInput: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  feedbackInput: {
    width: "100%",
    minHeight: "100px",
    marginTop: "12px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  statusSelect: {
    width: "100%",
    marginTop: "12px",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  gradeBtn: {
    width: "100%",
    marginTop: "15px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#10b981",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  submissionCard: {
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "15px",
    border: "1px solid #e2e8f0",
  },

  answerBox: {
    background: "#fff",
    padding: "12px",
    borderRadius: "10px",
    marginTop: "8px",
    border: "1px solid #ddd",
    whiteSpace: "pre-wrap",
  },
  assignmentBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#10b981",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  assignmentCard: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #e2e8f0",
  },
  container: {
    padding: "30px",
  },

  createBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    flex: 1,
  },

  button: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
  },

  moduleCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },

  moduleHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  lessonInput: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },

  lesson: {
    padding: "8px",
    background: "#f1f5f9",
    borderRadius: "6px",
    marginBottom: "5px",
  },
  lessonCardAdvanced: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "10px",
    border: "1px solid #e2e8f0",
  },

  lessonType: {
    color: "#64748b",
    fontSize: "13px",
  },

  quizBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  quizModal: {
    width: "650px",
    background: "#fff",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  quizHeading: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  quizSub: {
    color: "#64748b",
    marginBottom: "25px",
  },

  createQuizBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "15px",
  },

  questionBuilder: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  questionInput: {
    minHeight: "120px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "14px",
    resize: "none",
  },

  select: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  addQuestionBtn: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#10b981",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },

  closeBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};
