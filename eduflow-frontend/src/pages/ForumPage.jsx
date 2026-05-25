import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";

import api from "../api/axios";

import {
  createPost,
  getCoursePosts,
  addReply,
  getReplies,
  upvotePost,
  resolvePost,
} from "../api/forum";

export default function ForumPage() {
  const { courseId } = useParams();

  const [posts, setPosts] = useState([]);

  const [course, setCourse] = useState(null);

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [expandedPost, setExpandedPost] = useState(null);

  const [replies, setReplies] = useState({});

  const [replyText, setReplyText] = useState({});

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get("/users/me");

      setUser(userRes.data);

      const courseRes = await api.get(`/courses/${courseId}`);

      setCourse(courseRes.data);

      const postsRes = await getCoursePosts(courseId);

      setPosts(postsRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreatePost = async () => {
    if (!title || !content) {
      return alert("Fill all fields");
    }

    try {
      await createPost(courseId, {
        title,
        content,
      });

      setTitle("");
      setContent("");

      loadData();
    } catch {
      alert("Failed to create post");
    }
  };

  const loadReplies = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    try {
      const res = await getReplies(postId);

      setReplies({
        ...replies,
        [postId]: res.data,
      });

      setExpandedPost(postId);
    } catch {
      alert("Failed loading replies");
    }
  };

  const handleReply = async (postId) => {
    try {
      await addReply(postId, {
        content: replyText[postId],
      });

      setReplyText({
        ...replyText,
        [postId]: "",
      });

      loadReplies(postId);
    } catch {
      alert("Reply failed");
    }
  };

  const handleUpvote = async (postId) => {
    try {
      await upvotePost(postId);

      loadData();
    } catch (err) {
      alert(err.response?.data?.detail);
    }
  };

  const handleResolve = async (postId) => {
    try {
      await resolvePost(postId);

      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Discussion Forum 💬</h1>

          <p style={styles.subtitle}>{course?.title}</p>
        </div>

        {/* CREATE POST */}

        <div style={styles.createBox}>
          <input
            placeholder="Question title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Describe your doubt..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
          />

          <button style={styles.postBtn} onClick={handleCreatePost}>
            Post Question
          </button>
        </div>

        {/* POSTS */}

        <div style={styles.postsContainer}>
          {posts.length === 0 ? (
            <div style={styles.empty}>No discussions yet</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} style={styles.card}>
                <div style={styles.top}>
                  <div>
                    <h2 style={styles.title}>{post.title}</h2>

                    <div style={styles.meta}>
                      <span>{post.author}</span>

                      {post.author_role === "instructor" && (
                        <span style={styles.instructorBadge}>Instructor</span>
                      )}

                      {post.is_resolved && (
                        <span style={styles.resolvedBadge}>Resolved</span>
                      )}
                    </div>
                  </div>

                  <button
                    style={styles.upvoteBtn}
                    onClick={() => handleUpvote(post.id)}
                  >
                    ⬆ {post.upvotes}
                  </button>
                </div>

                <p style={styles.content}>{post.content}</p>

                <div style={styles.actions}>
                  <button
                    style={styles.actionBtn}
                    onClick={() => loadReplies(post.id)}
                  >
                    Replies ({post.replies_count})
                  </button>

                  {user?.role === "instructor" && !post.is_resolved && (
                    <button
                      style={styles.resolveBtn}
                      onClick={() => handleResolve(post.id)}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>

                {/* REPLIES */}

                {expandedPost === post.id && (
                  <div style={styles.replySection}>
                    {(replies[post.id] || []).map((reply) => (
                      <div key={reply.id} style={styles.replyCard}>
                        <div style={styles.replyTop}>
                          <strong>{reply.author}</strong>

                          {reply.author_role === "instructor" && (
                            <span style={styles.instructorBadge}>
                              Instructor
                            </span>
                          )}
                        </div>

                        <p style={styles.replyContent}>{reply.content}</p>
                      </div>
                    ))}

                    <textarea
                      placeholder="Write a reply..."
                      value={replyText[post.id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [post.id]: e.target.value,
                        })
                      }
                      style={styles.replyInput}
                    />

                    <button
                      style={styles.replyBtn}
                      onClick={() => handleReply(post.id)}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    marginBottom: "30px",
  },

  subtitle: {
    color: "#666",
  },

  createBox: {
    background: "#fff",
    padding: "25px",
    borderRadius: "18px",
    marginBottom: "30px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    marginBottom: "15px",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    marginBottom: "15px",
  },

  postBtn: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  postsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
  },

  title: {
    marginBottom: "8px",
  },

  meta: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  instructorBadge: {
    background: "#dbeafe",
    color: "#2563eb",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  resolvedBadge: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  content: {
    marginTop: "20px",
    lineHeight: "1.7",
    color: "#444",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  actionBtn: {
    border: "none",
    background: "#eff6ff",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  resolveBtn: {
    border: "none",
    background: "#10b981",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  upvoteBtn: {
    border: "none",
    background: "#eff6ff",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  replySection: {
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
  },

  replyCard: {
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "12px",
  },

  replyTop: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "8px",
  },

  replyContent: {
    color: "#444",
  },

  replyInput: {
    width: "100%",
    minHeight: "80px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    marginTop: "15px",
  },

  replyBtn: {
    marginTop: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  empty: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
  },
};
