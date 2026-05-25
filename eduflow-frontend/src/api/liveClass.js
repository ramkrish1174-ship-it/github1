import api from "./axios";

export const createLiveClass = (courseId, data) =>
  api.post(`/live-classes/${courseId}`, data);

export const getCourseLiveClasses = (courseId) =>
  api.get(`/live-classes/course/${courseId}`);

export const updateLiveClass = (classId, data) =>
  api.put(`/live-classes/${classId}`, data);

export const cancelLiveClass = (classId) =>
  api.delete(`/live-classes/${classId}`);

export const uploadRecording = (classId, data) =>
  api.put(`/live-classes/${classId}/recording`, data);

export const getUpcomingClasses = () =>
  api.get("/live-classes/upcoming/me");