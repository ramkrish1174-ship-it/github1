import api from "./axios";

/* =========================
   CREATE ASSIGNMENT
========================= */

export const createAssignment = (moduleId, data) => {
  return api.post(`/assignments/${moduleId}`, data);
};

/* =========================
   GET MODULE ASSIGNMENTS
========================= */

export const getAssignments = (moduleId) => {
  return api.get(`/assignments/module/${moduleId}`);
};

/* =========================
   SUBMIT ASSIGNMENT
========================= */

export const submitAssignment = (assignmentId, data) => {
  return api.post(`/assignments/submit/${assignmentId}`, data);
};

/* =========================
   MY SUBMISSIONS
========================= */

export const getMySubmissions = () => {
  return api.get("/assignments/my-submissions");
};

/* =========================
   VIEW SUBMISSIONS
========================= */

export const getAssignmentSubmissions = (assignmentId) => {
  return api.get(`/assignments/submissions/${assignmentId}`);
};

/* =========================
   GRADE SUBMISSION
========================= */

export const gradeSubmission = (submissionId, data) => {
  return api.put(`/assignments/grade/${submissionId}`, data);
};


