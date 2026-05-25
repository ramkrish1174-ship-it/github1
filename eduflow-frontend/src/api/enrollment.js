import api from "./axios";

export const enrollCourse = (courseId) => {
  return api.post(`/enrollments/${courseId}`);
};

export const getMyEnrollments = () => {
  return api.get("/enrollments");
};